// server/routes/evidenceRoutes.js
import express from 'express';
import { getEvidenceByEventId, getEvidenceForEvents } from '../controllers/evidenceController.js';

const router = express.Router();

// GET /api/evidence/:eventId
router.get('/:eventId', getEvidenceByEventId);

// POST /api/evidence/batch - for multiple events
router.post('/batch', getEvidenceForEvents);

export default router;