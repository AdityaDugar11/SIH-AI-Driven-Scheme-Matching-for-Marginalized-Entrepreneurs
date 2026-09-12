import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  XCircle, CheckCircle2, AlertTriangle, ChevronRight, Bookmark, Share2, 
  Sparkles, FileText, CheckSquare, Square, MapPin, ExternalLink, ChevronDown, ChevronUp
} from 'lucide-react';
import EmiCalculator from './EmiCalculator';

export default function SchemeModal({ scheme, profile, onClose, onApply, onSave, isSaved, isApplied }) {
  const { t } = useTranslation();
  const [isApplying, setIsApplying] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isDetailedInfoOpen, setIsDetailedInfoOpen] = useState(false);
  const [documents, setDocuments] = useState(
    (scheme?.documents || scheme?.base_documents || []).map(doc => ({ name: doc, available: false }))
  );
  const [emiData, setEmiData] = useState({ amount: 500000, interest: scheme?.interest ? parseFloat(scheme.interest) : null });

  if (!scheme) return null;

  const toggleDocument = (index) => {
    const newDocs = [...documents];
    newDocs[index].available = !newDocs[index].available;
    setDocuments(newDocs);
  };
  
  const docsAvailableCount = documents.filter(d => d.available).length;
  const isLoan = (scheme.loanType || scheme.type || '').toLowerCase().includes('loan') || (scheme.loanType || '').toLowerCase().includes('finance');
  const interestRate = scheme.interest || (isLoan ? '8.5% p.a.*' : 'Not Applicable');

  const tabs = [
    { id: 'overview', label: t('overview') },
    { id: 'eligibility', label: t('eligibility') },
    { id: 'benefits', label: t('benefits') },
    { id: 'documents', label: t('documents') },
    { id: 'financial', label: t('financial') },
    { id: 'application', label: t('application') },
    { id: 'details', label: t('details') }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-3xl shadow-2xl w-[95vw] md:w-[80vw] lg:w-[70vw] max-w-5xl h-[90vh] max-h-[850px] flex flex-col overflow-hidden border border-white/20"
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-start bg-gray-50/80 backdrop-blur relative">
          <div className="flex-1 pr-6">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 mb-2 uppercase tracking-wide">
              {scheme.type}
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight mb-2">{scheme.name}</h3>
            
            <div className="flex items-center space-x-3">
              <div className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center ${scheme.match >= 80 ? 'bg-green-100 text-green-800' : scheme.match >= 50 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}`}>
                <Sparkles className="h-3 w-3 mr-1" /> {scheme.match}% MATCH
              </div>
              <span className="text-sm font-medium text-gray-600">
                {scheme.isEligible ? <span className="text-green-600 font-bold">Potentially Eligible</span> : <span className="text-amber-600 font-bold">Review Criteria</span>}
              </span>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-3 z-10 flex-shrink-0">
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 bg-white hover:bg-gray-100 shadow-sm border border-gray-200 rounded-full p-2 transition-all">
              <XCircle className="h-6 w-6" />
            </button>
            <div className="flex bg-gray-200/50 p-1 rounded-lg">
              <button 
                onClick={() => setIsDetailedInfoOpen(false)}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${!isDetailedInfoOpen ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {t('simple_view')}
              </button>
              <button 
                onClick={() => setIsDetailedInfoOpen(true)}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${isDetailedInfoOpen ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {t('detailed_view')}
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Tabs Bar - Only visible in Detailed View */}
        {isDetailedInfoOpen && (
          <div className="flex overflow-x-auto border-b border-gray-100 hide-scrollbar bg-white px-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap px-6 py-4 text-sm font-bold border-b-2 transition-colors ${
                  activeTab === tab.id 
                    ? 'border-primary text-primary' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
        
        {/* Modal Body - Content */}
        <div className="flex-1 overflow-y-auto bg-slate-50 p-6 sm:p-8 relative">
          <AnimatePresence mode="wait">
            {!isDetailedInfoOpen ? (
              /* SIMPLE VIEW - ALL CRITICAL INFO IN ONE SCROLL */
              <motion.div key="simple-view" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                <section className="bg-gradient-to-r from-blue-50 to-indigo-50/50 rounded-2xl p-6 border border-blue-100 shadow-sm">
                  <h2 className="text-sm font-bold text-gray-900 flex items-center mb-3">
                    <Sparkles className="h-4 w-4 text-primary mr-2" /> {t('ai_summary')}
                  </h2>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    This scheme provides financial support to eligible beneficiaries. Based on your profile, it appears highly relevant because your <strong>location</strong>, <strong>business type</strong>, and <strong>income information</strong> strongly match the available criteria. The primary objective is to empower individuals in your category to successfully fund their projects.
                  </p>
                </section>
                
                <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-4">About This Scheme</h2>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {scheme.description || 'This scheme is designed to provide targeted financial assistance and support to marginalized groups and upcoming entrepreneurs to help them establish sustainable business ventures and improve their livelihood.'}
                  </p>
                </section>
              </motion.div>
            ) : (
              <>
                {activeTab === 'overview' && (
                  <motion.div key="overview" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
                    <section className="bg-gradient-to-r from-blue-50 to-indigo-50/50 rounded-2xl p-6 border border-blue-100 shadow-sm">
                      <h2 className="text-sm font-bold text-gray-900 flex items-center mb-3">
                        <Sparkles className="h-4 w-4 text-primary mr-2" /> {t('ai_summary')}
                      </h2>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        This scheme provides financial support to eligible beneficiaries. Based on your profile, it appears highly relevant because your <strong>location</strong>, <strong>business type</strong>, and <strong>income information</strong> strongly match the available criteria. The primary objective is to empower individuals in your category to successfully fund their projects.
                      </p>
                    </section>

                    <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                      <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-3">About This Scheme</h2>
                      <p className="text-gray-700 text-sm leading-relaxed mb-4">
                        {scheme.description || 'This scheme is designed to provide targeted financial assistance and support to marginalized groups and upcoming entrepreneurs to help them establish sustainable business ventures and improve their livelihood.'}
                      </p>
                      <h3 className="font-bold text-gray-900 text-sm mb-2">Objective</h3>
                      <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                        <li>Provide accessible financial assistance.</li>
                        <li>Promote entrepreneurship among target demographics.</li>
                        <li>Support capacity building and skill development.</li>
                      </ul>
                    </section>
                  </motion.div>
                )}

                {activeTab === 'eligibility' && (
                  <motion.div key="eligibility" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
                    <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                      <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-4">{t('eligibility_analysis')}</h2>
                      {scheme.reasons && scheme.reasons.length > 0 ? (
                        <div className="space-y-3">
                          {scheme.reasons.map((reason, i) => (
                            <div key={i} className="flex items-start bg-gray-50 p-4 rounded-xl border border-gray-100">
                              {reason.type === 'success' && <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />}
                              {reason.type === 'error' && <XCircle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />}
                              {reason.type === 'warning' && <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 mr-3 flex-shrink-0" />}
                              <div>
                                <p className="text-sm font-bold text-gray-900">{reason.type === 'success' ? 'Eligible' : reason.type === 'error' ? 'Not Eligible' : 'Partially Eligible'}</p>
                                <p className="text-xs text-gray-500 mt-1">{reason.text}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">Eligibility analysis not fully available.</p>
                      )}
                      <div className="mt-6 pt-4 border-t border-gray-100">
                        <h3 className="font-bold text-gray-900 text-sm mb-3">General Criteria</h3>
                        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                          <li>Must be an Indian citizen.</li>
                          <li>Age between 18 and 55 years.</li>
                          <li>Business must be located in designated areas.</li>
                        </ul>
                      </div>
                    </section>
                  </motion.div>
                )}

                {activeTab === 'benefits' && (
                  <motion.div key="benefits" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
                    <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                      <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-4">Key Benefits</h2>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                          <CheckCircle2 className="h-6 w-6 text-green-600 mb-2" />
                          <h3 className="font-bold text-gray-900 text-sm mb-1">Financial Subsidy</h3>
                          <p className="text-xs text-gray-600">Up to 35% subsidy on project cost for eligible categories.</p>
                        </div>
                        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                          <CheckCircle2 className="h-6 w-6 text-blue-600 mb-2" />
                          <h3 className="font-bold text-gray-900 text-sm mb-1">Low Interest Rate</h3>
                          <p className="text-xs text-gray-600">Concessional interest rates starting at {interestRate}.</p>
                        </div>
                        <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                          <CheckCircle2 className="h-6 w-6 text-purple-600 mb-2" />
                          <h3 className="font-bold text-gray-900 text-sm mb-1">Training Support</h3>
                          <p className="text-xs text-gray-600">Mandatory EDP training provided free of cost.</p>
                        </div>
                        <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                          <CheckCircle2 className="h-6 w-6 text-amber-600 mb-2" />
                          <h3 className="font-bold text-gray-900 text-sm mb-1">Collateral Free</h3>
                          <p className="text-xs text-gray-600">No collateral required for loans up to ₹10 Lakhs under CGTMSE.</p>
                        </div>
                      </div>
                    </section>
                  </motion.div>
                )}

                {activeTab === 'documents' && (
                  <motion.div key="documents" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
                    <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wide">{t('required_documents')}</h2>
                        <span className="text-xs font-bold text-primary bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                          {t('document_readiness')}: {docsAvailableCount} / {documents.length}
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        {documents.map((doc, idx) => (
                          <div 
                            key={idx} 
                            onClick={() => toggleDocument(idx)}
                            className={`flex justify-between items-center p-4 rounded-xl border cursor-pointer transition-colors ${doc.available ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}
                          >
                            <div className="flex items-center">
                              {doc.available ? <CheckSquare className="h-5 w-5 text-green-600 mr-3" /> : <Square className="h-5 w-5 text-gray-400 mr-3" />}
                              <span className={`text-sm font-medium ${doc.available ? 'text-green-900 line-through opacity-70' : 'text-gray-700'}`}>{doc.name}</span>
                            </div>
                            <span className={`text-xs font-bold ${doc.available ? 'text-green-700' : 'text-amber-500'}`}>
                              {doc.available ? t('available') : t('missing')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </section>
                  </motion.div>
                )}

                {activeTab === 'financial' && (
                  <motion.div key="financial" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
                    <section className="bg-blue-900 rounded-2xl p-6 shadow-sm border border-blue-800 text-white">
                      <h2 className="text-sm font-bold text-blue-300 uppercase tracking-wide mb-6">{t('financial')}</h2>
                      <div className="grid grid-cols-2 gap-6">
                        {isLoan ? (
                          <>
                            <div>
                              <p className="text-xs text-blue-200 mb-1">{t('scheme_maximum')}</p>
                              <p className="text-2xl font-extrabold text-white">{scheme.maxLimit || t('varies_by_lender')}</p>
                            </div>
                            <div>
                              <p className="text-xs text-blue-200 mb-1">{t('interest_rate')}</p>
                              <p className="text-2xl font-bold text-white">{interestRate}</p>
                            </div>
                            <div>
                              <p className="text-xs text-blue-200 mb-1">{t('your_requested_amount')}</p>
                              <p className="text-2xl font-bold text-white">₹{emiData.amount.toLocaleString('en-IN')}</p>
                            </div>
                            <div>
                              <p className="text-xs text-blue-200 mb-1">{t('potential_loan')}</p>
                              <p className="text-2xl font-bold text-green-400">₹{emiData.amount.toLocaleString('en-IN')}*</p>
                              <p className="text-[10px] text-blue-300 mt-1">{t('subject_to_assessment')}</p>
                            </div>
                          </>
                        ) : (
                          <>
                            <div>
                              <p className="text-xs text-blue-200 mb-1">{t('financial_assistance')}</p>
                              <p className="text-2xl font-extrabold text-white">{scheme.maxLimit || 'As per norms'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-blue-200 mb-1">{t('interest_rate')}</p>
                              <p className="text-sm font-bold text-white">{t('not_applicable')}</p>
                            </div>
                          </>
                        )}
                      </div>
                    </section>

                    {isLoan && (
                      <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-4">{t('estimate_emi')}</h2>
                        <div className="flex space-x-2 mb-6">
                          <button onClick={() => setEmiData({...emiData, amount: 100000})} className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-bold py-2 rounded border border-gray-200">₹1 Lakh</button>
                          <button onClick={() => setEmiData({...emiData, amount: 200000})} className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-bold py-2 rounded border border-gray-200">₹2 Lakh</button>
                          <button onClick={() => setEmiData({...emiData, amount: 500000})} className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-bold py-2 rounded border border-gray-200">₹5 Lakh</button>
                        </div>

                        {emiData.interest ? (
                          <div className="-mx-6">
                            <EmiCalculator 
                              initialLoanAmount={emiData.amount} 
                              initialInterest={emiData.interest} 
                            />
                          </div>
                        ) : (
                          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
                            <p className="text-gray-600 font-medium">{t('varies_by_lender')}</p>
                            <p className="text-sm text-gray-400 mt-2">{t('emi_not_available')}</p>
                          </div>
                        )}
                        
                        <p className="text-xs text-gray-400 mt-6 text-center">
                          {t('actual_rate_varies')}
                        </p>
                      </section>
                    )}
                  </motion.div>
                )}

            {activeTab === 'application' && (
              <motion.div key="application" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
                <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-6">How To Apply</h2>
                  <div className="relative">
                    <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-gray-100"></div>
                    <div className="space-y-6 relative">
                      <div className="flex items-start">
                        <div className="h-8 w-8 rounded-full bg-blue-50 border-2 border-primary flex items-center justify-center text-primary font-bold text-xs mr-4 z-10 flex-shrink-0">01</div>
                        <div className="pt-1.5">
                          <p className="text-sm font-bold text-gray-900">Check Eligibility</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="h-8 w-8 rounded-full bg-blue-50 border-2 border-primary flex items-center justify-center text-primary font-bold text-xs mr-4 z-10 flex-shrink-0">02</div>
                        <div className="pt-1.5">
                          <p className="text-sm font-bold text-gray-900">Prepare Documents</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="h-8 w-8 rounded-full bg-blue-50 border-2 border-primary flex items-center justify-center text-primary font-bold text-xs mr-4 z-10 flex-shrink-0">03</div>
                        <div className="pt-1.5">
                          <p className="text-sm font-bold text-gray-900">Fill Application</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="h-8 w-8 rounded-full bg-gray-50 border-2 border-gray-200 flex items-center justify-center text-gray-400 font-bold text-xs mr-4 z-10 flex-shrink-0">04</div>
                        <div className="pt-1.5">
                          <p className="text-sm font-bold text-gray-400">Track Application</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
                
                <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100 flex flex-col sm:flex-row items-center justify-between">
                  <div className="mb-4 sm:mb-0">
                    <h4 className="font-bold text-gray-900 flex items-center mb-1">
                      <MapPin className="h-5 w-5 text-primary mr-2" /> Find Nearest Partner
                    </h4>
                    <p className="text-sm text-gray-600">Locate physical branches for assistance.</p>
                  </div>
                  <a href="/partner-locator" target="_blank" className="bg-white text-primary border border-blue-200 font-bold px-4 py-2 rounded-xl hover:bg-blue-50 flex items-center shadow-sm">
                    Open Locator <ExternalLink className="h-4 w-4 ml-2" />
                  </a>
                </div>
              </motion.div>
            )}

            {activeTab === 'details' && (
              <motion.div key="details" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
                <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <button 
                    onClick={() => setIsDetailedInfoOpen(!isDetailedInfoOpen)}
                    className="w-full flex justify-between items-center p-6 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <h2 className="text-sm font-bold text-gray-900 flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-primary" /> Detailed Information
                    </h2>
                    {isDetailedInfoOpen ? <ChevronUp className="h-5 w-5 text-gray-500" /> : <ChevronDown className="h-5 w-5 text-gray-500" />}
                  </button>
                  
                  {isDetailedInfoOpen && (
                    <div className="p-6 border-t border-gray-100 text-sm text-gray-600 leading-relaxed space-y-4">
                      <h3 className="font-bold text-gray-900 text-sm">Overview & Background</h3>
                      <p>This section contains detailed institutional guidelines and technical specifications extracted from the raw government dataset. The primary objective is socio-economic upliftment through structured financial interventions.</p>
                      
                      <h3 className="font-bold text-gray-900 text-sm mt-4">Geographical Coverage</h3>
                      <p className="flex items-center"><MapPin className="h-4 w-4 mr-2 text-gray-400" /> Pan-India implementation across all designated districts and rural blocks.</p>
                      
                      <h3 className="font-bold text-gray-900 text-sm mt-4">Implementation & Administration</h3>
                      <ul className="list-disc pl-5 space-y-1">
                        <li><strong>Ministry:</strong> Relevant Central/State Ministry</li>
                        <li><strong>Nodal Agency:</strong> State Channelizing Agencies (SCAs)</li>
                        <li><strong>Partner Banks:</strong> Public Sector Banks, RRBs, Cooperative Banks</li>
                      </ul>
                      
                      <h3 className="font-bold text-gray-900 text-sm mt-4">Sources</h3>
                      <p className="text-xs text-gray-400 break-all">{scheme.source_file || 'Data aggregated from official public datasets.'}</p>
                    </div>
                  )}
                </section>
              </motion.div>
            )}
              </>
            )}
          </AnimatePresence>
        </div>
        
        {/* Modal Footer */}
        <div className="p-4 sm:p-6 bg-white border-t border-gray-100 flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 relative z-10 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)]">
          <div className="flex space-x-3 w-full sm:w-auto">
            <button className="flex-1 sm:flex-none flex items-center justify-center p-3 sm:px-4 sm:py-2.5 border border-gray-200 shadow-sm text-sm font-bold rounded-xl text-gray-700 bg-gray-50 hover:bg-gray-100">
              <Share2 className="h-5 w-5 sm:h-4 sm:w-4 sm:mr-2" /> <span className="hidden sm:inline">{t('share')}</span>
            </button>
            <button 
              onClick={onSave}
              className={`flex-1 sm:flex-none flex items-center justify-center p-3 sm:px-5 sm:py-2.5 shadow-sm text-sm font-bold rounded-xl transition-colors ${isSaved ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}
            >
              {isSaved ? (
                <><CheckCircle2 className="h-5 w-5 sm:h-4 sm:w-4 sm:mr-2 text-amber-600" /> <span className="hidden sm:inline">Saved</span></>
              ) : (
                <><Bookmark className="h-5 w-5 sm:h-4 sm:w-4 sm:mr-2" /> <span className="hidden sm:inline">{t('save')}</span></>
              )}
            </button>
          </div>
          <button 
            onClick={async () => {
              if (isApplied || isApplying) return;
              setIsApplying(true);
              try {
                await onApply();
              } finally {
                setIsApplying(false);
              }
            }}
            disabled={isApplied || isApplying}
            className={`w-full sm:w-auto flex items-center justify-center px-8 py-3.5 sm:py-2.5 border border-transparent text-sm font-bold rounded-xl transition-all ${
              isApplied 
                ? 'bg-green-500 text-white shadow-md' 
                : isApplying
                  ? 'bg-blue-400 text-white cursor-not-allowed'
                  : 'text-white bg-primary hover:bg-blue-800 shadow-lg shadow-blue-500/30'
            }`}
          >
            {isApplied ? (
              <><CheckCircle2 className="h-5 w-5 mr-2" /> Already Applied</>
            ) : isApplying ? (
              <><span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span> Applying...</>
            ) : (
              <>{t('apply_now')} <ChevronRight className="h-5 w-5 ml-1" /></>
            )}
          </button>
        </div>

      </motion.div>
    </div>
  );
}
