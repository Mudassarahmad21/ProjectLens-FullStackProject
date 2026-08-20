// client/src/components/ui/Footer.jsx
import React from 'react';

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-semibold text-[10px] tracking-wide">PL</span>
            </div>
            <span className="text-sm font-semibold text-gray-800 tracking-tight">PatientLens</span>
          </div>

          <p className="text-xs text-gray-500">
            &copy; {year} PatientLens. Built by{' '}
            <span className="text-gray-700 font-medium">Mudassar &amp; Muzammil</span>.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;