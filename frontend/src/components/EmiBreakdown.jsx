import React from 'react';
import { 
  Calculator, 
  IndianRupee, 
  Percent, 
  Calendar, 
  TrendingUp, 
  PieChart, 
  Wallet, 
  ShieldAlert
} from 'lucide-react';

function formatInr(val) {
  if (val === undefined || val === null || isNaN(val)) return '0';
  return Number(val).toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

export default function EmiBreakdown({ emiData, isEligible, isLoading }) {
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
            <h2 className="text-lg font-bold text-white">Financial Breakdown & EMI</h2>
            <p className="text-xs text-slate-400">90% Scheme Loan vs. 10% Applicant Own Share</p>
          </div>
        </div>
      </div>

      {/* 90/10 Share Visual Ratio Bar */}
      <div className="mb-5 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
        <div className="flex justify-between items-center text-xs mb-1.5 font-medium">
          <span className="text-emerald-400 flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            <span>Sanctioned Loan: {loanPct}% (₹{formatInr(loan_amount)})</span>
          </span>
          <span className="text-amber-400 flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
            <span>Own Share: {ownPct}% (₹{formatInr(applicant_contribution)})</span>
          </span>
        </div>
        <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden flex">
          <div
            style={{ width: `${loanPct}%` }}
            className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full"
          />
          <div
            style={{ width: `${ownPct}%` }}
            className="bg-amber-500 h-full"
          />
        </div>
      </div>

      {/* Financial Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {/* Monthly EMI */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-teal-950/40 to-slate-900/90 border border-teal-500/30">
          <div className="flex items-center justify-between text-teal-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Monthly EMI</span>
            <Wallet className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-teal-300">
            ₹{formatInr(emi)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Reducing balance amortization
          </div>
        </div>

        {/* Total Loan Amount */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-950/40 to-slate-900/90 border border-emerald-500/30">
          <div className="flex items-center justify-between text-emerald-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Sanctioned Loan</span>
            <IndianRupee className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-emerald-300">
            ₹{formatInr(loan_amount)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Up to 90% of project cost
          </div>
        </div>

        {/* Minimum Applicant Contribution */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-amber-950/40 to-slate-900/90 border border-amber-500/30">
          <div className="flex items-center justify-between text-amber-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Min. Own Contribution</span>
            <PieChart className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-amber-300">
            ₹{formatInr(applicant_contribution)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Mandatory 10% promoter share
          </div>
        </div>

        {/* Interest Rate */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Interest Rate</span>
            <Percent className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-white">
            {interest_rate}% <span className="text-xs text-slate-400 font-normal">p.a.</span>
          </div>
          <div className="text-[11px] text-emerald-400/90 mt-1">
            Concessional subsidized rate
          </div>
        </div>

        {/* Moratorium Period */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Moratorium Period</span>
            <Calendar className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl font-bold text-white">
            {moratorium_months} <span className="text-xs text-slate-400 font-normal">Months</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Repayment holiday during setup
          </div>
        </div>

        {/* Total Interest Payable */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Interest</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold text-white">
            ₹{formatInr(total_interest)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Over total loan duration
          </div>
        </div>
      </div>
    </div>
  );
}
