import db from '../config/db.js'
import { eq, and, desc, sql } from 'drizzle-orm'
import { predictionsTable, questionBankTable, topicMasteryTable } from '../models/prediction.model.js'
import { papersTable } from '../models/paper.model.js'
import { subjectsTable } from '../models/subject.model.js'
import { departmentsTable } from '../models/department.model.js'
import OpenAI from 'openai'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

// SKIT Common Subjects (First year common for all branches)
export const skitCommonSubjects = [
  { code: '1FY2-01', name: 'Engineering Mathematics-I', semester: 1 },
  { code: '2FY2-01', name: 'Engineering Mathematics-II', semester: 2 },
  { code: 'FY2-02', name: 'Engineering Physics', semester: 1 }, // Taught in both sems depending on group
  { code: 'FY2-02', name: 'Engineering Physics', semester: 2 },
  { code: 'FY2-03', name: 'Engineering Chemistry', semester: 1 }, // Taught in both sems
  { code: 'FY2-03', name: 'Engineering Chemistry', semester: 2 },
  { code: 'FY1-04', name: 'Communication Skills', semester: 1 },
  { code: 'FY1-04', name: 'Communication Skills', semester: 2 },
  { code: 'FY1-05', name: 'Human Values', semester: 1 },
  { code: 'FY1-05', name: 'Human Values', semester: 2 },
  { code: 'FY3-06', name: 'Programming for Problem Solving', semester: 1 },
  { code: 'FY3-06', name: 'Programming for Problem Solving', semester: 2 },
  { code: 'FY3-07', name: 'Basic Civil Engineering', semester: 1 },
  { code: 'FY3-07', name: 'Basic Civil Engineering', semester: 2 },
  { code: 'FY3-08', name: 'Basic Electrical Engineering', semester: 1 },
  { code: 'FY3-08', name: 'Basic Electrical Engineering', semester: 2 },
  { code: 'FY3-09', name: 'Basic Mechanical Engineering', semester: 1 },
  { code: 'FY3-09', name: 'Basic Mechanical Engineering', semester: 2 },
]

// SKIT Branches
export const skitBranches = [
  { code: 'CSE', name: 'Computer Science & Engineering', commonSemesters: [1, 2] },
  { code: 'IT', name: 'Information Technology', commonSemesters: [1, 2] },
  { code: 'ECE', name: 'Electronics & Communication Engineering', commonSemesters: [1, 2] },
  { code: 'EE', name: 'Electrical Engineering', commonSemesters: [1, 2] },
  { code: 'ME', name: 'Mechanical Engineering', commonSemesters: [1, 2] },
  { code: 'CE', name: 'Civil Engineering', commonSemesters: [1, 2] },
]

// Get AI predictions for a subject
export const getPredictions = async (req, res) => {
  try {
    const { subjectid, departmentid, semester } = req.query
    const currentYear = new Date().getFullYear()

    if (!subjectid || !departmentid) {
      return res.status(400).json({ error: 'Subject ID and Department ID are required' })
    }

    // Check if prediction exists for this subject
    let prediction = await db.select()
      .from(predictionsTable)
      .where(
        and(
          eq(predictionsTable.subjectid, subjectid),
          eq(predictionsTable.departmentid, departmentid),
          eq(predictionsTable.year, currentYear),
          eq(predictionsTable.isActive, true)
        )
      )
      .limit(1)

    // If no prediction exists, generate one
    if (!prediction || prediction.length === 0) {
      prediction = await generatePrediction(subjectid, departmentid, semester || 1, currentYear)
    } else {
      // Update view count
      await db.update(predictionsTable)
        .set({ views: sql`${predictionsTable.views} + 1` })
        .where(eq(predictionsTable.predictionid, prediction[0].predictionid))
    }

    return res.status(200).json({
      success: true,
      prediction: prediction[0]
    })
  } catch (error) {
    console.error('Get predictions error:', error)
    return res.status(500).json({ error: 'Failed to get predictions' })
  }
}

// Generate AI prediction using OpenAI
const generatePrediction = async (subjectid, departmentid, semester, year) => {
  try {
    // Get all papers for this subject
    const papers = await db.select()
      .from(papersTable)
      .where(
        and(
          eq(papersTable.subjectid, subjectid),
          eq(papersTable.departmentid, departmentid),
          eq(papersTable.isApproved, true)
        )
      )
      .orderBy(desc(papersTable.year))
      .limit(10)

    if (papers.length === 0) {
      // If no papers available, use common subject patterns
      return await generateCommonSubjectPrediction(subjectid, departmentid, semester, year)
    }

    // Extract questions from papers (if already extracted)
    const questions = await db.select()
      .from(questionBankTable)
      .where(
        and(
          eq(questionBankTable.subjectid, subjectid),
          eq(questionBankTable.departmentid, departmentid)
        )
      )

    // Get subject details
    const subject = await db.select()
      .from(subjectsTable)
      .where(eq(subjectsTable.subjectid, subjectid))
      .limit(1)

    // Prepare data for AI analysis
    const analysisData = {
      subjectName: subject[0]?.name || 'Unknown Subject',
      semester,
      totalPapers: papers.length,
      yearRange: `${papers[papers.length - 1]?.year}-${papers[0]?.year}`,
      questions: questions.map(q => ({
        text: q.questionText,
        marks: q.marks,
        topics: q.topics,
        year: q.year,
        type: q.questionType
      }))
    }

    // Call OpenAI for prediction
    const prompt = `
    As an expert educational AI, analyze the previous year question patterns for ${analysisData.subjectName} (Semester ${semester}).
    
    Based on the following historical data:
    - Total papers analyzed: ${analysisData.totalPapers}
    - Year range: ${analysisData.yearRange}
    - Questions: ${JSON.stringify(analysisData.questions.slice(0, 20))}
    
    Please provide:
    1. **Important Topics** (top 8-10 topics with confidence scores 0-100)
    2. **Predicted Questions** (10-15 most likely questions with marks and confidence)
    3. **Marks Distribution** by units
    4. **Study Recommendations**
    
    Format the response as JSON with this structure:
    {
      "importantTopics": [{"topic": "name", "confidence": 85, "marks": 10, "unit": "Unit 1"}],
      "predictedQuestions": [{"question": "question text", "marks": 10, "confidence": 75, "type": "descriptive"}],
      "marksDistribution": {"Unit 1": 20, "Unit 2": 15, "Unit 3": 15, "Unit 4": 10, "Unit 5": 10},
      "overallConfidence": 75,
      "studyRecommendations": ["Start with high-confidence topics", "Practice numerical problems"]
    }
    `

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an expert educational AI that analyzes exam patterns and predicts important questions for college students.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: 'json_object' }
    })

    const aiResponse = JSON.parse(completion.choices[0].message.content)

    // Save prediction to database
    const newPrediction = await db.insert(predictionsTable)
      .values({
        subjectid,
        departmentid,
        semester,
        year,
        importantTopics: aiResponse.importantTopics,
        predictedQuestions: aiResponse.predictedQuestions,
        topicFrequency: analysisData.questions,
        marksDistribution: aiResponse.marksDistribution,
        confidenceScore: aiResponse.overallConfidence.toString(),
        basedOnPapers: papers.length,
        modelVersion: 'gpt-4-turbo-v1.0'
      })
      .returning()

    // Update topic mastery
    await updateTopicMastery(subjectid, departmentid, semester, aiResponse.importantTopics)

    return newPrediction
  } catch (error) {
    console.error('Generate prediction error:', error)
    throw error
  }
}

// Generate prediction for common subjects (when no papers available)
const generateCommonSubjectPrediction = async (subjectid, departmentid, semester, year) => {
  try {
    const subject = await db.select()
      .from(subjectsTable)
      .where(eq(subjectsTable.subjectid, subjectid))
      .limit(1)

    const subjectName = subject[0]?.name || 'Unknown Subject'
    
    // Use OpenAI to generate predictions based on subject name and standard curriculum
    const prompt = `
    As an expert educational AI, generate important topics and predicted questions for ${subjectName} (Semester ${semester}).
    
    This is a common subject for first/second semester engineering students at SKIT (Rajasthan).
    Generate predictions based on standard engineering curriculum and common exam patterns.
    
    Please provide:
    1. **Important Topics** (top 8-10 fundamental topics)
    2. **Predicted Questions** (10-15 important questions)
    3. **Marks Distribution** by units
    4. **Study Tips**
    
    Format as JSON with structure:
    {
      "importantTopics": [{"topic": "name", "confidence": 80, "marks": 10, "unit": "Unit 1"}],
      "predictedQuestions": [{"question": "question text", "marks": 10, "confidence": 70, "type": "descriptive"}],
      "marksDistribution": {"Unit 1": 20, "Unit 2": 15, "Unit 3": 15, "Unit 4": 10, "Unit 5": 10},
      "overallConfidence": 65,
      "studyRecommendations": ["Focus on fundamentals", "Practice derivations"]
    }
    `

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an expert educational AI specializing in Indian engineering curriculum, particularly Rajasthan Technical University (RTU) syllabus.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: 'json_object' }
    })

    const aiResponse = JSON.parse(completion.choices[0].message.content)

    // Save prediction
    const newPrediction = await db.insert(predictionsTable)
      .values({
        subjectid,
        departmentid,
        semester,
        year,
        importantTopics: aiResponse.importantTopics,
        predictedQuestions: aiResponse.predictedQuestions,
        marksDistribution: aiResponse.marksDistribution,
        confidenceScore: aiResponse.overallConfidence.toString(),
        basedOnPapers: 0,
        modelVersion: 'gpt-4-curriculum-v1.0'
      })
      .returning()

    return newPrediction
  } catch (error) {
    console.error('Common subject prediction error:', error)
    throw error
  }
}

// Update topic mastery statistics
const updateTopicMastery = async (subjectid, departmentid, semester, topics) => {
  try {
    for (const topic of topics) {
      // Check if topic exists
      const existing = await db.select()
        .from(topicMasteryTable)
        .where(
          and(
            eq(topicMasteryTable.subjectid, subjectid),
            eq(topicMasteryTable.topicName, topic.topic),
            eq(topicMasteryTable.semester, semester)
          )
        )
        .limit(1)

      if (existing.length > 0) {
        // Update existing topic
        await db.update(topicMasteryTable)
          .set({
            frequency: sql`${topicMasteryTable.frequency} + 1`,
            importance: topic.confidence.toString(),
            predictedForNextYear: topic.confidence > 70,
            updatedat: new Date()
          })
          .where(eq(topicMasteryTable.topicid, existing[0].topicid))
      } else {
        // Create new topic
        await db.insert(topicMasteryTable)
          .values({
            subjectid,
            departmentid,
            semester,
            topicName: topic.topic,
            unit: topic.unit,
            frequency: 1,
            importance: topic.confidence.toString(),
            predictedForNextYear: topic.confidence > 70
          })
      }
    }
  } catch (error) {
    console.error('Update topic mastery error:', error)
  }
}

// Get predictions by department and semester (for branch filtering)
export const getPredictionsByDepartment = async (req, res) => {
  try {
    const { departmentid, semester } = req.params
    const currentYear = new Date().getFullYear()

    const predictions = await db.select()
      .from(predictionsTable)
      .where(
        and(
          eq(predictionsTable.departmentid, departmentid),
          eq(predictionsTable.semester, parseInt(semester)),
          eq(predictionsTable.year, currentYear),
          eq(predictionsTable.isActive, true)
        )
      )
      .orderBy(desc(predictionsTable.confidenceScore))

    return res.status(200).json({
      success: true,
      predictions
    })
  } catch (error) {
    console.error('Get department predictions error:', error)
    return res.status(500).json({ error: 'Failed to get predictions' })
  }
}

// Get common subject predictions (for first year students)
export const getCommonSubjectPredictions = async (req, res) => {
  try {
    const { semester } = req.params
    const currentYear = new Date().getFullYear()

    // Get predictions for all common subjects
    const predictions = await db.select()
      .from(predictionsTable)
      .innerJoin(subjectsTable, eq(predictionsTable.subjectid, subjectsTable.subjectid))
      .where(
        and(
          eq(predictionsTable.semester, parseInt(semester)),
          eq(predictionsTable.year, currentYear),
          eq(predictionsTable.isActive, true)
        )
      )
      .orderBy(desc(predictionsTable.confidenceScore))

    return res.status(200).json({
      success: true,
      predictions,
      commonSubjects: skitCommonSubjects.filter(s => s.semester === parseInt(semester))
    })
  } catch (error) {
    console.error('Get common predictions error:', error)
    return res.status(500).json({ error: 'Failed to get predictions' })
  }
}

// Rate prediction helpfulness
export const ratePrediction = async (req, res) => {
  try {
    const { predictionid } = req.params
    const { isHelpful, rating, comment } = req.body
    const userid = req.user?.userid // From authenticated middleware

    if (!userid) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    // Update prediction votes
    if (isHelpful) {
      await db.update(predictionsTable)
        .set({ helpfulVotes: sql`${predictionsTable.helpfulVotes} + 1` })
        .where(eq(predictionsTable.predictionid, predictionid))
    } else {
      await db.update(predictionsTable)
        .set({ notHelpfulVotes: sql`${predictionsTable.notHelpfulVotes} + 1` })
        .where(eq(predictionsTable.predictionid, predictionid))
    }

    // Save feedback
    await db.insert(predictionFeedbackTable)
      .values({
        predictionid,
        userid,
        isHelpful,
        rating,
        comment
      })

    return res.status(200).json({
      success: true,
      message: 'Feedback recorded'
    })
  } catch (error) {
    console.error('Rate prediction error:', error)
    return res.status(500).json({ error: 'Failed to record feedback' })
  }
}

// Get topic-wise analysis
export const getTopicAnalysis = async (req, res) => {
  try {
    const { subjectid, departmentid } = req.query

    const topicAnalysis = await db.select()
      .from(topicMasteryTable)
      .where(
        and(
          eq(topicMasteryTable.subjectid, subjectid),
          eq(topicMasteryTable.departmentid, departmentid)
        )
      )
      .orderBy(desc(topicMasteryTable.importance))
      .limit(20)

    return res.status(200).json({
      success: true,
      topicAnalysis
    })
  } catch (error) {
    console.error('Get topic analysis error:', error)
    return res.status(500).json({ error: 'Failed to get topic analysis' })
  }
}

// Get SKIT branches and common subjects info
export const getSKITInfo = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      branches: skitBranches,
      commonSubjects: skitCommonSubjects
    })
  } catch (error) {
    console.error('Get SKIT info error:', error)
    return res.status(500).json({ error: 'Failed to get SKIT info' })
  }
}