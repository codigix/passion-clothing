import React, { useState } from 'react';
import { FaEye, FaEyeSlash, FaEnvelope, FaLock, FaBuilding } from 'react-icons/fa';
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
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-6">
          <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-primary flex items-center justify-center">
            <FaBuilding className="text-white text-4xl" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-1">PASHION ERP</h1>
          <p className="text-gray-500">Clothing Factory Management System</p>
        </div>
        <div className="bg-white shadow rounded-lg border border-gray-200">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 text-center mb-1">Welcome Back</h2>
            <p className="text-gray-500 text-center mb-4">Sign in to your account to continue</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    <FaEnvelope />
                  </span>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    <FaLock />
                  </span>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="pl-10 pr-10 py-2 w-full border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 focus:outline-none"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-3 text-lg font-semibold rounded bg-gradient-to-r from-primary to-blue-400 text-white flex items-center justify-center disabled:opacity-50"
                disabled={loading}
              >
                {loading ? (
                  <span className="animate-spin h-5 w-5 mr-2 border-2 border-white border-t-transparent rounded-full"></span>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">Demo Credentials:</p>
              <p className="text-xs text-gray-500">Admin: admin@pashion.com / admin123</p>
              <p className="text-xs text-gray-500">Sales: sales@pashion.com / sales123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;