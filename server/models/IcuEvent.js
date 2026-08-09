import mongoose from 'mongoose';

const icuEventSchema = new mongoose.Schema(
  {
    subjectId: { type: Number, required: true, index: true },
    hadmId:    { type: Number, index: true },
    stayId:    { type: Number, index: true },   // FK -> icustays
    itemId:    { type: Number, index: true },   // join key -> d_items
    title:     { type: String },                // resolved vital label, e.g. "Heart Rate"
    valueNum:  { type: Number, default: null },
    unit:      { type: String, default: null },
    chartTime: { type: Date },                  // timeline timestamp
    // provenance row id is composite (stayId, itemId, chartTime) — chartevents has no single id
    source: {
      table: { type: String, default: 'chartevents' },
      file:  { type: String, default: 'icu/chartevents.csv' },
    },
  },
  { timestamps: true }
);

icuEventSchema.index({ stayId: 1, chartTime: 1 });

export default mongoose.model('ICUEvent', icuEventSchema);