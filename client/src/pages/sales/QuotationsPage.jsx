import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaSearch, FaEye, FaPlus, FaFilter, FaDownload, FaList, FaThLarge,
  FaFileInvoiceDollar, FaCheckCircle, FaClock, FaCalendarAlt, FaEllipsisV,
  FaChevronLeft, FaChevronRight, FaStepForward, FaStepBackward, FaSpinner
} from 'react-icons/fa';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const QuotationsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [quotations, setQuotations] = useState([]);
  const [filteredQuotations, setFilteredQuotations] = useState([]);
  const [searchTerm, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchQuotations();
  }, []);

  useEffect(() => {
    let filtered = [...quotations];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(q =>
        (q.quotation_number && q.quotation_number.toLowerCase().includes(term)) ||
        (q.customer_name && q.customer_name.toLowerCase().includes(term)) ||
        (q.buyer && q.buyer.toLowerCase().includes(term))
      );
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter(q => q.status === statusFilter);
    }
    setFilteredQuotations(filtered);
  }, [searchTerm, statusFilter, quotations]);

  const fetchQuotations = async () => {
    try {
      setLoading(true);
      const res = await api.get('/quotations');
      const data = res.data.data || res.data;
      if (Array.isArray(data) && data.length > 0) {
        setQuotations(data);
      } else {
        const mockData = [
          { id: 1, quotation_number: 'QT-2026-00045', created_at: '05 Aug 2026', customer_name: 'H&M Global', buyer: 'H&M', items_count: 5, total_amount: '$14,500', valid_until: '25 Aug 2026', status: 'Sent' },
          { id: 2, quotation_number: 'QT-2026-00044', created_at: '04 Aug 2026', customer_name: 'Zara SA', buyer: 'Zara', items_count: 8, total_amount: '$28,900', valid_until: '20 Aug 2026', status: 'Approved' },
          { id: 3, quotation_number: 'QT-2026-00043', created_at: '03 Aug 2026', customer_name: 'NEXT Retail', buyer: 'NEXT', items_count: 3, total_amount: '$9,200', valid_until: '18 Aug 2026', status: 'Draft' },
          { id: 4, quotation_number: 'QT-2026-00042', created_at: '02 Aug 2026', customer_name: 'Marks & Spencer', buyer: 'M&S', items_count: 12, total_amount: '$42,000', valid_until: '15 Aug 2026', status: 'Converted to SO' },
        ];
        setQuotations(mockData);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      'Draft': { bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' },
      'Sent': { bg: 'bg-blue-50', text: 'text-blue-600', dot: 'bg-blue-500' },
      'Approved': { bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-500' },
      'Converted to SO': { bg: 'bg-purple-50', text: 'text-purple-600', dot: 'bg-purple-500' }
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
          <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600">
            <FaFileInvoiceDollar size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Quotations</h1>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">Create, send, and track commercial quotations for buyers</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
            <FaDownload size={12} className="text-slate-500" />
            <span>Export</span>
          </button>

          <button
            onClick={() => navigate('/sales/quotations/create')}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-105 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-200 transition-all"
          >
            <FaPlus size={12} />
            <span>Create Quotation</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Quotations', value: '45', change: '18% vs last month', icon: FaFileInvoiceDollar, color: '#8B5DE0', bg: '#F5F0FE' },
          { label: 'Sent To Buyer', value: '28', change: '10% vs last month', icon: FaClock, color: '#4C7AF0', bg: '#EFF4FE' },
          { label: 'Approved', value: '12', change: '24% vs last month', icon: FaCheckCircle, color: '#3FAE73', bg: '#EDF8F2' },
          { label: 'Converted to SO', value: '5', change: '5% vs last month', icon: FaFileInvoiceDollar, color: '#E23F94', bg: '#FDF0F6' },
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
            placeholder="Search by quotation no, customer, buyer..."
            value={searchTerm}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
          >
            <option value="all">Status</option>
            <option value="Draft">Draft</option>
            <option value="Sent">Sent</option>
            <option value="Approved">Approved</option>
            <option value="Converted to SO">Converted to SO</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/70 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100">
            <tr>
              <th className="p-4">QUOTATION NO.</th>
              <th className="p-4">CUSTOMER</th>
              <th className="p-4">BUYER</th>
              <th className="p-4">ITEMS</th>
              <th className="p-4">TOTAL AMOUNT</th>
              <th className="p-4">VALID UNTIL</th>
              <th className="p-4">STATUS</th>
              <th className="p-4 text-center">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredQuotations.map((q, idx) => (
              <tr key={q.id || idx} className="hover:bg-slate-50/60 transition-all border-l-4 border-l-purple-500">
                <td className="p-4 font-bold text-slate-900">{q.quotation_number}</td>
                <td className="p-4 font-bold text-slate-800">{q.customer_name}</td>
                <td className="p-4 text-slate-600 font-medium">{q.buyer}</td>
                <td className="p-4 text-slate-600 font-medium">{q.items_count || 5} Pcs</td>
                <td className="p-4 font-extrabold text-slate-900">{q.total_amount}</td>
                <td className="p-4 text-slate-600 font-medium">{q.valid_until}</td>
                <td className="p-4">{getStatusBadge(q.status)}</td>
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

export default QuotationsPage;
