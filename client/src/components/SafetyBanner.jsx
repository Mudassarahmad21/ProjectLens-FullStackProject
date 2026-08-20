// client/src/components/SafetyBanner.jsx
import React from 'react';
import { AlertTriangle, XOctagon } from 'lucide-react';

const CONFIG = {
  REJECT: {
    icon: XOctagon,
    bgClass: 'bg-red-50 border-red-200',
    textClass: 'text-red-700',
    iconClass: 'text-red-500',
    label: 'Rejected',
  },
  ABSTAIN: {
    icon: AlertTriangle,
    bgClass: 'bg-amber-50 border-amber-200',
    textClass: 'text-amber-700',
    iconClass: 'text-amber-500',
    label: 'Abstained',
  },
};

const SafetyBanner = ({ action, message, displayClass }) => {
  if (!action || action === 'ALLOW') return null;

  const { icon: Icon, bgClass, textClass, iconClass, label } = CONFIG[action] || CONFIG.ABSTAIN;

  return (
    <div className={`p-3.5 rounded-lg border ${bgClass} ${displayClass || ''} mb-4`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-4.5 h-4.5 ${iconClass} mt-0.5 flex-shrink-0`} />
        <div>
          <p className={`text-sm font-medium ${textClass}`}>{label}</p>
          <p className={`text-sm ${textClass} opacity-90`}>{message}</p>
        </div>
      </div>
    </div>
  );
};

export default SafetyBanner;