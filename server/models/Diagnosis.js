import mongoose from 'mongoose';

const diagnosisSchema = new mongoose.Schema(
  {
    subjectId:  { type: Number, required: true, index: true },
    hadmId:     { type: Number, required: true, index: true },
    seqNum:     { type: Number },        // 1 = primary; part of provenance key
    icdCode:    { type: String, index: true },
    icdVersion: { type: Number },        // 9 or 10
    title:      { type: String },        // resolved long_title
    isPrimary:  { type: Boolean, default: false }, // seqNum === 1
    // NO timestamp: MIMIC diagnoses have no time. Timeline placement is a Phase 4 decision.
    source: {
      table: { type: String, default: 'diagnoses_icd' },
      file:  { type: String, default: 'hosp/diagnoses_icd.csv' },
    },
  },
  { timestamps: true }
);

diagnosisSchema.index({ hadmId: 1, seqNum: 1 });

export default mongoose.model('Diagnosis', diagnosisSchema);