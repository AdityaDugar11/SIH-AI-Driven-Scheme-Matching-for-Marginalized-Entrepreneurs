import React from 'react';
import { Languages, Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 text-xs font-bold transition shadow-sm hover:border-emerald-500/50 cursor-pointer"
      title={language === 'en' ? 'हिंदी में बदलें' : 'Switch to English'}
    >
      <Languages className="w-3.5 h-3.5 text-emerald-400" />
      <span>{language === 'en' ? 'English' : 'हिंदी'}</span>
      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/40">
        {language === 'en' ? 'हिंदी' : 'EN'}
      </span>
    </button>
  );
}
