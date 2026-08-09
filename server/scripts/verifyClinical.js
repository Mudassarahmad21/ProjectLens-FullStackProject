import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import Patient from '../models/Patient.js';
import Admission from '../models/Admission.js';
import Transfer from '../models/Transfer.js';
import Lab from '../models/Lab.js';
import Medication from '../models/Medication.js';

async function run() {
  await connectDB(process.env.MONGO_URI);

  console.log('Counts:', {
    patients: await Patient.countDocuments(),
    admissions: await Admission.countDocuments(),
    transfers: await Transfer.countDocuments(),
    labs: await Lab.countDocuments(),
    medications: await Medication.countDocuments(),
  });

  console.log('\nSample transfer:', await Transfer.findOne().lean());
  console.log('\nSample lab:', await Lab.findOne({ valueNum: { $ne: null } }).lean());
  console.log('\nSample medication:', await Medication.findOne().lean());

  // Data-quality visibility (expected characteristics, not errors)
  console.log('\nLabs with null hadm_id (outpatient):', await Lab.countDocuments({ hadmId: null }));
  console.log('Transfers with null hadm_id (pre-admission/ED):', await Transfer.countDocuments({ hadmId: null }));

  // Relationship walk for one patient
  const p = await Patient.findOne().lean();
  console.log(`\nFor subject ${p.subjectId}:`);
  console.log('  admissions: ', await Admission.countDocuments({ subjectId: p.subjectId }));
  console.log('  transfers:  ', await Transfer.countDocuments({ subjectId: p.subjectId }));
  console.log('  labs:       ', await Lab.countDocuments({ subjectId: p.subjectId }));
  console.log('  medications:', await Medication.countDocuments({ subjectId: p.subjectId }));

  // Integrity: every lab subject must exist as a patient
  const patientIds = new Set(await Patient.distinct('subjectId'));
  const labOrphans = (await Lab.distinct('subjectId')).filter((s) => !patientIds.has(s));
  console.log('\nLab subjects with no matching patient:', labOrphans.length);

  await mongoose.disconnect();
}
run().catch((e) => { console.error(e); process.exit(1); });