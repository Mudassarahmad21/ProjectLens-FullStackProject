// server/models/EvaluationResult.js
import mongoose from 'mongoose';

const evaluationResultSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  },
  summary: {
    ai: {
      passed: Number,
      total: Number,
      metrics: {
        factAccuracy: Number,
        temporalAccuracy: Number,
        provenanceCoverage: Number,
        abstentionAccuracy: Number
      }
    },
    baseline: {
      passed: Number,
      total: Number,
      metrics: {
        factAccuracy: Number,
        temporalAccuracy: Number,
        provenanceCoverage: Number,
        abstentionAccuracy: Number
      }
    }
  },
  details: {
    ai: [{
      id: String,
      category: String,
      question: String,
      expected: String,
      actual: String,
      success: Boolean,
      evidenceCount: Number
    }],
    baseline: [{
      id: String,
      category: String,
      question: String,
      expected: String,
      actual: String,
      success: Boolean,
      evidenceCount: Number
    }]
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const EvaluationResult = mongoose.model('EvaluationResult', evaluationResultSchema);
export default EvaluationResult;