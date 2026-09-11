/**
 * Screen 1: IntakeForm — collects the 4 inputs needed for POST /recommend
 *
 * UI.md spec:
 * - Annual family income (number, ₹, with helper text)
 * - What is this loan for? (radio: Small Business / Larger Business Project / Education)
 * - Estimated project or course cost (number, ₹)
 * - Location (city dropdown)
 * - Language toggle visible at top
 * - CTA: "Find My Scheme" → calls /recommend, navigates to Screen 2
 * - Validation: income >₹5L still submits (shows ineligibility on Screen 2)
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import { useTranslation } from "../hooks/useTranslation.js";
import { recommendScheme } from "../api/client.js";
import { Building2, Store, GraduationCap, Globe } from "lucide-react";

/**
 * City list with lat/lng for partner locator (Screen 4).
 * Cities overlap with partner dataset in data/partners.json.
 */
const CITIES = [
  { city: "Delhi", lat: 28.6139, lng: 77.209 },
  { city: "Mumbai", lat: 19.076, lng: 72.8777 },
  { city: "Bangalore", lat: 12.9716, lng: 77.5946 },
  { city: "Chennai", lat: 13.0827, lng: 80.2707 },
  { city: "Hyderabad", lat: 17.385, lng: 78.4867 },
  { city: "Kolkata", lat: 22.5726, lng: 88.3639 },
  { city: "Ahmedabad", lat: 23.0225, lng: 72.5714 },
  { city: "Lucknow", lat: 26.8467, lng: 80.9462 },
  { city: "Patna", lat: 25.6093, lng: 85.1376 },
  { city: "Jaipur", lat: 26.9124, lng: 75.7873 },
  { city: "Bhopal", lat: 23.2599, lng: 77.4126 },
];

/** Maps UI radio value to API project_type + education_need */
const PURPOSE_MAP = {
  small_business: { project_type: "small_business", education_need: false, icon: Store },
  larger_project: { project_type: "larger_project", education_need: false, icon: Building2 },
  education: { project_type: "education", education_need: true, icon: GraduationCap },
};

export default function IntakeForm() {
  const { setIntake, setRecommendation, language, setLanguage } = useApp();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [income, setIncome] = useState("");
  const [purpose, setPurpose] = useState("");
  const [cost, setCost] = useState("");
  const [cityIdx, setCityIdx] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  function validate() {
    const errs = {};
    if (!income || isNaN(Number(income)) || Number(income) <= 0) {
      errs.income = t("error_income_required");
    }
    if (!purpose) {
      errs.purpose = t("error_purpose_required");
    }
    if (!cost || isNaN(Number(cost)) || Number(cost) <= 0) {
      errs.cost = t("error_cost_required");
    }
    if (cityIdx === "") {
      errs.location = t("error_location_required");
    }
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setApiError("");

    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const city = CITIES[Number(cityIdx)];
    const mapped = PURPOSE_MAP[purpose];

    const intakeData = {
      income: Number(income),
      project_type: mapped.project_type,
      project_cost: Number(cost),
      education_need: mapped.education_need,
      location: { city: city.city, lat: city.lat, lng: city.lng },
    };

    setIntake(intakeData);
    setLoading(true);

    try {
      const result = await recommendScheme({
        income: intakeData.income,
        project_type: intakeData.project_type,
        project_cost: intakeData.project_cost,
        education_need: intakeData.education_need,
      });

      setRecommendation(result);
      navigate("/result");
    } catch (err) {
      setApiError(err.message || t("error_generic"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card max-w-lg mx-auto w-full mt-4 sm:mt-8 p-6 sm:p-8">
      <div className="flex items-center mb-6">
        <div className="p-2 bg-blue-100 text-[#1D4ED8] rounded-full">
          <Building2 size={24} />
        </div>
      </div>

      <h1 className="text-[28px] font-bold text-slate-900 leading-tight mb-6">
        {t("screen1_title")}
      </h1>

      <form onSubmit={handleSubmit} noValidate>
        {/* ── Annual Family Income ──────────────────────────── */}
        <div className="mb-5">
          <label htmlFor="income" className="form-label">
            {t("income_label")}
          </label>
          <div className="relative">
            <span
              className="absolute left-3 top-1/2 -translate-y-1/2 font-semibold"
              style={{ color: "var(--color-text-muted)" }}
            >
              ₹
            </span>
            <input
              id="income"
              type="number"
              className="form-input text-lg font-medium border-2"
              style={{ paddingLeft: "2rem" }}
              placeholder={t("income_placeholder")}
              value={income}
              onChange={(e) => setIncome(e.target.value)}
              min="0"
              inputMode="numeric"
            />
          </div>
          <p className="form-helper">{t("income_helper")}</p>
          {errors.income && (
            <p className="text-sm mt-1" style={{ color: "#d32f2f" }}>
              {errors.income}
            </p>
          )}
        </div>

        {/* ── Loan Purpose ─────────────────────────────────── */}
        <div className="mb-5">
          <label className="form-label">{t("purpose_label")}</label>
          <div className="flex flex-col sm:flex-row gap-3 mt-1">
            {Object.entries(PURPOSE_MAP).map(([key, config]) => {
              const Icon = config.icon;
              return (
                <label
                  key={key}
                  className="flex-1 flex flex-col items-center justify-center gap-2 p-4 rounded-[8px] border-2 cursor-pointer transition-colors text-center"
                  style={{
                    borderColor:
                      purpose === key ? "var(--color-primary)" : "#E2E8F0",
                    backgroundColor:
                      purpose === key
                        ? "var(--color-primary-light)"
                        : "var(--color-surface)",
                  }}
                >
                  <input
                    type="radio"
                    name="purpose"
                    value={key}
                    checked={purpose === key}
                    onChange={(e) => setPurpose(e.target.value)}
                    className="hidden"
                  />
                  <Icon 
                    size={28} 
                    color={purpose === key ? "var(--color-primary)" : "var(--color-text-muted)"} 
                    strokeWidth={1.5}
                  />
                  <span className={`text-sm font-bold ${purpose === key ? 'text-slate-900' : 'text-slate-600'}`}>
                    {t(`purpose_${key}`)}
                  </span>
                </label>
              );
            })}
          </div>
          {errors.purpose && (
            <p className="text-sm mt-1" style={{ color: "#d32f2f" }}>
              {errors.purpose}
            </p>
          )}
        </div>

        {/* ── Estimated Cost ───────────────────────────────── */}
        <div className="mb-5">
          <label htmlFor="cost" className="form-label">
            {t("cost_label")}
          </label>
          <div className="relative">
            <span
              className="absolute left-3 top-1/2 -translate-y-1/2 font-semibold"
              style={{ color: "var(--color-text-muted)" }}
            >
              ₹
            </span>
            <input
              id="cost"
              type="number"
              className="form-input text-lg font-medium border-2"
              style={{ paddingLeft: "2rem" }}
              placeholder={t("cost_placeholder")}
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              min="0"
              inputMode="numeric"
            />
          </div>
          {errors.cost && (
            <p className="text-sm mt-1" style={{ color: "#d32f2f" }}>
              {errors.cost}
            </p>
          )}
        </div>

        {/* ── City Dropdown ────────────────────────────────── */}
        <div className="mb-6">
          <label htmlFor="city" className="form-label">
            {t("location_label")}
          </label>
          <select
            id="city"
            className="form-input border-2 text-lg font-medium bg-white"
            value={cityIdx}
            onChange={(e) => setCityIdx(e.target.value)}
          >
            <option value="" disabled>
              {t("location_placeholder")}
            </option>
            {CITIES.map((c, i) => (
              <option key={c.city} value={i}>
                {c.city}
              </option>
            ))}
          </select>
          {errors.location && (
            <p className="text-sm mt-1" style={{ color: "#d32f2f" }}>
              {errors.location}
            </p>
          )}
        </div>

        {/* ── API error ────────────────────────────────────── */}
        {apiError && (
          <div
            className="p-3 rounded-lg mb-4 text-sm font-medium"
            style={{
              backgroundColor: "var(--color-warning-light)",
              color: "var(--color-warning-dark)",
            }}
          >
            {apiError}
          </div>
        )}

        {/* ── CTA ──────────────────────────────────────────── */}
        <button
          id="cta-find-scheme"
          type="submit"
          className="btn-primary w-full text-lg mt-4"
          disabled={loading}
        >
          {loading ? t("finding_scheme") : t("cta_find_scheme")}
        </button>
      </form>
    </div>
  );
}
