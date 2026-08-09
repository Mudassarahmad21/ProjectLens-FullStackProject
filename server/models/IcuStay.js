import mongoose from 'mongoose';

const icuStaySchema = new mongoose.Schema(
  {
    subjectId:     { type: Number, required: true, index: true },
    hadmId:        { type: Number, required: true, index: true },
    stayId:        { type: Number, required: true, unique: true, index: true }, // provenance row id
    firstCareUnit: { type: String },
    lastCareUnit:  { type: String },
    inTime:        { type: Date },   // ICU admission time — used by "before ICU" query later
    outTime:       { type: Date },
    los:           { type: Number }, // length of stay (days)
    source: {
      table: { type: String, default: 'icustays' },
      file:  { type: String, default: 'icu/icustays.csv' },
    },
  },
  { timestamps: true }
);

export default mongoose.model('ICUStay', icuStaySchema);