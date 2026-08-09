// import express from 'express';
// import { 
//   getPatients, 
//   getPatientById, 
//   getPatientAdmissions 
// } from '../controllers/patientController.js';

// const router = express.Router();

// router.get('/', getPatients);
// router.get('/:subjectId', getPatientById);
// router.get('/:subjectId/admissions', getPatientAdmissions);

// export default router;

// server/routes/patientRoutes.js

import express from 'express';
import { getPatients, getPatient, getPatientAdmissions } from '../controllers/patientController.js';

const router = express.Router();

router.get('/', getPatients);
router.get('/:subjectId', getPatient);
router.get('/:subjectId/admissions', getPatientAdmissions);

export default router;