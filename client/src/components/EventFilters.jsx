import React from 'react';
import { Filter, X } from 'lucide-react';

const EVENT_TYPES = ['All', 'LAB', 'MEDICATION', 'PROCEDURE', 'TRANSFER', 'DIAGNOSIS', 'ICU'];

const EventFilters = ({ selectedFilter, onFilterChange, eventStats }) => {
  const getCount = (type) => {
    if (!eventStats) return 0;
    if (type === 'All') return Object.values(eventStats).reduce((sum, count) => sum + count, 0);
    return eventStats[type] || 0;
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Filter className="h-3.5 w-3.5 text-gray-400 hidden sm:block" />
      {EVENT_TYPES.map((type) => {
        const count = getCount(type);
        const isSelected = selectedFilter === type;
        return (
          <button
            key={type}
            onClick={() => onFilterChange(type)}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
              isSelected
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {type}
            {count > 0 && (
              <span className={isSelected ? 'text-indigo-200 ml-1' : 'text-gray-400 ml-1'}>
                {count}
              </span>
            )}
          </button>
        );
      })}
      {selectedFilter !== 'All' && (
        <button
          onClick={() => onFilterChange('All')}
          className="p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          aria-label="Clear filter"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
};

export default EventFilters;