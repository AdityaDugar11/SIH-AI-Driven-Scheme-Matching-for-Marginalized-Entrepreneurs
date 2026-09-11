import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import { useTranslation } from "../hooks/useTranslation.js";
import { nearestPartners } from "../api/client.js";

export default function PartnerLocator() {
  const { state } = useApp();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSelection, setCurrentSelection] = useState(null);
  const [submitStatus, setSubmitStatus] = useState("idle"); // idle, success

  // Default to New Delhi if location not provided
  const centerLat = state.intake.location?.lat || 28.6139;
  const centerLng = state.intake.location?.lng || 77.2090;

  useEffect(() => {
    async function fetchPartners() {
      try {
        setLoading(true);
        const data = {
          lat: centerLat,
          lng: centerLng,
          scheme: state.recommendation.recommended_scheme,
          limit: 3,
        };
        const res = await nearestPartners(data);
        setPartners(res.partners);
        if (res.partners.length > 0) {
          setCurrentSelection(res.partners[0].id);
        }
        setError(null);
      } catch (err) {
        setError(err.message || t("error_generic"));
      } finally {
        setLoading(false);
      }
    }
    fetchPartners();
  }, [centerLat, centerLng, state.recommendation.recommended_scheme, t]);

  const selectPartner = (id) => {
    setCurrentSelection(id);
  };

  const rejectPartner = (id) => {
    if (currentSelection === id) {
      setCurrentSelection(null);
    }
  };

  const submitSelection = () => {
    if (!currentSelection) return;
    setSubmitStatus("success");
    setTimeout(() => {
      // Simulated webhook POST
      console.log("POSTING to n8n webhook for partner:", currentSelection);
      navigate("/confirmation");
    }, 1500);
  };

  return (
    <div className="flex flex-col w-full pb-8 animate-fade-in">
      {/* Progress Header */}
      <div className="flex flex-col gap-space-xs mb-space-md">
        <div className="flex items-center gap-space-xs">
          <span className="px-space-xs py-0.5 rounded bg-primary-fixed text-on-primary-fixed font-label-md text-label-md">Step 4 of 5</span>
          <span className="font-body-md text-body-md text-on-surface-variant">Concessional Loan Workflow</span>
        </div>
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">Find Nearest Sanctioning Partner</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant">Select a government-approved partner to process your concessional loan application.</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-on-surface-variant font-body-lg text-body-lg">{t("screen4_loading") || "Finding partners near you..."}</div>
      ) : error ? (
        <div className="p-space-md rounded-xl bg-error-container text-on-error-container font-body-md text-body-md text-center">{error}</div>
      ) : (
        <>
          {/* Map Section Card */}
          <div className="flex flex-col w-full bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm mb-space-lg">
            {/* Map Canvas (Civic High-Contrast Minimalist Style) */}
            <div className="relative w-full h-56 bg-surface-container-low overflow-hidden select-none">
              {/* Minimalist Street Vector Map */}
              <svg aria-label="Stylized civic grid" className="absolute inset-0 w-full h-full text-outline-variant" fill="none" viewBox="0 0 400 240" xmlns="http://www.w3.org/2000/svg">
                <rect fill="#f1f3ff" height="240" width="400" x="0" y="0"></rect>
                <path d="M-10 180 C 80 170, 120 220, 180 240 L -10 240 Z" fill="#dce2f7" opacity="0.6"></path>
                <path d="M-20 40 L420 40 M-20 90 L420 90 M-20 150 L420 150 M-20 200 L420 200" stroke="#dce2f7" strokeWidth="4"></path>
                <path d="M70 -20 L70 260 M150 -20 L150 260 M250 -20 L250 260 M340 -20 L340 260" stroke="#dce2f7" strokeWidth="4"></path>
                <path d="M-10 120 C 100 110, 170 80, 240 70 C 310 60, 360 40, 420 30" stroke="#ffffff" strokeLinecap="round" strokeWidth="12"></path>
                <path d="M-10 120 C 100 110, 170 80, 240 70 C 310 60, 360 40, 420 30" stroke="#c4c5d7" strokeLinecap="round" strokeWidth="8"></path>
                <path d="M120 -20 Q 200 130, 290 260" stroke="#ffffff" strokeWidth="10"></path>
                <path d="M120 -20 Q 200 130, 290 260" stroke="#c4c5d7" strokeWidth="6"></path>
                <rect fill="#ffffff" height="22" rx="4" stroke="#747686" strokeWidth="2" width="48" x="85" y="80"></rect>
                <text fill="#141b2b" fontFamily="'Public Sans'" fontSize="9" fontWeight="700" textAnchor="middle" x="109" y="95">STATION</text>
              </svg>

              {partners.map((p, index) => {
                const isSelected = currentSelection === p.id;
                // Dummy positions for pins to look like the static design
                const positions = [
                  { top: "82px", left: "138px" },
                  { top: "64px", left: "262px" },
                  { top: "175px", left: "295px" },
                ];
                const pos = positions[index % positions.length];

                return (
                  <button key={p.id} aria-label={`Pin ${index + 1}: ${p.name}`} className="absolute -translate-x-1/2 -translate-y-full flex flex-col items-center group cursor-pointer focus:outline-none" style={{ top: pos.top, left: pos.left }} onClick={() => selectPartner(p.id)} type="button">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-headline-sm text-headline-sm shadow-sm transition-transform group-hover:scale-110 group-focus:scale-110 ${isSelected ? 'bg-primary-container text-surface-container-lowest scale-110 w-9 h-9 shadow-md' : 'bg-surface-container-lowest text-on-surface'}`}>
                      {index + 1}
                    </div>
                    <div className={`w-2.5 h-1.5 clip-triangle -mt-0.5 ${isSelected ? 'bg-primary-container w-3 h-2' : 'bg-surface-container-lowest'}`}></div>
                    <span className="mt-1 px-1.5 py-0.5 rounded bg-inverse-surface text-inverse-on-surface font-label-md text-xs whitespace-nowrap shadow-sm">
                      {p.name.split(' ')[0]} ({p.distance_km} km)
                    </span>
                  </button>
                );
              })}
              {/* Map Compass/Civic Stamp */}
              <div className="absolute top-2 right-2 px-2 py-1 rounded bg-surface-container-lowest/95 text-on-surface font-label-md text-xs flex items-center gap-1 shadow-sm">
                <span className="material-symbols-outlined text-[16px] text-primary">my_location</span>
                <span>Current Location</span>
              </div>
            </div>

            {/* Map Info Banner */}
            <div className="p-space-sm bg-surface-container-high flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">verified_user</span>
              <span className="font-label-md text-label-md text-on-surface">Showing {partners.length} authorized channelizing agencies</span>
            </div>
          </div>

          {/* Partner Cards List */}
          <div aria-label="Sanctioning Partner Selection" className="flex flex-col gap-space-md w-full mb-space-lg" role="radiogroup">
            {partners.map((partner, index) => {
              const isSelected = currentSelection === partner.id;

              return (
                <article key={partner.id} className={`partner-card rounded-xl p-space-lg shadow-sm flex flex-col gap-space-sm transition-all ${isSelected ? 'bg-surface-container-lowest' : 'bg-surface-container-lowest'}`}>
                  <div className="flex items-start justify-between gap-space-xs">
                    <div className="flex items-start gap-space-xs flex-1 min-w-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-headline-sm text-headline-sm flex-shrink-0 ${isSelected ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface'}`}>
                        {index + 1}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <h2 className="font-headline-sm text-headline-sm text-on-surface leading-snug">{partner.name}</h2>
                        <div className="mt-1 flex items-center gap-2 flex-wrap">
                          <span className="inline-flex px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface font-label-md text-label-md">{partner.type}</span>
                          <span className="inline-flex px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface font-label-md text-label-md">Risk Score: {partner.risk_score}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Distance & Physical Office */}
                  <div className="flex items-center gap-2 text-on-surface-variant font-body-md text-body-md">
                    <span className="material-symbols-outlined text-[20px] text-primary">navigation</span>
                    <span>{partner.distance_km} km away</span>
                  </div>

                  {/* Contact and Working Hours */}
                  <div className="p-space-sm bg-surface-container-low rounded-lg flex flex-col gap-1 text-on-surface font-body-md text-body-md">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-primary">call</span>
                      <span>{partner.contact_email}</span>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div className="flex items-center gap-2 px-space-sm py-1.5 rounded-lg bg-secondary-container/40">
                    <span className="w-3 h-3 rounded-full bg-secondary flex-shrink-0"></span>
                    <span className="font-label-md text-label-md text-on-secondary-container">Active Funding Window</span>
                  </div>

                  {/* Simulated Callout Box */}
                  {partner.simulated && (
                    <div className="flex items-start gap-2 p-space-xs rounded bg-surface-container text-on-surface-variant font-body-md text-body-md">
                      <span className="material-symbols-outlined text-[18px] text-primary flex-shrink-0 mt-0.5">info</span>
                      <span>Simulated eligibility data — production version integrates with official fund records</span>
                    </div>
                  )}

                  {/* Action Toggles */}
                  <div className="grid grid-cols-2 gap-space-xs pt-1">
                    <button 
                      aria-pressed={isSelected} 
                      className={`h-12 rounded-lg font-body-lg-bold text-body-lg-bold flex items-center justify-center gap-1 transition-colors ${isSelected ? 'bg-primary-container text-surface-container-lowest shadow-sm' : 'bg-surface-container-low text-on-surface active:bg-surface-container'}`} 
                      onClick={() => selectPartner(partner.id)} 
                      type="button"
                    >
                      {isSelected && <span className="material-symbols-outlined text-[20px]">check</span>}
                      <span>Interested</span>
                    </button>
                    <button 
                      aria-pressed={!isSelected && currentSelection !== null} 
                      className={`h-12 rounded-lg font-body-lg-bold text-body-lg-bold flex items-center justify-center gap-1 ${!isSelected && currentSelection !== null && currentSelection !== partner.id ? 'bg-inverse-surface text-inverse-on-surface shadow-sm' : 'bg-surface-container-lowest text-on-surface active:bg-surface-container-low'}`} 
                      onClick={() => rejectPartner(partner.id)} 
                      type="button"
                    >
                      <span>Not Interested</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Bottom Action & Civic Trust Guarantee */}
          <div className="flex flex-col gap-space-xs w-full mt-auto">
            <button 
              className={`w-full h-14 rounded-xl font-body-lg-bold text-body-lg-bold flex items-center justify-center gap-2 shadow-md transition-colors ${submitStatus === 'success' ? 'bg-secondary text-on-secondary' : currentSelection ? 'bg-primary-container text-surface-container-lowest active:bg-primary' : 'bg-surface-variant text-on-surface-variant opacity-70'}`} 
              onClick={submitSelection} 
              type="button"
            >
              <span>{submitStatus === 'success' ? 'Application Dispatched Successfully!' : currentSelection ? 'Send My Details to This Partner' : 'Please Select a Partner First'}</span>
              {submitStatus !== 'success' && <span className="material-symbols-outlined text-[24px]">arrow_forward</span>}
            </button>
            <div className="flex items-center justify-center gap-1.5 text-center text-on-surface-variant font-body-md text-body-md py-1">
              <span className="material-symbols-outlined text-secondary text-[18px]">verified</span>
              <span>No fees are ever charged for government scheme submissions.</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

