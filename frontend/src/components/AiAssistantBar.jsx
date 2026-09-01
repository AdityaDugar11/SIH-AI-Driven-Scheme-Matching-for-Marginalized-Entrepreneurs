import React, { useState } from 'react';
import { Sparkles, ArrowRight, Bot, MessageSquare, Lightbulb, Check } from 'lucide-react';
import { parseAiQuery } from '../services/api';

const EXAMPLE_QUERIES = [
  {
    label: '🏪 Micro Tailoring (₹1.2L in Lucknow)',
    query: 'I earn 2.5 Lakh annually and want a loan for my tailoring shop in Lucknow costing 1.2 Lakh',
  },
  {
    label: '🏭 Fabrication Unit (₹18L in Jaipur)',
    query: 'We have 3.5L family income and need 18 Lakhs for our metal fabrication workshop in Jaipur',
  },
  {
    label: '🎓 B.Tech College (₹8L in Bengaluru)',
    query: 'My daughter got admission for engineering in Bengaluru fees 8 Lakhs, family income 2 Lakhs',
  },
  {
    label: '⚙️ Auto Repair (₹1.4L in Delhi)',
    query: 'Annual income 3 Lakh and need 1.4 Lakh for auto repair tools in Delhi',
  },
];

export default function AiAssistantBar({ onApplyParsedData, onCityChange, isEvaluating }) {
  const [inputText, setInputText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [parseSuccess, setParseSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleParseAndApply = async (queryText) => {
    const textToProcess = queryText || inputText;
    if (!textToProcess.trim()) return;

    setIsParsing(true);
    setError(null);
    setParseSuccess(false);

    try {
      const parsed = await parseAiQuery(textToProcess);
      if (parsed) {
        onApplyParsedData(parsed);
        if (parsed.city && onCityChange) {
          onCityChange(parsed.city);
        }
        setParseSuccess(true);
        setTimeout(() => setParseSuccess(false), 3000);
      }
    } catch (err) {
      console.error('AI parse error:', err);
      setError('Could not parse sentence. Please try one of the prompt chips below.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleChipClick = (query) => {
    setInputText(query);
    handleParseAndApply(query);
  };

  return (
    <div className="glass-card rounded-2xl p-4 sm:p-5 border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-slate-900/90 to-teal-950/40 shadow-xl mb-6 relative overflow-hidden">
      {/* Decorative gradient glow */}
      <div className="absolute top-0 right-0 transform translate-x-12 -translate-y-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center space-x-1.5">
                <span>AI Conversational Intake Assistant</span>
              </h2>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                NLP Powered
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Type in natural English/Hindi transcript — AI will automatically extract parameters & evaluate eligibility
            </p>
          </div>
        </div>

        {parseSuccess && (
          <span className="self-start md:self-auto inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-semibold animate-fadeIn">
            <Check className="w-3.5 h-3.5" />
            <span>Parameters Extracted & Evaluated!</span>
          </span>
        )}
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleParseAndApply();
        }}
        className="relative flex items-center mb-3"
      >
        <div className="absolute left-3.5 text-emerald-400 pointer-events-none">
          <Bot className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="e.g., 'I make ₹3 Lakh annually and need ₹1.2 Lakh loan for my tailoring shop in Lucknow'"
          className="w-full pl-10 pr-32 py-3 bg-slate-950/80 border border-slate-700/80 rounded-xl text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition shadow-inner font-medium"
        />
        <button
          type="submit"
          disabled={isParsing || !inputText.trim() || isEvaluating}
          className="absolute right-1.5 px-3.5 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isParsing ? (
            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span>Ask AI</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </form>

      {error && (
        <div className="text-xs text-rose-400 mb-2 font-medium">
          {error}
        </div>
      )}

      {/* Suggested Prompt Chips */}
      <div className="flex flex-wrap items-center gap-1.5 text-xs">
        <span className="text-slate-400 flex items-center space-x-1 text-[11px] font-medium mr-1">
          <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
          <span>Try Prompts:</span>
        </span>
        {EXAMPLE_QUERIES.map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleChipClick(item.query)}
            className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-900/90 hover:bg-emerald-950/80 text-slate-300 hover:text-emerald-300 border border-slate-800 hover:border-emerald-500/50 transition flex items-center space-x-1"
          >
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
