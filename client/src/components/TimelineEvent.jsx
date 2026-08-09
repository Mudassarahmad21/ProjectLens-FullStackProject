import React, { useState } from 'react';
import { 
  Clock, 
  Beaker, 
  Pill, 
  Scissors, 
  ArrowRightLeft, 
  Stethoscope, 
  Activity,
  FileText,
  ExternalLink
} from 'lucide-react';
import EvidencePanel from './EvidencePanel';

const EVENT_ICONS = {
  ADMISSION: <Activity className="h-4 w-4" />,
  TRANSFER: <ArrowRightLeft className="h-4 w-4" />,
  LAB: <Beaker className="h-4 w-4" />,
  MEDICATION: <Pill className="h-4 w-4" />,
  PROCEDURE: <Scissors className="h-4 w-4" />,
  DIAGNOSIS: <Stethoscope className="h-4 w-4" />,
  ICU: <Activity className="h-4 w-4" />,
};

const EVENT_COLORS = {
  ADMISSION: 'border-green-500 bg-green-50',
  TRANSFER: 'border-blue-500 bg-blue-50',
  LAB: 'border-purple-500 bg-purple-50',
  MEDICATION: 'border-pink-500 bg-pink-50',
  PROCEDURE: 'border-orange-500 bg-orange-50',
  DIAGNOSIS: 'border-red-500 bg-red-50',
  ICU: 'border-indigo-500 bg-indigo-50',
};

const TimelineEvent = ({ event }) => {
  const [showEvidence, setShowEvidence] = useState(false);

  const formatTime = (date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleViewSource = () => {
    setShowEvidence(true);
  };

  const icon = EVENT_ICONS[event.eventType] || <FileText className="h-4 w-4" />;
  const colorClass = EVENT_COLORS[event.eventType] || 'border-gray-500 bg-gray-50';

  return (
    <>
      <div className="relative pl-8 pb-6 last:pb-0">
        {/* Timeline line */}
        <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-gray-200 last:hidden"></div>
        
        {/* Timeline dot */}
        <div className={`absolute left-0 top-1 h-4 w-4 rounded-full border-2 ${colorClass}`}>
          <div className="absolute -left-0.5 -top-0.5 h-4 w-4 rounded-full flex items-center justify-center text-gray-600">
            {icon}
          </div>
        </div>

        {/* Event content */}
        <div className="ml-2">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-500">
                  {formatTime(event.eventTime)}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                  {event.eventType}
                </span>
              </div>
              <h4 className="text-sm font-medium text-gray-800 mt-1">
                {event.title}
              </h4>
              {event.value && (
                <p className="text-sm text-gray-600">
                  {event.value}
                  {event.unit && ` ${event.unit}`}
                </p>
              )}
            </div>
            
            <button
              onClick={handleViewSource}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 transition-colors"
            >
              <ExternalLink className="h-3 w-3" />
              View Source
            </button>
          </div>
        </div>
      </div>

      {/* Evidence Panel Modal */}
      <EvidencePanel
        isOpen={showEvidence}
        onClose={() => setShowEvidence(false)}
        eventId={event._id}
      />
    </>
  );
};

export default TimelineEvent;