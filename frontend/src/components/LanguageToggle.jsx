/**
 * LanguageToggle — persistent English/Hindi toggle
 *
 * Design.md: "Top-right corner, persistent across all screens,
 * always visible without scrolling — this is a core accessibility feature."
 */

import { useApp } from "../context/AppContext.jsx";
import { useTranslation } from "../hooks/useTranslation.js";

export default function LanguageToggle() {
  const { state, setLanguage } = useApp();
  const { t } = useTranslation();

  const toggle = () => {
    setLanguage(state.language === "en" ? "hi" : "en");
  };

  return (
    <button
      id="language-toggle"
      onClick={toggle}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border-2 transition-colors cursor-pointer"
      style={{
        borderColor: "var(--color-primary)",
        color: "var(--color-primary)",
        backgroundColor: "transparent",
        minHeight: "36px",
      }}
      aria-label={`Switch to ${state.language === "en" ? "Hindi" : "English"}`}
    >
      <span className="text-base">🌐</span>
      <span>{t("language_toggle")}</span>
    </button>
  );
}
