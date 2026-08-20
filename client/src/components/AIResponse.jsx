import React, { useState } from 'react';
import {
  ChevronDown, ChevronUp, Database, Link2, AlertTriangle, CheckCircle, FileText,
} from 'lucide-react';
import EvidencePanel from './EvidencePanel';

const AIResponse = ({ result }) => {
  const [showEvidence, setShowEvidence] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [showEvidencePanel, setShowEvidencePanel] = useState(false);

  if (!result) return null;

  const handleViewEvidence = (eventId) => {
    setSelectedEventId(eventId);
    setShowEvidencePanel(true);
  };

  const isSupported = result.intent !== 'UNSUPPORTED';
  const hasAnswer = !result.abstained && result.answer;

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">AI response</span>
          {isSupported && (
            <span className="text-[11px] font-medium font-mono text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
              {result.intent}
            </span>
          )}
        </div>
        {isSupported && result.confidence != null && (
          <span className="text-xs text-gray-400">{(result.confidence * 100).toFixed(0)}% confidence</span>
        )}
      </div>

      <div className="p-4 space-y-4">
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <div className="text-xs font-medium text-gray-400 mb-0.5">Question</div>
          <p className="text-sm text-gray-800">{result.question}</p>
        </div>

        {!isSupported && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-start gap-2.5 text-amber-800">
              <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-medium">Question outside scope</div>
                <p className="text-sm opacity-90">{result.message || result.reasoning}</p>
              </div>
            </div>
          </div>
        )}

        {isSupported && result.abstained && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-start gap-2.5 text-amber-800">
              <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-medium">No evidence found</div>
                <p className="text-sm opacity-90">{result.answer}</p>
              </div>
            </div>
          </div>
        )}

        {isSupported && hasAnswer && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
            <div className="flex items-start gap-2.5 text-emerald-800">
              <CheckCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="text-sm font-medium">Answer</div>
                <div className="text-sm whitespace-pre-wrap opacity-90">{result.answer}</div>
                {result.isSummary && (
                  <div className="mt-1.5 text-xs opacity-75">
                    Summary of {result.evidenceCount} records
                  </div>
                )}
                {result.temporalRelation && (
                  <div className="mt-1 text-xs opacity-75">
                    Temporal: {result.temporalRelation}
                    {result.referenceEvent && ` (${result.referenceEvent})`}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {isSupported && result.evidence && result.evidence.length > 0 && (
          <div>
            <button
              onClick={() => setShowEvidence(!showEvidence)}
              className="flex items-center justify-between w-full text-left text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Evidence ({result.evidence.length} source{result.evidence.length > 1 ? 's' : ''})
              </span>
              {showEvidence ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>

            {showEvidence && (
              <div className="mt-2 space-y-1.5 max-h-60 overflow-y-auto">
                {result.evidence.map((item, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 rounded-lg px-3 py-2 border border-gray-200 flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2 text-sm min-w-0">
                      <span className="font-mono text-xs text-gray-400">#{index + 1}</span>
                      <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-gray-200 text-gray-600">
                        {item.table}
                      </span>
                      {item.field && <span className="text-xs text-gray-500 truncate">{item.field}</span>}
                      {item.timestamp && (
                        <span className="text-xs text-gray-400 flex-shrink-0">
                          {new Date(item.timestamp).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleViewEvidence(item.eventId)}
                      className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 flex-shrink-0"
                    >
                      <Link2 className="h-3 w-3" />
                      Source
                    </button>
                  </div>
                ))}

                {result.evidenceCount > result.evidence.length && (
                  <div className="text-xs text-gray-400 text-center py-1.5">
                    +{result.evidenceCount - result.evidence.length} more records (shown in summary)
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <EvidencePanel
        isOpen={showEvidencePanel}
        onClose={() => setShowEvidencePanel(false)}
        eventId={selectedEventId}
      />
    </div>
  );
};

export default AIResponse;