import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import { recommendScheme, saveRecommendation } from "../api/client.js";

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
  { city: "Hubballi-Dharwad, Karnataka", lat: 15.3647, lng: 75.1240 },
  { city: "Belagavi, Karnataka", lat: 15.8497, lng: 74.4977 },
  { city: "Kalaburagi, Karnataka", lat: 17.3297, lng: 76.8343 },
  { city: "Mysuru, Karnataka", lat: 12.2958, lng: 76.6394 },
  { city: "Bengaluru Rural, Karnataka", lat: 13.2359, lng: 77.7125 },
  { city: "Other District / State", lat: 20.5937, lng: 78.9629 }, // Default India approx center
];

const PURPOSE_MAP = {
  "small-business": { project_type: "small_business", education_need: false },
  "larger-project": { project_type: "larger_project", education_need: false },
  "education": { project_type: "education", education_need: true },
};

export default function IntakeForm() {
  const { setIntake, setRecommendation } = useApp();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [income, setIncome] = useState("");
  const [purpose, setPurpose] = useState("small-business");
  const [cost, setCost] = useState("");
  const [cityIdx, setCityIdx] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  function validate() {
    const errs = {};
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      errs.email = "Please enter a valid email address";
    }
    if (!income || isNaN(Number(income.replace(/,/g, ''))) || Number(income.replace(/,/g, '')) <= 0) {
      errs.income = "Please enter a valid income amount";
    }
    if (!purpose) {
      errs.purpose = "Please select a loan purpose";
    }
    if (!cost || isNaN(Number(cost.replace(/,/g, ''))) || Number(cost.replace(/,/g, '')) <= 0) {
      errs.cost = "Please enter a valid cost estimate";
    }
    if (cityIdx === "") {
      errs.location = "Please select your city or district";
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

    const parsedIncome = Number(income.replace(/,/g, ''));
    const parsedCost = Number(cost.replace(/,/g, ''));

    const intakeData = {
      email,
      income: parsedIncome,
      project_type: mapped.project_type,
      project_cost: parsedCost,
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

      if (result.matches && result.matches.length > 0) {
        const sortedMatches = [...result.matches].sort((a, b) => b.match_score - a.match_score);
        
        sortedMatches.forEach((match) => {
          saveRecommendation({
            email: intakeData.email,
            scheme_name: match.scheme,
            match_score: match.match_score,
            eligible: match.eligible,
            reason: match.reason,
            state: "N/A",
            city: intakeData.location.city,
          }).catch((err) => console.error("Failed to save recommendation", err));
        });

        setRecommendation({
          matches: sortedMatches,
          recommended_scheme: sortedMatches[0].scheme,
          reason: sortedMatches[0].reason,
          alternates: sortedMatches.slice(1).map(m => m.scheme),
          eligible: sortedMatches[0].eligible,
        });
      } else {
        setRecommendation({
          matches: [],
          recommended_scheme: null,
          reason: "No matches found.",
          alternates: [],
          eligible: false,
        });
      }

      navigate("/result");
    } catch (err) {
      setApiError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex flex-col flex-1 relative w-full px-margin-mobile bg-surface">
      <div className="flex flex-col w-full max-w-[720px] mx-auto pb-space-xl">
        {/* Top Progress & Header Area */}
        <div className="flex flex-col gap-space-xs mt-space-md mb-space-lg">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center px-space-sm py-1 rounded-full bg-surface-container-high text-on-surface font-label-md text-label-md">
              Step 1 of 5
            </span>
            <div aria-hidden="true" className="flex items-center gap-1.5">
              <span className="w-6 h-2 rounded-full bg-primary-container"></span>
              <span className="w-2 h-2 rounded-full bg-surface-container-highest"></span>
              <span className="w-2 h-2 rounded-full bg-surface-container-highest"></span>
              <span className="w-2 h-2 rounded-full bg-surface-container-highest"></span>
              <span className="w-2 h-2 rounded-full bg-surface-container-highest"></span>
            </div>
          </div>
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface font-extrabold tracking-tight mt-1">
            Find the Right Scheme for You
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
            Answer 5 simple questions to check your eligibility for government concessional loans.
          </p>
        </div>

        {/* Main Intake Form */}
        <form className="flex flex-col gap-space-lg" onSubmit={handleSubmit} noValidate>
          {/* Question 1: Annual Family Income */}
          <div className="flex flex-col bg-surface-container-lowest p-space-md rounded-lg shadow-sm border border-[#e0e0e0]">
            <label className="font-body-lg-bold text-body-lg-bold text-on-surface mb-2" htmlFor="familyIncome">
              1. Annual Family Income
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-4 pointer-events-none flex items-center justify-center text-on-surface font-headline-sm text-headline-sm">
                ₹
              </div>
              <input
                aria-describedby="incomeHelper"
                className={`w-full h-[52px] pl-10 pr-4 bg-surface-container-lowest text-on-surface font-body-lg-bold text-body-lg-bold rounded-lg focus:outline-none focus:ring-2 focus:ring-primary border border-outline-variant ${errors.income ? 'border-error' : ''}`}
                id="familyIncome"
                inputMode="numeric"
                name="familyIncome"
                placeholder="e.g. 1,50,000"
                type="text"
                value={income}
                onChange={(e) => setIncome(e.target.value)}
              />
            </div>
            {errors.income ? (
              <p className="text-sm mt-1 text-error font-medium">{errors.income}</p>
            ) : (
              <div className="mt-2.5 flex items-start gap-1.5 p-2 rounded bg-tertiary-fixed text-on-tertiary-fixed-variant" id="incomeHelper">
                <span aria-hidden="true" className="material-symbols-outlined text-tertiary text-[20px] shrink-0 mt-0.5">info</span>
                <p className="font-label-md text-label-md leading-tight">
                  Must be ₹5,00,000 or below to qualify for highest concessional interest rates.
                </p>
              </div>
            )}
          </div>

          {/* Question 2: Loan Purpose */}
          <fieldset className="flex flex-col bg-surface-container-lowest p-space-md rounded-lg shadow-sm m-0 border border-[#e0e0e0]">
            <legend className="font-body-lg-bold text-body-lg-bold text-on-surface mb-1 p-0 float-none">
              2. What is this loan for?
            </legend>
            <p className="font-body-md text-body-md text-on-surface-variant mb-space-sm">
              Select the primary category that matches your requirement:
            </p>
            <div aria-label="Loan Purpose" className="flex flex-col gap-space-xs" role="radiogroup">
              
              <label className={`relative flex items-start gap-space-sm p-space-md rounded-lg cursor-pointer transition-colors ${purpose === 'small-business' ? 'bg-surface-container-lowest ring-1 ring-primary' : 'bg-surface-container-low border border-transparent'}`} data-value="small-business">
                <input
                  checked={purpose === 'small-business'}
                  className="sr-only"
                  name="loanPurpose"
                  type="radio"
                  value="small-business"
                  onChange={(e) => setPurpose(e.target.value)}
                />
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${purpose === 'small-business' ? 'bg-surface-container text-primary' : 'bg-surface-container text-on-surface-variant'}`}>
                  <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: purpose === 'small-business' ? "'FILL' 1" : undefined }}>storefront</span>
                </div>
                <div className="flex flex-col flex-1 pr-6">
                  <div className="flex items-center gap-2">
                    <span className="font-body-lg-bold text-body-lg-bold text-on-surface">Small Business</span>
                    {purpose === 'small-business' && (
                      <span className="check-pill inline-flex items-center px-1.5 py-0.5 rounded bg-secondary text-on-secondary font-label-md text-[11px] leading-none">
                        Selected
                      </span>
                    )}
                  </div>
                  <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
                    Kirana shop, cycle/auto repair, tea stall, tailoring, street vending.
                  </p>
                </div>
                <div className={`absolute right-4 top-4 flex items-center justify-center w-6 h-6 rounded-full ${purpose === 'small-business' ? 'bg-primary text-on-primary opacity-100' : 'bg-surface-container-highest text-on-surface-variant opacity-0'}`}>
                  <span className="material-symbols-outlined text-[16px]">check</span>
                </div>
              </label>

              <label className={`relative flex items-start gap-space-sm p-space-md rounded-lg cursor-pointer transition-colors ${purpose === 'larger-project' ? 'bg-surface-container-lowest ring-1 ring-primary' : 'bg-surface-container-low border border-transparent'}`} data-value="larger-project">
                <input
                  checked={purpose === 'larger-project'}
                  className="sr-only"
                  name="loanPurpose"
                  type="radio"
                  value="larger-project"
                  onChange={(e) => setPurpose(e.target.value)}
                />
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${purpose === 'larger-project' ? 'bg-surface-container text-primary' : 'bg-surface-container text-on-surface-variant'}`}>
                  <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: purpose === 'larger-project' ? "'FILL' 1" : undefined }}>domain</span>
                </div>
                <div className="flex flex-col flex-1 pr-6">
                  <div className="flex items-center gap-2">
                    <span className="font-body-lg-bold text-body-lg-bold text-on-surface">Larger Business Project</span>
                    {purpose === 'larger-project' && (
                      <span className="check-pill inline-flex items-center px-1.5 py-0.5 rounded bg-secondary text-on-secondary font-label-md text-[11px] leading-none">
                        Selected
                      </span>
                    )}
                  </div>
                  <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
                    Small manufacturing unit, food processing, machinery, or workshop expansion.
                  </p>
                </div>
                <div className={`absolute right-4 top-4 flex items-center justify-center w-6 h-6 rounded-full ${purpose === 'larger-project' ? 'bg-primary text-on-primary opacity-100' : 'bg-surface-container-highest text-on-surface-variant opacity-0'}`}>
                  <span className="material-symbols-outlined text-[16px]">check</span>
                </div>
              </label>

              <label className={`relative flex items-start gap-space-sm p-space-md rounded-lg cursor-pointer transition-colors ${purpose === 'education' ? 'bg-surface-container-lowest ring-1 ring-primary' : 'bg-surface-container-low border border-transparent'}`} data-value="education">
                <input
                  checked={purpose === 'education'}
                  className="sr-only"
                  name="loanPurpose"
                  type="radio"
                  value="education"
                  onChange={(e) => setPurpose(e.target.value)}
                />
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${purpose === 'education' ? 'bg-surface-container text-primary' : 'bg-surface-container text-on-surface-variant'}`}>
                  <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: purpose === 'education' ? "'FILL' 1" : undefined }}>school</span>
                </div>
                <div className="flex flex-col flex-1 pr-6">
                  <div className="flex items-center gap-2">
                    <span className="font-body-lg-bold text-body-lg-bold text-on-surface">Education</span>
                    {purpose === 'education' && (
                      <span className="check-pill inline-flex items-center px-1.5 py-0.5 rounded bg-secondary text-on-secondary font-label-md text-[11px] leading-none">
                        Selected
                      </span>
                    )}
                  </div>
                  <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
                    Vocational trades, polytechnic, nursing, degree, or skill certification.
                  </p>
                </div>
                <div className={`absolute right-4 top-4 flex items-center justify-center w-6 h-6 rounded-full ${purpose === 'education' ? 'bg-primary text-on-primary opacity-100' : 'bg-surface-container-highest text-on-surface-variant opacity-0'}`}>
                  <span className="material-symbols-outlined text-[16px]">check</span>
                </div>
              </label>
            </div>
            {errors.purpose && <p className="text-sm mt-1 text-error font-medium">{errors.purpose}</p>}
          </fieldset>

          {/* Question 3: Estimated Cost */}
          <div className="flex flex-col bg-surface-container-lowest p-space-md rounded-lg shadow-sm border border-[#e0e0e0]">
            <label className="font-body-lg-bold text-body-lg-bold text-on-surface mb-2" htmlFor="projectCost">
              3. Estimated Project or Course Cost
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-4 pointer-events-none flex items-center justify-center text-on-surface font-headline-sm text-headline-sm">
                ₹
              </div>
              <input
                aria-describedby="costHelper"
                className={`w-full h-[52px] pl-10 pr-4 bg-surface-container-lowest text-on-surface font-body-lg-bold text-body-lg-bold rounded-lg focus:outline-none focus:ring-2 focus:ring-primary border border-outline-variant ${errors.cost ? 'border-error' : ''}`}
                id="projectCost"
                inputMode="numeric"
                name="projectCost"
                placeholder="e.g. 2,00,000"
                type="text"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
              />
            </div>
            {errors.cost ? (
              <p className="text-sm mt-1 text-error font-medium">{errors.cost}</p>
            ) : (
              <span className="font-body-md text-body-md text-on-surface-variant mt-2" id="costHelper">
                Enter the approximate loan amount required.
              </span>
            )}
          </div>

          {/* Question 4: Your City / District */}
          <div className="flex flex-col bg-surface-container-lowest p-space-md rounded-lg shadow-sm border border-[#e0e0e0]">
            <label className="font-body-lg-bold text-body-lg-bold text-on-surface mb-2" htmlFor="userLocation">
              4. Your City / District
            </label>
            <div className="relative flex items-center">
              <select
                className={`w-full h-[52px] px-4 pr-12 bg-surface-container-lowest text-on-surface font-body-lg-bold text-body-lg-bold rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary border border-outline-variant ${errors.location ? 'border-error' : ''}`}
                id="userLocation"
                name="userLocation"
                value={cityIdx}
                onChange={(e) => setCityIdx(e.target.value)}
              >
                <option value="" disabled>Select a location</option>
                {CITIES.map((c, i) => (
                  <option key={i} value={i}>
                    {c.city}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 pointer-events-none flex items-center justify-center text-on-surface">
                <span className="material-symbols-outlined text-[28px]">expand_more</span>
              </div>
            </div>
            {errors.location ? (
              <p className="text-sm mt-1 text-error font-medium">{errors.location}</p>
            ) : (
              <span className="font-body-md text-body-md text-on-surface-variant mt-2">
                Schemes vary based on your state and municipal district.
              </span>
            )}
          </div>

          {/* Question 5: Email Address */}
          <div className="flex flex-col bg-surface-container-lowest p-space-md rounded-lg shadow-sm border border-[#e0e0e0]">
            <label className="font-body-lg-bold text-body-lg-bold text-on-surface mb-2" htmlFor="userEmail">
              5. Email Address
            </label>
            <input
              aria-describedby="emailHelper"
              className={`w-full h-[52px] px-4 bg-surface-container-lowest text-on-surface font-body-lg text-body-lg rounded-lg focus:outline-none focus:ring-2 focus:ring-primary border border-outline-variant ${errors.email ? 'border-error' : ''}`}
              id="userEmail"
              name="userEmail"
              placeholder="yourname@gmail.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email ? (
              <p className="text-sm mt-1 text-error font-medium">{errors.email}</p>
            ) : (
              <div className="mt-2 flex items-start gap-1.5 text-on-surface-variant" id="emailHelper">
                <span aria-hidden="true" className="material-symbols-outlined text-primary text-[20px] shrink-0 mt-0.5">mark_email_read</span>
                <p className="font-body-md text-body-md leading-normal">
                  We use this to save your matched schemes so you can return anytime. Strictly no password needed.
                </p>
              </div>
            )}
          </div>

          {/* API error */}
          {apiError && (
            <div className="p-3 rounded-lg bg-error-container text-on-error-container font-medium text-sm">
              {apiError}
            </div>
          )}

          {/* Bottom Action Area */}
          <div className="flex flex-col gap-space-sm mt-space-xs">
            <button
              className="w-full h-[52px] bg-primary-container text-on-primary font-body-lg-bold text-body-lg-bold rounded-lg flex items-center justify-center gap-2 transition-transform active:scale-[0.99]"
              id="submitBtn"
              type="submit"
              disabled={loading}
            >
              <span>{loading ? "Finding Scheme..." : "Find My Scheme"}</span>
              <span aria-hidden="true" className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </button>
            {/* Civic Assurance Note */}
            <div className="flex items-center justify-center gap-2 p-3 bg-surface-container-low rounded-lg text-center">
              <span aria-hidden="true" className="material-symbols-outlined text-secondary text-[20px] shrink-0">verified_user</span>
              <span className="font-body-md text-body-md text-on-surface-variant">
                Your details are private and matched only against official government guidelines.
              </span>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
