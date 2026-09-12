import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { 
  Globe, Bell, UserCircle, Menu, X, LogOut, 
  Home, LayoutDashboard, Bookmark, FileText, BookOpen,
  CheckCircle2, Clock, XCircle, Star, Settings, HelpCircle
} from 'lucide-react';

export default function Header({ profile, onOpenSettings }) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Schemes', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Saved', path: '/dashboard#saved', icon: Bookmark },
    { name: 'Applications', path: '/dashboard#applications', icon: FileText },
    { name: 'Resources', path: '/partner-locator', icon: BookOpen },
  ];

  return (
    <>
      <header className="bg-primary text-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left side: Hamburger & Logo */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              {/* Hamburger Menu Button */}
              <button 
                onClick={() => setIsDrawerOpen(true)}
                className="p-1.5 text-blue-200 hover:text-white rounded-md hover:bg-blue-800/50 transition-colors"
              >
                <Menu className="h-7 w-7" />
              </button>

              <div className="flex flex-col flex-shrink-0 cursor-pointer" onClick={() => navigate('/')}>
                <div className="flex items-center">
                  <span className="text-xl font-bold tracking-tight text-white">Scheme</span>
                  <span className="text-xl font-light text-blue-200">Matcher</span>
                </div>
                <span className="text-[10px] text-blue-200 hidden sm:block tracking-wider uppercase">Right Scheme. Brighter Tomorrow.</span>
              </div>
            </div>

            {/* Right Side Tools */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              {/* Language Selector */}
              <div className="flex items-center space-x-1 bg-blue-800/50 rounded-lg px-2 py-1 border border-blue-700/50 hidden sm:flex">
                <Globe className="h-4 w-4 text-blue-200" />
                <select 
                  className="bg-transparent border-none text-xs sm:text-sm text-white focus:ring-0 cursor-pointer p-0 pr-4 appearance-none"
                  value={i18n.language}
                  onChange={(e) => i18n.changeLanguage(e.target.value)}
                >
                  <option value="en" className="text-gray-900">EN - English</option>
                  <option value="hi" className="text-gray-900">HI - हिंदी</option>
                  <option value="te" className="text-gray-900">TE - తెలుగు</option>
                  <option value="bn" className="text-gray-900">BN - বাংলা</option>
                </select>
              </div>

              {/* Notifications */}
              <button className="p-1.5 text-blue-200 hover:text-white hover:bg-blue-800/50 rounded-full transition-colors relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 border border-primary"></span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Slide-out Drawer Overlay */}
      <div 
        className={`fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${isDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsDrawerOpen(false)}
      ></div>
      
      {/* Drawer Content */}
      <div className={`fixed top-0 left-0 bottom-0 z-50 w-full max-w-[340px] sm:max-w-sm bg-white shadow-2xl flex flex-col overflow-y-auto transform transition-transform duration-300 ease-in-out border-r border-gray-200 ${isDrawerOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/80">
              <span className="text-lg font-bold text-gray-900 tracking-tight">Menu</span>
              <button 
                onClick={() => setIsDrawerOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="flex-1 px-4 py-6 space-y-8">
              {/* MAIN */}
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 px-2">{t('menu_main')}</h3>
                <div className="space-y-1">
                  <button onClick={() => { setIsDrawerOpen(false); navigate('/'); }} className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${location.pathname === '/' ? 'bg-blue-50 text-primary' : 'text-gray-700 hover:bg-blue-50 hover:text-primary'}`}>
                    <Home className={`h-5 w-5 mr-3 ${location.pathname === '/' ? 'text-primary' : 'text-gray-400'}`} /> {t('menu_home')}
                  </button>
                  <button onClick={() => { setIsDrawerOpen(false); navigate('/dashboard'); }} className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${location.pathname === '/dashboard' && !location.hash ? 'bg-blue-50 text-primary' : 'text-gray-700 hover:bg-blue-50 hover:text-primary'}`}>
                    <LayoutDashboard className={`h-5 w-5 mr-3 ${location.pathname === '/dashboard' && !location.hash ? 'text-primary' : 'text-gray-400'}`} /> {t('menu_schemes')}
                  </button>
                  <button onClick={() => { setIsDrawerOpen(false); navigate('/dashboard#saved'); }} className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${location.hash === '#saved' ? 'bg-blue-50 text-primary' : 'text-gray-700 hover:bg-blue-50 hover:text-primary'}`}>
                    <Bookmark className={`h-5 w-5 mr-3 ${location.hash === '#saved' ? 'text-blue-500' : 'text-gray-400'}`} /> {t('menu_saved')}
                  </button>
                  <button onClick={() => { setIsDrawerOpen(false); navigate('/dashboard#applications'); }} className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${location.hash.startsWith('#applications') ? 'bg-blue-50 text-primary' : 'text-gray-700 hover:bg-blue-50 hover:text-primary'}`}>
                    <FileText className={`h-5 w-5 mr-3 ${location.hash.startsWith('#applications') ? 'text-primary' : 'text-gray-400'}`} /> {t('menu_applications')}
                  </button>
                  <button onClick={() => { setIsDrawerOpen(false); navigate('/partner-locator'); }} className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${location.pathname === '/partner-locator' ? 'bg-blue-50 text-primary' : 'text-gray-700 hover:bg-blue-50 hover:text-primary'}`}>
                    <BookOpen className={`h-5 w-5 mr-3 ${location.pathname === '/partner-locator' ? 'text-primary' : 'text-gray-400'}`} /> {t('menu_resources')}
                  </button>
                </div>
              </div>

              {/* APPLICATION STATUS */}
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 px-2">{t('menu_app_status')}</h3>
                <div className="space-y-1">
                  <button onClick={() => { setIsDrawerOpen(false); navigate('/dashboard#applications'); }} className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${location.hash === '#applications' ? 'bg-blue-50 text-primary' : 'text-gray-700 hover:bg-blue-50 hover:text-primary'}`}>
                    <FileText className="h-5 w-5 mr-3 text-gray-400" /> {t('menu_all_apps')}
                  </button>
                  <button onClick={() => { setIsDrawerOpen(false); navigate('/dashboard#applications=UNDER_REVIEW'); }} className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${location.hash === '#applications=UNDER_REVIEW' ? 'bg-blue-50 text-primary' : 'text-gray-700 hover:bg-blue-50 hover:text-primary'}`}>
                    <Clock className="h-5 w-5 mr-3 text-amber-500" /> {t('menu_under_review')}
                  </button>
                  <button onClick={() => { setIsDrawerOpen(false); navigate('/dashboard#applications=APPROVED'); }} className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${location.hash === '#applications=APPROVED' ? 'bg-blue-50 text-primary' : 'text-gray-700 hover:bg-blue-50 hover:text-primary'}`}>
                    <CheckCircle2 className="h-5 w-5 mr-3 text-green-500" /> {t('menu_approved')}
                  </button>
                  <button onClick={() => { setIsDrawerOpen(false); navigate('/dashboard#applications=REJECTED'); }} className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${location.hash === '#applications=REJECTED' ? 'bg-blue-50 text-primary' : 'text-gray-700 hover:bg-blue-50 hover:text-primary'}`}>
                    <XCircle className="h-5 w-5 mr-3 text-red-500" /> {t('menu_rejected')}
                  </button>
                </div>
              </div>

              {/* ACCOUNT */}
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 px-2">{t('menu_account')}</h3>
                <div className="space-y-1">
                  <button 
                    onClick={() => { setIsDrawerOpen(false); if(onOpenSettings) onOpenSettings(); }}
                    className="w-full flex items-center px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-primary rounded-lg transition-colors"
                  >
                    <UserCircle className="h-5 w-5 mr-3 text-gray-400" /> {t('menu_my_profile')}
                  </button>
                  <button 
                    onClick={() => { setIsDrawerOpen(false); if(onOpenSettings) onOpenSettings(); }}
                    className="w-full flex items-center px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-primary rounded-lg transition-colors"
                  >
                    <Settings className="h-5 w-5 mr-3 text-gray-400" /> {t('menu_settings')}
                  </button>
                  {profile && (
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors"
                    >
                      <LogOut className="h-5 w-5 mr-3 text-red-500" /> {t('menu_logout')}
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-100 bg-gray-50 mt-auto">
              {!profile && (
                <button 
                  onClick={() => navigate('/login')}
                  className="w-full flex justify-center items-center px-4 py-3 text-sm font-bold text-white bg-primary hover:bg-blue-800 rounded-xl transition-colors"
                >
                  <UserCircle className="h-5 w-5 mr-2" /> Sign In
                </button>
              )}
            </div>
          </div>
    </>
  );
}
