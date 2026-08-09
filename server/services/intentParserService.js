import groq, { AI_MODEL, SUPPORTED_INTENTS } from '../config/ai.js';

// System prompt for the LLM
const SYSTEM_PROMPT = `You are a structured intent parser for a healthcare research platform called PatientLens.

Your ONLY job is to classify the user's question into a structured intent.

SUPPORTED INTENTS:
${SUPPORTED_INTENTS.join(', ')}

TEMPORAL RELATIONS:
- BEFORE: Events that occurred before a reference point
- AFTER: Events that occurred after a reference point  
- DURING: Events that occurred during a time period
- BETWEEN: Events between two time points
- ALL: No temporal restriction

REFERENCE EVENTS:
- ICU_ADMISSION: When the patient was admitted to ICU
- ADMISSION: When the patient was admitted to hospital

RULES:
1. Return ONLY valid JSON
2. Use ONLY the intents listed above
3. Do NOT answer the user's question
4. Do NOT provide medical advice
5. Do NOT invent parameters
6. Use null when information is unavailable
7. If the question is unsupported, set intent to "UNSUPPORTED"

OUTPUT FORMAT:
{
  "intent": "LAB_RESULTS" | "MEDICATION_EVENTS" | "PROCEDURES" | "TRANSFERS" | "DIAGNOSES" | "ICU_OBSERVATIONS" | "TIMELINE" | "SOURCE_LOOKUP" | "UNSUPPORTED",
  "temporalRelation": "BEFORE" | "AFTER" | "DURING" | "BETWEEN" | "ALL" | null,
  "referenceEvent": "ICU_ADMISSION" | "ADMISSION" | null,
  "startDate": "ISO date string" | null,
  "endDate": "ISO date string" | null,
  "confidence": 0.0 to 1.0,
  "reasoning": "Brief explanation of why this intent was chosen"
}

EXAMPLES:

User: "What laboratory measurements were recorded?"
{
  "intent": "LAB_RESULTS",
  "temporalRelation": null,
  "referenceEvent": null,
  "startDate": null,
  "endDate": null,
  "confidence": 0.95,
  "reasoning": "User is asking about lab results"
}

User: "What labs were recorded before ICU admission?"
{
  "intent": "LAB_RESULTS",
  "temporalRelation": "BEFORE",
  "referenceEvent": "ICU_ADMISSION",
  "startDate": null,
  "endDate": null,
  "confidence": 0.9,
  "reasoning": "User wants lab results before ICU admission"
}

User: "What medications were given during the hospital stay?"
{
  "intent": "MEDICATION_EVENTS",
  "temporalRelation": "DURING",
  "referenceEvent": "ADMISSION",
  "startDate": null,
  "endDate": null,
  "confidence": 0.85,
  "reasoning": "User wants medications during hospital stay"
}

User: "What is the patient's diagnosis?"
{
  "intent": "DIAGNOSES",
  "temporalRelation": null,
  "referenceEvent": null,
  "startDate": null,
  "endDate": null,
  "confidence": 0.9,
  "reasoning": "User is asking about diagnoses"
}

User: "Should I take this medication?" (unsupported)
{
  "intent": "UNSUPPORTED",
  "temporalRelation": null,
  "referenceEvent": null,
  "startDate": null,
  "endDate": null,
  "confidence": 1.0,
  "reasoning": "Question asks for medical advice, which is outside scope"
}

User: "What is the best treatment for this condition?" (unsupported)
{
  "intent": "UNSUPPORTED",
  "temporalRelation": null,
  "referenceEvent": null,
  "startDate": null,
  "endDate": null,
  "confidence": 1.0,
  "reasoning": "Question asks for treatment recommendations, which is outside scope"
}`;

// Parse user question to structured intent
export const parseIntent = async (question) => {
  try {
    const response = await groq.chat.completions.create({
      model: AI_MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: question }
      ],
      temperature: 0.1,
      max_tokens: 200,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0].message.content;
    
    try {
      const parsed = JSON.parse(content);
      
      // Validate the parsed intent
      const validation = validateIntentOutput(parsed);
      if (!validation.valid) {
        return {
          error: validation.error,
          raw: parsed
        };
      }
      
      return parsed;
    } catch (parseError) {
      return {
        error: 'Failed to parse LLM response as JSON',
        raw: content
      };
    }
  } catch (error) {
    console.error('Error calling LLM:', error);
    return {
      error: error.message || 'Failed to parse intent'
    };
  }
};

// Validate the LLM output
export const validateIntentOutput = (output) => {
  // Check required fields
  if (!output.intent) {
    return { valid: false, error: 'Missing intent field' };
  }
  
  // Check if intent is supported
  if (output.intent === 'UNSUPPORTED') {
    return { valid: true, unsupported: true };
  }
  
  if (!SUPPORTED_INTENTS.includes(output.intent)) {
    return { 
      valid: false, 
      error: `Unsupported intent: ${output.intent}. Supported: ${SUPPORTED_INTENTS.join(', ')}` 
    };
  }
  
  // Validate temporal relation if present
  const validRelations = ['BEFORE', 'AFTER', 'DURING', 'BETWEEN', 'ALL', null];
  if (output.temporalRelation && !validRelations.includes(output.temporalRelation)) {
    return { 
      valid: false, 
      error: `Invalid temporal relation: ${output.temporalRelation}` 
    };
  }
  
  // Validate reference event if present
  const validEvents = ['ICU_ADMISSION', 'ADMISSION', null];
  if (output.referenceEvent && !validEvents.includes(output.referenceEvent)) {
    return { 
      valid: false, 
      error: `Invalid reference event: ${output.referenceEvent}` 
    };
  }
  
  // Validate confidence
  if (output.confidence !== undefined && (output.confidence < 0 || output.confidence > 1)) {
    return { 
      valid: false, 
      error: 'Confidence must be between 0 and 1' 
    };
  }
  
  return { valid: true };
};

// Map intent to query parameters
export const mapIntentToQuery = (intentOutput, hadmId, subjectId) => {
  const { intent, temporalRelation, referenceEvent, startDate, endDate } = intentOutput;
  
  const queryParams = {
    intent,
    hadmId: hadmId || undefined,
    subjectId: subjectId || undefined
  };
  
  if (temporalRelation) {
    queryParams.temporalRelation = temporalRelation;
  }
  
  if (referenceEvent) {
    queryParams.referenceEvent = referenceEvent;
  }
  
  if (startDate) {
    queryParams.startDate = startDate;
  }
  
  if (endDate) {
    queryParams.endDate = endDate;
  }
  
  return queryParams;
};