// evaluation/metrics.js

/**
 * Calculate structured-fact accuracy
 * Measures if the system returned the expected type of evidence
 */
export function calculateFactAccuracy(result, groundTruth) {
  if (!result || !groundTruth) return 0;

  let score = 0;
  const checks = [];

  // Check if evidence was returned
  if (groundTruth.expectedBehavior === 'RETURN_EVIDENCE') {
    const hasEvidence = result.evidence && result.evidence.length > 0;
    checks.push({
      check: 'has_evidence',
      passed: hasEvidence,
      expected: true,
      actual: hasEvidence
    });
    
    if (hasEvidence) {
      // Check expected source
      if (groundTruth.expectedSource) {
        const hasCorrectSource = result.evidence.some(e => e.table === groundTruth.expectedSource);
        checks.push({
          check: 'correct_source',
          passed: hasCorrectSource,
          expected: groundTruth.expectedSource,
          actual: result.evidence.map(e => e.table)
        });
      }
      
      // Check event types if specified
      if (groundTruth.expectedEventType) {
        const hasExpectedType = result.evidence.some(e => e.eventType === groundTruth.expectedEventType);
        checks.push({
          check: 'correct_event_type',
          passed: hasExpectedType,
          expected: groundTruth.expectedEventType,
          actual: result.evidence.map(e => e.eventType)
        });
      }
      
      // Check min events
      if (groundTruth.minExpectedEvents !== undefined) {
        const meetsMin = result.evidence.length >= groundTruth.minExpectedEvents;
        checks.push({
          check: 'min_events',
          passed: meetsMin,
          expected: `>= ${groundTruth.minExpectedEvents}`,
          actual: result.evidence.length
        });
      }
      
      // Check max events
      if (groundTruth.maxExpectedEvents !== undefined) {
        const meetsMax = result.evidence.length <= groundTruth.maxExpectedEvents;
        checks.push({
          check: 'max_events',
          passed: meetsMax,
          expected: `<= ${groundTruth.maxExpectedEvents}`,
          actual: result.evidence.length
        });
      }
    }
  } else if (groundTruth.expectedBehavior === 'ABSTAIN' || groundTruth.expectedBehavior === 'REJECT') {
    // For abstain/reject, check that the system did NOT return evidence
    const hasNoEvidence = !result.evidence || result.evidence.length === 0;
    checks.push({
      check: 'no_evidence',
      passed: hasNoEvidence,
      expected: true,
      actual: result.evidence ? result.evidence.length : 0
    });
    
    // Check action matches
    const actionMatches = result.action === groundTruth.expectedBehavior;
    checks.push({
      check: 'correct_action',
      passed: actionMatches,
      expected: groundTruth.expectedBehavior,
      actual: result.action
    });
  }

  // Calculate score as percentage of passed checks
  const passed = checks.filter(c => c.passed).length;
  const total = checks.length;
  return total > 0 ? passed / total : 0;
}

/**
 * Calculate temporal-order accuracy
 * Measures if events are returned in chronological order
 */
export function calculateTemporalAccuracy(result) {
  if (!result.evidence || result.evidence.length < 2) {
    return 1.0; // Not applicable or perfect
  }

  const events = result.evidence.filter(e => e.eventTime);
  if (events.length < 2) return 1.0;

  let correctOrder = 0;
  for (let i = 1; i < events.length; i++) {
    const prev = new Date(events[i - 1].eventTime);
    const curr = new Date(events[i].eventTime);
    if (prev <= curr) {
      correctOrder++;
    }
  }

  return correctOrder / (events.length - 1);
}

/**
 * Calculate provenance coverage
 * Measures if patient-level claims have source evidence
 */
export function calculateProvenanceCoverage(result) {
  if (!result.evidence || result.evidence.length === 0) {
    return 0;
  }

  let hasProvenance = 0;
  for (const event of result.evidence) {
    if (event.source && event.source.table && event.source.rowId) {
      hasProvenance++;
    }
  }

  return hasProvenance / result.evidence.length;
}

/**
 * Calculate abstention accuracy
 * Measures if the system correctly refuses unsupported questions
 */
export function calculateAbstentionAccuracy(result, groundTruth) {
  if (!groundTruth.expectedBehavior) return 0;

  const expectedAbstain = groundTruth.expectedBehavior === 'ABSTAIN' || 
                          groundTruth.expectedBehavior === 'REJECT';
  
  if (!expectedAbstain) {
    // For questions that should return evidence, check that it didn't abstain
    const abstained = result.action === 'ABSTAIN' || result.action === 'REJECT';
    return abstained ? 0 : 1;
  }

  // For questions that should abstain, check that it did
  const abstained = result.action === 'ABSTAIN' || result.action === 'REJECT';
  return abstained ? 1 : 0;
}

/**
 * Calculate overall metrics for a test run
 */
export function calculateMetrics(results) {
  const metrics = {
    factAccuracy: {
      score: 0,
      total: 0,
      passed: 0
    },
    temporalAccuracy: {
      score: 0,
      total: 0,
      passed: 0
    },
    provenanceCoverage: {
      score: 0,
      total: 0,
      passed: 0
    },
    abstentionAccuracy: {
      score: 0,
      total: 0,
      passed: 0
    },
    byCategory: {}
  };

  for (const result of results) {
    const { testCase, groundTruth, evalResult } = result;
    
    // Fact accuracy
    if (testCase.expectedBehavior) {
      const factScore = calculateFactAccuracy(evalResult, groundTruth);
      metrics.factAccuracy.total++;
      metrics.factAccuracy.score += factScore;
      if (factScore >= 0.8) metrics.factAccuracy.passed++;
    }
    
    // Temporal accuracy
    if (evalResult.evidence && evalResult.evidence.length > 1) {
      const tempScore = calculateTemporalAccuracy(evalResult);
      metrics.temporalAccuracy.total++;
      metrics.temporalAccuracy.score += tempScore;
      if (tempScore >= 0.9) metrics.temporalAccuracy.passed++;
    }
    
    // Provenance coverage
    if (evalResult.evidence && evalResult.evidence.length > 0) {
      const provScore = calculateProvenanceCoverage(evalResult);
      metrics.provenanceCoverage.total++;
      metrics.provenanceCoverage.score += provScore;
      if (provScore >= 0.9) metrics.provenanceCoverage.passed++;
    }
    
    // Abstention accuracy
    if (testCase.expectedBehavior === 'ABSTAIN' || testCase.expectedBehavior === 'REJECT') {
      const abstainScore = calculateAbstentionAccuracy(evalResult, groundTruth);
      metrics.abstentionAccuracy.total++;
      metrics.abstentionAccuracy.score += abstainScore;
      if (abstainScore >= 0.9) metrics.abstentionAccuracy.passed++;
    }
    
    // By category
    const category = testCase.category || 'UNKNOWN';
    if (!metrics.byCategory[category]) {
      metrics.byCategory[category] = { total: 0, passed: 0 };
    }
    metrics.byCategory[category].total++;
    if (evalResult.success) metrics.byCategory[category].passed++;
  }

  // Calculate averages
  ['factAccuracy', 'temporalAccuracy', 'provenanceCoverage', 'abstentionAccuracy'].forEach(key => {
    if (metrics[key].total > 0) {
      metrics[key].score = metrics[key].score / metrics[key].total;
    }
  });

  return metrics;
}