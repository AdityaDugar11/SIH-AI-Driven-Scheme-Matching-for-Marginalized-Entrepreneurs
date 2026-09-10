/**
 * useTranslation — custom i18n hook (Decision D8)
 *
 * Simple dictionary lookup for English + Hindi.
 * No react-i18next dependency — overkill for 2 languages.
 * Supports {{variable}} template interpolation.
 */

import { useApp } from "../context/AppContext.jsx";
import en from "../i18n/en.json";
import hi from "../i18n/hi.json";

const dictionaries = { en, hi };

export function useTranslation() {
  const { state } = useApp();
  const lang = state.language;
  const dict = dictionaries[lang] || dictionaries.en;

  /**
   * Translate a key, with optional interpolation.
   * t("step_of", { current: 1, total: 5 }) → "Step 1 of 5"
   */
  function t(key, vars) {
    let str = dict[key] || dictionaries.en[key] || key;
    if (vars) {
      Object.entries(vars).forEach(([k, v]) => {
        str = str.replace(new RegExp(`\\{\\{${k}\\}\\}`, "g"), v);
      });
    }
    return str;
  }

  return { t, language: lang };
}
