import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { LogOut, Filter, CheckCircle2, XCircle, AlertTriangle, ChevronRight, Download, Search, Sparkles, Globe, UserCog, Save, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import ChatWidget from '../components/ChatWidget';
import EmiCalculator from '../components/EmiCalculator';
import { MapPin } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [interestedSchemes, setInterestedSchemes] = useState([]);
  const [schemes, setSchemes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [visibleSchemeIds, setVisibleSchemeIds] = useState(null); // null means show all
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsFormData, setSettingsFormData] = useState({});
  const [selectedScheme, setSelectedScheme] = useState(null);

  const handleInterest = async (schemeId, schemeName) => {
    if (!interestedSchemes.includes(schemeId)) {
      setInterestedSchemes([...interestedSchemes, schemeId]);
      
      try {
        await fetch('http://localhost:8000/api/interest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: profile.id,
            scheme_id: schemeId,
            user_email: profile.email || 'user@example.com',
            user_name: profile.name,
            scheme_name: schemeName
          })
        });
        alert("Interest registered! Backend notified for email processing.");
      } catch (err) {
        console.error("Backend error, but recorded locally:", err);
        alert("Interest registered locally (backend unreachable).");
      }
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setVisibleSchemeIds(null);
      return;
    }
    
    setIsSearching(true);
    try {
      const response = await fetch('http://localhost:8000/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery })
      });
      const data = await response.json();
      setVisibleSchemeIds(data.matched_schemes);
    } catch (err) {
      console.error(err);
      alert("Failed to reach AI search backend. Is it running?");
    }
    setIsSearching(false);
  };

  const handleDownload = (docName) => {
    // Generate a dummy text file to simulate downloading a document
    const element = document.createElement("a");
    const file = new Blob([`This is a dummy placeholder for ${docName}.`], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${docName.replace(/\s+/g, '_')}_Template.txt`;
    document.body.appendChild(element); // Required for FireFox
    element.click();
    document.body.removeChild(element);
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (data) {
        setProfile(data);
        await fetchSchemes(data);
      } else {
        // If no profile, they haven't onboarded
        navigate('/onboarding');
      }
    }
    setLoading(false);
  };

  const fetchSchemes = async (userProfile) => {
    try {
      const response = await fetch('http://localhost:8000/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile: userProfile, lang: i18n.language })
      });
      const result = await response.json();
      setSchemes(result.schemes || []);
    } catch (err) {
      console.error("Failed to fetch schemes:", err);
      alert("Failed to load schemes. Is the Python backend running?");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleOpenSettings = () => {
    setSettingsFormData(profile);
    setIsSettingsOpen(true);
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Ensure numbers are correct type
    const updatedData = {
      ...settingsFormData,
      income: Number(settingsFormData.income),
      projectCost: Number(settingsFormData.projectCost)
    };

    const { error } = await supabase
      .from('profiles')
      .update(updatedData)
      .eq('id', profile.id);

    if (error) {
      alert("Error saving profile: " + error.message);
    } else {
      setProfile(updatedData);
      setIsSettingsOpen(false);
      await fetchSchemes(updatedData);
    }
    setLoading(false);
  };

  const handleDeleteProfile = async () => {
    if (window.confirm("Are you sure you want to delete your profile data? This will log you out.")) {
      setLoading(true);
      await supabase.from('profiles').delete().eq('id', profile.id);
      await supabase.auth.signOut();
      navigate('/login');
    }
  };


  const filteredSchemes = schemes.filter(s => {
    // 1. Check AI Search filter
    if (visibleSchemeIds !== null && !visibleSchemeIds.includes(s.id)) return false;
    // 2. Check UI chips filter
    if (activeFilter !== 'All' && s.loanType !== activeFilter && s.type !== activeFilter) return false;
    return true;
  });

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-primary text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex flex-col truncate pr-2">
            <h1 className="text-lg sm:text-xl font-bold truncate">SchemeMatcher</h1>
            <p className="text-xs text-blue-200 truncate">Hi, {profile?.name}</p>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-6 flex-shrink-0">
            <div className="flex items-center space-x-1 sm:space-x-2 bg-blue-800/50 rounded-lg px-2 py-1">
              <Globe className="h-4 w-4 sm:h-5 sm:w-5 text-blue-200" />
              <select 
                className="bg-transparent border-none text-xs sm:text-sm text-white focus:ring-0 cursor-pointer p-0 pr-6"
                value={i18n.language}
                onChange={(e) => i18n.changeLanguage(e.target.value)}
              >
                <option value="en" className="text-gray-900">EN</option>
                <option value="hi" className="text-gray-900">हिंदी</option>
                <option value="bn" className="text-gray-900">বাংলা</option>
                <option value="te" className="text-gray-900">తెలుగు</option>
                <option value="mr" className="text-gray-900">मराठी</option>
              </select>
            </div>
            <button onClick={handleOpenSettings} className="flex items-center text-white hover:text-gray-200 p-1">
              <UserCog className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="hidden sm:inline ml-1 text-sm font-medium">Settings</span>
            </button>
            <button onClick={handleLogout} className="flex items-center text-white hover:text-gray-200 p-1">
              <LogOut className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="hidden sm:inline ml-1 text-sm font-medium">Log out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Profile Strength & Summary */}
        <section className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm p-6 flex flex-col md:flex-row items-center justify-between border border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{t('profile_overview')}</h2>
            <p className="text-sm text-gray-500 mt-1">Income: ₹{profile?.income} • {profile?.caste} • {profile?.projectType}</p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center">
            <div className="relative h-16 w-16">
              <svg className="h-full w-full" viewBox="0 0 36 36">
                <path className="text-gray-200" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                <path className="text-secondary" strokeDasharray="100, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-gray-900">100%</span>
              </div>
            </div>
            <span className="ml-3 text-sm font-medium text-gray-700">{t('profile_complete')}</span>
          </div>
        </section>

        {/* Filters */}
        <section>
          <div className="flex items-center space-x-2 mb-4 overflow-x-auto pb-2">
            <Filter className="h-5 w-5 text-gray-400 mr-2" />
            {['All', 'Central', 'State', 'Micro Finance', 'Term Loan'].map((filter) => (
              <button
                key={filter}
                onClick={() => { setActiveFilter(filter); setVisibleSchemeIds(null); setSearchQuery(''); }}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  activeFilter === filter && !visibleSchemeIds
                    ? 'bg-primary text-white'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {t(`filters.${filter}`)}
              </button>
            ))}
          </div>
        </section>

        {/* AI Natural Language Search */}
        <section className="mb-8">
          <form onSubmit={handleSearch} className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Sparkles className="h-5 w-5 text-secondary" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('search_placeholder')}
              className="w-full pl-11 pr-32 py-4 border border-gray-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-primary focus:border-primary text-gray-900"
            />
            <div className="absolute inset-y-0 right-2 flex items-center">
              <button 
                type="submit"
                disabled={isSearching}
                className="bg-primary hover:bg-blue-800 text-white px-6 py-2 rounded-xl text-sm font-medium transition-colors"
              >
                {isSearching ? t('searching') : t('ai_search')}
              </button>
            </div>
          </form>
        </section>

        {/* EMI Calculator removed from main view */}

        {/* Scheme Cards */}
        <section className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">{t('recommended')}</h2>
            <button 
              onClick={() => navigate('/partner-locator')}
              className="inline-flex items-center text-sm font-medium text-primary hover:text-blue-800"
            >
              <MapPin className="h-4 w-4 mr-1" />
              Find Nearest Partners
            </button>
          </div>
          {filteredSchemes.map((scheme, idx) => (
            <motion.div
              key={scheme.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white/90 backdrop-blur rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-5 sm:p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mb-2">
                      {scheme.type}
                    </span>
                    <h3 className="text-xl font-bold text-gray-900">{scheme.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">Max Limit: {scheme.maxLimit} • Interest: {scheme.interest}</p>
                  </div>
                  <div className={`flex flex-col items-center justify-center h-14 w-14 rounded-full ${scheme.match >= 75 ? 'bg-green-100 text-secondary' : scheme.match >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-warning'}`}>
                    <span className="text-lg font-bold">{scheme.match}%</span>
                    <span className="text-[10px] uppercase font-semibold leading-none">Match</span>
                  </div>
                </div>

                {/* Gap Analysis */}
                <div className="mt-4 bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Eligibility Analysis</h4>
                  <ul className="space-y-2">
                    {scheme.reasons.map((reason, i) => (
                      <li key={i} className="flex items-start text-sm">
                        {reason.type === 'success' && (
                          <CheckCircle2 className="h-4 w-4 text-secondary mt-0.5 mr-2 flex-shrink-0" />
                        )}
                        {reason.type === 'error' && (
                          <XCircle className="h-4 w-4 text-warning mt-0.5 mr-2 flex-shrink-0" />
                        )}
                        {reason.type === 'warning' && (
                          <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
                        )}
                        <span className={reason.type === 'error' ? 'text-gray-900 font-medium' : 'text-gray-700'}>{reason.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Document Checklist */}
                {scheme.isEligible && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                      <Download className="h-4 w-4 mr-2 text-gray-400" /> Required Documents
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {scheme.documents.map((doc, i) => (
                        <button 
                          key={i} 
                          onClick={() => handleDownload(doc)}
                          className="inline-flex items-center px-2.5 py-1 rounded border border-gray-200 text-xs font-medium text-gray-600 bg-white hover:bg-gray-50 transition-colors cursor-pointer shadow-sm"
                        >
                          <Download className="h-3 w-3 mr-1" /> {doc}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="mt-6">
                  <button 
                    onClick={() => setSelectedScheme(scheme)}
                    className="w-full bg-primary text-white py-2.5 rounded-lg text-sm font-bold hover:bg-blue-800 transition-colors flex justify-center items-center shadow-sm"
                  >
                    View More
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}

          {filteredSchemes.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              {t('no_schemes')}
            </div>
          )}
        </section>
      </main>
      <ChatWidget />

      {/* Scheme Details Modal */}
      {selectedScheme && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto pt-10 pb-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-full flex flex-col overflow-hidden my-auto border border-white/20"
          >
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/80 backdrop-blur">
              <div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 mb-1 uppercase tracking-wide">
                  {selectedScheme.type}
                </span>
                <h3 className="text-2xl font-bold text-gray-900 leading-tight">{selectedScheme.name}</h3>
              </div>
              <button onClick={() => setSelectedScheme(null)} className="text-gray-400 hover:text-gray-600 bg-white hover:bg-gray-100 shadow-sm border border-gray-200 rounded-full p-2 transition-all">
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 md:p-8 overflow-y-auto flex-1 space-y-8 bg-white">
              {/* Scheme Highlights */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50/30 rounded-2xl p-5 border border-blue-100/50 shadow-sm">
                  <p className="text-sm text-gray-500 font-medium mb-1">Maximum Loan Limit</p>
                  <p className="text-xl font-bold text-gray-900">{selectedScheme.maxLimit}</p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50/30 rounded-2xl p-5 border border-blue-100/50 shadow-sm">
                  <p className="text-sm text-gray-500 font-medium mb-1">Interest Rate</p>
                  <p className="text-xl font-bold text-gray-900">{selectedScheme.interest}</p>
                </div>
              </div>

              {/* Eligibility & Documents (from Card) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50/50 rounded-2xl p-5 border border-gray-100">
                  <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center uppercase tracking-wide">
                    <CheckCircle2 className="h-4 w-4 mr-2 text-secondary" /> Eligibility Analysis
                  </h4>
                  <ul className="space-y-3">
                    {selectedScheme.reasons.map((reason, i) => (
                      <li key={i} className="flex items-start text-sm">
                        {reason.type === 'success' && <CheckCircle2 className="h-5 w-5 text-secondary mt-0.5 mr-2 flex-shrink-0" />}
                        {reason.type === 'error' && <XCircle className="h-5 w-5 text-warning mt-0.5 mr-2 flex-shrink-0" />}
                        {reason.type === 'warning' && <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />}
                        <span className={reason.type === 'error' ? 'text-gray-900 font-medium leading-relaxed' : 'text-gray-600 leading-relaxed'}>{reason.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {selectedScheme.isEligible && (
                  <div className="bg-gray-50/50 rounded-2xl p-5 border border-gray-100">
                    <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center uppercase tracking-wide">
                      <Download className="h-4 w-4 mr-2 text-gray-400" /> Required Documents
                    </h4>
                    <div className="flex flex-col gap-3">
                      {selectedScheme.documents.map((doc, i) => (
                        <button 
                          key={i} 
                          onClick={() => handleDownload(doc)}
                          className="inline-flex justify-between items-center px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 bg-white hover:bg-blue-50 hover:border-blue-200 transition-all shadow-sm group"
                        >
                          <span className="truncate pr-4 group-hover:text-primary transition-colors">{doc}</span>
                          <Download className="h-4 w-4 flex-shrink-0 text-gray-400 group-hover:text-primary transition-colors" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Embedded EMI Calculator */}
              <div className="pt-8 mt-8 border-t border-gray-100">
                <EmiCalculator 
                  initialLoanAmount={profile?.projectCost || 500000} 
                  initialInterest={parseFloat(selectedScheme.interest) || 8.5} 
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 md:px-8 py-5 border-t border-gray-100 bg-gray-50 flex justify-end items-center">
              {interestedSchemes.includes(selectedScheme.id) ? (
                <button disabled className="w-full sm:w-auto px-8 bg-green-50 text-secondary border border-green-200 py-3.5 rounded-xl text-sm font-bold flex justify-center items-center shadow-sm">
                  Interest Registered <CheckCircle2 className="h-5 w-5 ml-2" />
                </button>
              ) : (
                <button 
                  onClick={() => {
                    handleInterest(selectedScheme.id, selectedScheme.name);
                  }}
                  className="w-full sm:w-auto px-10 bg-primary text-white py-3.5 rounded-xl text-sm font-bold hover:bg-blue-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex justify-center items-center"
                >
                  I am Interested & Apply
                  <ChevronRight className="h-5 w-5 ml-1" />
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <UserCog className="h-5 w-5 mr-2 text-primary" /> Profile Settings
              </h3>
              <button onClick={() => setIsSettingsOpen(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              <form onSubmit={handleSaveSettings} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Annual Income (₹)</label>
                  <input
                    type="number"
                    value={settingsFormData.income || ''}
                    onChange={(e) => setSettingsFormData({...settingsFormData, income: e.target.value})}
                    className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary p-2 border"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Caste Category</label>
                  <select
                    value={settingsFormData.caste || ''}
                    onChange={(e) => setSettingsFormData({...settingsFormData, caste: e.target.value})}
                    className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary p-2 border"
                    required
                  >
                    <option value="General">General</option>
                    <option value="SC">SC</option>
                    <option value="ST">ST</option>
                    <option value="OBC">OBC</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Loan Amount (₹)</label>
                  <input
                    type="number"
                    value={settingsFormData.projectCost || ''}
                    onChange={(e) => setSettingsFormData({...settingsFormData, projectCost: e.target.value})}
                    className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary p-2 border"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project Type</label>
                  <select
                    value={settingsFormData.projectType || ''}
                    onChange={(e) => setSettingsFormData({...settingsFormData, projectType: e.target.value})}
                    className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary p-2 border"
                    required
                  >
                    <option value="Agriculture">Agriculture</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Services">Services</option>
                    <option value="Retail">Retail</option>
                    <option value="Education">Education</option>
                  </select>
                </div>
                
                <div className="pt-4 flex flex-col space-y-3">
                  <button
                    type="submit"
                    className="w-full flex justify-center items-center bg-primary text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors"
                  >
                    <Save className="h-4 w-4 mr-2" /> Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteProfile}
                    className="w-full flex justify-center items-center bg-red-50 text-red-600 border border-red-200 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="h-4 w-4 mr-2" /> Delete Profile Data
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
