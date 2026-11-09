import React from 'react';
import { motion } from 'motion/react';

interface OfficePrinterProps {
  state?: 'idle' | 'dragging' | 'printing' | 'success';
  className?: string;
  size?: number;
}

export const OfficePrinter: React.FC<OfficePrinterProps> = ({
  state = 'idle',
  className = '',
  size = 140
}) => {
  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      <motion.svg
        width={size}
        height={size}
        viewBox="0 0 160 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        animate={
          state === 'printing'
            ? { y: [0, -1, 0, 1, 0] }
            : state === 'dragging'
            ? { scale: [1, 1.02, 1] }
            : state === 'success'
            ? { y: [0, -2, 0] }
            : { y: 0 }
        }
        transition={{
          repeat: state === 'printing' ? Infinity : 0,
          duration: 0.3,
          ease: 'easeInOut'
        }}
      >
        <defs>
          {/* Heavy-Duty Xerox Metallic Gradients */}
          <linearGradient id="xeroxBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#334155" /> {/* slate-700 */}
            <stop offset="50%" stopColor="#1e293b" /> {/* slate-800 */}
            <stop offset="100%" stopColor="#0f172a" /> {/* slate-900 */}
          </linearGradient>

          <linearGradient id="xeroxPlinthGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#475569" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>

          <linearGradient id="xeroxScreenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0284c7" /> {/* sky-600 */}
            <stop offset="100%" stopColor="#0369a1" /> {/* sky-700 */}
          </linearGradient>

          <linearGradient id="documentPaperGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#f1f5f9" />
          </linearGradient>

          <filter id="xeroxShadow" x="-10%" y="-10%" width="120%" height="130%">
            <feDropShadow dx="0" dy="5" stdDeviation="5" floodColor="#0f172a" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* Ambient Ground Shadow */}
        <ellipse cx="80" cy="150" rx="64" ry="6" fill="currentColor" className="text-slate-400/20 dark:text-slate-950/80" />

        {/* Heavy-Duty Xerox Photocopier Stand / Multi-Cassette Pedestal */}
        
        {/* Tray 3 / Base Plinth with Wheels */}
        <rect x="36" y="134" width="88" height="12" rx="2" fill="#1e293b" stroke="#334155" strokeWidth="0.8" />
        <rect x="72" y="138" width="16" height="3" rx="1.5" fill="#475569" /> {/* Tray 3 Handle */}
        {/* Machine feet */}
        <rect x="40" y="146" width="8" height="2" rx="1" fill="#090d16" />
        <rect x="112" y="146" width="8" height="2" rx="1" fill="#090d16" />

        {/* Tray 2 / Middle High-Capacity Cassette (500 Sheets) */}
        <rect x="36" y="120" width="88" height="13" rx="2" fill="#334155" stroke="#475569" strokeWidth="0.8" />
        <rect x="72" y="124" width="16" height="3" rx="1.5" fill="#64748b" /> {/* Tray 2 Handle */}

        {/* Main Xerox Photocopier Engine Body */}
        <rect
          x="30"
          y="56"
          width="100"
          height="63"
          rx="5"
          fill="url(#xeroxBodyGrad)"
          filter="url(#xeroxShadow)"
          stroke="#475569"
          strokeWidth="1.2"
        />

        {/* Brand Plaque on Machine: JET PRINTER · XEROX */}
        <g transform="translate(36, 62)">
          <rect x="0" y="0" width="46" height="8" rx="2" fill="#0f172a" stroke="#0284c7" strokeWidth="0.7" />
          <text x="23" y="5.8" fill="#38bdf8" fontSize="4.2" fontWeight="bold" fontFamily="system-ui, sans-serif" textAnchor="middle" letterSpacing="0.3">
            JET PRINTER
          </text>
        </g>

        {/* Automatic Document Feeder (ADF) on Top Lid */}
        <motion.g
          animate={
            state === 'printing'
              ? { y: [0, 2, 0] }
              : { y: 0 }
          }
          transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
        >
          {/* ADF Input Tray */}
          <path d="M 42 22 L 118 22 L 114 42 L 46 42 Z" fill="#64748b" stroke="#475569" strokeWidth="0.8" />
          {/* Original paper sheet stack fed into scanner */}
          <rect x="52" y="14" width="56" height="30" rx="1.5" fill="url(#documentPaperGrad)" stroke="#cbd5e1" strokeWidth="1" />
          <line x1="60" y1="20" x2="88" y2="20" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="60" y1="25" x2="98" y2="25" stroke="#cbd5e1" strokeWidth="1.2" strokeLinecap="round" />
          
          {/* Top Feeder Hood */}
          <rect x="38" y="38" width="84" height="10" rx="3" fill="#334155" stroke="#475569" strokeWidth="1" />
          <rect x="68" y="41" width="24" height="2" rx="1" fill="#94a3b8" />
        </motion.g>

        {/* Scanner Flatbed Glass / Exposure Trim */}
        <rect x="30" y="48" width="100" height="9" rx="2" fill="#475569" stroke="#64748b" strokeWidth="0.8" />
        <rect x="34" y="50" width="92" height="4" rx="1" fill="#0284c7" opacity="0.3" />

        {/* Angled High-Tech Touchscreen Console on Right Arm */}
        <g transform="translate(102, 54)">
          {/* Console Swivel Arm */}
          <rect x="0" y="8" width="24" height="18" rx="3" fill="#0f172a" stroke="#0284c7" strokeWidth="1" />
          {/* Touchscreen Glass */}
          <rect x="2" y="10" width="20" height="14" rx="2" fill="url(#xeroxScreenGrad)" />
          {/* Screen Content Simulator */}
          <rect x="4" y="12" width="10" height="2" rx="0.5" fill="#ffffff" />
          <rect x="4" y="16" width="16" height="1.5" rx="0.5" fill="#bae6fd" />
          <rect x="4" y="19" width="8" height="1.5" rx="0.5" fill={state === 'printing' ? '#fef08a' : '#86efac'} />
          <circle cx="19" cy="19" r="1.5" fill="#10b981" />
        </g>

        {/* Operational Physical Buttons */}
        <circle cx="90" cy="74" r="2.5" fill="#475569" stroke="#64748b" strokeWidth="0.5" />
        <circle cx="96" cy="74" r="2.5" fill="#475569" stroke="#64748b" strokeWidth="0.5" />
        <rect x="88" y="79" width="10" height="5" rx="1.5" fill="#059669" /> {/* Start / Copy */}

        {/* Status Indicators */}
        <circle cx="124" cy="58" r="2" fill="#22c55e" /> {/* Power */}
        <circle
          cx="124"
          cy="64"
          r="2"
          fill={state === 'printing' ? '#f59e0b' : state === 'success' ? '#22c55e' : '#38bdf8'}
        /> {/* Data */}

        {/* Internal Output Paper Exit Bay */}
        <rect x="38" y="86" width="60" height="26" rx="2" fill="#090d16" />

        {/* Printed Document Emerging into Exit Bay */}
        <motion.g
          animate={
            state === 'printing'
              ? { y: [0, 6, 10, 0], opacity: [0.8, 1, 1, 0.8] }
              : state === 'success'
              ? { y: 8 }
              : { y: 0 }
          }
          transition={{ repeat: state === 'printing' ? Infinity : 0, duration: 1.4, ease: 'easeInOut' }}
        >
          <rect
            x="44"
            y="90"
            width="48"
            height="20"
            rx="1.5"
            fill="url(#documentPaperGrad)"
            stroke="#cbd5e1"
            strokeWidth="1"
          />
          {/* Text lines on printed paper */}
          <line x1="48" y1="94" x2="72" y2="94" stroke="#2563eb" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="48" y1="98" x2="84" y2="98" stroke="#64748b" strokeWidth="1" strokeLinecap="round" />
          <line x1="48" y1="102" x2="80" y2="102" stroke="#94a3b8" strokeWidth="1" strokeLinecap="round" />
        </motion.g>

        {/* Left Side Finisher / Catch Tray */}
        <path d="M 30 92 L 18 90 L 16 104 L 30 102 Z" fill="#475569" stroke="#334155" strokeWidth="0.8" />
        <line x1="18" y1="93" x2="28" y2="95" stroke="#64748b" strokeWidth="1" />
      </motion.svg>
    </div>
  );
};
