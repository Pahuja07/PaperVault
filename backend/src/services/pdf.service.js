import pdfParse from 'pdf-parse'
import fs from 'fs'
import db from '../config/db.js'
import { papersTable } from '../models/paper.model.js'
import { questionBankTable } from '../models/prediction.model.js'
import { eq } from 'drizzle-orm'

/**
 * Extract text content from a PDF file
 * @param {string} filePath - Path to the PDF file
 * @returns {Promise<{text: string, pages: number}>}
 */
export const extractTextFromPDF = async (filePath) => {
  try {
    const dataBuffer = fs.readFileSync(filePath)
    const data = await pdfParse(dataBuffer)
    
    return {
      text: data.text,
      pages: data.numpages,
      info: data.info
    }
  } catch (error) {
    console.error('PDF extraction error:', error)
    throw new Error('Failed to extract text from PDF')
  }
}

/**
 * Parse exam paper text to extract questions
 * @param {string} text - Extracted text from PDF
 * @param {object} metadata - Paper metadata (year, semester, subject, etc.)
 * @returns {Promise<Array>} - Array of extracted questions
 */
export const parseQuestionsFromText = async (text, metadata) => {
  const questions = []
  
  // Common patterns in Indian university exam papers
  const questionPatterns = [
    // Pattern: "Q1." or "Q.1" or "1."
    /^\s*(?:Q\.?\s*\d+[A-Z]?\??|Unit\s*-\s*[IVX]+\s*)/im,
    // Pattern: Marks indicator like "(10)" or "[10]"
    /\((\d+)\s*marks?\)|\[(\d+)\]/i,
    // Pattern: "Attempt any X of the following"
    /attempt\s+any\s+\d+\s+of\s+the\s+following/i,
  ]
  
  // Split text into sections (by units or sections)
  const sections = text.split(/\n\s*(?:Unit\s*-\s*[IVX]+|Section\s*[A-D]|PART\s*[A-D])/i)
  
  let currentUnit = null
  let currentMarks = null
  
  for (const section of sections) {
    // Detect unit/section header
    const unitMatch = section.match(/Unit\s*-\s*([IVX]+)\s*[:\-]?\s*([^\n]+)/i)
    if (unitMatch) {
      currentUnit = `Unit ${unitMatch[1]}`
    }
    
    // Split section into individual questions
    const questionLines = section.split(/\n\s*(?=\d+\.|Q\.?\d+|Attempt any)/i)
    
    for (const line of questionLines) {
      // Extract marks
      const marksMatch = line.match(/\((\d+)\s*marks?\)|\[(\d+)\]/i)
      const marks = marksMatch ? parseInt(marksMatch[1] || marksMatch[2]) : null
      
      // Extract question number
      const qNumMatch = line.match(/^\s*(\d+[A-Z]?)\.?\s+/)
      const questionNum = qNumMatch ? qNumMatch[1] : null
      
      // Clean question text
      let questionText = line
        .replace(/^\s*(?:Q\.?\s*)?\d+[A-Z]?\s*\.?\s*/i, '')
        .replace(/\((\d+)\s*marks?\)|\[(\d+)\]/i, '')
        .replace(/\[.*?\]/g, '') // Remove any remaining brackets
        .trim()
        .replace(/\s+/g, ' ') // Normalize whitespace
      
      // Skip if question text is too short or looks like instructions
      if (questionText.length < 10 || 
          /^(note|instructions?|time|max\.?marks)/i.test(questionText)) {
        continue
      }
      
      // Determine question type
      let questionType = 'descriptive'
      if (/\b(mcq|multiple\s+choice|choose\s+the\s+correct)\b/i.test(questionText)) {
        questionType = 'mcq'
      } else if (/\b(numerical|calculate|find\s+the\s+value)\b/i.test(questionText)) {
        questionType = 'numerical'
      } else if (/\b(true|false|match\s+the\s+following)\b/i.test(questionText)) {
        questionType = 'truefalse'
      }
      
      // Extract keywords/topics from question
      const keywords = extractKeywords(questionText)
      
      questions.push({
        questionText,
        marks: marks || 5, // Default marks if not found
        questionType,
        unit: currentUnit,
        questionNum,
        keywords,
        topics: keywords.slice(0, 3), // Top 3 keywords as topics
        ...metadata
      })
    }
  }
  
  return questions
}

/**
 * Extract keywords from question text
 * @param {string} text - Question text
 * @returns {Array<string>} - Array of keywords
 */
const extractKeywords = (text) => {
  // Common technical terms and patterns
  const technicalTerms = [
    'algorithm', 'data structure', 'sorting', 'searching', 'tree', 'graph',
    'database', 'sql', 'normalization', 'indexing', 'transaction',
    'object', 'class', 'inheritance', 'polymorphism', 'encapsulation',
    'network', 'protocol', 'tcp', 'ip', 'http', 'socket',
    'circuit', 'voltage', 'current', 'resistance', 'capacitor',
    'thermodynamics', 'entropy', 'enthalpy', 'heat', 'work',
    'integral', 'derivative', 'differential', 'equation', 'matrix',
    'programming', 'function', 'loop', 'array', 'pointer',
    'operating system', 'process', 'thread', 'memory', 'scheduler',
    'compiler', 'parser', 'syntax', 'semantic', 'optimization',
    'machine learning', 'neural', 'classification', 'regression',
    'encryption', 'decryption', 'security', 'authentication',
    'interface', 'implementation', 'abstract', 'design pattern'
  ]
  
  const keywords = []
  const lowerText = text.toLowerCase()
  
  // Check for technical terms
  for (const term of technicalTerms) {
    if (lowerText.includes(term)) {
      keywords.push(term)
    }
  }
  
  // Extract capitalized words (potential topics)
  const capitalizedWords = text.match(/\b[A-Z][a-z]{2,}\b/g) || []
  for (const word of capitalizedWords) {
    if (!keywords.includes(word.toLowerCase()) && word.length > 3) {
      keywords.push(word.toLowerCase())
    }
  }
  
  // Remove common stop words and return unique keywords
  const stopWords = ['the', 'and', 'for', 'with', 'from', 'that', 'this', 'which', 'what', 'how']
  return [...new Set(keywords.filter(k => !stopWords.includes(k)))]
}

/**
 * Process a paper and extract questions to question bank
 * @param {string} paperId - Paper ID
 * @returns {Promise<Array>} - Extracted questions
 */
export const processPaperForQuestionBank = async (paperId) => {
  try {
    // Get paper details
    const papers = await db.select()
      .from(papersTable)
      .where(eq(papersTable.paperid, paperId))
      .limit(1)
    
    if (!papers || papers.length === 0) {
      throw new Error('Paper not found')
    }
    
    const paper = papers[0]
    
    // Check if questions already extracted
    const existingQuestions = await db.select()
      .from(questionBankTable)
      .where(eq(questionBankTable.paperid, paperId))
    
    if (existingQuestions.length > 0) {
      return existingQuestions
    }
    
    // Get PDF from local uploads (we need to handle OneDrive PDFs differently)
    // For now, we'll process local files. OneDrive files would need to be downloaded first.
    const localFilePath = `uploads/${paperId}.pdf` // This would need to be adjusted based on actual file storage
    
    // For demonstration, we'll create placeholder questions
    // In production, you'd download from OneDrive and process
    const metadata = {
      paperid: paper.paperid,
      year: paper.year,
      semester: paper.semester,
      subjectid: paper.subjectid,
      departmentid: paper.departmentid
    }
    
    // Placeholder questions (replace with actual extraction)
    const questions = [
      {
        questionText: `Sample question 1 from ${paper.title}`,
        marks: 10,
        questionType: 'descriptive',
        topics: ['sample', 'topic'],
        keywords: ['sample'],
        ...metadata
      }
    ]
    
    // Save questions to database
    const savedQuestions = []
    for (const q of questions) {
      const saved = await db.insert(questionBankTable)
        .values(q)
        .returning()
      savedQuestions.push(saved[0])
    }
    
    return savedQuestions
  } catch (error) {
    console.error('Process paper error:', error)
    throw error
  }
}

/**
 * Batch process all papers for question extraction
 * @returns {Promise<Object>} - Processing summary
 */
export const batchProcessPapers = async () => {
  try {
    // Get all approved papers
    const papers = await db.select()
      .from(papersTable)
      .where(eq(papersTable.isApproved, true))
    
    const results = {
      total: papers.length,
      processed: 0,
      failed: 0,
      errors: []
    }
    
    for (const paper of papers) {
      try {
        await processPaperForQuestionBank(paper.paperid)
        results.processed++
      } catch (error) {
        results.failed++
        results.errors.push({
          paperId: paper.paperid,
          title: paper.title,
          error: error.message
        })
      }
    }
    
    return results
  } catch (error) {
    console.error('Batch process error:', error)
    throw error
  }
}