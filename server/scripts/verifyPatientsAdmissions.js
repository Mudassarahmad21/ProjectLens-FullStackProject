import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import Patient from '../models/Patient.js';
import Admission from '../models/Admission.js';

async function run() {
  await connectDB(process.env.MONGO_URI);

  console.log('Patients:  ', await Patient.countDocuments());
  console.log('Admissions:', await Admission.countDocuments());

  const patient = await Patient.findOne().lean();
  console.log('\nSample patient:', patient);

  const admission = await Admission.findOne().lean();
  console.log('\nSample admission:', admission);

  const matched = await Patient.findOne({ subjectId: admission.subjectId }).lean();
  const count = await Admission.countDocuments({ subjectId: admission.subjectId });
  console.log(`\nadmission.subjectId ${admission.subjectId} -> patient:`,
    matched ? `FOUND (gender=${matched.gender}, age=${matched.anchorAge})` : 'NOT FOUND');
  console.log(`This patient has ${count} admission(s).`);

  const patientIds = new Set(await Patient.distinct('subjectId'));
  const orphans = (await Admission.distinct('subjectId')).filter((s) => !patientIds.has(s));
  console.log(`\nOrphan admissions: ${orphans.length}`);

  await mongoose.disconnect();
}
run().catch((e) => { console.error(e); process.exit(1); });