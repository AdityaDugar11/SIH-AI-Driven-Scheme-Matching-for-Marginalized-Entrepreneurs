import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import StepHeader from './components/StepHeader';
import AiAssistantBar from './components/AiAssistantBar';
import IntakeForm from './components/IntakeForm';
import RecommendationResult from './components/RecommendationResult';
import EmiBreakdown from './components/EmiBreakdown';
import PartnerLocator from './components/PartnerLocator';
import Confirmation from './components/Confirmation';
import Disclosures from './components/Disclosures';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { 
  checkBackendHealth, 
  fetchSchemeRecommendation, 
  fetchEmiCalculation 
} from './services/api';
import { AlertCircle, RefreshCw, ArrowLeft, ArrowRight } from 'lucide-react';

const DEFAULT_FORM_STATE = {
  income: 400000,
  project_type: 'small_business',
  project_cost: 120000,
  education_need: false,
  tenure_months: 36,
  gender: 'male',
};

function MainApp() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState(DEFAULT_FORM_STATE);
  const [selectedCity, setSelectedCity] = useState('delhi');
  const [recommendation, setRecommendation] = useState(null);
  const [emiData, setEmiData] = useState(null);
  const [selectedPartner, setSelectedPartner] = useState(null);
  
  // Step Navigation State (1 to 5)
  const [currentStep, setCurrentStep] = useState(1);
  const [maxStepReached, setMaxStepReached] = useState(1);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isConnected, setIsConnected] = useState(true);

  // Check health and run initial matching on mount
  const checkHealth = useCallback(async () => {
    const online = await checkBackendHealth();
    setIsConnected(online);
    return online;
  }, []);

  const handleEvaluate = async (customData, targetStep = 2) => {
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
        setCurrentStep(targetStep);
        setMaxStepReached((prev) => Math.max(prev, targetStep, 3));
      } else {
        setEmiData(null);
        setCurrentStep(2);
        setMaxStepReached((prev) => Math.max(prev, 2));
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
    handleEvaluate(updatedForm, 2);
  };

  useEffect(() => {
    checkHealth();
    handleEvaluate(DEFAULT_FORM_STATE, 1);
  }, []);

  const handleReset = () => {
    setFormData(DEFAULT_FORM_STATE);
    setSelectedCity('delhi');
    setCurrentStep(1);
    setMaxStepReached(1);
    setSelectedPartner(null);
    handleEvaluate(DEFAULT_FORM_STATE, 1);
  };

  const handleRouteLead = (partner) => {
    setSelectedPartner(partner);
    setCurrentStep(5);
    setMaxStepReached(5);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-white">
      {/* Top Header */}
      <Header isConnected={isConnected} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Banner / Title Area */}
        <div className="mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
                {t('hero_title')}
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                {t('hero_subtitle')}
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

        {/* Phase 4 Step Header Navigation */}
        <StepHeader 
          currentStep={currentStep} 
          onStepClick={(stepId) => setCurrentStep(stepId)} 
          maxStepReached={maxStepReached} 
        />

        {/* Screen 5: Confirmation View */}
        {currentStep === 5 ? (
          <Confirmation
            formData={formData}
            recommendation={recommendation}
            emiData={emiData}
            partner={selectedPartner}
            onStartOver={handleReset}
          />
        ) : (
          <>
            {/* AI Assistant Bar (always available on steps 1-4) */}
            <AiAssistantBar
              onApplyParsedData={handleApplyParsedAiData}
              onCityChange={setSelectedCity}
              isEvaluating={isLoading}
            />

            {/* Screen 1, 2, 3 Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
              {/* Left Column: Intake Form (Step 1 Focus) */}
              <div className={`lg:col-span-5 ${currentStep > 1 ? 'opacity-95' : ''}`}>
                <IntakeForm
                  formData={formData}
                  setFormData={setFormData}
                  onSubmit={() => handleEvaluate(formData, 2)}
                  isLoading={isLoading}
                  onReset={handleReset}
                />
              </div>

              {/* Right Column: Recommendation (Step 2) & EMI Breakdown (Step 3) */}
              <div className="lg:col-span-7 space-y-6">
                <RecommendationResult
                  recommendation={recommendation}
                  isLoading={isLoading}
                  onProceedToEmi={() => setCurrentStep(3)}
                />

                <EmiBreakdown
                  emiData={emiData}
                  isEligible={recommendation?.eligible}
                  isLoading={isLoading}
                  onProceedToPartners={() => {
                    setCurrentStep(4);
                    setMaxStepReached((prev) => Math.max(prev, 4));
                  }}
                />
              </div>
            </div>

            {/* Screen 4: Partner Locator (Interactive Map & Nearest Channel Branches) */}
            <div id="partner-locator-section">
              <PartnerLocator
                selectedCity={selectedCity}
                onCityChange={setSelectedCity}
                recommendedScheme={recommendation?.recommended_scheme}
                isEligible={recommendation?.eligible}
                onRouteLeadToPartner={handleRouteLead}
              />
            </div>
          </>
        )}

        {/* SIH Governance & Phase Disclosures Footer */}
        <Disclosures />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/90 py-4 text-center text-xs text-slate-500">
        <p>{t('footer_text')}</p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <MainApp />
    </LanguageProvider>
  );
}
