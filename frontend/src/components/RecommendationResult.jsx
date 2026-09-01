import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  Info, 
  Award, 
  Layers, 
  ShieldCheck, 
  AlertTriangle,
  FileCheck2,
  Lightbulb,
  Check,
  ArrowRight
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function RecommendationResult({ recommendation, isLoading, onProceedToEmi }) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('summary'); // 'summary' | 'audit'

  if (isLoading) {
    return (
      <div className="glass-card rounded-2xl p-6 border border-slate-800 animate-pulse">
        <div className="h-6 w-48 bg-slate-800 rounded mb-4"></div>
        <div className="h-20 bg-slate-800/60 rounded-xl mb-4"></div>
        <div className="h-10 bg-slate-800/40 rounded-lg"></div>
      </div>
    );
  }

  if (!recommendation) {
    return (
      <div className="glass-card rounded-2xl p-8 border border-slate-800/80 text-center flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-2xl bg-slate-800/60 text-slate-400 flex items-center justify-center mb-3">
          <Sparkles className="w-6 h-6 text-emerald-400/60" />
        </div>
        <h3 className="text-base font-semibold text-slate-200">No Evaluation Submitted Yet</h3>
        <p className="text-xs text-slate-400 max-w-sm mt-1">
          Fill in the intake details or ask the AI Assistant above to match the optimal concessional scheme.
        </p>
      </div>
    );
  }

  const { eligible, recommended_scheme, reason, alternates, ai_explanation } = recommendation;

  return (
    <div className="glass-card rounded-2xl p-5 sm:p-6 shadow-xl border border-slate-800 transition-all">
      {/* Title & Status Badge */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">{t('rec_title')}</h2>
            <p className="text-xs text-slate-400">{t('rec_subtitle')}</p>
          </div>
        </div>

        <div>
          {eligible ? (
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t('rec_eligible_badge')}</span>
            </span>
          ) : (
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
              <XCircle className="w-3.5 h-3.5 text-rose-400" />
              <span>{t('rec_ineligible_badge')}</span>
            </span>
          )}
        </div>
      </div>

      {/* Main Recommendation Card */}
      {eligible ? (
        <div className="space-y-4">
          <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-r from-emerald-950/60 via-slate-900/90 to-teal-950/60 border border-emerald-500/40 relative overflow-hidden">
            <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
                {t('rec_primary_badge')}
              </span>
              
              {/* Tab Selector: Summary vs AI Audit */}
              <div className="flex items-center bg-slate-950/80 p-0.5 rounded-lg border border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveTab('summary')}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition cursor-pointer ${
                    activeTab === 'summary'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t('rec_tab_overview')}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('audit')}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition flex items-center space-x-1 cursor-pointer ${
                    activeTab === 'audit'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <FileCheck2 className="w-3 h-3" />
                  <span>{t('rec_tab_audit')}</span>
                </button>
              </div>
            </div>
            
            <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              {recommended_scheme}
            </h3>

            {/* Tab 1: Overview */}
            {activeTab === 'summary' && (
              <div className="mt-3 flex items-start space-x-2.5 text-xs sm:text-sm text-slate-300 bg-slate-950/70 p-3.5 rounded-lg border border-slate-800">
                <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="leading-relaxed">{reason}</p>
                  {ai_explanation?.financial_tip && (
                    <div className="pt-2 mt-2 border-t border-slate-800/80 flex items-center space-x-1.5 text-xs text-amber-300">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span><strong>{t('rec_tip_label')}</strong> {ai_explanation.financial_tip}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab 2: 5-Point AI Audit Trail */}
            {activeTab === 'audit' && (
              <div className="mt-3 space-y-2 bg-slate-950/80 p-3.5 rounded-lg border border-slate-800 text-xs">
                <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 mb-2">
                  {t('rec_audit_trace_title')}
                </div>
                {ai_explanation?.audit_checklist?.map((item, idx) => (
                  <div key={idx} className="flex items-start space-x-2 py-1 border-b border-slate-900 last:border-0">
                    <div className={`p-0.5 rounded-full mt-0.5 ${item.passed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                      <Check className="w-3 h-3" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-200">{item.rule}: </span>
                      <span className="text-slate-400">{item.detail}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Alternate Eligible Schemes */}
          {alternates && alternates.length > 0 && (
            <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800">
              <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-300 mb-2">
                <Layers className="w-3.5 h-3.5 text-teal-400" />
                <span>{t('rec_alternates_title')}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {alternates.map((alt, i) => (
                  <div
                    key={i}
                    className="text-xs px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 flex items-center space-x-1.5"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                    <span>{alt}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Screen 2 Primary CTA: See EMI Breakdown */}
          {onProceedToEmi && (
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={onProceedToEmi}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 font-bold text-xs border border-emerald-500/30 hover:border-emerald-500/60 transition flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <span>{t('rec_btn_see_emi')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Ineligible State */
        <div className="p-5 rounded-xl bg-rose-950/30 border border-rose-800/50 space-y-3">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-rose-200">{t('rec_ineligible_title')}</h4>
              <p className="text-xs text-rose-300/90 mt-1 leading-relaxed">{reason}</p>
            </div>
          </div>
          <div className="text-[11px] text-slate-400 bg-slate-950/70 p-3 rounded-lg border border-slate-800">
            {t('rec_ineligible_next')}
          </div>
        </div>
      )}
    </div>
  );
}
