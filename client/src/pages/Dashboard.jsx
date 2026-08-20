
// client/src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, Activity, FileText, Pill, ArrowRight } from 'lucide-react';
import api from '../services/api';

const Dashboard = () => {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await api.get('/patients');
      setPatients(response.data.data || []);
    } catch (err) {
      console.error('Error fetching patients:', err);
      setError('Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter((p) => p.subjectId?.toString().includes(searchTerm));

  const stats = [
    { label: 'Total patients', value: patients.length, icon: User },
    { label: 'Total admissions', value: patients.reduce((sum, p) => sum + (p.admissionCount || 0), 0), icon: FileText },
    { label: 'Lab events', value: patients.reduce((sum, p) => sum + (p.labCount || 0), 0), icon: Activity },
    { label: 'Medications', value: patients.reduce((sum, p) => sum + (p.medicationCount || 0), 0), icon: Pill },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-indigo-600 mx-auto"></div>
          <p className="text-sm text-gray-400 mt-3">Loading patients…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-sm text-red-600">{error}</p>
        <button onClick={fetchPatients} className="mt-2 text-sm font-medium text-red-600 hover:text-red-800">
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Patients</h1>
        <p className="text-sm text-gray-500 mt-0.5">MIMIC-IV Demo v2.2 · research prototype</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">{label}</span>
              <Icon className="w-4 h-4 text-gray-300" />
            </div>
            <p className="text-2xl font-semibold text-gray-900 mt-1 font-mono">{value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by patient ID…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400"
              />
            </div>
            <span className="text-xs text-gray-400 flex-shrink-0">{filteredPatients.length} patients</span>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {filteredPatients.length === 0 ? (
            <div className="p-10 text-center text-sm text-gray-400">
              {searchTerm ? 'No patients found' : 'No patients available'}
            </div>
          ) : (
            filteredPatients.map((patient) => (
              <div
                key={patient.subjectId}
                onClick={() => navigate(`/patient/${patient.subjectId}`)}
                className="flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 font-mono">#{patient.subjectId}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{patient.gender}</span>
                      <span className="text-gray-300">·</span>
                      <span>{patient.anchorAge}y</span>
                      <span className="text-gray-300">·</span>
                      <span>{patient.admissionCount || 0} admissions</span>
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300" />
              </div>
            ))
          )}
        </div>
      </div>

      <p className="text-center text-xs text-gray-400">
        MIMIC-IV Demo v2.2 · {patients.length} patients · research prototype — not for clinical use
      </p>
    </div>
  );
};

export default Dashboard;