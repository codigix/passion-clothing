import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../utils/api'; // use axios instance

const departments = [
  { value: 'sales', label: 'Sales' },
  { value: 'procurement', label: 'Procurement' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'outsourcing', label: 'Outsourcing' },
  { value: 'inventory', label: 'Inventory' },
  { value: 'shipment', label: 'Shipment' },
  { value: 'store', label: 'Store' },
  { value: 'finance', label: 'Finance' },
  { value: 'admin', label: 'Administration' },
  { value: 'samples', label: 'Samples' }
];

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);






    try {
      await api.post('/auth/register', form); // Vite proxy → backend 5000
      toast.success('Registration successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="min-h-screen bg-gray-100 flex items-center py-8">
      <div className="max-w-2xl w-full mx-auto">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-blue-600 flex items-center justify-center">
            <span className="text-white text-4xl font-bold">P</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">PASHION ERP</h1>
          <h2 className="text-xl text-gray-600 font-medium mb-1">Create New Account</h2>
          <p className="text-gray-500">Join our clothing factory management system</p>
        </div>
        <div className="bg-white shadow rounded-lg border border-gray-200 p-8">

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Employee ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
                <input
                  type="text"
                  name="employee_id"
                  value={form.employee_id}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              {/* Email */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              {/* Department */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <select
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept.value} value={dept.value}>{dept.label}</option>
                  ))}
                </select>
                {/* Department restriction message removed (was using undefined departmentBlocked) */}
              </div>

            </div>

            <button
              type="submit"
              className="w-full btn btn-primary py-3 text-lg font-semibold"
              disabled={loading}
            >
              {loading ? 'Registering...' : 'Create Account'}
            </button>
          </form>
          <div className="my-6 border-t border-gray-200"></div>
          <div className="text-center">
            <span className="text-gray-600">Already have an account? </span>
            <Link to="/login" className="text-blue-600 font-semibold hover:underline">Sign In</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationPage;
