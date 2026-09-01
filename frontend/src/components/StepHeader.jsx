import React from 'react';
import { 
  UserCheck, 
  Award, 
  Calculator, 
  MapPin, 
  CheckCircle2, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function StepHeader({ currentStep, onStepClick, maxStepReached = 1 }) {
  const { t } = useLanguage();

  const STEPS = [
    { id: 1, label: t('step_1'), icon: UserCheck },
    { id: 2, label: t('step_2'), icon: Award },
    { id: 3, label: t('step_3'), icon: Calculator },
    { id: 4, label: t('step_4'), icon: MapPin },
    { id: 5, label: t('step_5'), icon: CheckCircle2 },
  ];

  return (
    <div className="w-full mb-6">
      <div className="glass-card rounded-2xl p-3 sm:p-4 border border-slate-800 bg-slate-950/60 shadow-lg">
        <div className="flex items-center justify-between overflow-x-auto no-scrollbar gap-2 sm:gap-4 py-1">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isCompleted = step.id < currentStep || (step.id <= maxStepReached && step.id !== currentStep);
            const isActive = step.id === currentStep;
            const isClickable = step.id <= maxStepReached;

            return (
              <React.Fragment key={step.id}>
                <button
                  type="button"
                  disabled={!isClickable}
                  onClick={() => isClickable && onStepClick && onStepClick(step.id)}
                  className={`flex items-center space-x-2 px-2.5 sm:px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-950/60 border border-emerald-400/40 ring-2 ring-emerald-500/20'
                      : isCompleted
                      ? 'bg-slate-900/90 text-emerald-400 border border-emerald-500/30 hover:bg-slate-800 cursor-pointer'
                      : 'bg-slate-950/40 text-slate-500 border border-slate-900 cursor-not-allowed opacity-60'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs ${
                      isActive
                        ? 'bg-white text-emerald-700 font-extrabold'
                        : isCompleted
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {isCompleted && !isActive ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <span>{step.id}</span>
                    )}
                  </div>
                  <span className="hidden sm:inline whitespace-nowrap">{step.label}</span>
                </button>

                {idx < STEPS.length - 1 && (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-700 shrink-0 hidden md:block" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}
