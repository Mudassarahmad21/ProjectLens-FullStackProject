import React from 'react';
import { FileText } from 'lucide-react';

const SourceRecord = ({ table, record }) => {
  if (!record) return null;

  const formatValue = (value) => {
    if (value === null || value === undefined) return 'null';
    if (typeof value === 'object') return JSON.stringify(value);
    if (value instanceof Date) return value.toLocaleString();
    return String(value);
  };

  const displayFields = Object.entries(record)
    .filter(([key]) => !['_id', '__v', 'createdAt', 'updatedAt', '_source', 'source'].includes(key))
    .slice(0, 15);

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-200 flex items-center gap-2">
        <FileText className="h-3.5 w-3.5 text-gray-400" />
        <span className="text-sm font-medium text-gray-700">Source record</span>
        <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded ml-auto">
          {table}
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <tbody>
            {displayFields.map(([key, value]) => (
              <tr key={key} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                <td className="px-4 py-2 font-mono text-xs text-gray-500 whitespace-nowrap align-top">
                  {key}
                </td>
                <td className="px-4 py-2 font-mono text-sm text-gray-800 break-all">
                  {formatValue(value)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {displayFields.length === 0 && (
          <div className="px-4 py-4 text-center text-sm text-gray-400">No fields to display</div>
        )}
      </div>
    </div>
  );
};

export default SourceRecord;