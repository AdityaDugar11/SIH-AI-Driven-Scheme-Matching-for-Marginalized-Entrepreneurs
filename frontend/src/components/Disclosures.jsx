import React from 'react';
import { ShieldCheck, Scale, FileText, CheckCircle } from 'lucide-react';

export default function Disclosures() {
  return (
    <div className="mt-8 p-5 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 space-y-3">
      <div className="flex items-center space-x-2 text-slate-300 font-semibold">
        <Scale className="w-4 h-4 text-emerald-400" />
        <span>SIH Governance & Architecture Transparency Disclosures</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80">
          <div className="flex items-center space-x-1.5 font-medium text-slate-200 mb-1">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>Deterministic Rules Engine</span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-400">
            Eligibility decisions are 100% auditable and rule-based per official NBCFDC/NSFDC policy tables, eliminating black-box bias.
          </p>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80">
          <div className="flex items-center space-x-1.5 font-medium text-slate-200 mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
            <span>90% Loan Cap Rule</span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-400">
            Concessional loans cover up to 90% of project costs. The remaining 10% represents the mandatory applicant equity contribution.
          </p>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80">
          <div className="flex items-center space-x-1.5 font-medium text-slate-200 mb-1">
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            <span>Phase 3 Partner Integration</span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-400">
            Channel partner risk & branch routing data is pre-configured for demonstration; live production integrates directly with SCA/MIS APIs.
          </p>
        </div>
      </div>
    </div>
  );
}
