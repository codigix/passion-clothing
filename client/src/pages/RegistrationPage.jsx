import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FaUser, FaEnvelope, FaLock, FaPhone, FaBriefcase, FaIdBadge, FaArrowRight } from 'react-icons/fa';
import api from '../utils/api'; // use axios instance

const departments = [
  { value: 'sales', label: '📊 Sales' },
  { value: 'procurement', label: '🛒 Procurement' },
  { value: 'manufacturing', label: '🏭 Manufacturing' },
  { value: 'outsourcing', label: '🔄 Outsourcing' },
  { value: 'inventory', label: '📦 Inventory' },
  { value: 'shipment', label: '✈️ Shipment' },
  { value: 'store', label: '🏪 Store' },
  { value: 'finance', label: '💰 Finance' },
  { value: 'admin', label: '⚙️ Administration' },
  { value: 'samples', label: '🎨 Samples' }
];

// ✅ MOVED OUTSIDE: Prevent re-mounting on every render
const FormField = ({ icon: Icon, label, name, type = 'text', placeholder, required = true, value, onChange }) => (
  <div>
    <label className="block text-xs font-semibold text-slate-700 mb-1">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <div className="relative group">
      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 group-focus-within:text-blue-500 transition-colors">
        <Icon className="w-3 h-3" />
      </span>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="pl-10 pr-4 py-2 w-full border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-0 transition-colors placeholder-slate-400 text-sm"
      />
    </div>
  </div>
);

const RegistrationPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    employee_id: '',
    name: '',
    email: '',
    password: '',
    phone: '',
    department: ''
  });
  const [loading, setLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Input changed: ${name} = ${value}`); // Debug log
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted with data:', form); // Debug log
    
    if (!form.employee_id || !form.name || !form.email || !form.password || !form.department) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    if (!agreedToTerms) {
      toast.error('Please agree to the terms and conditions');
      return;
    }

    setLoading(true);

    try {
      await api.post('/auth/register', form);
      toast.success('Registration successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center py-4 px-3">
      <div className="w-full max-w-2xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mx-auto mb-2 shadow-lg">
            <span className="text-lg font-bold text-white">P</span>
          </div>
          <h1 className="text-2xl font-black text-white mb-1 tracking-tight">PASHION ERP</h1>
          <p className="text-xs text-slate-300 font-light mb-1">Create Your Account</p>
          <p className="text-xs text-slate-400">Join our clothing factory management ecosystem</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          
          {/* Header Bar */}
          <div className="h-1 bg-gradient-to-r from-blue-600 to-blue-700"></div>

          <div className="p-6 lg:p-8">
            <form onSubmit={handleSubmit} className="space-y-3">
              
              {/* Section 1: Personal Information */}
              <div>
                <div className="flex items-center gap-2 mb-3 pb-2 border-b-2 border-slate-100">
                  <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs">1</div>
                  <h3 className="text-sm font-semibold text-slate-900">Personal Information</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <FormField icon={FaIdBadge} label="Employee ID" name="employee_id" placeholder="EMP001" value={form.employee_id} onChange={handleChange} />
                  <FormField icon={FaUser} label="Full Name" name="name" placeholder="John Doe" value={form.name} onChange={handleChange} />
                </div>
              </div>

              {/* Section 2: Contact Information */}
              <div>
                <div className="flex items-center gap-2 mb-3 pb-2 border-b-2 border-slate-100">
                  <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs">2</div>
                  <h3 className="text-sm font-semibold text-slate-900">Contact Information</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <FormField icon={FaEnvelope} label="Email Address" name="email" type="email" placeholder="john@example.com" value={form.email} onChange={handleChange} />
                  <FormField icon={FaPhone} label="Phone Number" name="phone" placeholder="+91 98765 43210" required={false} value={form.phone} onChange={handleChange} />
                </div>
              </div>

              {/* Section 3: Account & Department */}
              <div>
                <div className="flex items-center gap-2 mb-3 pb-2 border-b-2 border-slate-100">
                  <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs">3</div>
                  <h3 className="text-sm font-semibold text-slate-900">Account & Department</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Password */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Password <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="relative group">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                        <FaLock className="w-3 h-3" />
                      </span>
                      <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        required
                        className="pl-10 pr-4 py-2 w-full border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-0 transition-colors placeholder-slate-400 text-sm"
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">Min. 6 characters</p>
                  </div>

                  {/* Department */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Department <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="relative group">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 group-focus-within:text-blue-500 transition-colors pointer-events-none">
                        <FaBriefcase className="w-3 h-3" />
                      </span>
                      <select
                        name="department"
                        value={form.department}
                        onChange={handleChange}
                        required
                        className="pl-10 pr-4 py-2 w-full border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-0 transition-colors text-sm appearance-none cursor-pointer bg-white"
                      >
                        <option value="">Select Department</option>
                        {departments.map(dept => (
                          <option key={dept.value} value={dept.value}>{dept.label}</option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Terms & Conditions */}
              <div className="bg-slate-50 rounded-lg p-3 mt-2">
                <label className="flex items-start gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 mt-0.5 cursor-pointer"
                  />
                  <span className="text-xs text-slate-700 group-hover:text-slate-900 transition-colors">
                    I agree to the{' '}
                    <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">Terms of Service</a>
                    {' '}and{' '}
                    <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">Privacy Policy</a>
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !agreedToTerms}
                className="w-full py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group shadow-lg hover:shadow-xl mt-3 text-sm"
              >
                {loading ? (
                  <>
                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                    Creating Account...
                  </>
                ) : (
                  <>
                    Create Account
                    <FaArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="my-3 flex items-center gap-2">
              <div className="flex-1 h-px bg-slate-200"></div>
              <span className="text-xs text-slate-500 px-2">Already registered?</span>
              <div className="flex-1 h-px bg-slate-200"></div>
            </div>

            {/* Sign In Link */}
            <div className="text-center">
              <p className="text-xs text-slate-600">
                Already have an account?{' '}
                <Link to="/login" className="text-blue-600 font-semibold hover:text-blue-700 transition-colors">
                  Sign in instead
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-400 text-xs mt-3">
          © 2024 PASHION ERP. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default RegistrationPage;