import React from 'react';

interface PrinterLogoProps {
  className?: string;
  size?: number;
}

export const PrinterLogo: React.FC<PrinterLogoProps> = ({ className = '', size = 36 }) => {
  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 44 44"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="xeroxLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e3a8a" /> {/* blue-900 */}
            <stop offset="50%" stopColor="#1d4ed8" /> {/* blue-700 */}
            <stop offset="100%" stopColor="#0f172a" /> {/* slate-900 */}
          </linearGradient>
          <linearGradient id="xeroxBodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>
        </defs>

        {/* Outer Squircle Container */}
        <rect width="44" height="44" rx="10" fill="url(#xeroxLogoGrad)" />

        {/* Heavy-Duty Floor / Large Desktop Xerox Multifunction Machine */}
        
        {/* Top Automatic Document Feeder (ADF) */}
        <path d="M 14 7 L 30 7 L 29 11 L 15 11 Z" fill="#94a3b8" />
        <rect x="16" y="5" width="12" height="3" rx="0.8" fill="#ffffff" />
        <rect x="13" y="11" width="18" height="3" rx="1" fill="#475569" />

        {/* Scanner Flatbed & Console Unit */}
        <rect x="10" y="14" width="24" height="5" rx="1.5" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="0.5" />
        
        {/* Angled Digital Touchscreen Display on Right */}
        <rect x="29" y="12" width="6" height="5" rx="1" fill="#0284c7" stroke="#ffffff" strokeWidth="0.6" />
        <rect x="30" y="13" width="4" height="2" rx="0.5" fill="#38bdf8" />

        {/* Main Photocopier / Engine Body */}
        <rect x="11" y="19" width="22" height="11" rx="2" fill="url(#xeroxBodyGrad)" />
        
        {/* Internal Output Cavity / Exit Tray */}
        <rect x="13" y="21" width="16" height="4" rx="1" fill="#0f172a" />
        {/* Printed Document Emerging */}
        <rect x="14" y="22" width="12" height="2" rx="0.5" fill="#ffffff" />
        <line x1="16" y1="23" x2="22" y2="23" stroke="#2563eb" strokeWidth="0.6" />

        {/* Power Status LED */}
        <circle cx="30" cy="22" r="1" fill="#10b981" />

        {/* Lower Multi-Tray Paper Drawers (High Capacity Cassettes 1 & 2) */}
        <rect x="12" y="31" width="20" height="4" rx="1" fill="#94a3b8" />
        <rect x="19" y="32" width="6" height="1.2" rx="0.6" fill="#475569" /> {/* Tray 1 handle */}

        <rect x="12" y="36" width="20" height="4" rx="1" fill="#64748b" />
        <rect x="19" y="37" width="6" height="1.2" rx="0.6" fill="#334155" /> {/* Tray 2 handle */}

        {/* Side Output Finisher Tray */}
        <path d="M 11 23 L 6 23 L 8 27 L 11 25 Z" fill="#94a3b8" />
      </svg>
    </div>
  );
};
