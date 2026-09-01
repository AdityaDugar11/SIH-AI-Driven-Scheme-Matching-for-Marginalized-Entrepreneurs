import React from 'react';
import { Landmark, Sparkles, Wifi, WifiOff } from 'lucide-react';
import LanguageToggle from './LanguageToggle';
import { useLanguage } from '../context/LanguageContext';

export default function Header({ isConnected }) {
  const { t } = useLanguage();

  return (
    <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
        {/* Brand & Logo */}
        <div className="flex items-center space-x-3.5">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Landmark className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-sm sm:text-lg font-bold bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                {t('app_title')}
              </h1>
              <span className="hidden lg:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <Sparkles className="w-3 h-3 mr-1" />
                {t('phase_badge')}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              {t('app_subtitle')}
            </p>
          </div>
        </div>

        {/* Right Nav: Language Toggle & Backend Status indicator */}
        <div className="flex items-center space-x-2.5 sm:space-x-3">
          {/* Phase 4 Language Toggle */}
          <LanguageToggle />

          {/* Backend Status indicator */}
          <div
            className={`flex items-center space-x-2 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
              isConnected
                ? 'bg-emerald-950/50 text-emerald-300 border-emerald-800/60'
                : 'bg-rose-950/40 text-rose-300 border-rose-800/50'
            }`}
            title={isConnected ? 'Backend API is online and responding' : 'FastAPI backend connection error'}
          >
            {isConnected ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <Wifi className="w-3.5 h-3.5" />
                <span className="hidden md:inline">{t('api_online')}</span>
              </>
            ) : (
              <>
                <span className="inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                <WifiOff className="w-3.5 h-3.5" />
                <span className="hidden md:inline">{t('api_offline')}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
