/**
 * Screen 2: RecommendationResult — shows the matched scheme and why
 *
 * UI.md spec:
 * - Big, clear scheme name at top
 * - 1-2 sentence reason (from API `reason` field)
 * - If eligible: false → show clearly with amber styling (Design.md: not red)
 * - Alternates shown smaller/secondary
 * - CTA: "See EMI Breakdown" → Screen 3 (only if eligible)
 */

import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import { useTranslation } from "../hooks/useTranslation.js";
import StepHeader from "./StepHeader.jsx";

export default function RecommendationResult() {
  const { state } = useApp();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const rec = state.recommendation;

  // Guard: if no recommendation in context, go back to form
  if (rec.eligible === null) {
    navigate("/", { replace: true });
    return null;
  }

  return (
    <div>
      <StepHeader currentStep={2} />

      <h1 className="text-heading mb-4">{t("screen2_title")}</h1>

      {rec.eligible ? (
        /* ── Eligible: show recommended scheme ──────────────── */
        <div className="card">
          {/* Eligible badge */}
          <div
            className="inline-block px-3 py-1 rounded-full text-sm font-semibold mb-4"
            style={{
              backgroundColor: "var(--color-success-light)",
              color: "var(--color-success)",
            }}
          >
            {t("screen2_eligible_badge")}
          </div>

          {/* Scheme name — big and clear */}
          <h2
            className="text-2xl font-bold mb-3"
            style={{ color: "var(--color-primary)" }}
          >
            {rec.recommended_scheme}
          </h2>

          {/* Reason — plain-language explanation */}
          <p
            className="text-base leading-relaxed mb-4"
            style={{ color: "var(--color-text-secondary)" }}
          >
            {rec.reason}
          </p>

          {/* Alternates — smaller/secondary */}
          {rec.alternates && rec.alternates.length > 0 && (
            <div
              className="pt-4 mt-4"
              style={{ borderTop: "1px solid #e5e7eb" }}
            >
              <p
                className="text-sm font-semibold mb-2"
                style={{ color: "var(--color-text-muted)" }}
              >
                {t("screen2_alternates_label")}
              </p>
              <div className="flex flex-wrap gap-2">
                {rec.alternates.map((alt) => (
                  <span
                    key={alt}
                    className="inline-block px-3 py-1.5 rounded-lg text-sm font-medium"
                    style={{
                      backgroundColor: "var(--color-primary-light)",
                      color: "var(--color-primary)",
                    }}
                  >
                    {alt}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ── Not eligible: amber styling, not red (Design.md) ── */
        <div
          className="card"
          style={{
            borderColor: "var(--color-warning)",
            borderWidth: "2px",
          }}
        >
          {/* Not eligible badge */}
          <div
            className="inline-block px-3 py-1 rounded-full text-sm font-semibold mb-4"
            style={{
              backgroundColor: "var(--color-warning-light)",
              color: "var(--color-warning-dark)",
            }}
          >
            {t("screen2_not_eligible_title")}
          </div>

          {/* Reason */}
          <p
            className="text-base leading-relaxed"
            style={{ color: "var(--color-text-secondary)" }}
          >
            {rec.reason}
          </p>
        </div>
      )}

      {/* ── CTAs ──────────────────────────────────────────── */}
      <div className="mt-6 flex flex-col gap-3">
        {rec.eligible && (
          <button
            id="cta-see-emi"
            className="btn-primary"
            onClick={() => navigate("/emi")}
          >
            {t("screen2_cta_emi")}
          </button>
        )}

        <button
          id="cta-go-back"
          className="btn-secondary"
          onClick={() => navigate("/")}
        >
          {t("screen2_cta_back")}
        </button>
      </div>
    </div>
  );
}
