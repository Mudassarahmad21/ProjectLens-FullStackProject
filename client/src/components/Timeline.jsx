import React, { useEffect, useState } from 'react';
import { Clock, AlertCircle } from 'lucide-react';
import { getTimeline } from '../services/api';
import TimelineEvent from './TimelineEvent';
import EventFilters from './EventFilters';

const Timeline = ({ hadmId, admission }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('All');
  const [stats, setStats] = useState({});
  const [filteredEvents, setFilteredEvents] = useState([]);

  useEffect(() => {
    if (!hadmId) return;

    const fetchTimeline = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getTimeline(hadmId);
        setEvents(response.data.events);
        setStats(response.data.stats || {});
        setFilteredEvents(response.data.events);
      } catch (err) {
        setError('Failed to load timeline events');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTimeline();
  }, [hadmId]);

  useEffect(() => {
    if (filter === 'All') {
      setFilteredEvents(events);
    } else {
      setFilteredEvents(events.filter(event => event.eventType === filter));
    }
  }, [filter, events]);

  if (!hadmId) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">Select an admission to view the timeline</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <div className="animate-pulse text-gray-500">Loading timeline...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-red-200 p-8 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">No timeline events found for this admission</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-700">
            Timeline <span className="text-sm font-normal text-gray-500">({filteredEvents.length} events)</span>
          </h3>
          <EventFilters
            selectedFilter={filter}
            onFilterChange={setFilter}
            eventStats={stats}
          />
        </div>
      </div>

      <div className="p-4">
        {filteredEvents.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">
            No {filter} events found
          </p>
        ) : (
          <div className="max-h-[600px] overflow-y-auto pr-2">
            {filteredEvents.map((event, index) => (
              <TimelineEvent key={event._id || index} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Timeline;