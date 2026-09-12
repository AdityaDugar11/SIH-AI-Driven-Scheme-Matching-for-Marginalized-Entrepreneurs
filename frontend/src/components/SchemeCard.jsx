import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { CheckCircle2, ChevronRight, FileText, Banknote, Percent, Calendar, IndianRupee } from 'lucide-react';

export default function SchemeCard({ scheme, idx, onViewMore }) {
  const { t } = useTranslation();
  // Extract only the positive matching reasons for the summary card
  const matchReasons = (scheme?.reasons || []).filter(r => r.type === 'success').slice(0, 3);
  
  const isLoan = scheme.loanType === 'Term Loan' || scheme.loanType === 'Micro Finance' || scheme.type?.toLowerCase().includes('loan');
  
  // Calculate basic EMI for display if loan
  let estimatedEmi = null;
  const maxLoanAmt = parseInt(scheme?.maxLimit?.replace(/\D/g, '')) || 500000;
  const interestRate = scheme?.interest ? parseFloat(scheme.interest) : null;
  if (isLoan && interestRate) {
    const r = interestRate / 12 / 100;
    const n = 60; // assume 5 years
    const emi = maxLoanAmt * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
    estimatedEmi = Math.round(emi);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.1 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow relative flex flex-col"
    >
      {/* Decorative top border based on match % */}
      <div className={`h-1.5 w-full flex-shrink-0 ${scheme.match >= 75 ? 'bg-green-500' : scheme.match >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}></div>
      
      <div className="p-6 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1 pr-4">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-800 mb-2 uppercase tracking-wider">
              {scheme.type}
            </span>
            <h3 className="text-xl font-bold text-gray-900 leading-tight mb-2">{scheme.name}</h3>
          </div>
          
          <div className={`flex flex-col items-center justify-center h-16 w-16 flex-shrink-0 rounded-2xl shadow-inner ${scheme.match >= 75 ? 'bg-green-50 text-green-700 border border-green-100' : scheme.match >= 50 ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
            <span className="text-xl font-extrabold">{scheme.match}%</span>
            <span className="text-[9px] uppercase font-bold tracking-wider leading-none mt-0.5">Match</span>
          </div>
        </div>

        {/* Why it matches */}
        <div className="bg-gray-50/80 rounded-xl p-4 mb-4 border border-gray-100/50">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">{t('why_matches')}:</p>
          <ul className="space-y-1.5">
            {matchReasons.map((reason, i) => (
              <li key={i} className="flex items-start text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700 font-medium line-clamp-1 text-sm">{reason.text}</span>
              </li>
            ))}
            {matchReasons.length === 0 && (
              <li className="text-sm text-gray-500 italic">No specific exact matches found, but you meet general criteria.</li>
            )}
          </ul>
        </div>

        {/* Financial Info */}
        <div className="grid grid-cols-2 gap-3 mb-6 flex-1">
          {isLoan ? (
            <>
              <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                <p className="text-[10px] font-bold text-blue-600 uppercase flex items-center mb-1"><Banknote className="h-3 w-3 mr-1" /> {t('maximum_loan')}</p>
                <p className="text-sm font-bold text-gray-900">{scheme.maxLimit || 'Not Specified'}</p>
              </div>
              <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                <p className="text-[10px] font-bold text-blue-600 uppercase flex items-center mb-1"><Percent className="h-3 w-3 mr-1" /> {t('interest_rate')}</p>
                <p className="text-sm font-bold text-gray-900">{scheme.interest ? `${scheme.interest} ${t('p_a')}` : t('varies_by_lender')}</p>
              </div>
              <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                <p className="text-[10px] font-bold text-blue-600 uppercase flex items-center mb-1"><Calendar className="h-3 w-3 mr-1" /> {t('tenure')}</p>
                <p className="text-sm font-bold text-gray-900">Up to 5 years</p>
              </div>
              <div className="bg-green-50/50 p-3 rounded-lg border border-green-100 relative overflow-hidden">
                <div className="absolute -right-2 -top-2 text-green-500 opacity-20"><IndianRupee className="h-10 w-10" /></div>
                <p className="text-[10px] font-bold text-green-700 uppercase mb-1">{t('estimated_emi')}</p>
                <p className="text-sm font-bold text-green-900">{estimatedEmi ? `₹${estimatedEmi.toLocaleString('en-IN')}/mo*` : t('subject_to_assessment')}</p>
              </div>
            </>
          ) : (
            <>
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                <p className="text-[10px] font-bold text-gray-500 uppercase flex items-center mb-1">{t('benefit')}</p>
                <p className="text-sm font-bold text-gray-900">{scheme.maxLimit || t('not_applicable')}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                <p className="text-[10px] font-bold text-gray-500 uppercase flex items-center mb-1"><Percent className="h-3 w-3 mr-1" /> {t('interest_rate')}</p>
                <p className="text-sm font-bold text-gray-900">{t('not_applicable')}</p>
              </div>
            </>
          )}
        </div>
        
        <button 
          onClick={() => onViewMore(scheme)}
          className="w-full bg-white text-primary border-2 border-primary py-2.5 rounded-xl text-sm font-bold hover:bg-blue-50 transition-colors flex justify-center items-center shadow-sm"
        >
          {t('view_details')}
          <ChevronRight className="h-4 w-4 ml-1" />
        </button>
      </div>
    </motion.div>
  );
}
