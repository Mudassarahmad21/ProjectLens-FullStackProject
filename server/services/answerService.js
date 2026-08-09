import openai from '../config/ai.js';

// System prompt for answer generation
const ANSWER_SYSTEM_PROMPT = `You are a research assistant for PatientLens, a platform for exploring structured patient data.

Your ONLY job is to answer questions based on the provided structured evidence.

RULES:
1. Answer ONLY from the supplied evidence
2. Do NOT invent facts or fill in missing values
3. Do NOT infer unsupported clinical conclusions
4. Do NOT provide medical advice or recommendations
5. If evidence is insufficient, explicitly state: "The available evidence is insufficient to answer this question"
6. Be concise and factual
7. Reference specific data points when possible
8. Clearly distinguish between what is directly stated in the evidence and what is inferred

If there is no evidence at all, respond with: "No relevant records were found in the available data."

The source records are authoritative for this answer. Do not use external medical knowledge.`;

// Generate answer from evidence
export const generateAnswer = async (question, intent, evidence, hadmId) => {
  try {
    if (!evidence || evidence.length === 0) {
      return {
        answer: "No relevant records were found in the available data.",
        evidence: [],
        abstained: true,
        reason: 'No evidence provided'
      };
    }

    // Format evidence for the LLM
    const formattedEvidence = evidence.map((item, index) => {
      const record = item.data || item;
      const source = item.source || {};
      
      // Extract relevant fields based on the table
      let fields = [];
      if (source.table === 'labs') {
        fields.push(`Value: ${record.valuenum || record.value || 'N/A'} ${record.valueuom || record.unit || ''}`);
        fields.push(`Lab: ${record.itemid || record.title || 'Unknown'}`);
        fields.push(`Time: ${record.chartTime || record.charttime || 'N/A'}`);
      } else if (source.table === 'prescriptions' || source.table === 'medications') {
        fields.push(`Drug: ${record.drug || record.title || 'Unknown'}`);
        fields.push(`Dose: ${record.doseValRx || record.doseVal || 'N/A'} ${record.doseUnitRx || record.doseUnit || ''}`);
        fields.push(`Time: ${record.startTime || record.starttime || 'N/A'}`);
      } else if (source.table === 'procedures') {
        fields.push(`Procedure: ${record.title || record.description || record.icdCode || 'Unknown'}`);
        fields.push(`Date: ${record.chartDate || record.chartdate || 'N/A'}`);
      } else if (source.table === 'transfers') {
        fields.push(`Transfer: ${record.eventType || record.careunit || 'Unknown'}`);
        fields.push(`Time: ${record.inTime || record.eventtime || 'N/A'}`);
      } else if (source.table === 'diagnoses') {
        fields.push(`Diagnosis: ${record.title || record.description || record.icdCode || 'Unknown'}`);
      } else {
        // Generic fields
        Object.keys(record).forEach(key => {
          if (!['_id', '__v', 'createdAt', 'updatedAt', '_source', 'source'].includes(key)) {
            fields.push(`${key}: ${record[key]}`);
          }
        });
      }

      return `[${index + 1}] ${source.table || 'record'}:\n  ${fields.join('\n  ')}`;
    }).join('\n\n');

    const userPrompt = `Question: ${question}\n\nIntent: ${intent}\n\nEvidence found (${evidence.length} records):\n${formattedEvidence}\n\nBased on this evidence, provide a concise, factual answer to the question.`;

    const response = await openai.chat.completions.create({
      model: process.env.AI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: ANSWER_SYSTEM_PROMPT },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3,
      max_tokens: 500
    });

    const answer = response.choices[0].message.content.trim();

    return {
      answer,
      evidence: evidence.map(item => ({
        eventId: item._id || item.eventId || null,
        table: item.source?.table || 'unknown',
        rowId: item.source?.rowId || 'unknown',
        field: item.source?.field || 'value',
        timestamp: item.data?.chartTime || item.data?.eventTime || null,
        hadmId: hadmId
      })),
      abstained: false,
      evidenceCount: evidence.length
    };

  } catch (error) {
    console.error('Error generating answer:', error);
    return {
      answer: 'Error generating answer. Please try again.',
      evidence: [],
      abstained: true,
      error: error.message
    };
  }
};

// Generate a concise summary answer (for when there are many records)
export const generateSummaryAnswer = async (question, intent, evidence, hadmId) => {
  if (!evidence || evidence.length === 0) {
    return {
      answer: "No relevant records were found in the available data.",
      evidence: [],
      abstained: true
    };
  }

  // For large evidence sets, create a summary without LLM
  if (evidence.length > 50) {
    const recordTypes = {};
    evidence.forEach(item => {
      const type = item.source?.table || 'record';
      recordTypes[type] = (recordTypes[type] || 0) + 1;
    });

    const summary = `Found ${evidence.length} records across ${Object.keys(recordTypes).length} table(s):\n` +
      Object.entries(recordTypes).map(([type, count]) => `- ${count} ${type}`).join('\n') +
      `\n\nShowing first ${Math.min(10, evidence.length)} records for detailed inspection.`;

    return {
      answer: summary,
      evidence: evidence.slice(0, 10),
      abstained: false,
      evidenceCount: evidence.length,
      isSummary: true
    };
  }

  // For smaller sets, generate a detailed answer
  return generateAnswer(question, intent, evidence, hadmId);
};