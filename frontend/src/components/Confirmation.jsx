import React from 'react';
import {
  CheckCircle2,
  RotateCcw,
  Building2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  Sparkles,
  Printer,
  Share2,
  ShieldCheck,
  IndianRupee,
  Clock
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

function formatInr(val) {
  if (val === undefined || val === null || isNaN(val)) return '0';
  return Number(val).toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

export default function Confirmation({
  formData,
  recommendation,
  emiData,
  partner,
  onStartOver
}) {
  const { t } = useLanguage();

  const referenceId = `NBCFDC-${Math.floor(100000 + Math.random() * 900000)}`;
  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      {/* Success Hero Banner */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-emerald-500/40 bg-gradient-to-b from-emerald-950/60 via-slate-900/90 to-slate-950 shadow-2xl text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 transform translate-x-12 -translate-y-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Animated Check Icon */}
        <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-xl shadow-emerald-600/30 flex items-center justify-center mb-4">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-400 animate-bounce" />
          </div>
        </div>

        <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Automated Lead Dispatch Active</span>
        </span>

        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          {t('confirm_title')}
        </h1>
        <p className="text-sm text-slate-300 max-w-xl mx-auto mt-2 leading-relaxed">
          {t('confirm_subtitle')}
        </p>

        {/* Lead Reference Badge */}
        <div className="inline-flex items-center space-x-2 mt-4 px-4 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-400">
          <span>{t('confirm_lead_id')}</span>
          <span className="font-mono font-bold text-emerald-400 text-sm tracking-wider">{referenceId}</span>
          <span className="text-slate-600">|</span>
          <span>{currentDate}</span>
        </div>
      </div>

      {/* 2-Column Summary Cards: Scheme Details & Assigned Partner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Scheme & Financial Summary */}
        <div className="glass-card rounded-2xl p-5 sm:p-6 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center space-x-2 text-emerald-400 border-b border-slate-800/80 pb-3">
            <ShieldCheck className="w-5 h-5" />
            <h2 className="text-base font-bold text-white">{t('confirm_scheme_heading')}</h2>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-400">Recommended Scheme:</span>
              <p className="text-base font-extrabold text-white mt-0.5">
                {recommendation?.recommended_scheme || 'Micro Finance Scheme'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-slate-400">Sanctioned Loan (90%):</span>
                <p className="text-sm font-bold text-emerald-300 mt-0.5">
                  ₹{formatInr(emiData?.loan_amount || formData?.project_cost * 0.9)}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-slate-400">Estimated Monthly EMI:</span>
                <p className="text-sm font-bold text-teal-300 mt-0.5">
                  ₹{formatInr(emiData?.emi || 3340)}/mo
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-slate-400">Promoter Share (10%):</span>
                <p className="text-xs font-bold text-amber-300 mt-0.5">
                  ₹{formatInr(emiData?.applicant_contribution || formData?.project_cost * 0.1)}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-slate-400">Moratorium Period:</span>
                <p className="text-xs font-bold text-cyan-300 mt-0.5">
                  {emiData?.moratorium_months || 3} Months
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Channel Partner Branch Info */}
        <div className="glass-card rounded-2xl p-5 sm:p-6 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center space-x-2 text-teal-400 border-b border-slate-800/80 pb-3">
            <Building2 className="w-5 h-5" />
            <h2 className="text-base font-bold text-white">{t('confirm_partner_heading')}</h2>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  {partner?.type || 'SCA'}
                </span>
                <span className="text-slate-400">Branch Name:</span>
              </div>
              <p className="text-base font-extrabold text-white mt-1">
                {partner?.name || 'Delhi SC/ST Financial & Development Corp (DSCFDC)'}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
              <div className="flex items-start space-x-2 text-slate-300">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{partner?.address || 'Sector 12, RK Puram'}, {partner?.city || 'New Delhi'}</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-300">
                <Phone className="w-4 h-4 text-teal-400 shrink-0" />
                <span>{partner?.contact_phone || '+91-11-26178345'}</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-300">
                <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="break-all">{partner?.contact_email || 'delhi.sca@dscfdc.delhi.gov.in'}</span>
              </div>
            </div>

            <div className="text-[11px] text-emerald-400 flex items-center space-x-1.5 bg-emerald-950/40 p-2 rounded-lg border border-emerald-900/50">
              <Clock className="w-3.5 h-3.5" />
              <span>Expected turnaround: ~{partner?.disbursement_speed_days || 12} working days</span>
            </div>
          </div>
        </div>
      </div>

      {/* Next Steps Guidance */}
      <div className="glass-card rounded-2xl p-5 sm:p-6 border border-slate-800 shadow-xl bg-slate-950/60">
        <h3 className="text-sm font-bold text-white mb-3 flex items-center space-x-2">
          <FileText className="w-4 h-4 text-amber-400" />
          <span>{t('confirm_next_steps_title')}</span>
        </h3>
        <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
          <p>{t('confirm_step_1')}</p>
          <p>{t('confirm_step_2')}</p>
          <p>{t('confirm_step_3')}</p>
        </div>
      </div>

      {/* Action Buttons: Start Over & Print */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800">
        <button
          type="button"
          onClick={onStartOver}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm border border-slate-700 transition flex items-center justify-center space-x-2 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 text-emerald-400" />
          <span>{t('confirm_btn_start_over')}</span>
        </button>

        <button
          type="button"
          onClick={() => window.print()}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-600/20 transition flex items-center justify-center space-x-2 cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>{t('confirm_btn_print')}</span>
        </button>
      </div>
    </div>
  );
}
