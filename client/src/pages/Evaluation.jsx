// client/src/pages/Evaluation.jsx

import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  CartesianGrid 
} from 'recharts';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  TrendingUp,
  Database,
  Shield,
  Clock
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
      
      // Log the response to see what we're getting
      console.log('Evaluation API Response:', response.data);
      
      // Handle different response structures
      let data = response.data;
      
      // If the response has a 'data' property, use that
      if (data.data) {
        data = data.data;
      }
      
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading evaluation results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-yellow-800">No Evaluation Results Found</h2>
          <p className="text-yellow-700 mt-2">{error}</p>
          <button
            onClick={fetchResults}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Check if we have valid results
  if (!results || !results.summary) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
          <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700">No Evaluation Data</h2>
          <p className="text-gray-500 mt-2">
            Run the evaluation script to generate results.
          </p>
          <div className="mt-4 p-4 bg-gray-100 rounded-lg text-left">
            <code className="text-sm text-gray-700">npm run evaluate</code>
          </div>
        </div>
      </div>
    );
  }

  const { summary, details, timestamp } = results;
  
  // Handle case where summary might not have the expected structure
  if (!summary.ai || !summary.baseline) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-yellow-800">Invalid Results Format</h2>
          <p className="text-yellow-700 mt-2">
            The evaluation results are in an unexpected format. Please re-run the evaluation.
          </p>
          <pre className="mt-4 text-left text-xs bg-yellow-100 p-4 rounded overflow-auto max-h-40">
            {JSON.stringify(results, null, 2)}
          </pre>
        </div>
      </div>
    );
  }

  const { ai, baseline } = summary;
  const totalTests = details && details.ai ? details.ai.length : 0;
  const passedTests = details && details.ai ? details.ai.filter(t => t.success).length : 0;

  // Default metrics if they don't exist
  const aiMetrics = ai.metrics || { factAccuracy: 0, temporalAccuracy: 0, provenanceCoverage: 0, abstentionAccuracy: 0 };
  const baselineMetrics = baseline.metrics || { factAccuracy: 0, temporalAccuracy: 0, provenanceCoverage: 0, abstentionAccuracy: 0 };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">📊 Evaluation Dashboard</h1>
        <p className="text-gray-500 mt-1">
          PatientLens prototype evaluation results
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Last updated: {timestamp ? new Date(timestamp).toLocaleString() : 'Unknown'}
        </p>
      </div>

      {/* Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8">
        <p className="text-sm text-amber-700">
          ⚠️ These results evaluate prototype retrieval behavior on the supplied demo dataset 
          and do not establish clinical effectiveness or generalizability.
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-500 text-sm">Total Tests</span>
            <Database className="w-5 h-5 text-indigo-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">{totalTests}</p>
          <p className="text-sm text-gray-400">Test cases run</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-500 text-sm">Passed</span>
            <CheckCircle className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-600 mt-1">{passedTests}</p>
          <p className="text-sm text-gray-400">Successfully passed</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-500 text-sm">AI Success Rate</span>
            <TrendingUp className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(0) : 0}%
          </p>
          <p className="text-sm text-gray-400">AI system performance</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-500 text-sm">Baseline vs AI</span>
            <Shield className="w-5 h-5 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-purple-600 mt-1">
            {ai.total > 0 && baseline.total > 0 
              ? ((ai.passed / ai.total) * 100 - (baseline.passed / baseline.total) * 100).toFixed(0)
              : 0}%
          </p>
          <p className="text-sm text-gray-400">Improvement over baseline</p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">📈 AI System Metrics</h2>
          <div className="space-y-4">
            <MetricBar 
              label="Fact Accuracy" 
              value={aiMetrics.factAccuracy || 0} 
              color="indigo"
              icon={<CheckCircle className="w-4 h-4" />}
            />
            <MetricBar 
              label="Temporal Accuracy" 
              value={aiMetrics.temporalAccuracy || 0} 
              color="blue"
              icon={<Clock className="w-4 h-4" />}
            />
            <MetricBar 
              label="Provenance Coverage" 
              value={aiMetrics.provenanceCoverage || 0} 
              color="green"
              icon={<Database className="w-4 h-4" />}
            />
            <MetricBar 
              label="Abstention Accuracy" 
              value={aiMetrics.abstentionAccuracy || 0} 
              color="purple"
              icon={<Shield className="w-4 h-4" />}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">📊 Baseline Comparison</h2>
          <div className="space-y-4">
            <ComparisonBar 
              label="Fact Accuracy" 
              aiValue={aiMetrics.factAccuracy || 0}
              baselineValue={baselineMetrics.factAccuracy || 0}
            />
            <ComparisonBar 
              label="Temporal Accuracy" 
              aiValue={aiMetrics.temporalAccuracy || 0}
              baselineValue={baselineMetrics.temporalAccuracy || 0}
            />
            <ComparisonBar 
              label="Provenance Coverage" 
              aiValue={aiMetrics.provenanceCoverage || 0}
              baselineValue={baselineMetrics.provenanceCoverage || 0}
            />
            <ComparisonBar 
              label="Abstention Accuracy" 
              aiValue={aiMetrics.abstentionAccuracy || 0}
              baselineValue={baselineMetrics.abstentionAccuracy || 0}
            />
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">📊 AI vs Baseline Comparison</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={[
                {
                  metric: 'Fact Accuracy',
                  AI: (aiMetrics.factAccuracy || 0) * 100,
                  Baseline: (baselineMetrics.factAccuracy || 0) * 100,
                },
                {
                  metric: 'Temporal Accuracy',
                  AI: (aiMetrics.temporalAccuracy || 0) * 100,
                  Baseline: (baselineMetrics.temporalAccuracy || 0) * 100,
                },
                {
                  metric: 'Provenance Coverage',
                  AI: (aiMetrics.provenanceCoverage || 0) * 100,
                  Baseline: (baselineMetrics.provenanceCoverage || 0) * 100,
                },
                {
                  metric: 'Abstention Accuracy',
                  AI: (aiMetrics.abstentionAccuracy || 0) * 100,
                  Baseline: (baselineMetrics.abstentionAccuracy || 0) * 100,
                },
              ]}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="metric" />
              <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
              <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
              <Legend />
              <Bar dataKey="AI" fill="#4F46E5" />
              <Bar dataKey="Baseline" fill="#9CA3AF" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Test Case Details */}
      {details && details.ai && details.ai.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">📋 Test Case Details</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 font-medium text-gray-500">ID</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-500">Category</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-500">Question</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-500">Expected</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-500">Actual</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {details.ai.map((test, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 px-3 font-mono text-xs text-gray-600">{test.id}</td>
                    <td className="py-2 px-3">
                      <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-700">
                        {test.category}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-gray-700 max-w-xs truncate">{test.question}</td>
                    <td className="py-2 px-3">
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                        {test.expected}
                      </span>
                    </td>
                    <td className="py-2 px-3">
                      <span className="px-2 py-1 bg-gray-50 text-gray-700 rounded text-xs">
                        {test.actual || 'N/A'}
                      </span>
                    </td>
                    <td className="py-2 px-3">
                      {test.success ? (
                        <span className="flex items-center text-green-600">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Pass
                        </span>
                      ) : (
                        <span className="flex items-center text-red-600">
                          <XCircle className="w-4 h-4 mr-1" />
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

// Helper Components
const MetricBar = ({ label, value, color, icon }) => {
  const colors = {
    indigo: 'bg-indigo-600',
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    purple: 'bg-purple-600',
  };

  const percentage = (value * 100).toFixed(1);

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm text-gray-600 flex items-center">
          {icon && <span className="mr-2">{icon}</span>}
          {label}
        </span>
        <span className="text-sm font-medium text-gray-800">{percentage}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className={`${colors[color] || 'bg-indigo-600'} h-2.5 rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

const ComparisonBar = ({ label, aiValue, baselineValue }) => {
  const aiPercent = (aiValue * 100).toFixed(1);
  const baselinePercent = (baselineValue * 100).toFixed(1);

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm text-gray-600">{label}</span>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">Baseline: {baselinePercent}%</span>
          <span className="text-sm font-medium text-indigo-600">AI: {aiPercent}%</span>
        </div>
      </div>
      <div className="flex gap-1">
        <div className="flex-1 bg-gray-200 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-gray-400 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${baselinePercent}%` }}
          />
        </div>
        <div className="flex-1 bg-gray-200 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${aiPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default Evaluation;