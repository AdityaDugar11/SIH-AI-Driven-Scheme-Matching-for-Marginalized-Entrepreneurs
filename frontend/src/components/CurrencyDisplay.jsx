/**
 * CurrencyDisplay — formats numbers as ₹X,XX,XXX (Indian locale)
 *
 * UI.md: "Every number needs a one-line plain-language label next to it"
 * Design.md: "Numbers — largest and boldest text on any screen they appear on"
 */

export default function CurrencyDisplay({ amount, className = "", large = false }) {
  if (amount === null || amount === undefined) return null;

  const formatted = `₹${Number(amount).toLocaleString("en-IN")}`;

  return (
    <span className={`${large ? "text-amount" : ""} ${className}`}>
      {formatted}
    </span>
  );
}
