/**
 * App.jsx — Main application shell with routing
 *
 * Routes:
 *   /            → Screen 1 (IntakeForm)
 *   /result      → Screen 2 (RecommendationResult)
 *   /emi         → Screen 3 (EmiCalculator)
 *   /partners    → Screen 4 (placeholder — built by another team member)
 *   /confirmation → Screen 5 (placeholder — built by another team member)
 *
 * App shell: LanguageToggle top-right, content centered at max-width 640px
 */

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "./context/AppContext.jsx";
import LanguageToggle from "./components/LanguageToggle.jsx";
import IntakeForm from "./components/IntakeForm.jsx";
import RecommendationResult from "./components/RecommendationResult.jsx";
import EmiCalculator from "./components/EmiCalculator.jsx";

import PartnerLocator from "./components/PartnerLocator.jsx";
import ConfirmationScreen from "./components/ConfirmationScreen.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <div
          className="min-h-screen"
          style={{ backgroundColor: "var(--color-bg)" }}
        >
          {/* ── Header with Language Toggle ──────────────── */}
          <header className="sticky top-0 z-10 px-4 py-3 flex items-center justify-between"
            style={{
              backgroundColor: "var(--color-surface)",
              borderBottom: "1px solid #e5e7eb",
            }}
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">🏦</span>
              <span className="font-bold text-base" style={{ color: "var(--color-primary)" }}>
                Scheme Matcher
              </span>
            </div>
            <LanguageToggle />
          </header>

          {/* ── Main content (max-width 640px, centered) ── */}
          <main
            className="mx-auto px-4 py-6"
            style={{ maxWidth: "var(--max-w-content)" }}
          >
            <Routes>
              <Route path="/" element={<IntakeForm />} />
              <Route path="/result" element={<RecommendationResult />} />
              <Route path="/emi" element={<EmiCalculator />} />
              <Route path="/partners" element={<PartnerLocator />} />
              <Route path="/confirmation" element={<ConfirmationScreen />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </AppProvider>
    </BrowserRouter>
  );
}
