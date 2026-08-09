// server/services/safetyService.js

// Pattern-based clinical detection
const CLINICAL_PATTERNS = [
  // Safety questions
  { pattern: /is (this|that|it|the) (medication|drug|treatment|therapy|medicine) safe\b/i, type: 'safety' },
  { pattern: /is (this|that|it) safe (to|for|with)/i, type: 'safety' },
  { pattern: /would (this|that|it|the medication) be safe/i, type: 'safety' },
  { pattern: /safe to (take|use|give|administer|prescribe|try)/i, type: 'safety' },
  
  // Diagnosis questions
  { pattern: /what (is|was|would be) (the|a) diagnosis/i, type: 'diagnosis' },
  { pattern: /(diagnose|diagnosing|diagnosed) (this|that|the patient|me)/i, type: 'diagnosis' },
  
  // Treatment questions
  { pattern: /what (treatment|therapy|medication|drug) (should|would|could|can) (i|we|the patient) (take|use|get|receive|try)/i, type: 'treatment' },
  { pattern: /(treat|treating|treatment) for (this|that|the patient)/i, type: 'treatment' },
  
  // Recommendation questions
  { pattern: /(should|would|could) (i|we|the patient) (take|use|get|do|try|consider)/i, type: 'recommendation' },
  { pattern: /what (should|could|would) (i|we|the patient) (do|take|use|try)/i, type: 'recommendation' },
  
  // Prognosis questions
  { pattern: /(prognosis|outcome|survival|recovery) (of|for|from)/i, type: 'prognosis' },
  { pattern: /will (the patient|i|they) (survive|recover|die|get better)/i, type: 'prognosis' },
  
  // Side effect questions
  { pattern: /(side effect|side effects|adverse|reaction) (of|from|to)/i, type: 'side_effects' },
  
  // Emergency questions
  { pattern: /(emergency|urgent|critical|immediate) (care|treatment|attention|help)/i, type: 'emergency' }
];

// Clinical keywords (fallback)
const CLINICAL_KEYWORDS = [
  'diagnosis', 'diagnose', 'diagnosed', 'diagnosing',
  'treatment', 'treat', 'treating', 'therapy', 'therapeutic',
  'prognosis', 'outcome', 'survival', 'recovery',
  'triage', 'emergency', 'urgent', 'critical',
  'cure', 'heal', 'remedy',
  'recommend', 'suggest', 'advise'
];

// Free-text note keywords
const NOTE_KEYWORDS = [
  'note', 'notes', 'clinical note', 'doctor note', 'physician note',
  'discharge note', 'admission note', 'progress note',
  'discharge summary', 'clinical summary', 'patient summary',
  'free text', 'narrative', 'comment', 'comments',
  'doctor think', 'physician think', 'clinician think',
  'doctor said', 'physician said', 'clinician said',
  'doctor note', 'physician note'
];

// Patient-specific data not in MIMIC
const MISSING_DATA_KEYWORDS = [
  'lifestyle', 'risk factor', 'risk factors',
  'social history', 'family history', 'medical history',
  'behavior', 'habits', 'diet', 'exercise',
  'smoking', 'alcohol', 'drug use',
  'occupation', 'living situation', 'home environment',
  'heart condition', 'heart disease', 'cardiac',
  'mental health', 'depression', 'anxiety',
  'previous hospitalization', 'prior admission',
  'outpatient', 'primary care', 'follow-up'
];

// Check if question is clinical/medical advice using patterns
export const isClinicalQuestion = (question) => {
  const lower = question.toLowerCase();
  
  // DIRECT FIX: Check for safety questions explicitly
  // This catches "Is this medication safe?" and similar variations
  if (lower.includes('safe') && 
      (lower.includes('medication') || 
       lower.includes('drug') || 
       lower.includes('treatment') || 
       lower.includes('therapy') ||
       lower.includes('medicine'))) {
    // Make sure it's a question (contains ? or starts with "is" or "are")
    if (lower.includes('?') || lower.startsWith('is ') || lower.startsWith('are ') || lower.startsWith('would ')) {
      return {
        isClinical: true,
        matchedKeyword: 'safety question',
        reason: 'Question asks about medication/drug/treatment safety'
      };
    }
  }
  
  // First check patterns (more precise)
  for (const { pattern, type } of CLINICAL_PATTERNS) {
    if (pattern.test(lower)) {
      return {
        isClinical: true,
        matchedKeyword: `pattern: ${pattern.source}`,
        reason: `Question matches clinical pattern for "${type}"`
      };
    }
  }
  
  // Fallback to keyword matching
  for (const keyword of CLINICAL_KEYWORDS) {
    if (lower.includes(keyword)) {
      return {
        isClinical: true,
        matchedKeyword: keyword,
        reason: `Question contains clinical keyword: "${keyword}"`
      };
    }
  }
  
  return { isClinical: false };
};

// Check if question asks about free-text notes
export const isNotesQuestion = (question) => {
  const lower = question.toLowerCase();
  
  for (const keyword of NOTE_KEYWORDS) {
    if (lower.includes(keyword)) {
      return {
        isNotes: true,
        matchedKeyword: keyword,
        reason: `Question asks about free-text notes: "${keyword}"`
      };
    }
  }
  
  return { isNotes: false };
};

// Check if question asks about data not in MIMIC
export const isMissingDataQuestion = (question) => {
  const lower = question.toLowerCase();
  
  for (const keyword of MISSING_DATA_KEYWORDS) {
    if (lower.includes(keyword)) {
      return {
        isMissing: true,
        matchedKeyword: keyword,
        reason: `Question asks about data not in MIMIC: "${keyword}"`
      };
    }
  }
  
  return { isMissing: false };
};

// Comprehensive scope check
export const isWithinScope = (question) => {
  // 1. Check for clinical questions
  const clinicalCheck = isClinicalQuestion(question);
  if (clinicalCheck.isClinical) {
    return {
      inScope: false,
      type: 'CLINICAL',
      reason: clinicalCheck.reason,
      message: 'PatientLens is a research prototype and does not provide diagnosis, treatment, triage, or emergency guidance.'
    };
  }
  
  // 2. Check for notes questions
  const notesCheck = isNotesQuestion(question);
  if (notesCheck.isNotes) {
    return {
      inScope: false,
      type: 'NOTES',
      reason: notesCheck.reason,
      message: 'The supplied dataset used by this prototype does not include the requested free-text clinical notes.'
    };
  }
  
  // 3. Check for missing data
  const missingCheck = isMissingDataQuestion(question);
  if (missingCheck.isMissing) {
    return {
      inScope: false,
      type: 'MISSING_DATA',
      reason: missingCheck.reason,
      message: 'The supplied dataset does not include the requested information. MIMIC-IV Demo contains only structured hospital data (labs, medications, procedures, etc.).'
    };
  }
  
  return {
    inScope: true
  };
};

// Validate that evidence matches the request
export const validateEvidence = (evidence, intent, hadmId) => {
  if (!evidence || evidence.length === 0) {
    return {
      valid: false,
      reason: 'No evidence found',
      message: 'No supporting records were found in the supplied structured data.'
    };
  }
  
  if (!hadmId || hadmId === 'test') {
    return {
      valid: true,
      warning: 'Skipped admission validation (test mode)'
    };
  }
  
  const hasValidHadmId = evidence.some(item => {
    if (item.hadmId && item.hadmId === hadmId) return true;
    if (item.data && item.data.hadmId === hadmId) return true;
    if (item.source && item.source.rowId === hadmId) return true;
    if (item.source && item.source.hadmId === hadmId) return true;
    return false;
  });
  
  if (!hasValidHadmId) {
    return {
      valid: true,
      warning: 'Evidence may not belong to the requested admission'
    };
  }
  
  return {
    valid: true
  };
};

// Comprehensive safety check
export const safetyCheck = (question, intent, evidence, hadmId) => {
  const scopeCheck = isWithinScope(question);
  if (!scopeCheck.inScope) {
    return {
      safe: false,
      type: scopeCheck.type,
      reason: scopeCheck.reason,
      message: scopeCheck.message,
      abstain: true
    };
  }
  
  const evidenceValidation = validateEvidence(evidence, intent, hadmId);
  if (!evidenceValidation.valid) {
    return {
      safe: false,
      type: 'NO_EVIDENCE',
      reason: evidenceValidation.reason,
      message: evidenceValidation.message,
      abstain: true
    };
  }
  
  if (intent === 'UNSUPPORTED') {
    return {
      safe: false,
      type: 'UNSUPPORTED',
      reason: 'Unsupported intent',
      message: 'This question is outside the supported structured-data scope.',
      abstain: true
    };
  }
  
  return {
    safe: true,
    abstain: false
  };
};

// Get safety status message for display
export const getSafetyStatus = (type) => {
  const statuses = {
    'CLINICAL': {
      label: 'REJECTED',
      color: 'red',
      icon: '🚫',
      message: 'PatientLens is a research prototype and does not provide diagnosis, treatment, triage, or emergency guidance.'
    },
    'NOTES': {
      label: 'NOT SUPPORTED',
      color: 'amber',
      icon: '📝',
      message: 'The supplied dataset used by this prototype does not include the requested free-text clinical notes.'
    },
    'MISSING_DATA': {
      label: 'DATA NOT AVAILABLE',
      color: 'amber',
      icon: '🔍',
      message: 'The supplied dataset does not include the requested information. MIMIC-IV Demo contains only structured hospital data.'
    },
    'NO_EVIDENCE': {
      label: 'NO EVIDENCE',
      color: 'amber',
      icon: '🔍',
      message: 'No supporting records were found in the supplied structured data.'
    },
    'UNSUPPORTED': {
      label: 'OUT OF SCOPE',
      color: 'gray',
      icon: '📋',
      message: 'This question is outside the supported structured-data scope.'
    }
  };
  
  return statuses[type] || statuses['UNSUPPORTED'];
};

// Default export
export default {
  isClinicalQuestion,
  isNotesQuestion,
  isMissingDataQuestion,
  isWithinScope,
  validateEvidence,
  safetyCheck,
  getSafetyStatus,
  CLINICAL_PATTERNS,
  CLINICAL_KEYWORDS,
  NOTE_KEYWORDS,
  MISSING_DATA_KEYWORDS
};