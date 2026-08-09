// server/routes/timelineRoutes.js
import express from 'express';
import { getTimeline, getEventTypes, getTimelineSummary } from '../controllers/timelineController.js';

const router = express.Router();

// GET /api/admissions/:hadmId/timeline - Frontend expects this path
router.get('/admissions/:hadmId/timeline', getTimeline);

// GET /api/timeline/event-types
router.get('/event-types', getEventTypes);

// POST /api/timeline/summary
router.post('/summary', getTimelineSummary);

export default router;