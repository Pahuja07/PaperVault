import {pgTable,text,varchar,uuid,timestamp,integer,boolean,decimal,jsonb} from 'drizzle-orm/pg-core'
import {papersTable} from './paper.model.js'
import {subjectsTable} from './subject.model.js'
import {departmentsTable} from './department.model.js'

// AI Predictions table
export const predictionsTable = pgTable('predictions', {
  predictionid: uuid().primaryKey().defaultRandom(),
  subjectid: uuid().notNull().references(()=>subjectsTable.subjectid),
  departmentid: uuid().notNull().references(()=>departmentsTable.departmentid),
  semester: integer().notNull(),
  year: integer().notNull(), // Prediction for this year
  
  // AI Analysis Data
  importantTopics: jsonb().default([]), // [{topic: "Sorting", confidence: 0.85, marks: 10}, ...]
  predictedQuestions: jsonb().default([]), // [{question: "Explain Quick Sort", marks: 10, confidence: 0.75}, ...]
  topicFrequency: jsonb().default([]), // Historical frequency data
  marksDistribution: jsonb().default({}), // {unit1: 20, unit2: 15, ...}
  
  // Prediction Metadata
  confidenceScore: decimal({precision: 5, scale: 2}).default('0.00'), // Overall confidence 0-100
  analysisDate: timestamp().defaultNow(),
  basedOnPapers: integer().default(0), // Number of papers analyzed
  modelVersion: varchar({length: 50}).default('v1.0'),
  
  // User Interaction
  views: integer().default(0),
  helpfulVotes: integer().default(0),
  notHelpfulVotes: integer().default(0),
  
  isActive: boolean().default(true),
  isVerified: boolean().default(false), // Verified by faculty
  
  createdat: timestamp().defaultNow(),
  updatedat: timestamp().defaultNow(),
})

// Question Bank (extracted from papers)
export const questionBankTable = pgTable('question_bank', {
  questionid: uuid().primaryKey().defaultRandom(),
  paperid: uuid().notNull().references(()=>papersTable.paperid),
  
  // Question Details
  questionText: text().notNull(),
  marks: integer().notNull(),
  questionType: varchar({length: 50}).default('descriptive'), // descriptive, mcq, numerical
  
  // Topic Analysis
  topics: text().array().default([]), // Extracted topics from question
  unit: varchar({length: 50}), // Unit number/name
  difficulty: varchar({length: 20}).default('medium'),
  
  // Keywords for AI analysis
  keywords: text().array().default([]),
  
  // Metadata
  year: integer().notNull(),
  semester: integer().notNull(),
  subjectid: uuid().notNull().references(()=>subjectsTable.subjectid),
  departmentid: uuid().notNull().references(()=>departmentsTable.departmentid),
  
  createdat: timestamp().defaultNow(),
})

// Topic Mastery (for tracking important topics)
export const topicMasteryTable = pgTable('topic_mastery', {
  topicid: uuid().primaryKey().defaultRandom(),
  subjectid: uuid().notNull().references(()=>subjectsTable.subjectid),
  departmentid: uuid().notNull().references(()=>departmentsTable.departmentid),
  semester: integer().notNull(),
  
  topicName: varchar({length: 255}).notNull(),
  unit: varchar({length: 50}),
  
  // Statistics
  frequency: integer().default(0), // How often this topic appears
  avgMarks: decimal({precision: 5, scale: 2}).default('0.00'),
  lastAppeared: integer(), // Last year this topic appeared
  trend: varchar({length: 20}).default('stable'), // rising, falling, stable
  
  // AI Analysis
  importance: decimal({precision: 5, scale: 2}).default('0.00'), // 0-100 importance score
  predictedForNextYear: boolean().default(false),
  
  createdat: timestamp().defaultNow(),
  updatedat: timestamp().defaultNow(),
})

// User Prediction Feedback
export const predictionFeedbackTable = pgTable('prediction_feedback', {
  feedbackid: uuid().primaryKey().defaultRandom(),
  predictionid: uuid().notNull().references(()=>predictionsTable.predictionid),
  userid: uuid().notNull(), // Assuming usersTable exists
  
  isHelpful: boolean().notNull(),
  comment: text(),
  rating: integer(), // 1-5 stars
  
  createdat: timestamp().defaultNow(),
})