import React, { useState, useEffect } from 'react';
import { Sun, Moon, Volume2, VolumeX, LogOut, KeyRound } from 'lucide-react';
import { StaffMember } from '../types';
import { PrinterLogo } from './PrinterLogo';
import { isSoundEnabled, setSoundEnabled, playCutePop } from '../utils/audio';

interface HeaderProps {
  currentUser: StaffMember | null;
  onLogout: () => void;
  onOpenSignIn?: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onLogout,
  onOpenSignIn,
  isDark,
  onToggleTheme
}) => {
  const [soundOn, setSoundOn] = useState<boolean>(true);
  const [time, setTime] = useState<{
    hours: string;
    minutes: string;
    seconds: string;
    ampm: string;
    date: string;
  }>({
    hours: '00',
    minutes: '00',
    seconds: '00',
    ampm: 'AM',
    date: ''
  });

  useEffect(() => {
    setSoundOn(isSoundEnabled());

    const updateClock = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      const formattedHours = String(hours).padStart(2, '0');

      const dateStr = now.toLocaleDateString('en-IN', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });

      setTime({
        hours: formattedHours,
        minutes,
        seconds,
        ampm,
        date: dateStr
      });
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSoundToggle = () => {
    const nextState = !soundOn;
    setSoundOn(nextState);
    setSoundEnabled(nextState);
    if (nextState) {
      playCutePop();
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        
        {/* Top Row on Mobile / Left + Right on Desktop */}
        <div className="flex items-center justify-between gap-2">
          {/* Brand Zone with Official Printer Logo */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <PrinterLogo size={38} />
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white leading-tight">
                  JET <span className="text-blue-600 dark:text-blue-400">PRINT</span>
                </span>
              </div>
              <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium leading-tight">
                Cloud Printing
              </span>
            </div>
          </div>

          {/* Right Actions on Mobile */}
          <div className="flex sm:hidden items-center gap-1.5 shrink-0">
            <button
              onClick={handleSoundToggle}
              title={soundOn ? 'Mute audio feedback' : 'Enable audio feedback'}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            </button>

            <button
              onClick={() => {
                playCutePop();
                onToggleTheme();
              }}
              title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-600" />}
            </button>

            {currentUser ? (
              <button
                onClick={() => {
                  playCutePop();
                  onLogout();
                }}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 border border-slate-700 rounded-xl transition-all cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            ) : (
              onOpenSignIn && (
                <button
                  onClick={() => {
                    playCutePop();
                    onOpenSignIn();
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-xl transition-all cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
              )
            )}
          </div>
        </div>

        {/* Center: Date & Live Clock Display (Visible on BOTH Mobile and Desktop) */}
        <div className="flex items-center justify-between sm:justify-center gap-2.5 bg-slate-100/90 dark:bg-slate-800/90 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 tracking-wide">
            {time.date}
          </div>
          <div className="h-4 w-px bg-slate-300 dark:bg-slate-700" />
          <div className="flex items-center gap-1 font-mono text-xs sm:text-sm font-bold tracking-tight tabular-nums">
            <span className="bg-slate-900 dark:bg-slate-950 text-white dark:text-blue-300 px-1.5 py-0.5 rounded shadow-inner">
              {time.hours}
            </span>
            <span className="text-slate-500 font-bold">:</span>
            <span className="bg-slate-900 dark:bg-slate-950 text-white dark:text-blue-300 px-1.5 py-0.5 rounded shadow-inner">
              {time.minutes}
            </span>
            <span className="text-slate-500 font-bold">:</span>
            <span className="bg-slate-900 dark:bg-slate-950 text-white dark:text-blue-300 px-1.5 py-0.5 rounded shadow-inner">
              {time.seconds}
            </span>
            <span className="ml-1 bg-blue-700 text-white px-1.5 py-0.5 rounded text-xs font-sans font-bold">
              {time.ampm}
            </span>
          </div>
        </div>

        {/* Right Actions Zone on Desktop */}
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          {/* Sound Toggle */}
          <button
            onClick={handleSoundToggle}
            title={soundOn ? 'Mute audio feedback' : 'Enable audio feedback'}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={() => {
              playCutePop();
              onToggleTheme();
            }}
            title={isDark ? 'Switch to Standard Light Theme' : 'Switch to Dark Theme'}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-500" />}
          </button>

          {/* User Sign Out / Sign In */}
          {currentUser ? (
            <button
              onClick={() => {
                playCutePop();
                onLogout();
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 border border-slate-700 rounded-xl transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          ) : (
            onOpenSignIn && (
              <button
                onClick={() => {
                  playCutePop();
                  onOpenSignIn();
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-xl transition-all cursor-pointer"
              >
                <KeyRound className="w-4 h-4" />
                <span>Sign In</span>
              </button>
            )
          )}
        </div>

      </div>
    </header>
  );
};
