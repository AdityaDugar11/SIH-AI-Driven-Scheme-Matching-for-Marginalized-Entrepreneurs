import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import AiAssistantBar from './components/AiAssistantBar';
import IntakeForm from './components/IntakeForm';
import RecommendationResult from './components/RecommendationResult';
import EmiBreakdown from './components/EmiBreakdown';
import PartnerLocator from './components/PartnerLocator';
import Disclosures from './components/Disclosures';
import { 
  checkBackendHealth, 
  fetchSchemeRecommendation, 
  fetchEmiCalculation 
} from './services/api';
import { AlertCircle, RefreshCw } from 'lucide-react';

const DEFAULT_FORM_STATE = {
  income: 400000,
  project_type: 'small_business',
  project_cost: 120000,
  education_need: false,
  tenure_months: 36,
  gender: 'male',
};

export default function App() {
  const [formData, setFormData] = useState(DEFAULT_FORM_STATE);
  const [selectedCity, setSelectedCity] = useState('delhi');
  const [recommendation, setRecommendation] = useState(null);
  const [emiData, setEmiData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isConnected, setIsConnected] = useState(true);

  // Check health and run initial matching on mount
  const checkHealth = useCallback(async () => {
    const online = await checkBackendHealth();
    setIsConnected(online);
    return online;
  }, []);

  const handleEvaluate = async (customData) => {
    const dataToSubmit = customData || formData;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      // 1. Call /recommend endpoint (includes AI audit explanation)
      const recResult = await fetchSchemeRecommendation({
        income: dataToSubmit.income,
        project_type: dataToSubmit.project_type,
        project_cost: dataToSubmit.project_cost,
        education_need: dataToSubmit.education_need,
        gender: dataToSubmit.gender,
      });

      setRecommendation(recResult);
      setIsConnected(true);

      // 2. If eligible, call /calculate-emi endpoint
      if (recResult.eligible && recResult.recommended_scheme) {
        const emiResult = await fetchEmiCalculation({
          scheme: recResult.recommended_scheme,
          project_cost: dataToSubmit.project_cost,
          tenure_months: dataToSubmit.tenure_months,
          gender: dataToSubmit.gender,
        });
        setEmiData(emiResult);
      } else {
        setEmiData(null);
      }
    } catch (err) {
      console.error('Error evaluating scheme:', err);
      setErrorMessage(err.message || 'Unable to communicate with the matching engine.');
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyParsedAiData = (parsedData) => {
    const updatedForm = {
      ...formData,
      income: parsedData.income,
      project_type: parsedData.project_type,
      project_cost: parsedData.project_cost,
      education_need: parsedData.education_need,
      gender: parsedData.gender || formData.gender,
      tenure_months: parsedData.tenure_months || formData.tenure_months,
    };
    setFormData(updatedForm);
    if (parsedData.city) {
      setSelectedCity(parsedData.city);
    }
    handleEvaluate(updatedForm);
  };

  useEffect(() => {
    checkHealth();
    handleEvaluate(DEFAULT_FORM_STATE);
  }, []);

  const handleReset = () => {
    setFormData(DEFAULT_FORM_STATE);
    setSelectedCity('delhi');
    handleEvaluate(DEFAULT_FORM_STATE);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-white">
      {/* Top Header */}
      <Header isConnected={isConnected} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Banner / Title Area */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                AI Concessional Scheme Matching & Partner Locator
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Deterministic matching engine delivering instant concessional loan eligibility, 90% loan calculation, AI audit trail, and nearest channel partner routing.
              </p>
            </div>
            {!isConnected && (
              <button
                onClick={() => {
                  checkHealth();
                  handleEvaluate();
                }}
                className="self-start sm:self-auto flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-semibold transition cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Connection</span>
              </button>
            )}
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mt-4 p-3.5 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Connection / API Error:</span> {errorMessage}
                <div className="text-[11px] text-rose-400 mt-0.5">
                  Make sure the FastAPI backend is running on <code className="bg-rose-950 px-1 py-0.5 rounded border border-rose-800">http://127.0.0.1:8000</code>.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Phase 3 AI Conversational Intake Assistant Bar */}
        <AiAssistantBar
          onApplyParsedData={handleApplyParsedAiData}
          onCityChange={setSelectedCity}
          isEvaluating={isLoading}
        />

        {/* 2-Column Responsive Layout: Left (Form) & Right (Results + EMI) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Left Column: Intake Form (5 cols on large screens) */}
          <div className="lg:col-span-5">
            <IntakeForm
              formData={formData}
              setFormData={setFormData}
              onSubmit={() => handleEvaluate(formData)}
              isLoading={isLoading}
              onReset={handleReset}
            />
          </div>

          {/* Right Column: Recommendation & EMI Dashboard (7 cols on large screens) */}
          <div className="lg:col-span-7 space-y-6">
            <RecommendationResult
              recommendation={recommendation}
              isLoading={isLoading}
            />

            <EmiBreakdown
              emiData={emiData}
              isEligible={recommendation?.eligible}
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* Phase 3: Interactive Channel Partner Map & Nearest Branches */}
        <PartnerLocator
          selectedCity={selectedCity}
          onCityChange={setSelectedCity}
          recommendedScheme={recommendation?.recommended_scheme}
          isEligible={recommendation?.eligible}
        />

        {/* SIH Governance & Phase Disclosures Footer */}
        <Disclosures />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/90 py-4 text-center text-xs text-slate-500">
        <p>
          SIH Prototype — AI-Driven Concessional Loan Scheme Matching & Channel Partner Routing System | Phase 3
        </p>
      </footer>
    </div>
  );
}
