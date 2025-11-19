import React, { useState } from 'react';
import { FaEye, FaEyeSlash, FaEnvelope, FaLock, FaArrowRight, FaCheckCircle } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Input changed: ${name} = ${value}`); // Debug log
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData); // Debug log
    
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }
    
    setLoading(true);

    const result = await login(formData.email, formData.password);

    if (!result.success) {
      toast.error(result.message);
    }
    
    setLoading(false);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const features = [
    'Real-time Production Tracking',
    'Inventory Management',
    'Sales Order Processing',
    'Shipment Management'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-3">
      <div className="w-full max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-center">
          
          {/* Left Side - Branding & Features */}
          <div className="hidden lg:block text-white">
            <div className="mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-3 shadow-lg">
                <span className="text-xl font-bold">P</span>
              </div>
              <h1 className="text-3xl font-black mb-1 tracking-tight">PASHION ERP</h1>
              <p className="text-sm text-slate-300 font-light">Clothing Factory Management</p>
            </div>

            <div className="space-y-3">
              <p className="text-slate-300 text-xs leading-relaxed">
                Streamline your entire clothing manufacturing operations with our comprehensive ERP solution.
              </p>
              
              {features.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <div className="flex-shrink-0 mt-0.5">
                    <FaCheckCircle className="w-4 h-4 text-green-400" />
                  </div>
                  <span className="text-slate-200 font-medium text-xs">{feature}</span>
                </div>
              ))}
            </div>

            {/* Bottom Stats */}
            <div className="mt-6 pt-4 border-t border-slate-700">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xl font-bold text-blue-400">1000+</p>
                  <p className="text-slate-400 text-xs">Active Users</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-green-400">500+</p>
                  <p className="text-slate-400 text-xs">Factories</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-purple-400">24/7</p>
                  <p className="text-slate-400 text-xs">Support</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="w-full max-w-md mx-auto lg:mx-0">
            <div className="bg-white rounded-2xl shadow-2xl p-6 lg:p-8">
              {/* Mobile Logo */}
              <div className="lg:hidden text-center mb-5">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mx-auto mb-2 shadow-lg">
                  <span className="text-lg font-bold text-white">P</span>
                </div>
                <h2 className="text-lg font-bold text-slate-900">PASHION ERP</h2>
              </div>

              {/* Form Header */}
              <div className="mb-5">
                <h3 className="text-lg font-bold text-slate-900 mb-1">Welcome Back</h3>
                <p className="text-xs text-slate-600">Sign in to your account to continue</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative group">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                      <FaEnvelope className="w-3 h-3" />
                    </span>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      required
                      className="pl-10 pr-4 py-2 w-full border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-0 transition-colors placeholder-slate-400 text-sm"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label htmlFor="password" className="block text-xs font-semibold text-slate-700 mb-1">
                    Password
                  </label>
                  <div className="relative group">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                      <FaLock className="w-3 h-3" />
                    </span>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      required
                      className="pl-10 pr-10 py-2 w-full border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-0 transition-colors placeholder-slate-400 text-sm"
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                    >
                      {showPassword ? <FaEyeSlash className="w-3 h-3" /> : <FaEye className="w-3 h-3" />}
                    </button>
                  </div>
                </div>

                {/* Remember & Forgot */}
                <div className="flex items-center justify-between text-xs">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="checkbox" className="w-3 h-3 rounded border-slate-300 text-blue-600" />
                    <span className="text-slate-600 group-hover:text-slate-900 transition-colors">Remember me</span>
                  </label>
                  <a href="#" className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
                    Forgot password?
                  </a>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group shadow-lg hover:shadow-xl text-sm"
                >
                  {loading ? (
                    <>
                      <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <FaArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="my-3 flex items-center gap-2">
                <div className="flex-1 h-px bg-slate-200"></div>
                <span className="text-xs text-slate-500 px-2">Demo Credentials</span>
                <div className="flex-1 h-px bg-slate-200"></div>
              </div>

              {/* Demo Credentials */}
              <div className="bg-slate-50 rounded-lg p-3 space-y-1 text-xs mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600"><strong>Admin:</strong></span>
                  <span className="font-mono text-slate-700 bg-white px-2 py-0.5 rounded text-xs">admin@pashion.com</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600"><strong>Password:</strong></span>
                  <span className="font-mono text-slate-700 bg-white px-2 py-0.5 rounded text-xs">Admin@123</span>
                </div>
              </div>

              {/* Sign Up Link */}
              <div className="text-center pt-2 border-t border-slate-200">
                <p className="text-xs text-slate-600">
                  Don't have an account?{' '}
                  <Link to="/register" className="text-blue-600 font-semibold hover:text-blue-700 transition-colors">
                    Create one
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;