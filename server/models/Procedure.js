import mongoose from 'mongoose';

const procedureSchema = new mongoose.Schema(
  {
    subjectId:  { type: Number, required: true, index: true },
    hadmId:     { type: Number, required: true, index: true },
    seqNum:     { type: Number },        // ordering within admission; part of provenance key
    icdCode:    { type: String, index: true },  // string — keeps leading zeros
    icdVersion: { type: Number },        // 9 or 10
    title:      { type: String },        // resolved long_title
    chartDate:  { type: Date },          // date-only -> event sits at 00:00 that day
    source: {
      table: { type: String, default: 'procedures_icd' },
      file:  { type: String, default: 'hosp/procedures_icd.csv' },
    },
  },
  { timestamps: true }
);

procedureSchema.index({ hadmId: 1, seqNum: 1 }); // composite provenance / lookup

export default mongoose.model('Procedure', procedureSchema);