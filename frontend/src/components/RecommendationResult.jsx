import React from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  Info, 
  Award, 
  Layers, 
  HelpCircle,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';

export default function RecommendationResult({ recommendation, isLoading }) {
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
          Fill in the intake details on the left or select a 1-click test scenario to match the optimal concessional scheme.
        </p>
      </div>
    );
  }

  const { eligible, recommended_scheme, reason, alternates } = recommendation;

  return (
    <div className="glass-card rounded-2xl p-5 sm:p-6 shadow-xl border border-slate-800 transition-all">
      {/* Title & Status Badge */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Scheme Recommendation</h2>
            <p className="text-xs text-slate-400">Rule-driven deterministic matching result</p>
          </div>
        </div>

        <div>
          {eligible ? (
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Eligible for Concession</span>
            </span>
          ) : (
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
              <XCircle className="w-3.5 h-3.5 text-rose-400" />
              <span>Ineligible</span>
            </span>
          )}
        </div>
      </div>

      {/* Main Recommendation Card */}
      {eligible ? (
        <div className="space-y-4">
          <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-r from-emerald-950/60 via-slate-900/90 to-teal-950/60 border border-emerald-500/40 relative overflow-hidden">
            <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center space-x-2 mb-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
                Recommended Primary Scheme
              </span>
            </div>
            
            <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              {recommended_scheme}
            </h3>

            <div className="mt-3 flex items-start space-x-2.5 text-xs sm:text-sm text-slate-300 bg-slate-950/60 p-3 rounded-lg border border-slate-800">
              <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">{reason}</p>
            </div>
          </div>

          {/* Alternate Eligible Schemes */}
          {alternates && alternates.length > 0 && (
            <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800">
              <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-300 mb-2">
                <Layers className="w-3.5 h-3.5 text-teal-400" />
                <span>Alternative Eligible Concessional Scheme(s):</span>
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
        </div>
      ) : (
        /* Ineligible State */
        <div className="p-5 rounded-xl bg-rose-950/30 border border-rose-800/50 space-y-3">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-rose-200">Not Eligible for Concessional Lending</h4>
              <p className="text-xs text-rose-300/90 mt-1 leading-relaxed">{reason}</p>
            </div>
          </div>
          <div className="text-[11px] text-slate-400 bg-slate-950/70 p-3 rounded-lg border border-slate-800">
            <strong>Next Steps:</strong> Verify your annual family income certification or consider standard commercial SME lending channels through Public Sector Banks (PSBs) and Mudra Yojana loans.
          </div>
        </div>
      )}
    </div>
  );
}
