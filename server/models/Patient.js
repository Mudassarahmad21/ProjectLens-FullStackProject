import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema({
  subjectId: { type: Number, required: true, unique: true },
  gender: { type: String, enum: ['M', 'F'], required: true },
  anchorAge: { type: Number, required: true },
  anchorYear: { type: Number, required: true },
  anchorYearGroup: { type: String, required: true },
  dod: { type: Date, default: null },
  _source: {
    table: { type: String, default: 'patients' },
    file: { type: String, default: 'hosp/patients.csv' },
    importedAt: { type: Date, default: Date.now }
  }
}, { timestamps: true });

// ONLY indexes here - NO index:true in schema above
patientSchema.index({ subjectId: 1 }, { unique: true });

export default mongoose.model('Patient', patientSchema);