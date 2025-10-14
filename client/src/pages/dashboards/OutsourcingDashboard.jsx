import React, { useState } from 'react';
import {
  Building,
  Plus,
  Search,
  Eye,
  Edit,
  Truck,
  Calendar,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  FileText,
  Download,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const OutsourcingDashboard = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);


  // Real data with default values
  const [stats, setStats] = useState({
    activeOrders: 12,
    completedOrders: 45,
    totalVendors: 8,
    avgDeliveryTime: 6.2,
    qualityScore: 4.5,
    onTimeDelivery: 92
  });
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await import('../../utils/api').then(m => m.default.get('/outsourcing/dashboard/stats'));
      setStats(prevStats => ({
        ...prevStats,
        ...res.data
      }));
    } catch (error) {
      // Keep default values if API fails
      console.log('Using default stats values');
    } finally {
      setLoading(false);
    }
  };

  const outsourceOrders = [
    {
      id: 1,
      orderNo: 'OUT-2024-001',
      vendorName: 'Precision Embroidery Works',
      productName: 'School Logo Embroidery',
      quantity: 500,
      orderDate: '2024-11-20',
      expectedReturn: '2024-12-05',
      actualReturn: null,
      status: 'in_progress',
      progress: 65,
      outwardChallan: 'CHN-20241120-0001',
      inwardChallan: null,
      qualityRating: null
    },
    {
      id: 2,
      orderNo: 'OUT-2024-002',
      vendorName: 'Elite Stitching Services',
      productName: 'Trouser Stitching',
      quantity: 300,
      orderDate: '2024-11-22',
      expectedReturn: '2024-12-08',
      actualReturn: '2024-12-06',
      status: 'completed',
      progress: 100,
      outwardChallan: 'CHN-20241122-0001',
      inwardChallan: 'CHN-20241206-0001',
      qualityRating: 4.5
    },
    {
      id: 3,
      orderNo: 'OUT-2024-003',
      vendorName: 'Quick Print Solutions',
      productName: 'Screen Printing',
      quantity: 200,
      orderDate: '2024-11-25',
      expectedReturn: '2024-12-10',
      actualReturn: null,
      status: 'delayed',
      progress: 40,
      outwardChallan: 'CHN-20241125-0001',
      inwardChallan: null,
      qualityRating: null
    }
  ];

  const vendors = [
    {
      id: 1,
      name: 'Precision Embroidery',
      specialization: 'Embroidery',
      contact: '+91 9876543210',
      email: 'contact@precisionembroidery.com',
      location: 'Mumbai, Maharashtra',
      rating: 4.8,
      activeOrders: 3,
      completedOrders: 25,
      onTimeDelivery: 96,
      avgDeliveryTime: 5,
      qualityScore: 4.8,
      paymentTerms: '30 Days'
    },
    {
      id: 2,
      name: 'Elite Stitching Services',
      specialization: 'Stitching',
      contact: '+91 9876543211',
      email: 'info@elitestitching.com',
      location: 'Bangalore, Karnataka',
      rating: 4.6,
      activeOrders: 2,
      completedOrders: 18,
      onTimeDelivery: 92,
      avgDeliveryTime: 6,
      qualityScore: 4.6,
      paymentTerms: '45 Days'
    },
    {
      id: 3,
      name: 'Quick Print Solutions',
      specialization: 'Printing',
      contact: '+91 9876543212',
      email: 'sales@quickprint.com',
      location: 'Delhi, NCR',
      rating: 4.2,
      activeOrders: 1,
      completedOrders: 12,
      onTimeDelivery: 88,
      avgDeliveryTime: 7,
      qualityScore: 4.2,
      paymentTerms: '60 Days'
    }
  ];

  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      in_progress: 'primary',
      quality_check: 'info',
      completed: 'success',
      delayed: 'error',
      rejected: 'error'
    };
    return colors[status] || 'default';
  };

  const StatCard = ({ title, value, icon, color = 'primary', subtitle, unit }) => {
    const colorClasses = {
      primary: 'bg-blue-100',
      success: 'bg-green-100',
      info: 'bg-cyan-100',
      warning: 'bg-yellow-100',
      secondary: 'bg-purple-100'
    };

    return (
      <div className="bg-white p-6 rounded-lg shadow h-full">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="text-xs font-semibold uppercase text-gray-500 mb-1 tracking-wide">
              {title}
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {value}{unit && <span className="text-sm text-gray-500">{unit}</span>}
            </div>
            {subtitle && (
              <div className="text-sm text-gray-500 mt-1">
                {subtitle}
              </div>
            )}
          </div>
          <div className={`rounded-full p-3 flex items-center justify-center ${colorClasses[color] || 'bg-blue-100'}`}>
            {icon}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Outsourcing Dashboard
        </h1>
        <div className="flex gap-2">
          <button
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            onClick={() => navigate('/outsourcing/vendors')}
          >
            <Building className="w-4 h-4" />
            Manage Vendors
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            onClick={() => navigate('/outsourcing/create-order')}
          >
            <Plus className="w-4 h-4" />
            Create Outsource Order
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard
          title="Active Outsource Orders"
          value={stats.activeOrders}
          subtitle="Currently with vendors"
          icon={<FileText className="w-6 h-6 text-blue-600" />}
          color="primary"
        />
        <StatCard
          title="Completed Orders"
          value={stats.completedOrders}
          subtitle="Successfully completed"
          icon={<CheckCircle className="w-6 h-6 text-green-600" />}
          color="success"
        />
        <StatCard
          title="Total Vendors"
          value={stats.totalVendors}
          subtitle="Active partnerships"
          icon={<Building className="w-6 h-6 text-cyan-600" />}
          color="info"
        />
        <StatCard
          title="Avg Delivery Time"
          value={stats.avgDeliveryTime}
          subtitle="Days from vendor"
          icon={<Calendar className="w-6 h-6 text-yellow-600" />}
          color="warning"
        />
      </div>

      {/* Recent Outsource Orders - Quick Preview */}
      <div className="bg-white rounded-lg shadow mb-6 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Outsource Orders</h2>
          <button
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            onClick={() => setTabValue(0)}
          >
            View All →
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {outsourceOrders.slice(0, 3).map((order) => (
            <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="text-sm font-semibold text-gray-900">{order.orderNo}</div>
                  <div className="text-xs text-gray-500">{order.vendorName}</div>
                </div>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  order.status === 'completed' ? 'bg-green-100 text-green-800' :
                  order.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                  order.status === 'delayed' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {order.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              <div className="text-sm text-gray-700 mb-3">{order.productName}</div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      order.status === 'completed' ? 'bg-green-600' :
                      order.status === 'delayed' ? 'bg-red-600' :
                      'bg-blue-600'
                    }`}
                    style={{ width: `${order.progress}%` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-600 font-medium">{order.progress}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Performing Vendors */}
      <div className="bg-white rounded-lg shadow mb-6 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Top Performing Vendors</h2>
          <button
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            onClick={() => setTabValue(1)}
          >
            View All →
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {vendors.slice(0, 3).map((vendor) => (
            <div key={vendor.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 mb-1">{vendor.name}</div>
                  <div className="text-xs text-gray-500">{vendor.completedOrders} orders completed</div>
                </div>
                <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded">
                  <span className="text-yellow-500 text-sm">★</span>
                  <span className="text-sm font-semibold text-gray-900">{vendor.rating}</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-green-600" />
                  <span className="text-gray-600">{vendor.onTimeDelivery}% on-time</span>
                </div>
                <div className="text-gray-500">{vendor.avgDeliveryTime} days avg</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Outsourcing Actions */}
      <div className="bg-white rounded-lg shadow mb-6 p-6">
        <h2 className="text-lg font-semibold mb-4">
          Outsourcing Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by order no, vendor name..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <button
              className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              onClick={() => navigate('/outsourcing/performance')}
            >
              Vendor Performance
            </button>
          </div>
          <div>
            <button
              className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              onClick={() => navigate('/outsourcing/quality')}
            >
              Quality Reports
            </button>
          </div>
          <div>
            <button
              className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              onClick={() => navigate('/outsourcing/reports')}
            >
              Outsource Reports
            </button>
          </div>
          <div>
            <button
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
              onClick={() => navigate('/outsourcing/reports/export')}
            >
              <Download className="w-4 h-4" />
              Export Data
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <div className="flex">
            {[
              { label: "Outsource Orders", index: 0 },
              { label: "Vendor Directory", index: 1 },
              { label: "Quality Control", index: 2 },
              { label: "Performance Analytics", index: 3 }
            ].map((tab) => (
              <button
                key={tab.index}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  tabValue === tab.index
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setTabValue(tab.index)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          {(() => {
            switch (tabValue) {
              case 0:
                return <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">
                      Outsource Orders ({outsourceOrders.length})
                    </h2>
                    <button
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      onClick={() => navigate('/outsourcing/orders')}
                    >
                      View All Orders
                    </button>
                  </div>

                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order No.</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product/Service</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expected Return</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quality Rating</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {outsourceOrders.map((order) => (
                          <tr key={order.id} className="hover:bg-gray-50">
                            <td className="px-4 py-4 whitespace-nowrap">
                              <span className="text-sm font-medium text-gray-900">
                                {order.orderNo}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-900">{order.vendorName}</td>
            <td className="px-4 py-4 text-sm text-gray-900">{order.productName}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{order.quantity}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{order.expectedReturn}</td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                                {order.status.replace('_', ' ').toUpperCase()}
                              </span>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <div className="w-16 bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-blue-600 h-2 rounded-full"
                                    style={{ width: `${order.progress}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs text-gray-500">{order.progress}%</span>
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {order.qualityRating ? (
                                <div className="flex items-center">
                                  {[...Array(5)].map((_, i) => (
                                    <span key={i} className={`text-sm ${i < Math.floor(order.qualityRating) ? 'text-yellow-400' : 'text-gray-300'}`}>
                                      ★
                                    </span>
                                  ))}
                                  <span className="ml-1 text-xs text-gray-500">({order.qualityRating})</span>
                                </div>
                              ) : (
                                <span className="text-xs text-gray-500">Pending</span>
                              )}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  className="text-blue-600 hover:text-blue-800 p-1"
                                  onClick={() => navigate(`/outsourcing/orders/${order.id}`)}
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  className="text-gray-600 hover:text-gray-800 p-1"
                                  onClick={() => navigate(`/outsourcing/orders/edit/${order.id}`)}
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>;
              case 1:
                return <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">
                      Vendor Directory
                    </h2>
                    <button
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      onClick={() => navigate('/outsourcing/add-vendor')}
                    >
                      <Building className="w-4 h-4" />
                      Add Vendor
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {vendors.map((vendor) => (
                      <div key={vendor.id} className="bg-white border border-gray-200 rounded-lg p-6 h-full">
                        <div className="flex items-center mb-4">
                          <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center mr-3">
                            {vendor.name.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold">
                              {vendor.name}
                            </h3>
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                              {vendor.specialization}
                            </span>
                          </div>
                        </div>

                        <div className="mb-4 space-y-2">
                          <div className="flex items-center">
                            <Phone className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-600">{vendor.contact}</span>
                          </div>
                          <div className="flex items-center">
                            <Mail className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-600">{vendor.email}</span>
                          </div>
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-600">{vendor.location}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="text-center">
                            <div className="text-lg font-semibold text-blue-600">
                              {vendor.activeOrders}
                            </div>
                            <div className="text-xs text-gray-500">
                              Active Orders
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-semibold text-green-600">
                              {vendor.onTimeDelivery}%
                            </div>
                            <div className="text-xs text-gray-500">
                              On-Time Delivery
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <span key={i} className={`text-sm ${i < Math.floor(vendor.rating) ? 'text-yellow-400' : 'text-gray-300'}`}>
                                  ★
                                </span>
                              ))}
                            </div>
                            <span className="ml-1 text-sm text-gray-600">
                              ({vendor.rating})
                            </span>
                          </div>
                          <span className="text-sm text-gray-500">
                            {vendor.avgDeliveryTime} days avg
                          </span>
                        </div>

                        <div className="flex gap-2">
                          <button
                            className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50"
                            onClick={() => navigate(`/outsourcing/vendors/${vendor.id}`)}
                          >
                            View Details
                          </button>
                          <button
                            className="flex-1 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                            onClick={() => navigate(`/outsourcing/create-order?vendor=${vendor.id}`)}
                          >
                            Create Order
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>;
              case 2:
                return <div className="p-6">
                  <h2 className="text-lg font-semibold mb-4">
                    Quality Control Metrics
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
                      <CheckCircle className="w-10 h-10 text-green-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-green-600">
                        {stats.qualityScore + '/5'}
                      </div>
                      <div className="text-sm text-gray-500">
                        Average Quality Score
                      </div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
                      <AlertTriangle className="w-10 h-10 text-yellow-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold">
                        3
                      </div>
                      <div className="text-sm text-gray-500">
                        Quality Issues This Month
                      </div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
                      <TrendingUp className="w-10 h-10 text-blue-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold">
                        95%
                      </div>
                      <div className="text-sm text-gray-500">
                        Acceptance Rate
                      </div>
                    </div>
                  </div>
                </div>;
              case 3:
                return <div className="p-6">
                  <h2 className="text-lg font-semibold mb-4">
                    Performance Analytics
                  </h2>
                  <p className="text-sm text-gray-500">
                    Comprehensive vendor performance analytics and trends will be displayed here.
                  </p>
                </div>;
              default:
                return null;
            }
          })()}
        </div>
      </div>
    </div>
  );
};

export default OutsourcingDashboard;