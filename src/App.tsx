import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Printer,
  FileDown,
  BookOpen,
  PhoneCall,
  ClipboardList
} from 'lucide-react';
import { StaffMember, ActiveTab } from './types';
import { Header } from './components/Header';
import { LoginModal } from './components/LoginModal';
import { PrintTab } from './components/PrintTab';
import { FormsTab } from './components/FormsTab';
import { InstructionsTab } from './components/InstructionsTab';
import { ContactTab } from './components/ContactTab';
import { LogTab } from './components/LogTab';
import { playCutePop } from './utils/audio';

const INACTIVITY_LIMIT = 2 * 60 * 1000; // 2 minutes

export default function App() {
  const [currentUser, setCurrentUser] = useState<StaffMember | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('print');
  const [isDark, setIsDark] = useState<boolean>(false);

  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize theme and saved session
  useEffect(() => {
    // Theme setup
    const savedTheme = localStorage.getItem('jetprint_theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    setIsDark(initialDark);
    if (initialDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Session check
    const savedUserStr = localStorage.getItem('jetPrintUser');
    const lastActivity = localStorage.getItem('lastActivityTime');

    if (savedUserStr && lastActivity) {
      const elapsed = Date.now() - parseInt(lastActivity, 10);
      if (elapsed < INACTIVITY_LIMIT) {
        try {
          const parsed = JSON.parse(savedUserStr);
          setCurrentUser(parsed);
          setActiveTab('print');
        } catch {
          localStorage.removeItem('jetPrintUser');
          setCurrentUser(null);
        }
      } else {
        localStorage.removeItem('jetPrintUser');
        localStorage.removeItem('lastActivityTime');
        setCurrentUser(null);
      }
    } else {
      setCurrentUser(null);
    }
  }, []);

  // Theme toggle
  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    localStorage.setItem('jetprint_theme', nextDark ? 'dark' : 'light');
    if (nextDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Inactivity tracking
  const handleLogout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem('jetPrintUser');
    localStorage.removeItem('lastActivityTime');
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    setActiveTab('print');
  }, []);

  const resetInactivityTimer = useCallback(() => {
    if (!currentUser) return;
    localStorage.setItem('lastActivityTime', Date.now().toString());
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);

    inactivityTimerRef.current = setTimeout(() => {
      alert('Session ended due to inactivity to protect printer queue integrity. Please sign in again.');
      handleLogout();
    }, INACTIVITY_LIMIT);
  }, [currentUser, handleLogout]);

  useEffect(() => {
    const events = ['click', 'touchstart', 'mousemove', 'keypress', 'scroll'];
    const handleUserActivity = () => resetInactivityTimer();

    events.forEach((evt) => window.addEventListener(evt, handleUserActivity, { passive: true }));
    resetInactivityTimer();

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, handleUserActivity));
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    };
  }, [currentUser, resetInactivityTimer]);

  const handleLoginSuccess = (staff: StaffMember) => {
    setCurrentUser(staff);
    localStorage.setItem('jetPrintUser', JSON.stringify(staff));
    localStorage.setItem('lastActivityTime', Date.now().toString());
    setActiveTab('print');
    resetInactivityTimer();
  };

  // Before Login: Show ONLY the clean Sign-In Screen (Zero background watermark, all portal details hidden until login)
  if (!currentUser) {
    return (
      <LoginModal
        isOpen={true}
        onSuccessLogin={handleLoginSuccess}
      />
    );
  }

  const isAmit = currentUser.name.toLowerCase().includes('amit kumar yadav');

  // Tab definitions: First Instructions, then Print Documents, then Forms, and last Support and Feedback
  const tabs = [
    { id: 'instructions' as ActiveTab, label: 'Instructions', icon: BookOpen },
    { id: 'print' as ActiveTab, label: 'Print Documents', icon: Printer },
    { id: 'forms' as ActiveTab, label: 'Forms', icon: FileDown },
    { id: 'contact' as ActiveTab, label: 'Support and Feedback', icon: PhoneCall },
    ...(isAmit
      ? [{ id: 'logs' as ActiveTab, label: 'Audit Activity Log', icon: ClipboardList }]
      : [])
  ];

  const handleTabClick = (tabId: ActiveTab) => {
    playCutePop();
    setActiveTab(tabId);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors selection:bg-blue-200 dark:selection:bg-blue-900 selection:text-blue-900 dark:selection:text-blue-100">
      
      {/* Top Header */}
      <Header
        currentUser={currentUser}
        onLogout={handleLogout}
        isDark={isDark}
        onToggleTheme={toggleTheme}
      />

      {/* Main Body (Visible ONLY after user logs in) */}
      <motion.main
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-8"
      >
        
        {/* Responsive Sidebar + Main Content Layout */}
        <div className="flex flex-col md:flex-row gap-5 md:gap-6 items-stretch md:items-start">
          
          {/* Left-Side Navigation Tabs */}
          <aside className="w-full md:w-64 shrink-0 flex flex-col gap-2 md:sticky md:top-24">
            <div className="grid grid-cols-2 sm:grid-cols-2 md:flex md:flex-col gap-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabClick(tab.id)}
                    className={`relative w-full flex items-center justify-start gap-2.5 px-3.5 py-3 rounded-xl text-sm sm:text-base font-bold transition-colors cursor-pointer text-left overflow-hidden ${
                      isActive
                        ? 'text-white shadow-sm'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeNavTabBg"
                        transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                        className="absolute inset-0 bg-blue-700 rounded-xl -z-0"
                      />
                    )}
                    <Icon className={`relative z-10 w-4 h-4 sm:w-5 sm:h-5 shrink-0 ${isActive ? 'text-white' : 'text-blue-600 dark:text-blue-400'}`} />
                    <span className="relative z-10 leading-snug">{tab.label}</span>
                    {tab.id === 'logs' && (
                      <span className="relative z-10 ml-auto text-xs font-mono bg-blue-900/40 text-blue-100 px-2 py-0.5 rounded shrink-0">
                        Admin
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Active Tab Viewport */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 12, scale: 0.992 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.992 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              >
                {activeTab === 'instructions' && <InstructionsTab />}

                {activeTab === 'print' && (
                  <PrintTab
                    currentUser={currentUser}
                    onSwitchUser={handleLogout}
                  />
                )}

                {activeTab === 'forms' && (
                  <FormsTab
                    currentUser={currentUser}
                    onRequireLogin={handleLogout}
                  />
                )}

                {activeTab === 'contact' && <ContactTab currentUser={currentUser} />}

                {activeTab === 'logs' && isAmit && (
                  <LogTab currentUser={currentUser} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </motion.main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 text-sm py-4 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="font-extrabold text-slate-900 dark:text-slate-100 text-sm sm:text-base">
            JET PRINT
          </div>

          <div className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">
            Complete Cloud Printing Solution
          </div>
        </div>
      </footer>

    </div>
  );
}
