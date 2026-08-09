import React from 'react';
import { Filter, X } from 'lucide-react';

const EVENT_TYPES = ['All', 'LAB', 'MEDICATION', 'PROCEDURE', 'TRANSFER', 'DIAGNOSIS', 'ICU'];

const EventFilters = ({ selectedFilter, onFilterChange, eventStats }) => {
  const getCount = (type) => {
    if (!eventStats) return 0;
    if (type === 'All') {
      return Object.values(eventStats).reduce((sum, count) => sum + count, 0);
    }
    return eventStats[type] || 0;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
      <div className="flex items-center gap-2 mb-2">
        <Filter className="h-4 w-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">Filter Events</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {EVENT_TYPES.map((type) => {
          const count = getCount(type);
          const isSelected = selectedFilter === type;
          return (
            <button
              key={type}
              onClick={() => onFilterChange(type)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                isSelected
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type}
              {count > 0 && (
                <span className={`ml-1 ${
                  isSelected ? 'text-indigo-200' : 'text-gray-400'
                }`}>
                  ({count})
                </span>
              )}
            </button>
          );
        })}
        {selectedFilter !== 'All' && (
          <button
            onClick={() => onFilterChange('All')}
            className="px-2 py-1 rounded-full text-xs font-medium text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <X className="h-3 w-3 inline" />
          </button>
        )}
      </div>
    </div>
  );
};

export default EventFilters;