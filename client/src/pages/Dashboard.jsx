// client/src/pages/Dashboard.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, Activity, FileText, Pill, Syringe, ArrowRight } from 'lucide-react';
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

  const filteredPatients = patients.filter(p =>
    p.subjectId?.toString().includes(searchTerm)
  );

  const stats = [
    { label: 'Total Patients', value: patients.length, icon: User, color: 'indigo' },
    { label: 'Total Admissions', value: patients.reduce((sum, p) => sum + (p.admissionCount || 0), 0), icon: FileText, color: 'blue' },
    { label: 'Lab Events', value: patients.reduce((sum, p) => sum + (p.labCount || 0), 0), icon: Activity, color: 'green' },
    { label: 'Medications', value: patients.reduce((sum, p) => sum + (p.medicationCount || 0), 0), icon: Pill, color: 'purple' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading patients...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600">{error}</p>
        <button
          onClick={fetchPatients}
          className="mt-2 text-sm text-red-600 hover:text-red-800"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">{label}</span>
              <div className={`w-8 h-8 rounded-lg bg-${color}-50 flex items-center justify-center`}>
                <Icon className={`w-4 h-4 text-${color}-600`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          </div>
        ))}
      </div>

      {/* Patient Search */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by patient ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <span className="text-sm text-gray-400">{filteredPatients.length} patients</span>
          </div>
        </div>

        {/* Patient List */}
        <div className="divide-y divide-gray-100">
          {filteredPatients.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {searchTerm ? 'No patients found' : 'No patients available'}
            </div>
          ) : (
            filteredPatients.map((patient) => (
              <div
                key={patient.subjectId}
                onClick={() => navigate(`/patient/${patient.subjectId}`)}
                className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                    <span className="text-indigo-600 font-medium">
                      {patient.gender === 'F' ? '👩' : '👨'}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">ID: {patient.subjectId}</p>
                    <div className="flex items-center space-x-3 text-sm text-gray-500">
                      <span>Gender: {patient.gender}</span>
                      <span>•</span>
                      <span>Age: {patient.anchorAge}</span>
                      <span>•</span>
                      <span>{patient.admissionCount || 0} admissions</span>
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-gray-400 py-4">
        <p>MIMIC-IV Demo v2.2 • {patients.length} patients • Research Prototype</p>
      </div>
    </div>
  );
};

export default Dashboard;