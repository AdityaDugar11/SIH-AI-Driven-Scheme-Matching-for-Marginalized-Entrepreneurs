import React from 'react';
import { 
  IndianRupee, 
  Briefcase, 
  GraduationCap, 
  Clock, 
  Sliders, 
  UserCheck, 
  CheckCircle2, 
  ArrowRight, 
  RotateCcw,
  Zap
} from 'lucide-react';

const PROJECT_TYPE_OPTIONS = [
  { value: 'small_business', label: 'Small Business / Retail Shop', icon: '🏪' },
  { value: 'micro_enterprise', label: 'Micro Enterprise / Local Workshop', icon: '⚙️' },
  { value: 'manufacturing', label: 'Manufacturing & Processing Unit', icon: '🏭' },
  { value: 'services', label: 'Services, Logistics & Trade', icon: '🚚' },
  { value: 'artisan', label: 'Artisan & Traditional Crafts', icon: '🎨' },
  { value: 'education', label: 'Higher Education / Engineering / Medical', icon: '🎓' },
];

const PRESETS = [
  {
    name: 'Micro-Finance Demo',
    badge: '₹1.20L Project',
    data: {
      income: 400000,
      project_type: 'small_business',
      project_cost: 120000,
      education_need: false,
      tenure_months: 36,
      gender: 'male',
    },
  },
  {
    name: 'Term Loan Demo',
    badge: '₹20.00L Project',
    data: {
      income: 300000,
      project_type: 'manufacturing',
      project_cost: 2000000,
      education_need: false,
      tenure_months: 60,
      gender: 'female',
    },
  },
  {
    name: 'Education Loan Demo',
    badge: '₹8.00L Degree',
    data: {
      income: 200000,
      project_type: 'education',
      project_cost: 800000,
      education_need: true,
      tenure_months: 60,
      gender: 'female',
    },
  },
  {
    name: 'Boundary Test',
    badge: '₹1.40L Boundary',
    data: {
      income: 350000,
      project_type: 'small_business',
      project_cost: 140000,
      education_need: false,
      tenure_months: 36,
      gender: 'male',
    },
  },
  {
    name: 'Over Income Test',
    badge: '₹6.00L Income',
    data: {
      income: 600000,
      project_type: 'small_business',
      project_cost: 100000,
      education_need: false,
      tenure_months: 36,
      gender: 'male',
    },
  },
];

function formatInr(num) {
  if (isNaN(num) || num === null || num === undefined) return '0';
  return Number(num).toLocaleString('en-IN');
}

function formatLakhs(num) {
  const val = Number(num);
  if (isNaN(val) || val <= 0) return '';
  if (val >= 10000000) return `(${(val / 10000000).toFixed(2)} Cr)`;
  if (val >= 100000) return `(${(val / 100000).toFixed(2)} Lakh)`;
  if (val >= 1000) return `(${(val / 1000).toFixed(1)}k)`;
  return '';
}

export default function IntakeForm({ formData, setFormData, onSubmit, isLoading, onReset }) {
  const handleChange = (field, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      // Automatically toggle education_need if education project type selected
      if (field === 'project_type') {
        if (value === 'education') {
          updated.education_need = true;
        } else if (prev.education_need && prev.project_type === 'education') {
          updated.education_need = false;
        }
      }
      if (field === 'education_need' && value === true && prev.project_type !== 'education') {
        updated.project_type = 'education';
      }
      return updated;
    });
  };

  const handleApplyPreset = (presetData) => {
    setFormData(presetData);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <div className="glass-card rounded-2xl p-5 sm:p-6 lg:p-7 shadow-xl border border-slate-800">
      {/* Header & Presets */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Applicant Intake Form</h2>
              <p className="text-xs text-slate-400">Enter applicant financial & project details</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onReset}
            className="flex items-center space-x-1 text-xs text-slate-400 hover:text-slate-200 px-2.5 py-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition-colors"
            title="Reset form to default values"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>

        {/* Demo Fast-Load Chips */}
        <div className="mt-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <div className="flex items-center space-x-1.5 mb-2 text-xs font-semibold text-emerald-400">
            <Zap className="w-3.5 h-3.5" />
            <span>1-Click Test Scenarios (SIH Judges Demo):</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyPreset(preset.data)}
                className="text-xs px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-emerald-600/20 text-slate-300 hover:text-emerald-300 border border-slate-700 hover:border-emerald-500/40 transition-all text-left flex items-center space-x-1.5"
              >
                <span>{preset.name}</span>
                <span className="text-[10px] text-slate-400 bg-slate-900/80 px-1.5 py-0.5 rounded border border-slate-700/50">
                  {preset.badge}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Annual Income */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-sm font-semibold text-slate-200 flex items-center space-x-1.5">
              <IndianRupee className="w-4 h-4 text-emerald-400" />
              <span>Annual Family Income</span>
            </label>
            <span className="text-xs text-slate-400">
              {formatLakhs(formData.income)}
            </span>
          </div>
          <div className="relative rounded-xl shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-semibold">
              ₹
            </div>
            <input
              type="number"
              min="0"
              step="5000"
              required
              id="input-income"
              value={formData.income}
              onChange={(e) => handleChange('income', e.target.value)}
              placeholder="e.g. 300000"
              className="w-full pl-8 pr-4 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition text-sm font-medium"
            />
          </div>
          <div className="flex items-center justify-between mt-1.5 text-[11px] text-slate-400">
            <span>Eligibility limit: ₹5.00 Lakh/year</span>
            <div className="space-x-1">
              {[150000, 300000, 450000, 600000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleChange('income', amt)}
                  className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/50"
                >
                  ₹{amt / 100000}L
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Project Purpose / Type */}
        <div>
          <label className="block text-sm font-semibold text-slate-200 mb-1.5 flex items-center space-x-1.5">
            <Briefcase className="w-4 h-4 text-emerald-400" />
            <span>Project / Venture Category</span>
          </label>
          <div className="relative">
            <select
              id="input-project-type"
              value={formData.project_type}
              onChange={(e) => handleChange('project_type', e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition text-sm appearance-none cursor-pointer"
            >
              {PROJECT_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-slate-900 text-slate-100 py-1">
                  {opt.icon} {opt.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-400">
              <ArrowRight className="w-4 h-4 rotate-90" />
            </div>
          </div>
        </div>

        {/* Project Cost */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-sm font-semibold text-slate-200 flex items-center space-x-1.5">
              <IndianRupee className="w-4 h-4 text-teal-400" />
              <span>Total Estimated Project / Course Cost</span>
            </label>
            <span className="text-xs text-slate-400">
              {formatLakhs(formData.project_cost)}
            </span>
          </div>
          <div className="relative rounded-xl shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-semibold">
              ₹
            </div>
            <input
              type="number"
              min="1000"
              step="any"
              required
              id="input-project-cost"
              value={formData.project_cost}
              onChange={(e) => handleChange('project_cost', e.target.value)}
              placeholder="e.g. 120000"
              className="w-full pl-8 pr-4 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition text-sm font-medium"
            />
          </div>
          <div className="flex items-center justify-between mt-1.5 text-[11px] text-slate-400">
            <span className="text-emerald-400/90 font-medium">
              Micro cap: ≤₹1.40L | Term cap: ≤₹50L
            </span>
            <div className="space-x-1">
              {[120000, 140000, 800000, 2000000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleChange('project_cost', amt)}
                  className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/50"
                >
                  ₹{amt >= 100000 ? `${amt / 100000}L` : `${amt / 1000}k`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Education Need Toggle */}
        <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className={`p-2 rounded-lg ${formData.education_need ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : 'bg-slate-800 text-slate-400'}`}>
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-200">Higher Education / Course Loan</p>
              <p className="text-xs text-slate-400">For engineering, medical, vocational or overseas degrees</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              id="input-education-need"
              checked={formData.education_need}
              onChange={(e) => handleChange('education_need', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>
        </div>

        {/* Desired Loan Tenure */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-sm font-semibold text-slate-200 flex items-center space-x-1.5">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>Desired Loan Tenure</span>
            </label>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-800/50">
              {formData.tenure_months} Months ({(formData.tenure_months / 12).toFixed(1)} Years)
            </span>
          </div>
          <input
            type="range"
            min="12"
            max="84"
            step="6"
            id="input-tenure-slider"
            value={formData.tenure_months}
            onChange={(e) => handleChange('tenure_months', parseInt(e.target.value, 10))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
          <div className="flex justify-between text-[11px] text-slate-400 mt-1">
            <span>12 Months (1 yr)</span>
            <span>36 Months (3 yrs)</span>
            <span>60 Months (5 yrs)</span>
            <span>84 Months (7 yrs)</span>
          </div>
        </div>

        {/* Gender Concession Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center space-x-1.5">
            <UserCheck className="w-3.5 h-3.5 text-slate-400" />
            <span>Applicant Gender (Special 0.5% Concession for Women)</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'male', label: 'Male' },
              { id: 'female', label: 'Female (-0.5% p.a.)' },
              { id: 'other', label: 'Other' },
            ].map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => handleChange('gender', g.id)}
                className={`py-2 px-2.5 rounded-xl text-xs font-medium border transition-all text-center ${
                  formData.gender === g.id
                    ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/60 font-semibold'
                    : 'bg-slate-950/50 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          id="btn-evaluate"
          disabled={isLoading}
          className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 hover:shadow-emerald-600/40 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Evaluating Scheme Match & EMI...</span>
            </>
          ) : (
            <>
              <span>Match Scheme & Calculate EMI</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
