import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  KeyRound,
  User,
  Lock,
  HelpCircle,
  Phone,
  Mail,
  AlertCircle,
  MessageSquare,
  CheckCircle2,
  BookOpen
} from 'lucide-react';
import { StaffMember } from '../types';
import { staffDatabase, SCRIPT_URL, GUEST_PIN, recordAuditLog } from '../data/staffData';
import { OfficePrinter } from './OfficePrinter';
import { PrinterLogo } from './PrinterLogo';
import { playCutePop, playCuteDing } from '../utils/audio';

interface LoginModalProps {
  isOpen: boolean;
  onSuccessLogin: (staff: StaffMember) => void;
}

const GUEST_WHATSAPP_SENT_KEY = 'jetprint_guest_whatsapp_requested';

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onSuccessLogin
}) => {
  const [selectedStaffIndex, setSelectedStaffIndex] = useState<string>('');
  const [pin, setPin] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [showForgotModal, setShowForgotModal] = useState<boolean>(false);
  const [hasSentWhatsAppToAdmin, setHasSentWhatsAppToAdmin] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(GUEST_WHATSAPP_SENT_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const guestIndex = staffDatabase.findIndex((s) => s.name === 'Guest User');
  const isGuestSelected = selectedStaffIndex !== '' && parseInt(selectedStaffIndex, 10) === guestIndex;

  // Clear staff selection and PIN whenever the login modal opens (e.g., on Sign Out)
  useEffect(() => {
    if (isOpen) {
      setSelectedStaffIndex('');
      setPin('');
      setErrorMsg('');
      setLoading(false);
      setShowForgotModal(false);
    }
  }, [isOpen]);

  const getGuestWhatsAppUrl = () => {
    const msg = 'Hello Admin (Amit Kumar Yadav), I want to request for using Jet Printer as Guest Mode. Please give me the Guest Login PIN.';
    return `https://wa.me/917503455156?text=${encodeURIComponent(msg)}`;
  };

  const handleGuestLoginAndWhatsApp = () => {
    playCutePop();
    if (guestIndex !== -1) {
      setSelectedStaffIndex(String(guestIndex));
    }
    setErrorMsg('');
    setHasSentWhatsAppToAdmin(true);
    try {
      sessionStorage.setItem(GUEST_WHATSAPP_SENT_KEY, 'true');
    } catch {
      // ignore storage errors
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaffIndex) {
      setErrorMsg('Please select a username from the list.');
      playCutePop();
      return;
    }
    if (!pin || pin.length !== 4) {
      setErrorMsg('Please enter your 4-digit security PIN.');
      playCutePop();
      return;
    }

    const staffIdx = parseInt(selectedStaffIndex, 10);
    const staff = staffDatabase[staffIdx];
    if (!staff) {
      setErrorMsg('Selected username is invalid.');
      return;
    }

    setErrorMsg('');
    setLoading(true);
    playCutePop();

    // Guest User login: PIN is 0000 in database, works only after sending WhatsApp request to Admin
    if (staff.name === 'Guest User') {
      if (!hasSentWhatsAppToAdmin) {
        setLoading(false);
        setErrorMsg('Please click the "Guest Login" WhatsApp button below first to send a request message to Admin (+91 7503455156) before entering the PIN.');
        return;
      }

      if (pin === GUEST_PIN) {
        playCuteDing();
        recordAuditLog(staff.name, staff.desig, 'Signed In to Portal (Guest Mode)');
        setSelectedStaffIndex('');
        setPin('');
        setLoading(false);
        onSuccessLogin(staff);
        return;
      } else {
        setLoading(false);
        setErrorMsg('Invalid Guest PIN. Please check the 4-digit PIN sent by Admin on WhatsApp (+91 7503455156).');
        return;
      }
    }

    try {
      const formData = new URLSearchParams();
      formData.append('action', 'verifyLogin');
      formData.append('staffName', staff.name);
      formData.append('pin', pin);

      const res = await fetch(SCRIPT_URL, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();

      if (data.success || data.valid) {
        playCuteDing();
        recordAuditLog(staff.name, staff.desig, 'Signed In to Portal');
        setSelectedStaffIndex('');
        setPin('');
        onSuccessLogin(staff);
      } else {
        setErrorMsg('Invalid 4-digit PIN. Please verify your credentials or contact administrator.');
      }
    } catch {
      setErrorMsg('Connection error. Please check your network and try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="min-h-screen w-full bg-slate-100 dark:bg-slate-950 flex flex-col items-center justify-center p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-7 shadow-lg relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-blue-700" />

        {/* Header & Official Printer Graphic */}
        <div className="flex flex-col items-center text-center mb-5">
          <OfficePrinter size={95} state={loading ? 'printing' : 'idle'} />
          <div className="mt-2.5 flex items-center gap-2">
            <PrinterLogo size={28} />
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              JET <span className="text-blue-600 dark:text-blue-400">PRINT</span>
            </h1>
          </div>
          <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 mt-0.5">
            Complete Cloud Printing Solution
          </p>
        </div>

        {/* Error message */}
        <AnimatePresence>
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-xl flex items-start gap-2.5 text-sm text-red-600 dark:text-red-300 font-medium"
            >
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <form onSubmit={handleLoginSubmit} autoComplete="off" className="space-y-4">
          {/* Select Username Dropdown (English Only) */}
          <div>
            <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-1.5 flex items-center gap-1.5">
              <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Select Username</span>
            </label>

            <select
              value={selectedStaffIndex}
              autoComplete="off"
              onChange={(e) => {
                setSelectedStaffIndex(e.target.value);
                setErrorMsg('');
              }}
              className="w-full px-3.5 py-3 text-sm sm:text-base font-medium bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition-colors"
            >
              <option value="">-- Select Username --</option>
              {staffDatabase.map((staff, idx) => (
                <option key={staff.name} value={idx}>
                  {idx + 1}. {staff.name} ({staff.desig})
                </option>
              ))}
            </select>
          </div>

          {/* Guest Mode Status Notice when Guest User is selected */}
          <AnimatePresence>
            {isGuestSelected && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-3 bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl space-y-1.5"
              >
                {hasSentWhatsAppToAdmin ? (
                  <div className="flex items-start gap-2 text-xs sm:text-sm text-emerald-700 dark:text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>WhatsApp request sent to Admin. Enter the 4-digit Guest PIN received from Admin below to sign in.</span>
                  </div>
                ) : (
                  <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium">
                    Click the <strong>Guest Login</strong> button below to message Admin on WhatsApp (+91 7503455156) and receive your Guest PIN.
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* 4-Digit Security PIN */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                4-Digit Security PIN
              </label>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 hover:underline font-bold cursor-pointer"
              >
                Forgot PIN?
              </button>
            </div>
            <input
              type="password"
              name="jetprint_security_pin"
              autoComplete="new-password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              value={pin}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                setPin(val);
                setErrorMsg('');
              }}
              placeholder="••••"
              className="w-full tracking-[0.4em] text-center font-mono font-bold text-xl px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white font-bold text-base rounded-xl shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-60 cursor-pointer"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <KeyRound className="w-5 h-5" />
                <span>Sign In to Portal</span>
              </>
            )}
          </button>

          {/* Single Guest Login Button that Selects Guest User & Sends WhatsApp Message to Admin */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <a
              href={getGuestWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleGuestLoginAndWhatsApp}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm sm:text-base rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <MessageSquare className="w-4 h-4 shrink-0" />
              <span>Guest Login</span>
            </a>
          </div>

          {/* Short Summarized Portal Instructions Displayed Without Login */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-left space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <span>Portal Instructions:</span>
              </div>
              <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300 leading-snug">
                <li>
                  <strong className="text-slate-900 dark:text-white">Sign In:</strong> Select username &amp; enter PIN
                </li>
                <li>
                  <strong className="text-slate-900 dark:text-white">Upload:</strong> Upload the Documents
                </li>
                <li>
                  <strong className="text-slate-900 dark:text-white">Collect:</strong> Collect prints from JetPrinter (flip the page if back to back Printing)
                </li>
                <li>
                  <strong className="text-slate-900 dark:text-white">Official Forms -</strong> One Tab Printing
                </li>
              </ul>
            </div>
          </div>
        </form>

        {/* Forgot PIN Modal */}
        <AnimatePresence>
          {showForgotModal && (
            <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-2xl text-center"
              >
                <div className="w-12 h-12 mx-auto rounded-xl bg-blue-100 dark:bg-blue-950/70 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-3">
                  <HelpCircle className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  PIN Verification Assistance
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 mb-4">
                  To issue or reset your 4-digit PIN, please contact administrator <strong>Amit Kumar Yadav</strong>:
                </p>

                <div className="space-y-2.5 text-left bg-slate-50 dark:bg-slate-800 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm">
                  <div className="flex items-center gap-2.5 text-slate-800 dark:text-slate-200">
                    <Phone className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <a href="tel:+917503455156" className="font-mono font-bold hover:underline">
                      +91 7503455156
                    </a>
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-800 dark:text-slate-200">
                    <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    <a href="mailto:aky55156@gmail.com" className="font-mono font-bold hover:underline">
                      aky55156@gmail.com
                    </a>
                  </div>
                </div>

                <button
                  onClick={() => setShowForgotModal(false)}
                  className="w-full mt-4 py-3 bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm rounded-xl shadow-sm transition-all cursor-pointer"
                >
                  Close Window
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
