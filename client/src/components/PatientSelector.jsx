import React, { useState, useEffect } from 'react';
import { Search, Users } from 'lucide-react';
import { getPatients } from '../services/api';

const PatientSelector = ({ onSelectPatient, selectedSubjectId }) => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, total: 0 });

  useEffect(() => {
    const fetchPatients = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getPatients({ search: searchTerm, limit: 50, page: pagination.page });
        setPatients(response.data.data);
        setPagination({ page: response.data.pagination.page, total: response.data.pagination.total });
      } catch (err) {
        setError('Failed to load patients');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounce = setTimeout(fetchPatients, 500);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm, pagination.page]);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Users className="h-4 w-4 text-gray-400" />
        <h3 className="text-sm font-semibold text-gray-700">Select patient</h3>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by patient ID…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400"
        />
      </div>

      {loading && <div className="mt-3 text-center text-sm text-gray-400">Loading…</div>}
      {error && <div className="mt-3 text-center text-sm text-red-600">{error}</div>}

      {!loading && !error && (
        <div className="mt-3 max-h-60 overflow-y-auto -mx-1 px-1">
          {patients.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No patients found</p>
          ) : (
            <ul className="space-y-1">
              {patients.map((patient) => {
                const selected = selectedSubjectId === patient.subjectId;
                return (
                  <li key={patient.subjectId}>
                    <button
                      onClick={() => onSelectPatient(patient.subjectId)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        selected ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-mono text-sm font-medium">#{patient.subjectId}</span>
                        <span className="text-xs text-gray-500">
                          {patient.gender} · {patient.anchorAge}y
                        </span>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      {pagination.total > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400 text-center">
          Showing {patients.length} of {pagination.total} patients
        </div>
      )}
    </div>
  );
};

export default PatientSelector;