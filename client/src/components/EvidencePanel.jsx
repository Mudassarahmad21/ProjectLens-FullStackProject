import React, { useState, useEffect } from "react";
import {
  X,
  Database,
  Hash,
  Calendar,
  User,
  Activity,
  AlertCircle,
  CheckCircle,
  Loader2,
  Link2,
  ExternalLink,
} from "lucide-react";
import { getEvidence } from "../services/api";
import SourceRecord from "./SourceRecord";

const EvidencePanel = ({ isOpen, onClose, eventId }) => {
  const [evidence, setEvidence] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && eventId) {
      fetchEvidence();
    }
  }, [isOpen, eventId]);

  const fetchEvidence = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getEvidence(eventId);
      setEvidence(response.data.data);
    } catch (err) {
      console.error("Failed to load evidence:", err);
      setError(err.response?.data?.message || "Failed to load evidence");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      ></div>

      {/* Panel */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-indigo-600" />
              <h3 className="text-lg font-semibold text-gray-800">
                Source Evidence
              </h3>
              <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                Provenance
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {loading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                <span className="ml-3 text-gray-500">Loading evidence...</span>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="h-5 w-5" />
                  <span>{error}</span>
                </div>
              </div>
            )}

            {evidence && !loading && (
              <div className="space-y-6">
                {/* Status */}
                <div
                  className={`flex items-center gap-2 text-sm ${
                    evidence.found ? "text-green-600" : "text-amber-600"
                  }`}
                >
                  {evidence.found ? (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      <span>
                        Source record found in {evidence.source.table}
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4" />
                      <span>
                        Source record not found in {evidence.source.table}
                      </span>
                    </>
                  )}
                </div>

                {/* Event Info */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    Event Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500">Type</span>
                      <p className="font-medium text-gray-800">
                        {evidence.event.type}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Title</span>
                      <p className="font-medium text-gray-800">
                        {evidence.event.title}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Value</span>
                      <p className="font-medium text-gray-800">
                        {evidence.event.value || "N/A"}
                        {evidence.event.unit && ` ${evidence.event.unit}`}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Time</span>
                      <p className="font-medium text-gray-800">
                        {formatDate(evidence.event.time)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Patient & Admission */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center gap-2 text-blue-700 mb-2">
                      <User className="h-4 w-4" />
                      <h4 className="text-sm font-medium">Patient</h4>
                    </div>
                    <div className="text-sm space-y-1">
                      <div>
                        ID:{" "}
                        <span className="font-mono font-medium">
                          {evidence.patient.subjectId}
                        </span>
                      </div>
                      <div>Gender: {evidence.patient.gender}</div>
                      <div>Age: {evidence.patient.anchorAge}</div>
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <div className="flex items-center gap-2 text-green-700 mb-2">
                      <Activity className="h-4 w-4" />
                      <h4 className="text-sm font-medium">Admission</h4>
                    </div>
                    <div className="text-sm space-y-1">
                      <div>
                        ID:{" "}
                        <span className="font-mono font-medium">
                          {evidence.admission.hadmId}
                        </span>
                      </div>
                      <div>Type: {evidence.admission.type}</div>
                      <div>Time: {formatDate(evidence.admission.time)}</div>
                    </div>
                  </div>
                </div>

                {/* Source Information */}
                <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                  <h4 className="text-sm font-medium text-indigo-700 mb-3 flex items-center gap-2">
                    <Link2 className="h-4 w-4" />
                    Source Provenance
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between py-1 border-b border-indigo-100">
                      <span className="text-indigo-600">Table</span>
                      <span className="font-mono font-medium">
                        {evidence.source.table}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-indigo-100">
                      <span className="text-indigo-600">Row ID</span>
                      <span className="font-mono font-medium">
                        {evidence.source.rowId}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-indigo-100">
                      <span className="text-indigo-600">Field</span>
                      <span className="font-mono font-medium">
                        {evidence.source.field || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-indigo-600">Timestamp Field</span>
                      <span className="font-mono font-medium">
                        {evidence.source.timestampField || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Traceability */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Traceability Path
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-gray-600 flex-wrap">
                    {evidence.traceability.map((step, index) => (
                      <React.Fragment key={index}>
                        <span className="bg-white px-2 py-1 rounded border border-gray-200">
                          {step}
                        </span>
                        {index < evidence.traceability.length - 1 && (
                          <span className="text-gray-400">→</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                {/* Source Record */}
                {evidence.sourceRecord && (
                  <SourceRecord
                    table={evidence.source.table}
                    record={evidence.sourceRecord}
                  />
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
