// server/models/TimelineEvent.js
import mongoose from 'mongoose';

const timelineEventSchema = new mongoose.Schema({
  subjectId: {
    type: Number,
    required: true,
    // REMOVED: index: true
  },
  hadmId: {
    type: Number,
    required: true,
    // REMOVED: index: true
  },
  eventType: {
    type: String,
    required: true,
    enum: ['ADMISSION', 'TRANSFER', 'LAB', 'MEDICATION', 'PROCEDURE', 'DIAGNOSIS', 'ICU']
  },
  eventTime: {
    type: Date,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  value: {
    type: String,
    default: null
  },
  unit: {
    type: String,
    default: null
  },
  source: {
    table: { type: String, required: true },
    rowId: { type: String, required: true },
    field: { type: String, default: null },
    timestampField: { type: String, default: null }
  }
}, {
  timestamps: true
});

// ONLY ONE set of index definitions
timelineEventSchema.index({ subjectId: 1 });
timelineEventSchema.index({ hadmId: 1 });
timelineEventSchema.index({ eventType: 1 });
timelineEventSchema.index({ eventTime: 1 });
timelineEventSchema.index({ hadmId: 1, eventTime: 1 });

const TimelineEvent = mongoose.model('TimelineEvent', timelineEventSchema);
export default TimelineEvent;