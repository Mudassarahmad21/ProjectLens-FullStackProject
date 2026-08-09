import express from 'express';
import { 
  naturalLanguageQuery,
  naturalLanguageQueryWithAnswer,
  executeStructuredQuery, 
  getSupportedIntents,
  getIntentSummaryController
} from '../controllers/queryController.js';

const router = express.Router();

// Natural language query (with answer generation)
router.post('/query', naturalLanguageQueryWithAnswer);

// Natural language query (intent only, for testing)
router.post('/query/intent', naturalLanguageQuery);

// Structured query (for testing)
router.post('/query/structured', executeStructuredQuery);

// Get supported intents
router.get('/query/intents', getSupportedIntents);

// Get summary for an intent
router.get('/query/:intent/summary', getIntentSummaryController);
router.get('/query/:intent/:hadmId/summary', getIntentSummaryController);

export default router;