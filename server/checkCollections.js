import { connectDB } from './config/db.js';
import Patient from './models/Patient.js';
import Admission from './models/Admission.js';
import Transfer from './models/Transfer.js';
import Lab from './models/Lab.js';
import Medication from './models/Medication.js';
import Procedure from './models/Procedure.js';
import Diagnosis from './models/Diagnosis.js';

const checkCollections = async () => {
  await connectDB();
  
  console.log('\n📊 Collection Counts:');
  console.log(`Patients:      ${await Patient.countDocuments()}`);
  console.log(`Admissions:    ${await Admission.countDocuments()}`);
  console.log(`Transfers:     ${await Transfer.countDocuments()}`);
  console.log(`Labs:          ${await Lab.countDocuments()}`);
  console.log(`Medications:   ${await Medication.countDocuments()}`);
  console.log(`Procedures:    ${await Procedure.countDocuments()}`);
  console.log(`Diagnoses:     ${await Diagnosis.countDocuments()}`);
  
  process.exit(0);
};

checkCollections();