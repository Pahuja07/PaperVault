import express from 'express'
const router = express.Router()

import {
  getPredictions,
  getPredictionsByDepartment,
  getCommonSubjectPredictions,
  ratePrediction,
  getTopicAnalysis,
  getSKITInfo
} from '../controllers/ai.controller.js'

import { authenticatedMiddleware, ensureAuthenticated } from '../middlewares/user.middleware.js'

// Get AI predictions for a specific subject
router.get('/predictions', getPredictions)

// Get predictions by department and semester
router.get('/predictions/department/:departmentid/semester/:semester', getPredictionsByDepartment)

// Get common subject predictions (for first year students)
router.get('/predictions/common/semester/:semester', getCommonSubjectPredictions)

// Rate prediction helpfulness (requires authentication)
router.post('/predictions/:predictionid/rate', authenticatedMiddleware, ensureAuthenticated, ratePrediction)

// Get topic-wise analysis
router.get('/topic-analysis', getTopicAnalysis)

// Get SKIT branches and common subjects information
router.get('/skit-info', getSKITInfo)

export default router