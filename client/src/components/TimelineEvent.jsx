import React, { useState } from 'react';
import {
  Beaker, Pill, Scissors, ArrowRightLeft, Stethoscope, Activity, FileText, ExternalLink,
} from 'lucide-react';
import EvidencePanel from './EvidencePanel';

export const EVENT_META = {
  ADMISSION:  { icon: Activity,        dot: 'bg-blue-500',    badge: 'bg-blue-50 text-blue-700' },
  TRANSFER:   { icon: ArrowRightLeft,  dot: 'bg-cyan-500',    badge: 'bg-cyan-50 text-cyan-700' },
  LAB:        { icon: Beaker,          dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700' },
  MEDICATION: { icon: Pill,            dot: 'bg-purple-500',  badge: 'bg-purple-50 text-purple-700' },
  PROCEDURE:  { icon: Scissors,        dot: 'bg-amber-500',   badge: 'bg-amber-50 text-amber-700' },
  DIAGNOSIS:  { icon: Stethoscope,     dot: 'bg-red-500',     badge: 'bg-red-50 text-red-700' },
  ICU:        { icon: Activity,        dot: 'bg-indigo-500',  badge: 'bg-indigo-50 text-indigo-700' },
};

const DEFAULT_META = { icon: FileText, dot: 'bg-gray-400', badge: 'bg-gray-100 text-gray-600' };

const TimelineEvent = ({ event }) => {
  const [showEvidence, setShowEvidence] = useState(false);

  const formatTime = (date) =>
    new Date(date).toLocaleString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });

  const meta = EVENT_META[event.eventType] || DEFAULT_META;
  const Icon = meta.icon;

  return (
    <>
      <div className="relative pl-7 pb-5 last:pb-0">
        <div className="absolute left-[7px] top-4 bottom-0 w-px bg-gray-200 last:hidden" />
        <div className={`absolute left-0 top-1 h-3.5 w-3.5 rounded-full ${meta.dot} ring-4 ring-white`} />

        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-gray-400">{formatTime(event.eventTime)}</span>
              <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded ${meta.badge}`}>
                <Icon className="h-3 w-3" />
                {event.eventType}
              </span>
            </div>
            <h4 className="text-sm font-medium text-gray-800 mt-1">{event.title}</h4>
            {event.value && (
              <p className="text-sm text-gray-500">
                {event.value}{event.unit && ` ${event.unit}`}
              </p>
            )}
          </div>

          <button
            onClick={() => setShowEvidence(true)}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 flex-shrink-0"
          >
            <ExternalLink className="h-3 w-3" />
            Source
          </button>
        </div>
      </div>

      <EvidencePanel isOpen={showEvidence} onClose={() => setShowEvidence(false)} eventId={event._id} />
    </>
  );
};

export default TimelineEvent;