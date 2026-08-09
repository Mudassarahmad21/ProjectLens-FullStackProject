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
        const response = await getPatients({
          search: searchTerm,
          limit: 50,
          page: pagination.page,
        });
        setPatients(response.data.data);
        setPagination({
          page: response.data.pagination.page,
          total: response.data.pagination.total,
        });
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

  const handleSelect = (subjectId) => {
    onSelectPatient(subjectId);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Users className="h-5 w-5 text-indigo-600" />
        <h3 className="font-semibold text-gray-700">Select Patient</h3>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by patient ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      {loading && (
        <div className="mt-3 text-center text-gray-500 text-sm">Loading patients...</div>
      )}

      {error && (
        <div className="mt-3 text-center text-red-600 text-sm">{error}</div>
      )}

      {!loading && !error && (
        <div className="mt-3 max-h-60 overflow-y-auto">
          {patients.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">No patients found</p>
          ) : (
            <ul className="space-y-1">
              {patients.map((patient) => (
                <li key={patient.subjectId}>
                  <button
                    onClick={() => handleSelect(patient.subjectId)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      selectedSubjectId === patient.subjectId
                        ? 'bg-indigo-100 text-indigo-700 font-medium'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-sm">#{patient.subjectId}</span>
                      <span className="text-xs text-gray-500">
                        {patient.gender} · {patient.anchorAge}y
                      </span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {pagination.total > 0 && (
        <div className="mt-3 text-xs text-gray-500 text-center">
          Showing {patients.length} of {pagination.total} patients
        </div>
      )}
    </div>
  );
};

export default PatientSelector;