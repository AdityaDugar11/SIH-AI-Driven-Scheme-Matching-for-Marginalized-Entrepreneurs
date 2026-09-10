import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import { useTranslation } from "../hooks/useTranslation.js";
import StepHeader from "./StepHeader.jsx";
import CurrencyDisplay from "./CurrencyDisplay.jsx";

export default function ConfirmationScreen() {
  const { state, resetAll } = useApp();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleStartOver = () => {
    resetAll();
    navigate("/");
  };

  return (
    <div className="animate-fade-in flex flex-col items-center">
      <StepHeader currentStep={5} />

      <div className="card text-center w-full mt-6 py-10 flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-3xl mb-2" style={{ color: "var(--color-success)" }}>
          ✓
        </div>
        
        <h1 className="text-heading text-green-700">
          {t("screen5_success_title") || "Success!"}
        </h1>
        
        <p className="text-lg mb-4">
          {t("screen5_success_subtitle") || "Your details have been sent. Check your email for confirmation."}
        </p>

        <div className="bg-gray-50 border border-gray-200 rounded p-4 w-full text-left">
          <p className="text-sm text-gray-500 mb-1">{t("screen5_scheme_label") || "Scheme"}</p>
          <p className="font-semibold text-gray-800 mb-3">{state.recommendation.recommended_scheme}</p>

          <p className="text-sm text-gray-500 mb-1">{t("screen5_emi_label") || "Estimated EMI"}</p>
          <p className="font-semibold text-gray-800 mb-3">
            <CurrencyDisplay amount={state.emi.emi} /> / {t("screen3_months") || "month"}
          </p>

          <p className="text-sm text-gray-500 mb-1">{t("screen5_partner_label") || "Channel Partner"}</p>
          <p className="font-semibold text-gray-800">
            {t("screen5_check_email") || "Details sent via email"}
          </p>
        </div>

        <button
          type="button"
          className="btn-primary mt-6"
          onClick={handleStartOver}
        >
          {t("screen5_cta_start_over") || "Start Over"}
        </button>
      </div>
    </div>
  );
}
