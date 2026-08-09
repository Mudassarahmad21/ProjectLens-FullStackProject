import express from 'express';
import { getAdmissionById, getAdmissions } from '../controllers/admissionController.js';

const router = express.Router();

router.get('/', getAdmissions);
router.get('/:hadmId', getAdmissionById);

export default router;