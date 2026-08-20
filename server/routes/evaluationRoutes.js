// server/routes/evaluationRoutes.js
import express from 'express';
import { getResults, getSummary, saveResults } from '../controllers/evaluationController.js';

const router = express.Router();

// GET /api/evaluation/results
router.get('/results', getResults);

// GET /api/evaluation/summary
router.get('/summary', getSummary);

// POST /api/evaluation/save - Save results to database
router.post('/save', saveResults);

export default router;