/**
 * StepHeader — "Step X of 5" with simple dots
 *
 * Design.md: "simple dots or 'Step X of 4' text —
 * don't build an elaborate progress bar animation"
 * UI.md: "shows progress so the user always knows where they are in the flow"
 */

import { useTranslation } from "../hooks/useTranslation.js";

const TOTAL_STEPS = 5;

export default function StepHeader({ currentStep }) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-3 mb-6">
      {/* Step text */}
      <span
        className="text-sm font-semibold"
        style={{ color: "var(--color-text-secondary)" }}
      >
        {t("step_of", { current: currentStep, total: TOTAL_STEPS })}
      </span>

      {/* Simple dots */}
      <div className="flex gap-1.5">
        {Array.from({ length: TOTAL_STEPS }, (_, i) => (
          <div
            key={i}
            className="rounded-full transition-colors"
            style={{
              width: "10px",
              height: "10px",
              backgroundColor:
                i + 1 <= currentStep
                  ? "var(--color-primary)"
                  : "#d1d5db",
            }}
          />
        ))}
      </div>
    </div>
  );
}
