import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import Patient from '../models/Patient.js';
import Admission from '../models/Admission.js';
import Transfer from '../models/Transfer.js';
import Lab from '../models/Lab.js';
import Medication from '../models/Medication.js';
import Procedure from '../models/Procedure.js';
import Diagnosis from '../models/Diagnosis.js';
import IcuStay from '../models/IcuStay.js';
import IcuEvent from '../models/IcuEvent.js';

async function run() {
  await connectDB(process.env.MONGO_URI);

  const counts = {
    patients: await Patient.countDocuments(),
    admissions: await Admission.countDocuments(),
    transfers: await Transfer.countDocuments(),
    labs: await Lab.countDocuments(),
    medications: await Medication.countDocuments(),
    procedures: await Procedure.countDocuments(),
    diagnoses: await Diagnosis.countDocuments(),
    icustays: await IcuStay.countDocuments(),
    icuevents: await IcuEvent.countDocuments(),
  };
  console.log('Collection counts:');
  console.table(counts);

  console.log('Sample procedure:', await Procedure.findOne().lean());
  console.log('Sample diagnosis:', await Diagnosis.findOne().lean());
  console.log('Sample ICU stay:', await IcuStay.findOne().lean());
  console.log('Sample ICU event:', await IcuEvent.findOne().lean());

  const stay = await IcuStay.findOne().lean();
  const s = stay.subjectId;
  console.log(`\nEverything on file for ICU subject ${s}:`);
  for (const [name, Model] of [['admissions', Admission], ['transfers', Transfer], ['labs', Lab],
       ['medications', Medication], ['procedures', Procedure], ['diagnoses', Diagnosis],
       ['icustays', IcuStay], ['icuevents', IcuEvent]]) {
    console.log(`  ${name}:`, await Model.countDocuments({ subjectId: s }));
  }

  await mongoose.disconnect();
}
run().catch((e) => { console.error(e); process.exit(1); });