import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";

export default function ConfirmationScreen() {
  const { state, resetAll } = useApp();
  const navigate = useNavigate();

  const handleStartOver = () => {
    resetAll();
    window.scrollTo({ top: 0, behavior: "smooth" });
    navigate("/");
  };

  const handleViewDashboard = () => {
    navigate("/dashboard");
  };

  const email = state.intake.email || "applicant@example.com";
  const scheme = state.recommendation.recommended_scheme || "NBCFDC Term Loan Scheme";
  const emi = state.emi.emi ? `₹ ${state.emi.emi.toLocaleString('en-IN')}` : "₹ 5,316";
  const loanAmount = state.intake.project_cost ? `₹ ${state.intake.project_cost.toLocaleString('en-IN')}` : "₹ 1,80,000";
  const matchScore = state.recommendation.matches?.[0]?.match_score ? `${Math.round(state.recommendation.matches[0].match_score)}%` : "94%";
  
  return (
    <div className="flex flex-col flex-1 relative w-full pb-12 animate-fade-in">
      <div className="flex flex-col w-full max-w-[720px] mx-auto pb-8">
        <div className="flex items-center justify-between py-space-xs mb-space-md">
          <div className="inline-flex items-center gap-2 px-space-sm py-1 rounded-full bg-secondary-container text-on-secondary-container">
            <span className="material-symbols-outlined text-[16px]">check_circle</span>
            <span className="font-label-md text-label-md uppercase tracking-wider">Step 5 of 5 • Completed</span>
          </div>
          <span className="font-label-md text-label-md text-on-surface-variant">e-Verification Passed</span>
        </div>

        <div className="bg-surface-container-lowest rounded-lg p-space-lg mb-space-lg flex flex-col items-center text-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-space-md">
            <span className="material-symbols-outlined text-on-secondary text-[36px]">check</span>
          </div>
          <h2 className="font-headline-md text-headline-md text-on-surface mb-space-xs">
            Application Referral Submitted!
          </h2>
          <div className="inline-flex items-center gap-2 bg-surface-container-low px-space-md py-1.5 rounded-full mb-space-sm">
            <span className="font-body-md text-body-md text-on-surface-variant">Confirmation:</span>
            <span className="font-body-lg-bold text-body-lg-bold text-primary font-mono tracking-wide">Ref SM-KA-2026-88412</span>
            <button aria-label="Copy reference ID" className="text-primary hover:text-on-primary-fixed-variant p-0.5 rounded" onClick={(e) => { navigator.clipboard.writeText('SM-KA-2026-88412'); e.currentTarget.querySelector('span').textContent='done'; setTimeout(()=> {if(e.currentTarget) e.currentTarget.querySelector('span').textContent='content_copy'}, 2000); }} type="button">
              <span className="material-symbols-outlined text-[18px]">content_copy</span>
            </button>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-[540px]">
            Your pre-screened profile and scheme match have been forwarded to the local partner office.
          </p>
        </div>

        <div className="bg-surface-container-lowest rounded-lg p-space-lg mb-space-lg shadow-sm">
          <div className="flex items-center justify-between pb-space-sm mb-space-md bg-surface-container-low px-space-md py-space-sm rounded-lg">
            <div>
              <span className="font-label-md text-label-md uppercase text-on-surface-variant block">Allocated Concession Scheme</span>
              <h3 className="font-headline-sm text-headline-sm text-on-surface">{scheme}</h3>
            </div>
            <span className="bg-secondary-container text-on-secondary-container px-space-sm py-1 rounded-full font-label-md text-label-md">
              {matchScore} Match
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm mb-space-md">
            <div className="bg-surface-container-low p-space-md rounded-lg">
              <span className="font-label-md text-label-md text-on-surface-variant block">Monthly Repayment (EMI)</span>
              <div className="font-display-currency-mobile text-display-currency-mobile text-on-surface mt-0.5">{emi}</div>
              <span className="font-body-md text-body-md text-on-surface-variant">for 36 months (Subsidized)</span>
            </div>
            <div className="bg-surface-container-low p-space-md rounded-lg">
              <span className="font-label-md text-label-md text-on-surface-variant block">Sanctioned Amount &amp; Rate</span>
              <div className="font-display-currency-mobile text-display-currency-mobile text-on-surface mt-0.5">{loanAmount}</div>
              <span className="font-body-md text-body-md text-secondary">at 4% concessional interest</span>
            </div>
          </div>

          <div className="bg-surface-container-low p-space-md rounded-lg mb-space-sm">
            <div className="flex items-start gap-space-sm mb-space-xs">
              <span className="material-symbols-outlined text-primary text-[22px] mt-0.5">domain</span>
              <div>
                <span className="font-label-md text-label-md text-on-surface-variant block">Selected Channel Partner (SCA)</span>
                <p className="font-body-lg-bold text-body-lg-bold text-on-surface">
                  Karnataka State D. Devaraj Urs DCWD Ltd
                </p>
              </div>
            </div>
            <div className="flex items-start gap-space-sm mb-space-xs text-on-surface-variant">
              <span className="material-symbols-outlined text-[20px] mt-0.5">location_on</span>
              <p className="font-body-md text-body-md text-on-surface">
                Station Road, Near Old Bus Stand, Hubballi • 📞 0836-2245890
              </p>
            </div>
            <div className="flex items-center gap-space-sm text-on-surface-variant">
              <span className="material-symbols-outlined text-[20px]">badge</span>
              <p className="font-body-md text-body-md text-on-surface">
                <span className="font-label-md text-label-md">Nodal Officer:</span> Shri M. B. Patil (Desk 3)
              </p>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-lg p-space-lg mb-space-lg shadow-sm">
          <div className="flex items-start gap-space-sm mb-space-md">
            <span className="material-symbols-outlined text-primary text-[24px]">mail</span>
            <div>
              <h4 className="font-headline-sm text-headline-sm text-on-surface">Email Delivery Confirmation</h4>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                Check your email (<strong className="text-on-surface">{email}</strong>) for full application summary and document checklist.
              </p>
            </div>
          </div>
          <div className="bg-surface-container-low p-space-md rounded-lg">
            <label className="flex items-start gap-space-sm cursor-pointer select-none">
              <input defaultChecked className="w-6 h-6 rounded text-primary mt-0.5 accent-primary cursor-pointer" id="emailReminderToggle" type="checkbox"/>
              <div className="flex flex-col">
                <span className="font-body-lg-bold text-body-lg-bold text-on-surface">Email me a reminder</span>
                <span className="font-body-md text-body-md text-on-surface-variant mt-0.5">
                  We'll remind you by email 10 days before the quarterly funding window closes.
                </span>
              </div>
            </label>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-lg p-space-lg mb-space-lg shadow-sm">
          <div className="flex items-center gap-space-xs mb-space-md">
            <span className="material-symbols-outlined text-primary text-[24px]">assignment_turned_in</span>
            <h4 className="font-headline-sm text-headline-sm text-on-surface">Mandatory Next Steps</h4>
          </div>
          <div className="flex flex-col gap-space-md">
            <div className="flex items-start gap-space-md bg-surface-container-low p-space-md rounded-lg">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary font-headline-sm text-headline-sm flex-shrink-0">
                1
              </div>
              <div className="flex flex-col">
                <span className="font-body-lg-bold text-body-lg-bold text-on-surface">Visit partner desk in person</span>
                <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
                  Visit partner desk with original Aadhaar &amp; Income certificate.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-space-md bg-surface-container-low p-space-md rounded-lg">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary font-headline-sm text-headline-sm flex-shrink-0">
                2
              </div>
              <div className="flex flex-col">
                <span className="font-body-lg-bold text-body-lg-bold text-on-surface">Physical Verification</span>
                <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
                  Partner verifies quotation and enters portal reference <span className="font-body-lg-bold text-body-lg-bold text-primary">#SM-KA-2026-88412</span>.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-space-md bg-surface-container-low p-space-md rounded-lg">
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-on-secondary font-headline-sm text-headline-sm flex-shrink-0">
                3
              </div>
              <div className="flex flex-col">
                <span className="font-body-lg-bold text-body-lg-bold text-on-surface">Direct Concession Disbursal</span>
                <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
                  Funds released directly to vendor/bank via DBT.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-space-sm pt-space-xs">
          <button 
            className="w-full min-h-[52px] bg-primary text-on-primary rounded-lg font-body-lg-bold text-body-lg-bold flex items-center justify-center gap-space-xs hover:bg-primary-container active:bg-primary shadow-sm transition-colors" 
            type="button"
            onClick={handleViewDashboard}
          >
            <span>View My Scheme Dashboard</span>
            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
          </button>
          <button 
            className="w-full min-h-[52px] bg-surface-container-lowest text-on-surface rounded-lg font-body-lg-bold text-body-lg-bold flex items-center justify-center hover:bg-surface-container-low active:bg-surface-dim shadow-sm transition-colors" 
            onClick={handleStartOver} 
            type="button"
          >
            Start Over for Another Loan
          </button>
        </div>
      </div>
    </div>
  );
}
