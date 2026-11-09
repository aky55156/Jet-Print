import React, { useState } from 'react';
import { Phone, Mail, MessageSquare, User, MessageCircle, ShieldCheck } from 'lucide-react';
import { StaffMember } from '../types';
import { playCutePop } from '../utils/audio';

interface ContactTabProps {
  currentUser?: StaffMember | null;
}

export const ContactTab: React.FC<ContactTabProps> = () => {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Administrator & Support Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-8 shadow-xs text-center">
        <div className="relative inline-block mx-auto mb-3.5">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-slate-300 dark:border-slate-700 shadow-sm bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            {!imgError ? (
              <img
                src="https://i.ibb.co/j7tZS0V/Screenshot-20261021-123525-Photos.jpg"
                alt="Amit Kumar Yadav"
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-500">
                <User className="w-10 h-10" />
                <span className="text-sm font-semibold mt-1">Amit</span>
              </div>
            )}
          </div>
        </div>

        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          AMIT KUMAR YADAV
        </h2>
        <div className="inline-block mt-1.5 px-3.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs sm:text-sm border border-slate-200 dark:border-slate-700">
          Developer
        </div>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mt-2.5 max-w-md mx-auto leading-relaxed">
          For PIN setup, paper refill, or Jet Printer assistance.
        </p>

        {/* Contact Action Buttons (Full width on mobile, inline on desktop) */}
        <div className="mt-5 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-center gap-3">
          <a
            href="tel:+917503455156"
            onClick={playCutePop}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 font-bold text-sm rounded-xl border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <Phone className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="font-mono">+91 7503455156</span>
          </a>

          <a
            href="https://wa.me/917503455156"
            target="_blank"
            rel="noopener noreferrer"
            onClick={playCutePop}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-xs transition-colors"
          >
            <MessageSquare className="w-4 h-4 shrink-0" />
            <span>WhatsApp Direct</span>
          </a>

          <a
            href="mailto:aky55156@gmail.com"
            onClick={playCutePop}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 font-bold text-sm rounded-xl border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span className="font-mono">aky55156@gmail.com</span>
          </a>
        </div>
      </div>

      {/* IT Administrative Notice (Displayed only inside Support and Feedback tab) */}
      <div className="p-4 sm:p-5 bg-blue-50/70 dark:bg-slate-900 border border-blue-100 dark:border-slate-800 rounded-2xl text-sm sm:text-base space-y-1.5 shadow-2xs">
        <div className="font-bold text-blue-900 dark:text-blue-300 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
          <span>IT Administrative Notice</span>
        </div>
        <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
          For paper restock or toner changes, contact <strong>Amit Kumar Yadav</strong> (+91 7503455156).
        </p>
      </div>

      {/* Embedded Google Form (Clipped at bottom so Google Forms disclaimer footer is completely hidden) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 sm:p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          <MessageCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
            Staff Feedback Form
          </h3>
        </div>

        {/* The outer wrapper clips the bottom 210px of the Google Form where "Never submit passwords / GoogleForms" sits */}
        <div className="relative w-full h-[1120px] sm:h-[980px] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white">
          <iframe
            src="https://docs.google.com/forms/d/e/1FAIpQLScXjUR5CRE1xR_TMgGRzlqpyq1Jyx3XqmGOP30BgmYGTzTLRA/viewform?embedded=true"
            width="100%"
            height="1350"
            scrolling="no"
            className="w-full h-[1350px] sm:h-[1210px] border-none block overflow-hidden pointer-events-auto"
            title="JET PRINT Staff Feedback Form"
          >
            Loading Feedback Form…
          </iframe>
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-white via-white/95 to-transparent" />
        </div>
      </div>
    </div>
  );
};
