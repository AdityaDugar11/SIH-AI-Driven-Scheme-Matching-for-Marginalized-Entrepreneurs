import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import { useTranslation } from "../hooks/useTranslation.js";

function MatchCard({ match, isExpanded, onToggle, isTopMatch }) {
  const isStrong = match.match_score >= 75;

  return (
    <article className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-sm mb-4">
      {isExpanded ? (
        <>
          <div className="flex flex-col gap-space-xs">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 font-label-md text-label-md rounded-full ${isStrong ? 'bg-secondary-fixed text-on-secondary-fixed' : 'bg-tertiary-fixed text-on-tertiary-fixed-variant'}`}>
                <span className="material-symbols-outlined text-[18px]">
                  {isStrong ? 'verified' : 'info'}
                </span>
                {isStrong ? 'Recommended (≥75% Match)' : 'Not a strong match'}
              </span>
              {isTopMatch && (
                <span className="px-2 py-0.5 bg-primary-fixed text-on-primary-fixed font-label-md text-label-md rounded">
                  Top Selected
                </span>
              )}
            </div>
            <h2 className="font-headline-md text-headline-md text-on-surface mt-1 leading-snug">
              {match.scheme}
            </h2>
          </div>
          
          <div className="bg-surface-container-low rounded-xl p-space-md flex items-center justify-between gap-4 mt-2">
            <div className="flex flex-col">
              <span className="font-label-md text-label-md text-on-surface-variant">Computed Fit</span>
              <span className="font-display-currency-mobile text-display-currency-mobile text-secondary leading-tight">{match.match_score}% Match</span>
            </div>
          </div>
          
          <div className="bg-surface-container p-space-md rounded-lg flex items-start gap-space-xs mt-2">
            <span className="material-symbols-outlined text-primary text-[24px] flex-shrink-0 mt-0.5">lightbulb</span>
            <div className="flex flex-col">
              <span className="font-label-md text-label-md text-on-surface">Why this scheme fits you best</span>
              <p className="font-body-lg text-body-lg text-on-surface-variant mt-0.5">
                {match.reason}
              </p>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center justify-between gap-2">
            <span className={`inline-flex items-center gap-1 px-3 py-1 font-label-md text-label-md rounded-full ${isStrong ? 'bg-secondary-fixed text-on-secondary-fixed' : 'bg-tertiary-fixed text-on-tertiary-fixed-variant'}`}>
              <span className="material-symbols-outlined text-[16px]">
                {isStrong ? 'verified' : 'info'}
              </span>
              {isStrong ? 'Recommended (≥75% Match)' : 'Not a strong match'}
            </span>
            <span className="font-body-lg-bold text-body-lg-bold text-tertiary text-lg">{match.match_score}% Match</span>
          </div>
          
          <div className="flex flex-col gap-1 mt-1">
            <h3 className="font-headline-sm text-headline-sm text-on-surface leading-tight">
              {match.scheme}
            </h3>
            <p className="font-body-lg text-body-lg text-on-surface-variant line-clamp-2">
              {match.reason}
            </p>
          </div>
        </>
      )}

      <button
        className="w-full mt-2 min-h-[44px] bg-surface-container-low text-on-surface font-label-lg text-label-lg rounded-lg flex items-center justify-center gap-1.5 hover:bg-surface-container transition-colors"
        onClick={onToggle}
        type="button"
      >
        <span>{isExpanded ? 'Hide details' : 'Tap to expand details'}</span>
        <span className="material-symbols-outlined text-[20px] transition-transform">
          {isExpanded ? 'expand_less' : 'expand_more'}
        </span>
      </button>
    </article>
  );
}

export default function RecommendationResult() {
  const { state } = useApp();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const rec = state.recommendation;
  const email = state.intake.email;

  const [expandedIndex, setExpandedIndex] = useState(0);

  // Guard: if no recommendation in context, go back to form
  useEffect(() => {
    if (rec.eligible === null && (!rec.matches || rec.matches.length === 0)) {
      navigate("/", { replace: true });
    }
  }, [rec.eligible, rec.matches, navigate]);

  if (rec.eligible === null && (!rec.matches || rec.matches.length === 0)) {
    return null;
  }

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

      <section className="bg-surface-container-lowest rounded-xl p-space-md flex flex-col gap-space-xs shadow-sm mt-4">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 px-space-sm py-1 bg-surface-container text-on-surface font-label-md text-label-md rounded-full">
            <span className="material-symbols-outlined text-[16px] text-primary" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>
            Step 2 of 5
          </span>
          <span className="font-label-md text-label-md text-secondary flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-secondary"></span>
            Verified Match Engine
          </span>
        </div>
        
        <div className="flex flex-col gap-1 mt-1">
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">Recommended Schemes for You</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant leading-snug">
            {rec.matches && rec.matches.length > 0 ? `${rec.matches.length} schemes evaluated based on family income under ` : 'Evaluated based on family income under '}
            <strong className="text-on-surface">₹{state.intake.income}</strong> and <strong className="text-on-surface">{state.intake.purpose}</strong> requirement in <strong className="text-on-surface">{state.intake.cityIdx > 0 ? 'Urban' : 'Rural'}</strong> area.
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-space-xs pt-space-xs mt-2">
          <div className="bg-surface-container-low p-space-xs rounded-lg flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[22px]">storefront</span>
            <div className="flex flex-col min-w-0">
              <span className="font-label-md text-label-md text-on-surface-variant text-xs truncate">Business Category</span>
              <span className="font-body-lg-bold text-body-lg-bold text-on-surface text-sm truncate">{state.intake.purpose}</span>
            </div>
          </div>
          <div className="bg-surface-container-low p-space-xs rounded-lg flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[22px]">savings</span>
            <div className="flex flex-col min-w-0">
              <span className="font-label-md text-label-md text-on-surface-variant text-xs truncate">Reported Income</span>
              <span className="font-body-lg-bold text-body-lg-bold text-on-surface text-sm truncate">₹{state.intake.income} / year</span>
            </div>
          </div>
        </div>
      </section>

      <div className="flex items-center justify-between px-1 mt-4 mb-2">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[22px]">workspace_premium</span>
          <span className="font-headline-sm text-headline-sm text-on-surface">Ranked Results</span>
        </div>
        <span className="font-label-md text-label-md text-on-surface-variant">Sorted by Eligibility</span>
      </div>

      {rec.matches && rec.matches.length > 0 ? (
        <div className="flex flex-col mt-2">
          {rec.matches.map((match, i) => (
            <MatchCard
              key={i}
              match={match}
              isExpanded={expandedIndex === i}
              onToggle={() => setExpandedIndex(expandedIndex === i ? -1 : i)}
              isTopMatch={i === 0}
            />
          ))}
        </div>
      ) : (
        <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md border-2 border-[var(--color-warning)]">
           <div className="inline-block px-3 py-1 rounded-full text-sm font-semibold mb-4 bg-error-container text-on-error-container self-start">
            {t("screen2_not_eligible_title")}
          </div>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            {rec.reason}
          </p>
        </div>
      )}

      {/* Primary CTA */}
      <section className="flex flex-col gap-space-sm pt-space-xs mt-4">
        {rec.eligible && (
          <button
            className="w-full min-h-[52px] bg-primary-container text-on-primary font-body-lg-bold text-body-lg-bold rounded-xl flex items-center justify-center gap-2 shadow-sm active:bg-primary transition-colors"
            onClick={() => navigate("/emi")}
            type="button"
          >
            <span>See EMI Breakdown</span>
            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
          </button>
        )}
        
        <button
          className="w-full min-h-[52px] bg-surface-container text-on-surface font-body-lg-bold text-body-lg-bold rounded-xl flex items-center justify-center gap-2 shadow-sm hover:bg-surface-container-high transition-colors"
          onClick={() => navigate(`/dashboard?email=${encodeURIComponent(email)}`)}
          type="button"
        >
          <span className="material-symbols-outlined text-[20px]">dashboard</span>
          <span>View My Dashboard</span>
        </button>

        <button
          className="w-full min-h-[52px] bg-surface-container-lowest text-on-surface font-body-lg-bold text-body-lg-bold rounded-xl flex items-center justify-center gap-2 shadow-sm hover:bg-surface-container transition-colors border border-outline-variant"
          onClick={() => navigate("/")}
          type="button"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          <span>← Back to Modify Details</span>
        </button>
        
        <div className="p-space-md rounded-xl bg-surface-container-low flex items-start gap-space-xs mt-2">
          <span className="material-symbols-outlined text-on-surface-variant text-[22px] flex-shrink-0">gavel</span>
          <p className="font-body-lg text-body-lg text-on-surface-variant text-sm leading-relaxed">
            <strong>Note:</strong> Match scores indicate alignment with published government criteria. Official sanction is granted by the partner bank.
          </p>
        </div>
      </section>
    </div>
  );
}
