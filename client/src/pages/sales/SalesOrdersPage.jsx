import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaSearch, FaEye, FaPlus, FaFilter, FaDownload, FaShoppingCart,
  FaCheckCircle, FaClock, FaCalendarAlt, FaEllipsisV, FaSpinner, FaTruck
} from 'react-icons/fa';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const SalesOrdersPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    let filtered = [...orders];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(o =>
        (o.order_number && o.order_number.toLowerCase().includes(term)) ||
        (o.customer_name && o.customer_name.toLowerCase().includes(term)) ||
        (o.buyer && o.buyer.toLowerCase().includes(term))
      );
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter(o => o.status === statusFilter);
    }
    setFilteredOrders(filtered);
  }, [searchTerm, statusFilter, orders]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/sales/orders');
      const data = res.data.data || res.data;
      if (Array.isArray(data) && data.length > 0) {
        setOrders(data);
      } else {
        const mockData = [
          { id: 1, order_number: 'SO-2026-1001', order_date: '05 Aug 2026', customer_name: 'H&M Global', buyer: 'H&M', total_amount: '$45,000', delivery_date: '25 Aug 2026', status: 'In Production', shipment_status: 'Pending' },
          { id: 2, order_number: 'SO-2026-1002', order_date: '04 Aug 2026', customer_name: 'Zara SA', buyer: 'Zara', total_amount: '$28,900', delivery_date: '20 Aug 2026', status: 'Cutting Completed', shipment_status: 'Pending' },
          { id: 3, order_number: 'SO-2026-1003', order_date: '03 Aug 2026', customer_name: 'NEXT Retail', buyer: 'NEXT', total_amount: '$19,200', delivery_date: '18 Aug 2026', status: 'Confirmed', shipment_status: 'Pending' },
          { id: 4, order_number: 'SO-2026-1004', order_date: '02 Aug 2026', customer_name: 'Marks & Spencer', buyer: 'M&S', total_amount: '$62,000', delivery_date: '15 Aug 2026', status: 'Shipped', shipment_status: 'Dispatched' },
        ];
        setOrders(mockData);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      'Confirmed': { bg: 'bg-blue-50', text: 'text-blue-600', dot: 'bg-blue-500' },
      'In Production': { bg: 'bg-purple-50', text: 'text-purple-600', dot: 'bg-purple-500' },
      'Cutting Completed': { bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-500' },
      'Shipped': { bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-500' }
    };
    const cfg = config[status] || { bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' };
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-8 bg-slate-50 min-h-screen flex justify-center items-center">
        <FaSpinner className="animate-spin text-4xl text-purple-600" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-6 font-sans text-slate-800" style={{ background: '#F8F7FC' }}>
      
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
            <FaShoppingCart size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Sales Orders</h1>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">Track confirmed garment sales orders and production status</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
            <FaDownload size={12} className="text-slate-500" />
            <span>Export</span>
          </button>

          <button
            onClick={() => navigate('/sales/orders/create')}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:brightness-105 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-200 transition-all"
          >
            <FaPlus size={12} />
            <span>Create Sales Order</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Orders', value: '120', change: '12% vs last month', icon: FaShoppingCart, color: '#FF4FA3', bg: '#FDF0F6' },
          { label: 'Running Orders', value: '85', change: '8% vs last month', icon: FaClock, color: '#9B5CF7', bg: '#F5F0FE' },
          { label: 'In Production', value: '45', change: '15% vs yesterday', icon: FaShoppingCart, color: '#6C5CE7', bg: '#EFF4FE' },
          { label: 'On Time Delivery', value: '92.5%', change: '4% vs last month', icon: FaTruck, color: '#34C759', bg: '#EDF8F2' },
        ].map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between hover:shadow-md transition-all">
              <div>
                <p className="text-xs font-semibold text-slate-500">{card.label}</p>
                <p className="text-2xl font-extrabold text-slate-900 mt-1">{card.value}</p>
                <p className="text-[11px] font-medium text-emerald-500 mt-1.5">↑ {card.change}</p>
              </div>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: card.bg, color: card.color }}>
                <Icon size={18} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Control Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input
            type="text"
            placeholder="Search by SO number, customer, buyer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
          >
            <option value="all">Order Status</option>
            <option value="Confirmed">Confirmed</option>
            <option value="In Production">In Production</option>
            <option value="Shipped">Shipped</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/70 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100">
            <tr>
              <th className="p-4">SO NUMBER</th>
              <th className="p-4">ORDER DATE</th>
              <th className="p-4">CUSTOMER</th>
              <th className="p-4">BUYER</th>
              <th className="p-4">TOTAL AMOUNT</th>
              <th className="p-4">DELIVERY DATE</th>
              <th className="p-4">STATUS</th>
              <th className="p-4 text-center">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredOrders.map((o, idx) => (
              <tr key={o.id || idx} className="hover:bg-slate-50/60 transition-all border-l-4 border-l-blue-500">
                <td className="p-4 font-bold text-slate-900">{o.order_number}</td>
                <td className="p-4 text-slate-600 font-medium">{o.order_date}</td>
                <td className="p-4 font-bold text-slate-800">{o.customer_name}</td>
                <td className="p-4 text-slate-600 font-medium">{o.buyer}</td>
                <td className="p-4 font-extrabold text-slate-900">{o.total_amount}</td>
                <td className="p-4 text-slate-600 font-medium">{o.delivery_date}</td>
                <td className="p-4">{getStatusBadge(o.status)}</td>
                <td className="p-4 text-center">
                  <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100"><FaEye size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default SalesOrdersPage;