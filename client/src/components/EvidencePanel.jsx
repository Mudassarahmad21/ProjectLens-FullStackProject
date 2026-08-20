import React, { useState, useEffect } from 'react';
import {
  X, Database, User, Activity, AlertCircle, CheckCircle, Loader2, Link2,
} from 'lucide-react';
import { getEvidence } from '../services/api';
import SourceRecord from './SourceRecord';

const EvidencePanel = ({ isOpen, onClose, eventId }) => {
  const [evidence, setEvidence] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen || !eventId) return;

    const fetchEvidence = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getEvidence(eventId);
        setEvidence(response.data.data);
      } catch (err) {
        console.error('Failed to load evidence:', err);
        setError(err.response?.data?.message || 'Failed to load evidence');
      } finally {
        setLoading(false);
      }
    };

    fetchEvidence();
  }, [isOpen, eventId]);

  if (!isOpen) return null;

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-gray-900/40" onClick={onClose}></div>

      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-gray-400" />
              <h3 className="text-sm font-semibold text-gray-800">Source evidence</h3>
              <span className="text-[11px] font-medium text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
                Provenance
              </span>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="h-4.5 w-4.5 text-gray-400" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(90vh-60px)]">
            {loading && (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
                <span className="ml-3 text-sm text-gray-500">Loading evidence…</span>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              </div>
            )}

            {evidence && !loading && (
              <div className="space-y-5">
                <div className={`flex items-center gap-2 text-sm ${evidence.found ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {evidence.found ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                  <span>
                    Source record {evidence.found ? 'found' : 'not found'} in{' '}
                    <span className="font-mono">{evidence.source.table}</span>
                  </span>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h4 className="text-xs font-medium text-gray-400 mb-3 uppercase tracking-wide">Event details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-xs text-gray-400">Type</span>
                      <p className="font-medium text-gray-800">{evidence.event.type}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400">Title</span>
                      <p className="font-medium text-gray-800">{evidence.event.title}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400">Value</span>
                      <p className="font-medium text-gray-800">
                        {evidence.event.value || 'N/A'}{evidence.event.unit && ` ${evidence.event.unit}`}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400">Time</span>
                      <p className="font-medium text-gray-800">{formatDate(evidence.event.time)}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <User className="h-4 w-4" />
                      <h4 className="text-xs font-medium uppercase tracking-wide">Patient</h4>
                    </div>
                    <div className="text-sm space-y-1 text-gray-700">
                      <div>ID: <span className="font-mono font-medium">{evidence.patient.subjectId}</span></div>
                      <div>Gender: {evidence.patient.gender}</div>
                      <div>Age: {evidence.patient.anchorAge}</div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <Activity className="h-4 w-4" />
                      <h4 className="text-xs font-medium uppercase tracking-wide">Admission</h4>
                    </div>
                    <div className="text-sm space-y-1 text-gray-700">
                      <div>ID: <span className="font-mono font-medium">{evidence.admission.hadmId}</span></div>
                      <div>Type: {evidence.admission.type}</div>
                      <div>Time: {formatDate(evidence.admission.time)}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-indigo-50/60 rounded-lg p-4 border border-indigo-100">
                  <h4 className="text-xs font-medium text-indigo-700 mb-3 flex items-center gap-2 uppercase tracking-wide">
                    <Link2 className="h-3.5 w-3.5" />
                    Source provenance
                  </h4>
                  <div className="space-y-2 text-sm font-mono">
                    {[
                      ['Table', evidence.source.table],
                      ['Row ID', evidence.source.rowId],
                      ['Field', evidence.source.field || 'N/A'],
                      ['Timestamp field', evidence.source.timestampField || 'N/A'],
                    ].map(([label, value], i, arr) => (
                      <div
                        key={label}
                        className={`flex justify-between py-1 ${i < arr.length - 1 ? 'border-b border-indigo-100' : ''}`}
                      >
                        <span className="text-indigo-600 font-sans">{label}</span>
                        <span className="font-medium text-gray-800">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h4 className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">Traceability path</h4>
                  <div className="flex items-center gap-2 text-xs text-gray-600 flex-wrap font-mono">
                    {evidence.traceability.map((step, index) => (
                      <React.Fragment key={index}>
                        <span className="bg-white px-2 py-1 rounded border border-gray-200">{step}</span>
                        {index < evidence.traceability.length - 1 && <span className="text-gray-300">&rarr;</span>}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                {evidence.sourceRecord && (
                  <SourceRecord table={evidence.source.table} record={evidence.sourceRecord} />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvidencePanel;