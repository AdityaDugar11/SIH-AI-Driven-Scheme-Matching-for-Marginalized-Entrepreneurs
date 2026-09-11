import { createContext, useContext, useReducer, useCallback } from "react";

/**
 * AppContext — shared state for all screens (1-5).
 *
 * State shape is documented here so team members building Screens 4-5
 * can read the same state without coordinating on structure mid-build.
 *
 * Actions: setIntake, setRecommendation, setEmi, setLanguage, resetAll
 */

const initialState = {
  // Screen 1 inputs
  intake: {
    email: "",
    income: null,
    project_type: "",
    project_cost: null,
    education_need: false,
    location: { city: "", lat: null, lng: null },
  },

  // Screen 2 result (from POST /recommend)
  recommendation: {
    matches: [],
    recommended_scheme: null,
    reason: "",
    alternates: [],
    eligible: null,
  },

  // Screen 3 result (from POST /calculate-emi)
  emi: {
    loan_amount: null,
    applicant_contribution: null,
    interest_rate: null,
    emi: null,
    moratorium_months: null,
    total_interest: null,
    tenure_months: 36, // user-selected default
  },

  // Language toggle
  language: "en",
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_INTAKE":
      return { ...state, intake: { ...state.intake, ...action.payload } };
    case "SET_RECOMMENDATION":
      return { ...state, recommendation: { ...action.payload } };
    case "SET_EMI":
      return { ...state, emi: { ...state.emi, ...action.payload } };
    case "SET_LANGUAGE":
      return { ...state, language: action.payload };
    case "RESET_ALL":
      return { ...initialState, language: state.language };
    default:
      return state;
  }
}

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const setIntake = useCallback(
    (data) => dispatch({ type: "SET_INTAKE", payload: data }),
    []
  );
  const setRecommendation = useCallback(
    (data) => dispatch({ type: "SET_RECOMMENDATION", payload: data }),
    []
  );
  const setEmi = useCallback(
    (data) => dispatch({ type: "SET_EMI", payload: data }),
    []
  );
  const setLanguage = useCallback(
    (lang) => dispatch({ type: "SET_LANGUAGE", payload: lang }),
    []
  );
  const resetAll = useCallback(() => dispatch({ type: "RESET_ALL" }), []);

  return (
    <AppContext.Provider
      value={{
        state,
        setIntake,
        setRecommendation,
        setEmi,
        setLanguage,
        resetAll,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

/**
 * Hook to access shared app state and actions.
 * Usage: const { state, setIntake, setRecommendation, ... } = useApp();
 */
export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
