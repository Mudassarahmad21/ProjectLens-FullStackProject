// client/src/components/SafetyBanner.jsx

import React from 'react';
import { AlertTriangle, Shield, XOctagon, CheckCircle } from 'lucide-react';

const SafetyBanner = ({ action, message, displayClass }) => {
  if (!action || action === 'ALLOW') return null;

  const config = {
    REJECT: {
      icon: XOctagon,
      bgClass: 'bg-red-50 border-red-200',
      textClass: 'text-red-800',
      iconClass: 'text-red-500',
      label: '⛔ REJECTED'
    },
    ABSTAIN: {
      icon: AlertTriangle,
      bgClass: 'bg-yellow-50 border-yellow-200',
      textClass: 'text-yellow-800',
      iconClass: 'text-yellow-500',
      label: '⚠️ ABSTAINED'
    }
  };

  const { icon: Icon, bgClass, textClass, iconClass, label } = config[action] || config.ABSTAIN;

  return (
    <div className={`p-4 rounded-lg border ${bgClass} mb-4`}>
      <div className="flex items-start">
        <Icon className={`w-5 h-5 ${iconClass} mt-0.5 mr-3 flex-shrink-0`} />
        <div>
          <p className={`font-medium ${textClass}`}>{label}</p>
          <p className={`text-sm ${textClass}`}>{message}</p>
        </div>
      </div>
    </div>
  );
};

export default SafetyBanner;