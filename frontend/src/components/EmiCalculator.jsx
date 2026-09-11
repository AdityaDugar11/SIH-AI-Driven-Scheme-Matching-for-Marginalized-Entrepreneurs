import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import { useTranslation } from "../hooks/useTranslation.js";
import { calculateEmi } from "../api/client.js";

export default function EmiCalculator() {
  const { state, setEmi } = useApp();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const rec = state.recommendation;
  const intake = state.intake;

  const [tenure, setTenure] = useState(state.emi.tenure_months || 36);
  const [emiData, setEmiData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const debounceRef = useRef(null);

  // Guard: must have a recommendation to show EMI
  useEffect(() => {
    if (!rec.eligible || !rec.recommended_scheme) {
      navigate("/", { replace: true });
    }
  }, [rec.eligible, rec.recommended_scheme, navigate]);

  // Fetch EMI on mount and when tenure changes (debounced)
  useEffect(() => {
    if (!rec.eligible || !rec.recommended_scheme) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        const result = await calculateEmi({
          scheme: rec.recommended_scheme,
          project_cost: intake.project_cost,
          tenure_months: tenure,
        });
        setEmiData(result);
        setEmi({ ...result, tenure_months: tenure });
      } catch (err) {
        setError(err.message || t("error_generic"));
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [tenure, rec.eligible, rec.recommended_scheme, intake.project_cost, setEmi, t]);

  if (!rec.eligible || !rec.recommended_scheme) {
    return null;
  }

  // Calculate bar percentages for the loan/contribution visual
  const loanPercent = emiData
    ? Math.round(
        (emiData.loan_amount /
          (emiData.loan_amount + emiData.applicant_contribution)) *
          100
      )
    : 90;
  const contribPercent = 100 - loanPercent;

  const getTenureYears = (months) => {
    const years = (months / 12).toFixed(months % 12 === 0 ? 0 : 1);
    return `${months} Months (${years} Yr${years > 1 ? 's' : ''})`;
  };

  const handleTenureClick = (months) => {
    setTenure(months);
  };

  return (
    <div className="flex flex-col flex-1 relative w-full pt-16 pb-28 px-margin-mobile bg-surface min-h-screen">
      <header className="fixed top-0 left-0 w-full z-50 bg-surface-container-lowest pt-safe shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 px-margin-mobile flex items-center justify-between gap-space-xs">
          <div className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-primary text-[28px]">shield</span>
            <div className="flex flex-col">
              <span className="font-headline-sm text-headline-sm text-on-surface leading-tight">Scheme Matcher</span>
            </div>
          </div>
          <div className="flex items-center gap-space-xs">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-space-xs bg-surface-container-lowest p-space-md rounded-xl shadow-sm mt-4">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 px-space-sm py-1 bg-surface-container rounded-full text-on-surface-variant font-label-md text-label-md">
            <span className="material-symbols-outlined text-[16px] text-primary" style={{fontVariationSettings: "'FILL' 1"}}>tune</span>
            Step 3 of 5
          </span>
          <span className="inline-flex items-center gap-1 px-space-sm py-1 bg-secondary-container text-on-secondary-container rounded-full font-label-md text-label-md">
            <span className="material-symbols-outlined text-[16px]">verified</span>
            {rec.matches && rec.matches[0] ? `${rec.matches[0].match_score}% Match` : 'Match'}
          </span>
        </div>
        <div className="flex flex-col mt-1">
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface leading-tight">
            Calculate Your Monthly Repayment (EMI)
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
            For: <span className="text-on-surface font-bold">{rec.recommended_scheme}</span>
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-space-sm bg-surface-container-lowest p-space-md rounded-xl shadow-sm mt-4">
        <span className="font-label-lg text-label-lg text-on-surface">Total Project Cost: ₹ {parseInt(intake.project_cost).toLocaleString('en-IN')}</span>
        
        <div className="grid grid-cols-2 gap-gutter-mobile">
          <div className="flex flex-col p-space-sm bg-surface-container-low rounded-lg">
            <div className="flex items-center gap-1 text-primary mb-1">
              <span className="material-symbols-outlined text-[18px]">account_balance</span>
              <span className="font-label-md text-label-md">Govt Loan ({loanPercent}%)</span>
            </div>
            <span className="font-headline-md text-headline-md text-primary tracking-tight">
              ₹ {emiData?.loan_amount?.toLocaleString('en-IN') || "0"}
            </span>
            <span className="font-label-md text-label-md text-on-surface-variant mt-1 text-xs">Direct Subsidized Capital</span>
          </div>

          <div className="flex flex-col p-space-sm bg-surface-variant rounded-lg">
            <div className="flex items-center gap-1 text-on-surface-variant mb-1">
              <span className="material-symbols-outlined text-[18px]">person</span>
              <span className="font-label-md text-label-md">Your Share ({contribPercent}%)</span>
            </div>
            <span className="font-headline-md text-headline-md text-on-surface tracking-tight">
              ₹ {emiData?.applicant_contribution?.toLocaleString('en-IN') || "0"}
            </span>
            <span className="font-label-md text-label-md text-on-surface-variant mt-1 text-xs">Own Equity Contribution</span>
          </div>
        </div>

        <div className="flex flex-col gap-1.5 pt-1">
          <div className="w-full h-8 flex rounded-lg overflow-hidden bg-surface-dim">
            <div 
              className="bg-primary flex items-center justify-start px-2.5 transition-all duration-300"
              style={{ width: `${loanPercent}%` }}
            >
              <span className="font-label-md text-label-md text-on-primary tracking-wide text-xs truncate">
                Loan: {loanPercent}% (₹{((emiData?.loan_amount || 0) / 100000).toFixed(2)}L)
              </span>
            </div>
            <div 
              className="bg-outline flex items-center justify-center transition-all duration-300"
              style={{ width: `${contribPercent}%` }}
            >
              <span className="font-label-md text-label-md text-surface-container-lowest text-xs truncate px-1">{contribPercent}%</span>
            </div>
          </div>
          <div className="flex justify-between items-center text-on-surface-variant font-label-md text-label-md text-xs">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-primary inline-block"></span> Government Term Subsidy</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-outline inline-block"></span> Beneficiary Equity</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-space-sm bg-surface-container-lowest p-space-md rounded-xl shadow-sm mt-4">
        <div className="flex items-center justify-between">
          <label className="font-label-lg text-label-lg text-on-surface" htmlFor="tenureSlider">
            Select Repayment Period (Tenure)
          </label>
          <span className="px-2.5 py-1 bg-surface-container-high text-primary font-headline-sm text-headline-sm rounded-lg" id="tenureBadge">
            {getTenureYears(tenure)}
          </span>
        </div>
        
        <div className="flex flex-col gap-2 py-2">
          <input 
            aria-label="Select loan repayment tenure in months" 
            className="w-full h-3 bg-surface-variant rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none" 
            id="tenureSlider" 
            max="60" 
            min="6" 
            step="6" 
            type="range" 
            value={tenure}
            onChange={(e) => setTenure(Number(e.target.value))}
          />
          
          <div className="flex justify-between items-center px-1 font-label-md text-label-md text-on-surface-variant text-xs">
            <span className={tenure === 6 ? "font-bold text-primary" : "font-bold text-on-surface"}>6M</span>
            <span className={tenure === 12 ? "font-bold text-primary" : ""}>12M</span>
            <span className={tenure === 24 ? "font-bold text-primary" : ""}>24M</span>
            <span className={tenure === 36 ? "font-bold text-primary" : ""}>36M</span>
            <span className={tenure === 48 ? "font-bold text-primary" : ""}>48M</span>
            <span className={tenure === 60 ? "font-bold text-primary" : "font-bold text-on-surface"}>60M</span>
          </div>
        </div>
        
        <div className="grid grid-cols-4 gap-space-xs mt-1">
          {[12, 24, 36, 60].map(months => (
            <button 
              key={months}
              className={`h-11 rounded-lg font-label-md text-label-md transition-colors ${tenure === months ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-on-surface active:bg-primary active:text-on-primary'}`}
              onClick={() => handleTenureClick(months)}
              type="button"
            >
              {months} Mo
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col bg-surface-container-lowest p-space-md rounded-xl shadow-md gap-space-sm mt-4">
        <div className="flex flex-col pb-2">
          <div className="flex items-center gap-1.5 text-on-surface-variant">
            <span className="material-symbols-outlined text-[20px] text-primary">calendar_month</span>
            <span className="font-label-lg text-label-lg">Estimated Monthly Payment (EMI)</span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-display-currency-mobile text-display-currency-mobile text-primary">
              {loading ? '...' : `₹ ${emiData?.emi?.toLocaleString('en-IN') || "0"}`}
            </span>
            <span className="font-body-lg-bold text-body-lg-bold text-on-surface-variant">/ month</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-xs bg-surface-container-low p-space-sm rounded-lg">
          <div className="flex flex-col py-1">
            <span className="font-body-md text-body-md text-on-surface-variant text-xs">Interest Rate</span>
            <span className="font-body-lg-bold text-body-lg-bold text-secondary">{emiData?.interest_rate || 0}% p.a. (Fixed)</span>
          </div>
          <div className="flex flex-col py-1">
            <span className="font-body-md text-body-md text-on-surface-variant text-xs">Moratorium Grace</span>
            <span className="font-body-lg-bold text-body-lg-bold text-on-surface">{emiData?.moratorium_months || 0} Months Free</span>
          </div>
          <div className="flex flex-col py-1">
            <span className="font-body-md text-body-md text-on-surface-variant text-xs">Total Interest</span>
            <span className="font-body-lg-bold text-body-lg-bold text-on-surface">₹ {emiData?.total_interest?.toLocaleString('en-IN') || "0"}</span>
          </div>
        </div>
      </div>

      <div className="flex items-start gap-space-sm bg-tertiary-fixed text-on-tertiary-fixed p-space-md rounded-xl mt-4">
        <span className="material-symbols-outlined text-[26px] text-tertiary flex-shrink-0 mt-0.5" style={{fontVariationSettings: "'FILL' 1"}}>lightbulb</span>
        <div className="flex flex-col">
          <span className="font-label-lg text-label-lg text-tertiary">Supportive {emiData?.moratorium_months || 0}-Month Breathing Room</span>
          <p className="font-body-md text-body-md text-on-tertiary-fixed-variant mt-0.5 leading-relaxed">
            Your first repayment will only start after the {emiData?.moratorium_months || 0}-month moratorium period so your shop can set up inventory and generate positive cash flow first.
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 rounded-lg mt-4 text-sm font-medium bg-error-container text-on-error-container">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-space-sm mt-4">
        <button 
          className="w-full h-[52px] bg-primary text-on-primary font-body-lg-bold text-body-lg-bold rounded-lg flex items-center justify-center gap-2 hover:bg-primary-container active:scale-[0.99] transition-transform shadow-sm disabled:opacity-50"
          onClick={() => navigate("/partners")}
          disabled={loading || !emiData}
          type="button"
        >
          <span>Find Nearest Partner</span>
          <span className="material-symbols-outlined text-[22px]">arrow_forward</span>
        </button>
        <button 
          className="h-11 flex items-center justify-center font-label-lg text-label-lg text-on-surface-variant hover:text-primary transition-colors text-center" 
          onClick={() => navigate("/recommendation")}
          type="button"
        >
          ← Change Loan Scheme
        </button>
      </div>
    </div>
  );
}
