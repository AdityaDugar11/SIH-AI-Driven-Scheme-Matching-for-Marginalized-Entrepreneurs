import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight, ChevronLeft } from 'lucide-react';

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'male',
    income: '',
    caste: 'General',
    locality: '',
    education: '10th Pass',
    projectType: '',
    estimatedCost: '',
    // New fields
    state: '',
    city: '',
    area_of_residence: 'Urban',
    is_pvtg: false,
    is_dnt: false,
    has_disability: false,
    is_minority: false,
    is_student: false,
    is_bpl: false,
    parent_income: ''
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleNext = () => setStep((prev) => Math.min(prev + 1, 4));
  const handlePrev = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step < 4) {
      handleNext();
      return;
    }

    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Bulletproof cleanup for numeric fields
      const payload = { ...formData };
      payload.parent_income = payload.parent_income ? Number(payload.parent_income) : null;
      payload.income = payload.income ? Number(payload.income) : null;
      payload.age = payload.age ? Number(payload.age) : null;
      payload.estimatedCost = payload.estimatedCost ? Number(payload.estimatedCost) : null;

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          ...payload,
          updated_at: new Date()
        });
        
      if (!error) {
        navigate('/dashboard');
      } else {
        console.error("Supabase Error:", error);
        alert(`Error: ${error.message}\n\nHint: ${error.hint || error.details || 'Check if you ran the latest SQL script in Supabase.'}`);
      }
    }
    setLoading(false);
  };

  const progress = (step / 4) * 100;

  return (
    <div className="min-h-screen bg-background flex flex-col pt-12 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full mx-auto">
        
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-500">Step {step} of 4</span>
            <span className="text-sm font-medium text-primary">{Math.round(progress)}% Completed</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-primary h-2.5 rounded-full transition-all duration-500 ease-out" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-2xl p-6 sm:p-10 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {step === 1 && "Personal Details"}
            {step === 2 && "Location Information"}
            {step === 3 && "Socio-Economic Background"}
            {step === 4 && "Your Business / Project"}
          </h2>

          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                
                {/* STEP 1 */}
                {step === 1 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Full Name</label>
                      <input type="text" name="name" required value={formData.name} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary focus:border-primary sm:text-sm" placeholder="John Doe" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Age</label>
                        <input type="number" name="age" required value={formData.age} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary focus:border-primary sm:text-sm" placeholder="25" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Gender</label>
                        <select name="gender" value={formData.gender} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary focus:border-primary sm:text-sm">
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="pt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <label className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg border border-gray-200 cursor-pointer">
                        <input type="checkbox" name="is_student" checked={formData.is_student} onChange={handleChange} className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" />
                        <span className="text-sm font-medium text-gray-900">I am a Student</span>
                      </label>
                      <label className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg border border-gray-200 cursor-pointer">
                        <input type="checkbox" name="is_minority" checked={formData.is_minority} onChange={handleChange} className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" />
                        <span className="text-sm font-medium text-gray-900">Minority Community</span>
                      </label>
                      <label className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg border border-gray-200 cursor-pointer sm:col-span-2">
                        <input type="checkbox" name="has_disability" checked={formData.has_disability} onChange={handleChange} className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" />
                        <span className="text-sm font-medium text-gray-900">Person with Disability (Divyangjan)</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* STEP 2 */}
                {step === 2 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">State</label>
                        <input type="text" name="state" required value={formData.state} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary focus:border-primary sm:text-sm" placeholder="e.g. Uttar Pradesh" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">City / District</label>
                        <input type="text" name="city" required value={formData.city} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary focus:border-primary sm:text-sm" placeholder="e.g. Lucknow" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Specific Locality / Village</label>
                      <input type="text" name="locality" required value={formData.locality} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary focus:border-primary sm:text-sm" placeholder="e.g. Alambagh" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Area of Residence</label>
                      <select name="area_of_residence" value={formData.area_of_residence} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary focus:border-primary sm:text-sm">
                        <option value="Urban">Urban</option>
                        <option value="Rural">Rural</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* STEP 3 */}
                {step === 3 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Social Category (Caste)</label>
                      <select name="caste" value={formData.caste} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary focus:border-primary sm:text-sm">
                        <option value="SC">Scheduled Caste (SC)</option>
                        <option value="ST">Scheduled Tribe (ST)</option>
                        <option value="OBC">Other Backward Class (OBC)</option>
                        <option value="General">General</option>
                      </select>
                    </div>
                    
                    <div className="pt-1 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <label className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg border border-gray-200 cursor-pointer">
                        <input type="checkbox" name="is_pvtg" checked={formData.is_pvtg} onChange={handleChange} className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" />
                        <span className="text-sm font-medium text-gray-900">PVTG Member</span>
                      </label>
                      <label className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg border border-gray-200 cursor-pointer">
                        <input type="checkbox" name="is_dnt" checked={formData.is_dnt} onChange={handleChange} className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" />
                        <span className="text-sm font-medium text-gray-900">DNT Community</span>
                      </label>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Your Annual Income (₹)</label>
                        <input type="number" name="income" required value={formData.income} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary focus:border-primary sm:text-sm" placeholder="e.g. 250000" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Parent's Income (₹)</label>
                        <input type="number" name="parent_income" value={formData.parent_income} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary focus:border-primary sm:text-sm" placeholder="Optional" />
                      </div>
                    </div>
                    
                    <label className="flex items-center space-x-3 mt-2">
                        <input type="checkbox" name="is_bpl" checked={formData.is_bpl} onChange={handleChange} className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" />
                        <span className="text-sm font-medium text-gray-900">I have a BPL (Below Poverty Line) Card</span>
                    </label>
                  </div>
                )}

                {/* STEP 4 */}
                {step === 4 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Highest Education Status</label>
                      <select name="education" value={formData.education} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary focus:border-primary sm:text-sm">
                        <option value="Below 10th">Below 10th</option>
                        <option value="10th Pass">10th Pass</option>
                        <option value="12th Pass">12th Pass</option>
                        <option value="Graduate">Graduate</option>
                        <option value="Post Graduate">Post Graduate</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Project / Business Type</label>
                      <select name="projectType" value={formData.projectType} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary focus:border-primary sm:text-sm">
                        <option value="">Select an option</option>
                        <option value="Agriculture">Agriculture & Allied</option>
                        <option value="Manufacturing">Manufacturing / MSME</option>
                        <option value="Service">Service Sector</option>
                        <option value="Education">Education / Skill Training</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Estimated Project Cost (₹)</label>
                      <input type="number" name="estimatedCost" required value={formData.estimatedCost} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary focus:border-primary sm:text-sm" placeholder="e.g. 500000" />
                    </div>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>

            <div className="mt-8 flex justify-between">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  <ChevronLeft className="mr-2 -ml-1 h-5 w-5" aria-hidden="true" />
                  Back
                </button>
              ) : <div></div>}

              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                {step < 4 ? (
                  <>
                    Next
                    <ChevronRight className="ml-2 -mr-1 h-5 w-5" aria-hidden="true" />
                  </>
                ) : (
                  <>
                    {loading ? 'Saving...' : 'Finish Setup'}
                    {!loading && <Check className="ml-2 -mr-1 h-5 w-5" aria-hidden="true" />}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
