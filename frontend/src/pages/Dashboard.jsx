import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Filter, CheckCircle2, XCircle, AlertTriangle, ChevronRight, Download, Search, Sparkles, Globe, UserCog, Save, Trash2, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import ChatWidget from '../components/ChatWidget';
import EmiCalculator from '../components/EmiCalculator';
import Header from '../components/Header';
import SchemeCard from '../components/SchemeCard';
import SchemeModal from '../components/SchemeModal';
import { MapPin, FileText, Bookmark, ArrowRight, ExternalLink } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [interestedSchemes, setInterestedSchemes] = useState([]); // Kept for backwards compatibility
  const [applications, setApplications] = useState([]);
  const [schemes, setSchemes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [visibleSchemeIds, setVisibleSchemeIds] = useState(null); // null means show all
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsFormData, setSettingsFormData] = useState({});
  const [selectedScheme, setSelectedScheme] = useState(null);

  const handleInterest = async (schemeId, schemeName) => {
    if (!interestedSchemes.includes(schemeId)) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        // Optimistic UI update
        setInterestedSchemes([...interestedSchemes, schemeId]);
        
        // 1. Save to Supabase `applications` table
        const newApp = {
          user_id: user.id,
          scheme_id: schemeId,
          scheme_name: schemeName,
          status: 'APPLIED',
          requested_amount: 500000 // default or from state
        };
        const { data: insertedApp, error: dbError } = await supabase
          .from('applications')
          .insert([newApp])
          .select()
          .single();
          
        if (dbError) throw dbError;
        
        // Update local state to reflect new application immediately
        setApplications(prev => [insertedApp, ...prev]);

        // 2. Call backend webhook for email
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
        
        alert("Application submitted successfully.");
      } catch (err) {
        console.error("Application failed:", err);
        alert("Unable to submit application. Please try again.");
        // Rollback optimistic update
        setInterestedSchemes(interestedSchemes.filter(id => id !== schemeId));
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
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (data) {
        setApplications(data);
        // Sync with legacy state
        setInterestedSchemes(data.map(app => app.scheme_id));
      }
    }
  };

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (data) {
        const enrichedProfile = { ...data, email: user.email };
        setProfile(enrichedProfile);
        await fetchSchemes(enrichedProfile);
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

  const currentView = location.hash.split('=')[0] || '';
  const currentFilter = location.hash.includes('=') ? location.hash.split('=')[1] : 'ALL';

  const displayedApplications = currentFilter === 'ALL' 
    ? applications 
    : applications.filter(app => app.status === currentFilter);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header profile={profile} onOpenSettings={handleOpenSettings} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-900 to-primary rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden flex flex-col lg:flex-row items-center justify-between">
          <div className="relative z-10 w-full lg:w-3/5 lg:pr-8 mb-10 lg:mb-0">
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-4 leading-tight">
              {t('find_schemes_title')}
            </h1>
            <p className="text-lg text-blue-100 mb-8 leading-relaxed">
              {t('find_schemes_desc')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <button 
                onClick={() => document.getElementById('ai-search').focus()}
                className="bg-white text-primary px-6 py-3 rounded-xl font-bold hover:bg-gray-50 transition-colors shadow-sm"
              >
                Find My Schemes
              </button>
              <button 
                onClick={handleOpenSettings}
                className="bg-blue-800/50 text-white border border-blue-400/30 px-6 py-3 rounded-xl font-bold hover:bg-blue-700/50 transition-colors backdrop-blur-sm"
              >
                Edit My Profile
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm font-medium text-blue-100">
              <div className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-green-400" /> {t('hero_personalized')}</div>
              <div className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-green-400" /> {t('hero_eligibility')}</div>
              <div className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-green-400" /> {t('hero_docs')}</div>
              <div className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-green-400" /> {t('hero_assistance')}</div>
            </div>
          </div>
          
          {/* User Profile Card Inside Hero */}
          <div className="relative z-10 w-full lg:w-2/5 flex justify-center lg:justify-end">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 w-full max-w-sm shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <UserCog className="h-5 w-5 text-blue-200 mr-2" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">{t('your_profile')}</h3>
                </div>
                <button onClick={handleOpenSettings} className="text-xs font-bold text-blue-300 hover:text-white transition-colors">{t('edit')} →</button>
              </div>

              <div className="flex items-center mb-6">
                <div className="relative h-16 w-16 mr-4 flex-shrink-0">
                  <svg className="h-full w-full transform -rotate-90" viewBox="0 0 36 36">
                    <path className="text-white/20" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                    <path className="text-green-400" strokeDasharray="100, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold text-white">100%</span>
                  </div>
                </div>
                <div>
                  <p className="text-lg font-bold text-white">{profile?.name || 'User'}</p>
                  <p className="text-xs text-blue-200">{t('profile_complete')}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                  <span className="text-xs text-blue-200">{t('income_range')}</span>
                  <span className="text-sm font-medium text-white">₹{profile?.income || '0'}</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                  <span className="text-xs text-blue-200">{t('category')}</span>
                  <span className="text-sm font-medium text-white">{profile?.caste || 'General'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-blue-200">{t('business_type')}</span>
                  <span className="text-sm font-medium text-white">{profile?.projectType || 'Service'}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Decorative shapes */}
          <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 right-1/4 translate-y-1/2 w-64 h-64 bg-blue-400/20 rounded-full blur-2xl pointer-events-none"></div>
        </section>

        {/* Dashboard Summary Stats */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center">
            <div className="bg-blue-50 p-3 rounded-xl mr-4"><Sparkles className="h-6 w-6 text-primary" /></div>
            <div><p className="text-2xl font-bold text-gray-900">{schemes.length}</p><p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">{t('matching_schemes')}</p></div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center">
            <div className="bg-green-50 p-3 rounded-xl mr-4"><CheckCircle2 className="h-6 w-6 text-green-600" /></div>
            <div><p className="text-2xl font-bold text-gray-900">{schemes.filter(s => s.match >= 80).length}</p><p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">{t('highly_eligible')}</p></div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center">
            <div className="bg-amber-50 p-3 rounded-xl mr-4"><Bookmark className="h-6 w-6 text-amber-500" /></div>
            <div><p className="text-2xl font-bold text-gray-900">{interestedSchemes.length}</p><p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">{t('saved_schemes')}</p></div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center">
            <div className="bg-purple-50 p-3 rounded-xl mr-4"><FileText className="h-6 w-6 text-purple-600" /></div>
            <div><p className="text-2xl font-bold text-gray-900">{applications.length}</p><p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">{t('active_applications')}</p></div>
          </div>
        </section>



        {/* Conditionally render Schemes or Applications */}
        {currentView !== '#applications' && (
          <>
        {/* Filters */}
        <section>
          <div className="flex items-center space-x-2 mb-4 overflow-x-auto pb-2">
            <Filter className="h-5 w-5 text-gray-400 mr-2" />
            {['All', 'Central', 'State', 'Agriculture', 'MSME', 'Business Loans', 'Education', 'Employment', 'Healthcare', 'Housing', 'Women', 'Social Welfare'].map((filter) => (
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
        <section className="mb-8 relative z-20">
          <form onSubmit={handleSearch} className="relative max-w-4xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <Sparkles className="h-6 w-6 text-primary animate-pulse" />
            </div>
            <input
              id="ai-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tell us what you need... Example: I need a ₹5 lakh loan to start a dairy business"
              className="w-full pl-14 pr-36 py-5 border-2 border-gray-100 rounded-2xl shadow-lg focus:ring-4 focus:ring-blue-100 focus:border-primary text-gray-900 text-lg transition-all"
            />
            <div className="absolute inset-y-0 right-2 flex items-center">
              <button 
                type="submit"
                disabled={isSearching}
                className="bg-primary hover:bg-blue-800 text-white px-8 py-3 rounded-xl text-sm font-bold transition-all shadow-md hover:shadow-lg flex items-center"
              >
                {isSearching ? 'Searching...' : '✨ Ask AI'}
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
            <SchemeCard 
              key={scheme.id} 
              scheme={scheme} 
              idx={idx} 
              onViewMore={setSelectedScheme} 
            />
          ))}

          {filteredSchemes.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              {t('no_schemes')}
            </div>
          )}
        </section>

        {/* Saved Schemes Section */}
        <section id="saved" className="pt-10 border-t border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Bookmark className="h-6 w-6 mr-2 text-amber-500" /> Saved Schemes
            </h2>
          </div>
          {interestedSchemes.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 border-dashed p-8 text-center">
              <Bookmark className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">You haven't saved any schemes yet.</p>
              <p className="text-sm text-gray-400 mt-1">Click "Save" on a scheme to easily find it later.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {interestedSchemes.map((scheme, idx) => (
                <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-gray-900">{scheme.name}</h3>
                    <p className="text-sm text-gray-500">Match: {scheme.match}%</p>
                  </div>
                  <button 
                    onClick={() => setSelectedScheme(scheme)}
                    className="text-primary font-bold text-sm hover:text-blue-800"
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
        </>
        )}

        {/* Applications Tracker Section */}
        {(currentView === '#applications' || currentView === '') && (
        <section id="applications" className="pt-10 border-t border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <FileText className="h-6 w-6 mr-2 text-purple-500" /> Application Tracker {currentFilter !== 'ALL' && `- ${currentFilter}`}
            </h2>
          </div>
          {displayedApplications.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 border-dashed p-8 text-center">
              <FileText className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No active applications found.</p>
              <p className="text-sm text-gray-400 mt-1">Apply for a scheme to track its status here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {displayedApplications.map((app) => (
                <div key={app.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">{app.scheme_name}</h3>
                      <p className="text-sm text-gray-500">Application ID: {app.id.substring(0,8).toUpperCase()}</p>
                    </div>
                    <span className={`px-3 py-1 text-xs font-bold rounded-full border ${app.status === 'APPLIED' ? 'bg-blue-50 text-primary border-blue-100' : app.status === 'APPROVED' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                      {app.status}
                    </span>
                  </div>
                  
                  {/* Status Timeline */}
                  <div className="relative pt-2">
                    <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-100 z-0"></div>
                    <div className="relative z-10 flex justify-between">
                      <div className="flex flex-col items-center">
                        <div className="h-4 w-4 bg-primary rounded-full mb-2 ring-4 ring-white"></div>
                        <span className="text-xs font-bold text-gray-900">Submitted</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className={`h-4 w-4 rounded-full mb-2 ring-4 ring-white ${['UNDER_REVIEW', 'APPROVED', 'REJECTED'].includes(app.status) ? 'bg-primary' : 'bg-gray-200 animate-pulse'}`}></div>
                        <span className={`text-xs font-bold ${['UNDER_REVIEW', 'APPROVED', 'REJECTED'].includes(app.status) ? 'text-gray-900' : 'text-primary'}`}>Partner Review</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className={`h-4 w-4 rounded-full mb-2 ring-4 ring-white ${['APPROVED'].includes(app.status) ? 'bg-green-500' : app.status === 'REJECTED' ? 'bg-red-500' : 'bg-gray-200'}`}></div>
                        <span className={`text-xs font-medium ${['APPROVED'].includes(app.status) ? 'text-green-600' : app.status === 'REJECTED' ? 'text-red-600' : 'text-gray-400'}`}>Decision</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="h-4 w-4 bg-gray-200 rounded-full mb-2 ring-4 ring-white"></div>
                        <span className="text-xs font-medium text-gray-400">Disbursed</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
        )}

      </main>
      <ChatWidget />

      {selectedScheme && (
        <SchemeModal 
          scheme={selectedScheme}
          profile={profile}
          onClose={() => setSelectedScheme(null)}
          isSaved={interestedSchemes.includes(selectedScheme.id)}
          isApplied={applications.some(app => app.scheme_id === selectedScheme.id)}
          onSave={() => handleInterest(selectedScheme.id, selectedScheme.name)}
          onApply={async () => {
            await handleInterest(selectedScheme.id, selectedScheme.name);
            setSelectedScheme(null);
            navigate('/dashboard#applications');
            setTimeout(() => {
              document.getElementById('applications')?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          }}
        />
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
