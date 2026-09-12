import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { ArrowRight, CheckCircle2, Search, FileText, CheckSquare, Sparkles } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-primary text-white py-20 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col lg:flex-row items-center">
            <div className="lg:w-1/2 lg:pr-12 text-center lg:text-left mb-12 lg:mb-0">
              <span className="inline-block py-1 px-3 rounded-full bg-blue-800 text-blue-200 text-sm font-bold tracking-wider mb-6">
                SMART INDIA HACKATHON 2026
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
                Empowering Entrepreneurs with the Right Schemes
              </h1>
              <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Navigating government loans can be confusing. SchemeMatcher uses AI to match your exact profile with schemes you are actually eligible for. No guesswork, no agent fees.
              </p>
              <div className="flex flex-col sm:flex-row justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-4">
                <button 
                  onClick={() => navigate('/signup')}
                  className="bg-white text-primary px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-50 transition-colors shadow-lg flex items-center justify-center"
                >
                  Find My Schemes <ArrowRight className="ml-2 h-5 w-5" />
                </button>
                <button 
                  onClick={() => navigate('/login')}
                  className="bg-blue-800 border border-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors shadow-lg"
                >
                  Login to Account
                </button>
              </div>
            </div>
            
            <div className="lg:w-1/2 relative">
              <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 transform rotate-1 hover:rotate-0 transition-transform duration-500">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">PM MUDRA Yojana</h3>
                    <p className="text-sm text-gray-500">Business Loan</p>
                  </div>
                  <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold flex items-center">
                    <Sparkles className="h-4 w-4 mr-1" /> 98% Match
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center text-gray-700">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-3" /> Age criteria met
                  </div>
                  <div className="flex items-center text-gray-700">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-3" /> Income criteria met
                  </div>
                  <div className="flex items-center text-gray-700">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-3" /> Business type matches
                  </div>
                </div>
                <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between items-center">
                  <div>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">Max Limit</p>
                    <p className="text-lg font-bold text-gray-900">₹10 Lakhs</p>
                  </div>
                  <button className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold">Apply Now</button>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-600/30 rounded-full blur-3xl"></div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">How SchemeMatcher Works</h2>
              <p className="text-lg text-gray-500 max-w-2xl mx-auto">A simple, transparent process to get you the financial support you need to grow your business.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center relative">
              <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gray-200 z-0"></div>
              
              <div className="relative z-10 flex flex-col items-center">
                <div className="h-24 w-24 rounded-full bg-blue-50 border-4 border-white shadow-md flex items-center justify-center mb-6">
                  <FileText className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">1. Tell us about you</h3>
                <p className="text-gray-500">Create a profile in under 2 minutes. Enter your business type, income, category, and state.</p>
              </div>
              
              <div className="relative z-10 flex flex-col items-center">
                <div className="h-24 w-24 rounded-full bg-blue-50 border-4 border-white shadow-md flex items-center justify-center mb-6">
                  <Search className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">2. AI Matching Engine</h3>
                <p className="text-gray-500">Our AI instantly filters hundreds of government schemes and finds the ones you are highly eligible for.</p>
              </div>
              
              <div className="relative z-10 flex flex-col items-center">
                <div className="h-24 w-24 rounded-full bg-blue-50 border-4 border-white shadow-md flex items-center justify-center mb-6">
                  <CheckSquare className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">3. Apply with Confidence</h3>
                <p className="text-gray-500">See exactly why you match, gather your documents, and route your lead directly to the nearest partner bank.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="bg-blue-50 py-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Ready to find your scheme?</h2>
            <p className="text-lg text-gray-600 mb-8">Join thousands of entrepreneurs who have found their perfect financial support through SchemeMatcher.</p>
            <button 
              onClick={() => navigate('/signup')}
              className="bg-primary text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-blue-800 transition-colors shadow-lg"
            >
              Get Started for Free
            </button>
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center">
              <span className="text-xl font-bold tracking-tight">Scheme</span>
              <span className="text-xl font-light text-blue-400">Matcher</span>
            </div>
            <p className="text-sm text-gray-400 mt-2">Built for SIH 2026. Empowering Marginalized Entrepreneurs.</p>
          </div>
          <div className="text-sm text-gray-400 flex space-x-6">
            <a href="#" className="hover:text-white">Privacy Policy</a>
            <a href="#" className="hover:text-white">Terms of Service</a>
            <a href="#" className="hover:text-white">Contact Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
