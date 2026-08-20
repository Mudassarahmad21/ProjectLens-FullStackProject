// client/src/pages/Evaluation.jsx
import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import {
  CheckCircle, XCircle, AlertTriangle, TrendingUp, Database, Shield, Clock,
} from 'lucide-react';
import api from '../services/api';

const Evaluation = () => {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const response = await api.get('/evaluation/results');
      let data = response.data;
      if (data.data) data = data.data;
      setResults(data);
    } catch (err) {
      console.error('Error fetching evaluation results:', err);
      setError('Failed to load evaluation results. Please run the evaluation first.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-indigo-600 mx-auto"></div>
          <p className="text-sm text-gray-400 mt-3">Loading evaluation results…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-8 text-center">
          <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-3" />
          <h2 className="text-base font-semibold text-amber-800">No evaluation results found</h2>
          <p className="text-sm text-amber-700 mt-1.5">{error}</p>
          <button
            onClick={fetchResults}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!results || !results.summary) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <Database className="w-8 h-8 text-gray-300 mx-auto mb-3" />
          <h2 className="text-base font-semibold text-gray-700">No evaluation data</h2>
          <p className="text-sm text-gray-500 mt-1.5">Run the evaluation script to generate results.</p>
          <div className="mt-4 p-3 bg-gray-50 rounded-lg inline-block border border-gray-200">
            <code className="text-sm text-gray-700 font-mono">npm run evaluate</code>
          </div>
        </div>
      </div>
    );
  }

  const { summary, details, timestamp } = results;

  if (!summary.ai || !summary.baseline) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-8 text-center">
          <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-3" />
          <h2 className="text-base font-semibold text-amber-800">Invalid results format</h2>
          <p className="text-sm text-amber-700 mt-1.5">
            The evaluation results are in an unexpected format. Please re-run the evaluation.
          </p>
          <pre className="mt-4 text-left text-xs bg-amber-100/60 p-4 rounded-lg overflow-auto max-h-40 font-mono">
            {JSON.stringify(results, null, 2)}
          </pre>
        </div>
      </div>
    );
  }

  const { ai, baseline } = summary;
  const totalTests = details?.ai ? details.ai.length : 0;
  const passedTests = details?.ai ? details.ai.filter((t) => t.success).length : 0;

  const aiMetrics = ai.metrics || { factAccuracy: 0, temporalAccuracy: 0, provenanceCoverage: 0, abstentionAccuracy: 0 };
  const baselineMetrics = baseline.metrics || { factAccuracy: 0, temporalAccuracy: 0, provenanceCoverage: 0, abstentionAccuracy: 0 };

  const improvement = ai.total > 0 && baseline.total > 0
    ? ((ai.passed / ai.total) * 100 - (baseline.passed / baseline.total) * 100).toFixed(0)
    : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Evaluation dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">PatientLens prototype evaluation results</p>
        <p className="text-xs text-gray-400 mt-1 font-mono">
          Last updated: {timestamp ? new Date(timestamp).toLocaleString() : 'Unknown'}
        </p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <p className="text-sm text-amber-700">
          These results evaluate prototype retrieval behavior on the supplied demo dataset and do not
          establish clinical effectiveness or generalizability.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Total tests" value={totalTests} icon={Database} />
        <StatCard label="Passed" value={passedTests} icon={CheckCircle} valueClass="text-emerald-600" />
        <StatCard
          label="AI success rate"
          value={`${totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(0) : 0}%`}
          icon={TrendingUp}
          valueClass="text-indigo-600"
        />
        <StatCard label="Improvement vs. baseline" value={`${improvement}%`} icon={Shield} valueClass="text-purple-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-800 mb-4">AI system metrics</h2>
          <div className="space-y-4">
            <MetricBar label="Fact accuracy" value={aiMetrics.factAccuracy} icon={<CheckCircle className="w-3.5 h-3.5" />} />
            <MetricBar label="Temporal accuracy" value={aiMetrics.temporalAccuracy} icon={<Clock className="w-3.5 h-3.5" />} />
            <MetricBar label="Provenance coverage" value={aiMetrics.provenanceCoverage} icon={<Database className="w-3.5 h-3.5" />} />
            <MetricBar label="Abstention accuracy" value={aiMetrics.abstentionAccuracy} icon={<Shield className="w-3.5 h-3.5" />} />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-800 mb-4">Baseline comparison</h2>
          <div className="space-y-4">
            <ComparisonBar label="Fact accuracy" aiValue={aiMetrics.factAccuracy} baselineValue={baselineMetrics.factAccuracy} />
            <ComparisonBar label="Temporal accuracy" aiValue={aiMetrics.temporalAccuracy} baselineValue={baselineMetrics.temporalAccuracy} />
            <ComparisonBar label="Provenance coverage" aiValue={aiMetrics.provenanceCoverage} baselineValue={baselineMetrics.provenanceCoverage} />
            <ComparisonBar label="Abstention accuracy" aiValue={aiMetrics.abstentionAccuracy} baselineValue={baselineMetrics.abstentionAccuracy} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-800 mb-4">AI vs. baseline comparison</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={[
                { metric: 'Fact accuracy', AI: (aiMetrics.factAccuracy || 0) * 100, Baseline: (baselineMetrics.factAccuracy || 0) * 100 },
                { metric: 'Temporal accuracy', AI: (aiMetrics.temporalAccuracy || 0) * 100, Baseline: (baselineMetrics.temporalAccuracy || 0) * 100 },
                { metric: 'Provenance coverage', AI: (aiMetrics.provenanceCoverage || 0) * 100, Baseline: (baselineMetrics.provenanceCoverage || 0) * 100 },
                { metric: 'Abstention accuracy', AI: (aiMetrics.abstentionAccuracy || 0) * 100, Baseline: (baselineMetrics.abstentionAccuracy || 0) * 100 },
              ]}
              margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="metric" tick={{ fontSize: 12, fill: '#6B7280' }} />
              <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 12, fill: '#6B7280' }} />
              <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="AI" fill="#4F46E5" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Baseline" fill="#D1D5DB" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {details?.ai?.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-800 mb-4">Test case details</h2>
          <div className="overflow-x-auto -mx-5 px-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-xs text-gray-400">
                  <th className="py-2 pr-3 font-medium">ID</th>
                  <th className="py-2 pr-3 font-medium">Category</th>
                  <th className="py-2 pr-3 font-medium">Question</th>
                  <th className="py-2 pr-3 font-medium">Expected</th>
                  <th className="py-2 pr-3 font-medium">Actual</th>
                  <th className="py-2 pr-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {details.ai.map((test, index) => (
                  <tr key={index} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                    <td className="py-2 pr-3 font-mono text-xs text-gray-500">{test.id}</td>
                    <td className="py-2 pr-3">
                      <span className="px-1.5 py-0.5 bg-gray-100 rounded text-xs text-gray-600">{test.category}</span>
                    </td>
                    <td className="py-2 pr-3 text-gray-700 max-w-xs truncate">{test.question}</td>
                    <td className="py-2 pr-3">
                      <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">{test.expected}</span>
                    </td>
                    <td className="py-2 pr-3">
                      <span className="px-1.5 py-0.5 bg-gray-50 text-gray-600 rounded text-xs">{test.actual || 'N/A'}</span>
                    </td>
                    <td className="py-2 pr-3">
                      {test.success ? (
                        <span className="flex items-center gap-1 text-emerald-600 text-xs font-medium">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Pass
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-red-600 text-xs font-medium">
                          <XCircle className="w-3.5 h-3.5" />
                          Fail
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ label, value, icon: Icon, valueClass = 'text-gray-900' }) => (
  <div className="bg-white rounded-lg border border-gray-200 p-4">
    <div className="flex items-center justify-between">
      <span className="text-xs text-gray-500">{label}</span>
      <Icon className="w-4 h-4 text-gray-300" />
    </div>
    <p className={`text-2xl font-semibold mt-1 font-mono ${valueClass}`}>{value}</p>
  </div>
);

const MetricBar = ({ label, value, icon }) => {
  const percentage = ((value || 0) * 100).toFixed(1);
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm text-gray-600 flex items-center gap-1.5">
          <span className="text-gray-400">{icon}</span>
          {label}
        </span>
        <span className="text-sm font-medium text-gray-800 font-mono">{percentage}%</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-1.5">
        <div className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
};

const ComparisonBar = ({ label, aiValue, baselineValue }) => {
  const aiPercent = ((aiValue || 0) * 100).toFixed(1);
  const baselinePercent = ((baselineValue || 0) * 100).toFixed(1);

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm text-gray-600">{label}</span>
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="text-gray-400">Base {baselinePercent}%</span>
          <span className="text-indigo-600 font-medium">AI {aiPercent}%</span>
        </div>
      </div>
      <div className="flex gap-1">
        <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
          <div className="bg-gray-400 h-1.5 rounded-full transition-all duration-500" style={{ width: `${baselinePercent}%` }} />
        </div>
        <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
          <div className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500" style={{ width: `${aiPercent}%` }} />
        </div>
      </div>
    </div>
  );
};

export default Evaluation;