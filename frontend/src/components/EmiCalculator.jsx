/**
 * Screen 3: EmiCalculator — financial breakdown with live tenure adjustment
 *
 * UI.md spec:
 * - Loan amount vs contribution (90/10 split), two labeled numbers
 * - Tenure selector (slider, months) — recalculates EMI live via /calculate-emi
 * - EMI amount, large and prominent
 * - Interest rate, moratorium, total interest — smaller secondary info
 * - Simple visual bar (loan vs contribution) — no charting library
 * - CTA: "Find Nearest Partner" → Screen 4
 *
 * Design.md: "Numbers — largest and boldest text on any screen they appear on"
 */

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import { useTranslation } from "../hooks/useTranslation.js";
import { calculateEmi } from "../api/client.js";
import CurrencyDisplay from "./CurrencyDisplay.jsx";
import StepHeader from "./StepHeader.jsx";

export default function EmiCalculator() {
  const { state, setEmi } = useApp();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const rec = state.recommendation;
  const intake = state.intake;

  // Guard: must have a recommendation to show EMI
  if (!rec.eligible || !rec.recommended_scheme) {
    navigate("/", { replace: true });
    return null;
  }

  const [tenure, setTenure] = useState(state.emi.tenure_months || 36);
  const [emiData, setEmiData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const debounceRef = useRef(null);

  // Fetch EMI on mount and when tenure changes (debounced)
  useEffect(() => {
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
  }, [tenure]);

  // Calculate bar percentages for the loan/contribution visual
  const loanPercent = emiData
    ? Math.round(
        (emiData.loan_amount /
          (emiData.loan_amount + emiData.applicant_contribution)) *
          100
      )
    : 90;
  const contribPercent = 100 - loanPercent;

  return (
    <div>
      <StepHeader currentStep={3} />

      <h1 className="text-heading mb-2">{t("screen3_title")}</h1>
      <p
        className="mb-6 text-sm"
        style={{ color: "var(--color-text-muted)" }}
      >
        {rec.recommended_scheme}
      </p>

      {/* ── Loan vs Contribution ─────────────────────────── */}
      <div className="card mb-4">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm font-semibold mb-1" style={{ color: "var(--color-text-muted)" }}>
              {t("screen3_loan_amount_label")}
            </p>
            <CurrencyDisplay
              amount={emiData?.loan_amount}
              large
              className="block"
              style={{ color: "var(--color-primary)" }}
            />
          </div>
          <div>
            <p className="text-sm font-semibold mb-1" style={{ color: "var(--color-text-muted)" }}>
              {t("screen3_contribution_label")}
            </p>
            <CurrencyDisplay
              amount={emiData?.applicant_contribution}
              large
              className="block"
            />
          </div>
        </div>

        {/* ── Simple visual bar (loan vs contribution) ────── */}
        {/* UI.md: "labeled bar is enough, no need for a charting library" */}
        <div className="mb-2">
          <div
            className="flex rounded-lg overflow-hidden"
            style={{ height: "28px" }}
          >
            <div
              className="flex items-center justify-center text-xs font-semibold text-white transition-all"
              style={{
                width: `${loanPercent}%`,
                backgroundColor: "var(--color-primary)",
              }}
            >
              {t("screen3_bar_loan")} {loanPercent}%
            </div>
            <div
              className="flex items-center justify-center text-xs font-semibold transition-all"
              style={{
                width: `${contribPercent}%`,
                backgroundColor: "#e5e7eb",
                color: "var(--color-text-secondary)",
              }}
            >
              {contribPercent}%
            </div>
          </div>
        </div>
      </div>

      {/* ── Tenure Slider ────────────────────────────────── */}
      {/* Decision D7: native range input, no external library */}
      <div className="card mb-4">
        <label htmlFor="tenure-slider" className="form-label">
          {t("screen3_tenure_label")}
        </label>
        <div className="flex items-center gap-4 mt-1">
          <span className="text-sm font-medium" style={{ color: "var(--color-text-muted)" }}>
            6
          </span>
          <input
            id="tenure-slider"
            type="range"
            min="6"
            max="60"
            step="6"
            value={tenure}
            onChange={(e) => setTenure(Number(e.target.value))}
            className="flex-1"
          />
          <span className="text-sm font-medium" style={{ color: "var(--color-text-muted)" }}>
            60
          </span>
        </div>
        <p className="text-center mt-2">
          <span className="text-xl font-bold" style={{ color: "var(--color-primary)" }}>
            {tenure}
          </span>{" "}
          <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            {t("screen3_months")}
          </span>
        </p>
      </div>

      {/* ── EMI Amount (hero number) ─────────────────────── */}
      <div
        className="card mb-4 text-center"
        style={{
          backgroundColor: "var(--color-primary-light)",
          border: "2px solid var(--color-primary)",
        }}
      >
        <p className="text-sm font-semibold mb-1" style={{ color: "var(--color-text-muted)" }}>
          {t("screen3_emi_label")}
        </p>
        {loading ? (
          <p className="text-amount" style={{ color: "var(--color-primary)" }}>
            {t("screen3_calculating")}
          </p>
        ) : (
          <CurrencyDisplay
            amount={emiData?.emi}
            large
            className="block"
            style={{ color: "var(--color-primary)" }}
          />
        )}
        <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
          {t("screen3_emi_helper")}
        </p>
      </div>

      {/* ── Secondary info ───────────────────────────────── */}
      {emiData && !loading && (
        <div className="card mb-6">
          <div className="grid grid-cols-1 gap-3">
            <div className="flex justify-between items-center py-2" style={{ borderBottom: "1px solid #f0f0f0" }}>
              <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                {t("screen3_interest_rate_label")}
              </span>
              <span className="font-semibold">{emiData.interest_rate}%</span>
            </div>
            <div className="flex justify-between items-center py-2" style={{ borderBottom: "1px solid #f0f0f0" }}>
              <div>
                <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                  {t("screen3_moratorium_label")}
                </span>
                <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                  {t("screen3_moratorium_helper")}
                </p>
              </div>
              <span className="font-semibold">
                {emiData.moratorium_months} {t("screen3_months")}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                {t("screen3_total_interest_label")}
              </span>
              <CurrencyDisplay amount={emiData.total_interest} className="font-semibold" />
            </div>
          </div>
        </div>
      )}

      {/* ── Error ─────────────────────────────────────────── */}
      {error && (
        <div
          className="p-3 rounded-lg mb-4 text-sm font-medium"
          style={{
            backgroundColor: "var(--color-warning-light)",
            color: "var(--color-warning-dark)",
          }}
        >
          {error}
        </div>
      )}

      {/* ── CTA ───────────────────────────────────────────── */}
      <button
        id="cta-find-partner"
        className="btn-primary"
        onClick={() => navigate("/partners")}
        disabled={loading || !emiData}
      >
        {t("screen3_cta_partners")}
      </button>
    </div>
  );
}
