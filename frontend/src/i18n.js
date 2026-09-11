import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Translations
const resources = {
  en: {
    translation: {
      "dashboard": "Dashboard",
      "profile_overview": "Profile Overview",
      "profile_complete": "Profile Complete",
      "recommended": "Recommended for you",
      "max_limit": "Max Limit",
      "interest": "Interest",
      "eligibility_analysis": "Eligibility Analysis",
      "required_documents": "Required Documents",
      "interested_button": "I am Interested",
      "interested_registered": "Interest Registered",
      "search_placeholder": "Describe your needs (e.g., 'I want a 5 lakh loan for a dairy farm')",
      "ai_search": "AI Search",
      "searching": "Searching...",
      "no_schemes": "No schemes found for this filter.",
      "filters": {
        "All": "All",
        "Central": "Central",
        "State": "State",
        "Micro Finance": "Micro Finance",
        "Term Loan": "Term Loan"
      }
    }
  },
  hi: {
    translation: {
      "dashboard": "डैशबोर्ड",
      "profile_overview": "प्रोफ़ाइल अवलोकन",
      "profile_complete": "प्रोफ़ाइल पूर्ण",
      "recommended": "आपके लिए अनुशंसित",
      "max_limit": "अधिकतम सीमा",
      "interest": "ब्याज",
      "eligibility_analysis": "पात्रता विश्लेषण",
      "required_documents": "आवश्यक दस्तावेज़",
      "interested_button": "मुझे दिलचस्पी है",
      "interested_registered": "दिलचस्पी दर्ज की गई",
      "search_placeholder": "अपनी ज़रूरतें बताएं (उदा. 'मुझे डेयरी फार्म के लिए 5 लाख का लोन चाहिए')",
      "ai_search": "एआई खोज",
      "searching": "खोज रहे हैं...",
      "no_schemes": "इस फ़िल्टर के लिए कोई योजना नहीं मिली।",
      "filters": {
        "All": "सभी",
        "Central": "केंद्रीय",
        "State": "राज्य",
        "Micro Finance": "माइक्रो फाइनेंस",
      }
    }
  },
  bn: {
    translation: {
      "dashboard": "ড্যাশবোর্ড",
      "profile_overview": "প্রোফাইল ওভারভিউ",
      "profile_complete": "প্রোফাইল সম্পূর্ণ",
      "recommended": "আপনার জন্য প্রস্তাবিত",
      "max_limit": "সর্বোচ্চ সীমা",
      "interest": "সুদ",
      "eligibility_analysis": "যোগ্যতা বিশ্লেষণ",
      "required_documents": "প্রয়োজনীয় কাগজপত্র",
      "interested_button": "আমি আগ্রহী",
      "interested_registered": "আগ্রহ নিবন্ধিত",
      "search_placeholder": "আপনার প্রয়োজন বর্ণনা করুন...",
      "ai_search": "এআই অনুসন্ধান",
      "searching": "খুঁজছি...",
      "no_schemes": "কোনো স্কিম পাওয়া যায়নি।",
      "filters": {
        "All": "সব",
        "Central": "কেন্দ্রীয়",
        "State": "রাজ্য",
        "Micro Finance": "মাইক্রো ফাইন্যান্স",
        "Term Loan": "টার্ম লোন"
      }
    }
  },
  te: {
    translation: {
      "dashboard": "డాష్‌బోర్డ్",
      "profile_overview": "ప్రొఫైల్ అవలోకనం",
      "profile_complete": "ప్రొఫైల్ పూర్తి",
      "recommended": "మీ కోసం సిఫార్సు చేయబడినవి",
      "max_limit": "గరిష్ట పరిమితి",
      "interest": "వడ్డీ",
      "eligibility_analysis": "అర్హత విశ్లేషణ",
      "required_documents": "అవసరమైన పత్రాలు",
      "interested_button": "నాకు ఆసక్తి ఉంది",
      "interested_registered": "ఆసక్తి నమోదు చేయబడింది",
      "search_placeholder": "మీ అవసరాలను వివరించండి...",
      "ai_search": "AI శోధన",
      "searching": "శోధిస్తోంది...",
      "no_schemes": "ఏ పథకాలు కనుగొనబడలేదు.",
      "filters": {
        "All": "అన్నీ",
        "Central": "కేంద్ర",
        "State": "రాష్ట్ర",
        "Micro Finance": "మైక్రో ఫైనాన్స్",
        "Term Loan": "టర్మ్ లోన్"
      }
    }
  },
  mr: {
    translation: {
      "dashboard": "डॅशबोर्ड",
      "profile_overview": "प्रोफाइल विहंगावलोकन",
      "profile_complete": "प्रोफाइल पूर्ण",
      "recommended": "तुमच्यासाठी शिफारस केलेले",
      "max_limit": "कमाल मर्यादा",
      "interest": "व्याज",
      "eligibility_analysis": "पात्रता विश्लेषण",
      "required_documents": "आवश्यक कागदपत्रे",
      "interested_button": "मला स्वारस्य आहे",
      "interested_registered": "स्वारस्य नोंदणीकृत",
      "search_placeholder": "तुमच्या गरजा वर्णन करा...",
      "ai_search": "AI शोध",
      "searching": "शोधत आहे...",
      "no_schemes": "कोणत्याही योजना आढळल्या नाहीत.",
      "filters": {
        "All": "सर्व",
        "Central": "केंद्रीय",
        "State": "राज्य",
        "Micro Finance": "मायक्रो फायनान्स",
        "Term Loan": "टर्म लोन"
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en", // default language
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
