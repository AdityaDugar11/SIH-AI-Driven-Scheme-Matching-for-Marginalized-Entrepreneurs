import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const TRANSLATIONS = {
  en: {
    // App Header
    app_title: 'Marginalized Entrepreneur Scheme Matcher',
    app_subtitle: 'Concessional Lending Recommender & EMI Calculator (NBCFDC / NSFDC Guidelines)',
    phase_badge: 'SIH Live Prototype',
    api_online: 'API Online',
    api_offline: 'API Disconnected',

    // Steps Header
    step_1: 'Intake Profile',
    step_2: 'Scheme Match',
    step_3: 'EMI & 90/10 Split',
    step_4: 'Nearest Partners',
    step_5: 'Confirmation',
    step_indicator: 'Step',
    step_of: 'of',

    // Hero banner
    hero_title: 'AI Concessional Scheme Matching & Partner Locator',
    hero_subtitle: 'Deterministic matching engine delivering instant concessional loan eligibility, 90% loan calculation, AI audit trail, and nearest channel partner routing.',

    // AI Assistant Bar
    ai_bar_title: 'AI Conversational Intake Assistant',
    ai_bar_nlp: 'NLP Powered',
    ai_bar_desc: 'Type in natural English/Hindi transcript — AI will automatically extract parameters & evaluate eligibility',
    ai_bar_placeholder: "e.g., 'I make ₹3 Lakh annually and need ₹1.2 Lakh loan for my tailoring shop in Lucknow'",
    ai_bar_button: 'Ask AI',
    ai_bar_try_prompts: 'Try Prompts:',
    ai_bar_success: 'Parameters Extracted & Evaluated!',

    // Intake Form
    intake_title: 'Applicant Intake Form',
    intake_subtitle: 'Enter applicant financial & project details',
    intake_reset: 'Reset',
    intake_presets: '1-Click Test Scenarios (SIH Judges Demo):',
    intake_income_label: 'Annual Family Income',
    intake_income_limit: 'Eligibility limit: ₹5.00 Lakh/year',
    intake_category_label: 'Project / Venture Category',
    intake_cost_label: 'Total Estimated Project / Course Cost',
    intake_caps: 'Micro cap: ≤₹1.40L | Term cap: ≤₹50L',
    intake_education_title: 'Higher Education / Course Loan',
    intake_education_desc: 'For engineering, medical, vocational or overseas degrees',
    intake_tenure_label: 'Desired Loan Tenure',
    intake_gender_label: 'Applicant Gender (Special 0.5% Concession for Women)',
    intake_gender_male: 'Male',
    intake_gender_female: 'Female (-0.5% p.a.)',
    intake_gender_other: 'Other',
    intake_submit_btn: 'Find My Scheme & Calculate EMI',
    intake_evaluating: 'Evaluating Scheme Match & EMI...',

    // Categories
    cat_small_business: 'Small Business / Retail Shop',
    cat_micro_enterprise: 'Micro Enterprise / Local Workshop',
    cat_manufacturing: 'Manufacturing & Processing Unit',
    cat_services: 'Services, Logistics & Trade',
    cat_artisan: 'Artisan & Traditional Crafts',
    cat_education: 'Higher Education / Engineering / Medical',

    // Recommendation
    rec_title: 'Scheme Recommendation',
    rec_subtitle: 'Rule-driven deterministic matching + AI explainability',
    rec_eligible_badge: 'Eligible for Concession',
    rec_ineligible_badge: 'Ineligible',
    rec_primary_badge: 'Primary Recommended Scheme',
    rec_tab_overview: 'Overview',
    rec_tab_audit: 'AI Audit Trail',
    rec_tip_label: 'Key Tip:',
    rec_audit_trace_title: '5-Point Financial & Statutory Verification Trace:',
    rec_alternates_title: 'Alternative Eligible Concessional Scheme(s):',
    rec_ineligible_title: 'Not Eligible for Concessional Lending',
    rec_ineligible_next: 'Next Steps: Verify your annual family income certification or consider standard commercial SME lending channels through Public Sector Banks (PSBs) and Mudra Yojana loans.',
    rec_btn_see_emi: 'See EMI Breakdown →',

    // EMI Breakdown & 90/10 Split
    emi_title: 'Financial Breakdown & EMI',
    emi_subtitle: '90% Scheme Loan vs. 10% Applicant Own Share',
    emi_sanctioned_loan: 'Sanctioned Scheme Loan (90%)',
    emi_applicant_share: 'Applicant Margin Share (10%)',
    emi_monthly_label: 'Monthly EMI',
    emi_reducing_desc: 'Reducing balance amortization',
    emi_total_loan_label: 'Sanctioned Loan',
    emi_loan_desc: 'Up to 90% of project cost',
    emi_own_label: 'Min. Own Contribution',
    emi_own_desc: 'Mandatory 10% promoter share',
    emi_rate_label: 'Interest Rate',
    emi_rate_desc: 'Concessional subsidized rate',
    emi_moratorium_label: 'Moratorium Period',
    emi_moratorium_desc: 'Repayment holiday during setup',
    emi_total_int_label: 'Total Interest',
    emi_total_int_desc: 'Over total loan duration',
    emi_btn_find_partner: 'Find Nearest Channel Partner →',

    // Partner Locator
    partner_title: 'Nearest Channel Partners & Branch Map',
    partner_subtitle: 'Locating approved SCAs, PSBs, RRBs, and NBFC-MFIs matching concessional schemes',
    partner_simulated_notice: 'Hackathon Prototype Notice: Partner locations and institutional types (SCA/PSB/RRB/MFI) represent authentic lending channels. The Health/Risk Score (0–100) is simulated for demonstration; in production, it connects to NBCFDC/SCA MIS live audit feeds.',
    partner_showing_closest: 'Showing closest branches to',
    partner_click_marker: 'Click any marker to view contact details',
    partner_days_sanction: 'days sanction',
    partner_health_score: 'Health Score:',
    partner_call_branch: 'Call Branch',
    partner_send_details: 'Send My Details to This Partner',
    partner_routed_badge: 'Routed via n8n!',
    partner_use_gps: 'My GPS',

    // Confirmation Screen
    confirm_title: 'Application Successfully Dispatched!',
    confirm_subtitle: 'Your concessional loan request has been routed to the matched channel partner.',
    confirm_lead_id: 'Lead Reference ID:',
    confirm_scheme_heading: 'Recommended Scheme Summary',
    confirm_partner_heading: 'Assigned Channel Partner Branch',
    confirm_next_steps_title: 'Next Steps for Applicant:',
    confirm_step_1: '1. Check your email and SMS for your official scheme recommendation slip and loan summary.',
    confirm_step_2: '2. Keep your SC caste certificate, Aadhaar card, and family income certificate ready.',
    confirm_step_3: '3. An assigned loan officer from the channel partner branch will contact you within 2-3 working days.',
    confirm_btn_start_over: '← Start Over / New Evaluation',
    confirm_btn_print: 'Print Scheme Summary',

    // Footer
    footer_text: 'SIH Prototype — AI-Driven Concessional Loan Scheme Matching & Channel Partner Routing System | Phase 4 Multi-Lingual',
  },

  hi: {
    // App Header
    app_title: 'वंचित उद्यमी ऋण योजना मिलान प्रणाली',
    app_subtitle: 'रियायती ऋण योजना चयन व ईएमआई कैलकुलेटर (NBCFDC / NSFDC दिशानिर्देश)',
    phase_badge: 'एस.आई.एच. लाइव प्रोटोटाइप',
    api_online: 'सर्वर ऑनलाइन',
    api_offline: 'सर्वर डिस्कनेक्ट',

    // Steps Header
    step_1: 'आवेदक प्रोफाइल',
    step_2: 'योजना मिलान',
    step_3: 'ईएमआई व 90/10 विभाजन',
    step_4: 'निकटतम भागीदार',
    step_5: 'आवेदन पुष्टि',
    step_indicator: 'चरण',
    step_of: 'का',

    // Hero banner
    hero_title: 'एआई रियायती योजना चयन एवं भागीदार लोकेटर',
    hero_subtitle: 'नियम-आधारित इंजन द्वारा अनुसूचित जाति उद्यमियों हेतु तत्काल रियायती ऋण पात्रता, 90% ऋण गणना, एआई ऑडिट ट्रेल और निकटतम बैंक शाखा मिलान।',

    // AI Assistant Bar
    ai_bar_title: 'एआई संवादात्मक सहायक',
    ai_bar_nlp: 'एनएलपी संचालित',
    ai_bar_desc: 'अपनी भाषा में वाक्य लिखें — एआई स्वतः आपकी आवश्यकता समझकर योजना का मूल्यांकन करेगा',
    ai_bar_placeholder: "उदा., 'मेरी वार्षिक आय 3 लाख है और मुझे लखनऊ में दर्जी की दुकान के लिए 1.2 लाख का ऋण चाहिए'",
    ai_bar_button: 'एआई से पूछें',
    ai_bar_try_prompts: 'उदाहरण प्रॉम्प्ट:',
    ai_bar_success: 'विवरण सफलतापूर्वक प्राप्त व मूल्यांकित!',

    // Intake Form
    intake_title: 'आवेदक विवरण फॉर्म',
    intake_subtitle: 'वित्तीय व व्यवसाय संबंधी जानकारी भरें',
    intake_reset: 'रीसेट',
    intake_presets: '1-क्लिक परीक्षण परिदृश्य (न्यायाधीश डेमो):',
    intake_income_label: 'वार्षिक पारिवारिक आय',
    intake_income_limit: 'पात्रता सीमा: ₹5.00 लाख/वर्ष तक',
    intake_category_label: 'परियोजना / व्यवसाय का प्रकार',
    intake_cost_label: 'कुल अनुमानित परियोजना या पाठ्यक्रम लागत',
    intake_caps: 'माइक्रो सीमा: ≤₹1.40 लाख | टर्म ऋण: ≤₹50 लाख',
    intake_education_title: 'उच्च शिक्षा / पाठ्यक्रम ऋण',
    intake_education_desc: 'इंजीनियरिंग, मेडिकल, व्यावसायिक या विदेश में उच्च शिक्षा हेतु',
    intake_tenure_label: 'इच्छित ऋण अवधि',
    intake_gender_label: 'आवेदक लिंग (महिलाओं हेतु 0.5% विशेष ब्याज छूट)',
    intake_gender_male: 'पुरुष',
    intake_gender_female: 'महिला (-0.5% प्रति वर्ष छूट)',
    intake_gender_other: 'अन्य',
    intake_submit_btn: 'मेरी योजना खोजें व ईएमआई देखें',
    intake_evaluating: 'योजना मिलान व ईएमआई की गणना हो रही है...',

    // Categories
    cat_small_business: 'छोटा व्यवसाय / खुदरा दुकान',
    cat_micro_enterprise: 'सूक्ष्म उद्यम / स्थानीय कार्यशाला',
    cat_manufacturing: 'विनिर्माण एवं प्रसंस्करण इकाई',
    cat_services: 'सेवाएं, रसद एवं व्यापार',
    cat_artisan: 'कारीगर एवं पारंपरिक हस्तशिल्प',
    cat_education: 'उच्च शिक्षा / इंजीनियरिंग / मेडिकल',

    // Recommendation
    rec_title: 'योजना अनुशंसा परिणाम',
    rec_subtitle: 'नियम-आधारित सटीक चयन + एआई व्याख्या',
    rec_eligible_badge: 'रियायती ऋण हेतु पात्र',
    rec_ineligible_badge: 'अपात्र',
    rec_primary_badge: 'सर्वोत्तम अनुशंसित योजना',
    rec_tab_overview: 'अवलोकन',
    rec_tab_audit: 'एआई ऑडिट ट्रेल',
    rec_tip_label: 'मुख्य सुझाव:',
    rec_audit_trace_title: '5-बिंदु वित्तीय व वैधानिक सत्यापन ट्रेल:',
    rec_alternates_title: 'वैकल्पिक पात्र रियायती योजनाएं:',
    rec_ineligible_title: 'रियायती ऋण हेतु वर्तमान में अपात्र',
    rec_ineligible_next: 'अगला कदम: अपनी वार्षिक पारिवारिक आय प्रमाणपत्र की जांच करें या सार्वजनिक क्षेत्र के बैंकों से सामान्य मुद्रा ऋण विकल्पों पर विचार करें।',
    rec_btn_see_emi: 'ईएमआई विवरण देखें →',

    // EMI Breakdown & 90/10 Split
    emi_title: 'वित्तीय विभाजन एवं मासिक ईएमआई',
    emi_subtitle: '90% सरकारी योजना ऋण बनाम 10% स्वयं का अंशदान',
    emi_sanctioned_loan: 'स्वीकृत योजना ऋण (90%)',
    emi_applicant_share: 'आवेदक का स्वयं अंशदान (10%)',
    emi_monthly_label: 'मासिक ईएमआई किस्त',
    emi_reducing_desc: 'घटती ब्याज दर (Reducing Balance)',
    emi_total_loan_label: 'स्वीकृत ऋण राशि',
    emi_loan_desc: 'परियोजना लागत का 90% तक',
    emi_own_label: 'न्यूनतम स्वयं का अंश',
    emi_own_desc: 'अनिवार्य 10% प्रमोटर अंशदान',
    emi_rate_label: 'ब्याज दर',
    emi_rate_desc: 'रियायती अनुदानित वार्षिक दर',
    emi_moratorium_label: 'मोराटोरियम अवधि',
    emi_moratorium_desc: 'व्यवसाय स्थापना दौरान किस्त छूट',
    emi_total_int_label: 'कुल देय ब्याज',
    emi_total_int_desc: 'संपूर्ण ऋण अवधि के दौरान',
    emi_btn_find_partner: 'निकटतम भागीदार बैंक खोजें →',

    // Partner Locator
    partner_title: 'निकटतम चैनल पार्टनर एवं शाखा मानचित्र',
    partner_subtitle: 'रियायती योजनाओं से जुड़े अधिकृत SCA, PSB, RRB और NBFC-MFI शाखाएं',
    partner_simulated_notice: 'हैकाथॉन प्रोटोटाइप सूचना: भागीदार स्थान एवं संस्थागत प्रकार प्रामाणिक हैं। स्वास्थ्य/जोखिम स्कोर (0–100) प्रदर्शन हेतु सिमुलेटेड है; वास्तविक प्रणाली में यह NBCFDC/SCA MIS से सीधे जुड़ेगा।',
    partner_showing_closest: 'निकटतम शाखाएं स्थान:',
    partner_click_marker: 'संपर्क विवरण देखने हेतु किसी भी मार्कर पर क्लिक करें',
    partner_days_sanction: 'दिनों में स्वीकृति',
    partner_health_score: 'संस्थागत स्कोर:',
    partner_call_branch: 'शाखा को कॉल करें',
    partner_send_details: 'मेरा विवरण इस भागीदार को भेजें',
    partner_routed_badge: 'n8n द्वारा प्रेषित!',
    partner_use_gps: 'मेरा जीपीएस',

    // Confirmation Screen
    confirm_title: 'आवेदन सफलतापूर्वक प्रेषित!',
    confirm_subtitle: 'आपका रियायती ऋण आवेदन चयनित चैनल भागीदार को भेज दिया गया है।',
    confirm_lead_id: 'आवेदन संदर्भ संख्या:',
    confirm_scheme_heading: 'अनुशंसित योजना विवरण',
    confirm_partner_heading: 'आवंटित चैनल भागीदार शाखा',
    confirm_next_steps_title: 'आवेदक हेतु महत्वपूर्ण अगले कदम:',
    confirm_step_1: '1. अपनी आधिकारिक योजना अनुशंसा पर्ची हेतु अपना ईमेल एवं एसएमएस जांचें।',
    confirm_step_2: '2. अपना अनुसूचित जाति प्रमाणपत्र, आधार कार्ड और आय प्रमाणपत्र तैयार रखें।',
    confirm_step_3: '3. बैंक शाखा से एक ऋण अधिकारी आगामी 2-3 कार्य दिवसों में आपसे संपर्क करेंगे।',
    confirm_btn_start_over: '← नया आवेदन / पुनः प्रारंभ करें',
    confirm_btn_print: 'योजना सारांश प्रिंट करें',

    // Footer
    footer_text: 'एस.आई.एच. प्रोटोटाइप — अनुसूचित जाति उद्यमियों हेतु एआई-संचालित योजना मिलान प्रणाली | चरण 4 बहुभाषी',
  },
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('sih_app_language') || 'en';
  });

  const toggleLanguage = () => {
    const nextLang = language === 'en' ? 'hi' : 'en';
    setLanguage(nextLang);
    localStorage.setItem('sih_app_language', nextLang);
  };

  const setSpecificLanguage = (lang) => {
    if (TRANSLATIONS[lang]) {
      setLanguage(lang);
      localStorage.setItem('sih_app_language', lang);
    }
  };

  const t = (key) => {
    return TRANSLATIONS[language]?.[key] || TRANSLATIONS.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, setLanguage: setSpecificLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
