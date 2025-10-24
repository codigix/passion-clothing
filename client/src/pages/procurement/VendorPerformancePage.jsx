import React, { useState, useEffect } from 'react';
import { Star, ShoppingCart, Clock, CheckCircle, ChartLine } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const VendorPerformancePage = () => {
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [performanceData, setPerformanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterPeriod, setFilterPeriod] = useState('last_30_days');

  useEffect(() => {
    fetchVendors();
  }, []);

  useEffect(() => {
    if (selectedVendor) {
      fetchVendorPerformance(selectedVendor.id);
    }
  }, [selectedVendor, filterPeriod]);

  const fetchVendors = async () => {
    try {
      const response = await api.get('/procurement/vendors?limit=100');
      setVendors(response.data.vendors || []);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      toast.error('Failed to load vendors');
    } finally {
      setLoading(false);
    }
  };

  const fetchVendorPerformance = async (vendorId) => {
    try {
      const response = await api.get(`/procurement/vendors/${vendorId}/performance?period=${filterPeriod}`);
      setPerformanceData(response.data);
    } catch (error) {
      console.error('Error fetching vendor performance:', error);
      toast.error('Failed to load vendor performance data');
    }
  };

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 3.5) return 'text-yellow-600';
    if (rating >= 2.5) return 'text-orange-600';
    return 'text-red-600';
  };

  const getRatingBgColor = (rating) => {
    if (rating >= 4.5) return 'bg-green-100';
    if (rating >= 3.5) return 'bg-yellow-100';
    if (rating >= 2.5) return 'bg-orange-100';
    return 'bg-red-100';
  };

  const getOnTimePercentage = (performance) => {
    if (!performance?.total_orders) return 0;
    return ((performance.on_time_deliveries / performance.total_orders) * 100).toFixed(1);
  };

  const getQualityPercentage = (performance) => {
    if (!performance?.total_orders) return 0;
    return ((performance.quality_approved / performance.total_orders) * 100).toFixed(1);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vendor Performance</h1>
          <p className="text-gray-600 mt-1">Monitor and analyze vendor performance metrics</p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={filterPeriod}
            onChange={(e) => setFilterPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:ring-opacity-20 focus:border-blue-500"
          >
            <option value="last_7_days">Last 7 Days</option>
            <option value="last_30_days">Last 30 Days</option>
            <option value="last_90_days">Last 90 Days</option>
            <option value="last_6_months">Last 6 Months</option>
            <option value="last_year">Last Year</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vendors List */}
        <div className="bg-white rounded shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Vendors</h2>
          </div>
          <div className="p-4 max-h-96 overflow-y-auto">
            <div className="space-y-2">
              {vendors.map((vendor) => (
                <div
                  key={vendor.id}
                  onClick={() => setSelectedVendor(vendor)}
                  className={`p-3 border rounded cursor-pointer transition-colors ${
                    selectedVendor?.id === vendor.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">{vendor.name}</h3>
                      <p className="text-sm text-gray-600">{vendor.vendor_code}</p>
                    </div>
                    {vendor.performance_rating && (
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium ${getRatingBgColor(vendor.performance_rating)} ${getRatingColor(vendor.performance_rating)}`}>
                        <Star className="w-3 h-3" />
                        {vendor.performance_rating.toFixed(1)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="lg:col-span-2">
          {selectedVendor && performanceData ? (
            <div className="space-y-6">
              {/* Vendor Header */}
              <div className="bg-white rounded shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{selectedVendor.name}</h2>
                    <p className="text-gray-600">{selectedVendor.vendor_code}</p>
                  </div>
                  <div className={`flex items-center gap-2 px-4 py-2 rounded ${getRatingBgColor(performanceData.overall_rating)}`}>
                    <Star className={`w-5 h-5 ${getRatingColor(performanceData.overall_rating)}`} />
                    <span className={`text-2xl font-bold ${getRatingColor(performanceData.overall_rating)}`}>
                      {performanceData.overall_rating?.toFixed(1) || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded shadow-sm border border-gray-200 p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded">
                      <ShoppingCart className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Orders</p>
                      <p className="text-2xl font-bold text-gray-900">{performanceData.total_orders || 0}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded shadow-sm border border-gray-200 p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded">
                      <Clock className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">On-Time Delivery</p>
                      <p className="text-2xl font-bold text-gray-900">{getOnTimePercentage(performanceData)}%</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded shadow-sm border border-gray-200 p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded">
                      <CheckCircle className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Quality Approved</p>
                      <p className="text-2xl font-bold text-gray-900">{getQualityPercentage(performanceData)}%</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Metrics */}
              <div className="bg-white rounded shadow-sm border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Performance Details</h3>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Delivery Performance</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">On-time deliveries</span>
                          <span className="text-sm font-medium">{performanceData.on_time_deliveries || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Delayed deliveries</span>
                          <span className="text-sm font-medium">{performanceData.delayed_deliveries || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Average delay (days)</span>
                          <span className="text-sm font-medium">{performanceData.avg_delay_days?.toFixed(1) || 'N/A'}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Quality Performance</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Approved items</span>
                          <span className="text-sm font-medium">{performanceData.quality_approved || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Rejected items</span>
                          <span className="text-sm font-medium">{performanceData.quality_rejected || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Pending QC</span>
                          <span className="text-sm font-medium">{performanceData.quality_pending || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Orders */}
              <div className="bg-white rounded shadow-sm border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
                </div>
                <div className="p-4">
                  {performanceData.recent_orders?.length > 0 ? (
                    <div className="space-y-3">
                      {performanceData.recent_orders.map((order) => (
                        <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                          <div>
                            <p className="font-medium text-gray-900">{order.po_number}</p>
                            <p className="text-sm text-gray-600">
                              {new Date(order.po_date).toLocaleDateString()} • ₹{order.final_amount?.toLocaleString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${
                              order.status === 'completed' ? 'bg-green-100 text-green-800' :
                              order.status === 'received' ? 'bg-blue-100 text-blue-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {order.status?.replace('_', ' ')}
                            </span>
                            {order.delivery_date && (
                              <p className="text-xs text-gray-500 mt-1">
                                Expected: {new Date(order.delivery_date).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No recent orders found</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded shadow-sm border border-gray-200 p-12">
              <div className="text-center text-gray-500">
                <ChartLine className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">Select a Vendor</h3>
                <p>Choose a vendor from the list to view their performance metrics</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorPerformancePage;