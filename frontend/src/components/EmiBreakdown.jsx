import React from 'react';
import { 
  Calculator, 
  IndianRupee, 
  Percent, 
  Calendar, 
  TrendingUp, 
  PieChart, 
  Wallet, 
  ArrowRight,
  ShieldCheck,
  Building
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

function formatInr(val) {
  if (val === undefined || val === null || isNaN(val)) return '0';
  return Number(val).toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

export default function EmiBreakdown({ emiData, isEligible, isLoading, onProceedToPartners }) {
  const { t } = useLanguage();

  if (isLoading) {
    return (
      <div className="glass-card rounded-2xl p-6 border border-slate-800 animate-pulse mt-6">
        <div className="h-6 w-48 bg-slate-800 rounded mb-4"></div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-20 bg-slate-800/60 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!isEligible || !emiData) {
    return null;
  }

  const {
    loan_amount,
    applicant_contribution,
    interest_rate,
    emi,
    moratorium_months,
    total_interest,
  } = emiData;

  const totalProjectOutlay = (loan_amount || 0) + (applicant_contribution || 0);
  const loanPct = totalProjectOutlay > 0 ? ((loan_amount / totalProjectOutlay) * 100).toFixed(0) : 90;
  const ownPct = 100 - loanPct;

  return (
    <div className="glass-card rounded-2xl p-5 sm:p-6 shadow-xl border border-slate-800 mt-6 transition-all">
      {/* Title */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">{t('emi_title')}</h2>
            <p className="text-xs text-slate-400">{t('emi_subtitle')}</p>
          </div>
        </div>
      </div>

      {/* Screen 3 Requirement: 2-Segment 90/10 Visual Ratio Progress Bar */}
      <div className="mb-6 p-4 rounded-xl bg-slate-950/70 border border-slate-800 shadow-inner">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs mb-2.5 gap-1.5">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-md bg-emerald-500 inline-block shadow-sm"></span>
            <span className="font-bold text-emerald-300">
              {t('emi_sanctioned_loan')}: <span className="text-white text-sm font-black">₹{formatInr(loan_amount)}</span> ({loanPct}%)
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-md bg-amber-500 inline-block shadow-sm"></span>
            <span className="font-bold text-amber-300">
              {t('emi_applicant_share')}: <span className="text-white text-sm font-black">₹{formatInr(applicant_contribution)}</span> ({ownPct}%)
            </span>
          </div>
        </div>

        {/* High-visibility 2-Segment Bar */}
        <div className="w-full h-4 bg-slate-900 rounded-lg overflow-hidden flex p-0.5 border border-slate-700/60 shadow-inner">
          <div
            style={{ width: `${loanPct}%` }}
            className="bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 h-full rounded-l-md transition-all duration-500 flex items-center justify-center text-[10px] font-black text-slate-950"
            title={`Scheme Loan Coverage: ₹${formatInr(loan_amount)} (${loanPct}%)`}
          >
            {loanPct >= 20 ? `${loanPct}% LOAN` : ''}
          </div>
          <div
            style={{ width: `${ownPct}%` }}
            className="bg-gradient-to-r from-amber-500 to-amber-400 h-full rounded-r-md transition-all duration-500 flex items-center justify-center text-[10px] font-black text-slate-950"
            title={`Applicant Own Share: ₹${formatInr(applicant_contribution)} (${ownPct}%)`}
          >
            {ownPct >= 10 ? `${ownPct}% OWN` : ''}
          </div>
        </div>

        <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
          <span>✓ 90% financed via NBCFDC/NSFDC scheme counter</span>
          <span>✓ 10% self-financed promoter margin</span>
        </div>
      </div>

      {/* Financial Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {/* Monthly EMI */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-teal-950/40 to-slate-900/90 border border-teal-500/30">
          <div className="flex items-center justify-between text-teal-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">{t('emi_monthly_label')}</span>
            <Wallet className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-teal-300">
            ₹{formatInr(emi)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {t('emi_reducing_desc')}
          </div>
        </div>

        {/* Total Loan Amount */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-950/40 to-slate-900/90 border border-emerald-500/30">
          <div className="flex items-center justify-between text-emerald-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">{t('emi_total_loan_label')}</span>
            <IndianRupee className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-emerald-300">
            ₹{formatInr(loan_amount)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {t('emi_loan_desc')}
          </div>
        </div>

        {/* Minimum Applicant Contribution */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-amber-950/40 to-slate-900/90 border border-amber-500/30">
          <div className="flex items-center justify-between text-amber-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">{t('emi_own_label')}</span>
            <PieChart className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-amber-300">
            ₹{formatInr(applicant_contribution)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {t('emi_own_desc')}
          </div>
        </div>

        {/* Interest Rate */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">{t('emi_rate_label')}</span>
            <Percent className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-white">
            {interest_rate}% <span className="text-xs text-slate-400 font-normal">p.a.</span>
          </div>
          <div className="text-[11px] text-emerald-400/90 mt-1">
            {t('emi_rate_desc')}
          </div>
        </div>

        {/* Moratorium Period */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">{t('emi_moratorium_label')}</span>
            <Calendar className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl font-bold text-white">
            {moratorium_months} <span className="text-xs text-slate-400 font-normal">Months</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {t('emi_moratorium_desc')}
          </div>
        </div>

        {/* Total Interest Payable */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">{t('emi_total_int_label')}</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold text-white">
            ₹{formatInr(total_interest)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {t('emi_total_int_desc')}
          </div>
        </div>
      </div>

      {/* Primary Step 3 Navigation CTA: Find Nearest Partner */}
      {onProceedToPartners && (
        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onProceedToPartners}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 flex items-center justify-center space-x-2 transition cursor-pointer"
          >
            <span>{t('emi_btn_find_partner')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
