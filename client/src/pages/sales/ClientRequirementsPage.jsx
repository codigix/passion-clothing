import React, { useState, useEffect } from 'react';
import {
  FaPlus,
  FaSearch,
  FaFilter,
  FaEdit,
  FaQrcode,
  FaClipboardList,
  FaFileInvoiceDollar,
  FaClock,
  FaCheck,
  FaColumns,
  FaEllipsisV,
  FaThLarge,
  FaTh,
  FaChartBar,
  FaExclamationCircle,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaEye,
  FaCalendarAlt,
  FaTrash
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import QRCodeDisplay from '../../components/QRCodeDisplay';
import ProjectIdentifier from '../../components/common/ProjectIdentifier';

const AVAILABLE_COLUMNS = [
  { id: 'requirement_number', label: 'Req Number', defaultVisible: true, alwaysVisible: true },
  { id: 'customer_name', label: 'Customer', defaultVisible: true },
  { id: 'project_name', label: 'Project / Inquiry', defaultVisible: true },
  { id: 'product_category', label: 'Category', defaultVisible: true },
  { id: 'product_name', label: 'Product Name', defaultVisible: false },
  { id: 'quantity', label: 'Quantity', defaultVisible: true },
  { id: 'required_date', label: 'Required Date', defaultVisible: true },
  { id: 'status', label: 'Status', defaultVisible: true },
  { id: 'actions', label: 'Actions', defaultVisible: true, alwaysVisible: true }
];

const ClientRequirementsPage = () => {
  const navigate = useNavigate();
  const [requirements, setRequirements] = useState([]);
  const [filteredRequirements, setFilteredRequirements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    Draft: 0,
    Review: 0,
    Approved: 0,
    "Quotation Generated": 0,
    "Converted to SO": 0
  });

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // View modes
  const [viewMode, setViewMode] = useState('table'); // 'table', 'cards', 'kanban'
  const [activeDropdown, setActiveDropdown] = useState(null);

  // Modal states
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrRequirement, setQrRequirement] = useState(null);
  const [showColumnMenu, setShowColumnMenu] = useState(false);

  const categories = [
    'Bottle', 'Garment', 'Assembly', 'Part', 
    'Plastic Product', 'Fabrication', 'Custom Product'
  ];

  // Column visibility
  const [visibleColumns, setVisibleColumns] = useState(() => {
    const saved = localStorage.getItem('clientRequirementsVisibleColumns');
    if (saved) {
      return JSON.parse(saved);
    }
    return AVAILABLE_COLUMNS.filter(col => col.defaultVisible).map(col => col.id);
  });

  useEffect(() => {
    fetchRequirements();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [requirements, searchTerm, statusFilter, categoryFilter, dateFrom, dateTo]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showColumnMenu && !event.target.closest('.column-menu-container')) {
        setShowColumnMenu(false);
      }
      if (activeDropdown && !event.target.closest('.action-menu-container')) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showColumnMenu, activeDropdown]);

  const fetchRequirements = async () => {
    try {
      setLoading(true);
      const response = await api.get('/client-requirements');
      setRequirements(response.data.requirements || []);
      if (response.data.stats) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch client requirements:', error);
      toast.error('Failed to load client requirements');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...requirements];

    if (searchTerm) {
      filtered = filtered.filter(req =>
        req.requirement_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.project_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.product_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter && statusFilter !== 'all') {
      filtered = filtered.filter(req => req.status === statusFilter);
    }

    if (categoryFilter && categoryFilter !== 'all') {
      filtered = filtered.filter(req => req.product_category === categoryFilter);
    }

    if (dateFrom) {
      filtered = filtered.filter(req => new Date(req.required_date) >= new Date(dateFrom));
    }
    if (dateTo) {
      filtered = filtered.filter(req => new Date(req.required_date) <= new Date(dateTo + 'T23:59:59'));
    }

    setFilteredRequirements(filtered);
  };

  const handleShowQR = (req) => {
    setQrRequirement(req);
    setShowQRModal(true);
  };

  const handleDeleteRequirement = async (id) => {
    if (!window.confirm('Are you sure you want to delete this client requirement? This will also delete any associated quotations.')) {
      return;
    }
    try {
      await api.delete(`/client-requirements/${id}`);
      toast.success('Client requirement deleted successfully');
      fetchRequirements();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to delete client requirement');
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      'Draft': { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300', icon: FaClock },
      'Review': { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300', icon: FaClock },
      'Approved': { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300', icon: FaCheckCircle },
      'Quotation Generated': { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300', icon: FaFileInvoiceDollar },
      'Converted to SO': { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300', icon: FaCheck }
    };
    const cfg = config[status] || { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300', icon: FaClock };
    const Icon = cfg.icon;
    return (
      <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md border ${cfg.bg} ${cfg.text} ${cfg.border} text-xs font-normal`}>
        <Icon size={12} />
        {status}
      </div>
    );
  };

  const getStatusColor = (status) => {
    const colors = {
      'Draft': 'from-slate-500 to-slate-600',
      'Review': 'from-orange-500 to-orange-600',
      'Approved': 'from-green-500 to-green-600',
      'Quotation Generated': 'from-blue-500 to-blue-600',
      'Converted to SO': 'from-purple-500 to-purple-600'
    };
    return colors[status] || 'from-slate-500 to-slate-600';
  };

  const groupRequirementsByStatus = () => {
    const groups = {
      'Draft': [],
      'Review': [],
      'Approved': [],
      'Quotation Generated': [],
      'Converted to SO': []
    };

    filteredRequirements.forEach(req => {
      if (groups[req.status] !== undefined) {
        groups[req.status].push(req);
      }
    });

    return groups;
  };

  const toggleDropdown = (id, e) => {
    e.stopPropagation();
    if (activeDropdown === id) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(id);
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex justify-center items-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-5xl text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading requirements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 text-white px-6 py-3.5 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 bg-white/20 rounded-lg">
                <FaClipboardList className="w-4 h-4" />
              </div>
              <h1 className="text-xl font-semibold">Client Requirements</h1>
            </div>
            <p className="text-blue-100 text-xs font-normal">Manage and track customer requirements and enquiries</p>
          </div>
          <button
            onClick={() => navigate('/sales/client-requirements/create')}
            className="px-4 py-1.5 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-all shadow-md font-medium flex items-center gap-2 hover:shadow-lg text-sm"
          >
            <FaPlus size={14} />
            Create Requirement
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-3">
        {/* KPI Counter Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
          {[
            { label: 'Total Enquiries', value: stats.total, icon: FaClipboardList, color: 'blue' },
            { label: 'Draft', value: stats.Draft || 0, icon: FaClock, color: 'slate' },
            { label: 'Under Review', value: stats.Review || 0, icon: FaClock, color: 'orange' },
            { label: 'Approved', value: stats.Approved || 0, icon: FaCheckCircle, color: 'green' },
            { label: 'Quotations', value: stats["Quotation Generated"] || 0, icon: FaFileInvoiceDollar, color: 'indigo' }
          ].map((card, idx) => {
            const Icon = card.icon;
            const bgColor = { blue: 'bg-blue-50', slate: 'bg-slate-50', orange: 'bg-orange-50', green: 'bg-green-50', indigo: 'bg-indigo-50' }[card.color];
            const iconBg = { blue: 'bg-blue-100', slate: 'bg-slate-100', orange: 'bg-orange-100', green: 'bg-green-100', indigo: 'bg-indigo-100' }[card.color];
            const iconColor = { blue: 'text-blue-600', slate: 'text-slate-600', orange: 'text-orange-600', green: 'text-green-600', indigo: 'text-indigo-600' }[card.color];
            const borderColor = { blue: 'border-blue-200', slate: 'border-slate-200', orange: 'border-orange-200', green: 'border-green-200', indigo: 'border-indigo-200' }[card.color];

            return (
              <div 
                key={idx} 
                onClick={() => {
                  if (card.color === 'slate') setStatusFilter('Draft');
                  else if (card.color === 'orange') setStatusFilter('Review');
                  else if (card.color === 'green') setStatusFilter('Approved');
                  else if (card.color === 'indigo') setStatusFilter('Quotation Generated');
                  else setStatusFilter('all');
                }}
                className={`${bgColor} ${borderColor} border rounded-lg p-3 shadow-sm hover:shadow-md cursor-pointer transition-all flex justify-between items-center`}
              >
                <div>
                  <p className="text-gray-600 text-xs font-normal mb-0.5">{card.label}</p>
                  <p className="text-2xl font-bold text-gray-800">{card.value}</p>
                </div>
                <div className={`${iconBg} p-2 rounded-lg`}>
                  <Icon className={`${iconColor} text-base`} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Filter & View Mode Bar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3.5 mb-4">
          <div className="flex flex-col lg:flex-row gap-2 justify-between items-start lg:items-center">
            {/* Search */}
            <div className="flex-1 relative w-full lg:w-auto">
              <FaSearch className="absolute left-2.5 top-2.5 text-gray-400" size={14} />
              <input
                type="text"
                placeholder="Search req no, customer, product, category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex gap-1.5 items-center">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg border transition-all text-sm ${viewMode === 'table' ? 'bg-blue-100 border-blue-300 text-blue-600' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                title="Table View"
              >
                <FaTh size={14} />
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-lg border transition-all text-sm ${viewMode === 'cards' ? 'bg-blue-100 border-blue-300 text-blue-600' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                title="Card View"
              >
                <FaThLarge size={14} />
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={`p-1.5 rounded-lg border transition-all text-sm ${viewMode === 'kanban' ? 'bg-blue-100 border-blue-300 text-blue-600' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                title="Kanban View"
              >
                <FaChartBar size={14} />
              </button>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-1.5 rounded-lg border transition-all text-sm ${showFilters ? 'bg-blue-100 border-blue-300 text-blue-600' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                title="Toggle Filters"
              >
                <FaFilter size={14} />
              </button>

              {/* Column Visibility Menu */}
              <div className="column-menu-container relative">
                <button
                  onClick={() => setShowColumnMenu(!showColumnMenu)}
                  className={`p-1.5 rounded-lg border transition-all text-sm ${showColumnMenu ? 'bg-blue-100 border-blue-300 text-blue-600' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                  title="Manage Columns"
                >
                  <FaColumns size={14} />
                </button>

                {/* Column Menu Dropdown */}
                {showColumnMenu && (
                  <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 w-56 max-h-96 overflow-y-auto">
                    <div className="p-3 border-b border-gray-200 sticky top-0 bg-white">
                      <p className="text-xs font-semibold text-gray-700 mb-2">Visible Columns</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            const allVisible = AVAILABLE_COLUMNS.filter(col => !col.alwaysVisible).map(col => col.id);
                            const always = AVAILABLE_COLUMNS.filter(col => col.alwaysVisible).map(col => col.id);
                            setVisibleColumns([...always, ...allVisible]);
                            localStorage.setItem('clientRequirementsVisibleColumns', JSON.stringify([...always, ...allVisible]));
                          }}
                          className="flex-1 px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors font-medium"
                        >
                          Show All
                        </button>
                        <button
                          onClick={() => {
                            const defaultVisible = AVAILABLE_COLUMNS.filter(col => col.defaultVisible || col.alwaysVisible).map(col => col.id);
                            setVisibleColumns(defaultVisible);
                            localStorage.setItem('clientRequirementsVisibleColumns', JSON.stringify(defaultVisible));
                          }}
                          className="flex-1 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors font-medium"
                        >
                          Reset
                        </button>
                      </div>
                    </div>
                    <div className="p-2 space-y-1">
                      {AVAILABLE_COLUMNS.map(col => (
                        <label key={col.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={visibleColumns.includes(col.id)}
                            onChange={(e) => {
                              let newVisible;
                              if (e.target.checked) {
                                newVisible = [...visibleColumns, col.id];
                              } else {
                                if (col.alwaysVisible) {
                                  alert('This column cannot be hidden');
                                  return;
                                }
                                newVisible = visibleColumns.filter(c => c !== col.id);
                              }
                              setVisibleColumns(newVisible);
                              localStorage.setItem('clientRequirementsVisibleColumns', JSON.stringify(newVisible));
                            }}
                            disabled={col.alwaysVisible}
                            className="w-4 h-4 rounded border-gray-300"
                          />
                          <span className={`text-xs font-normal ${col.alwaysVisible ? 'text-gray-400' : 'text-gray-700 group-hover:text-gray-900'}`}>
                            {col.label}
                            {col.alwaysVisible && <span className="text-gray-400 ml-1">(fixed)</span>}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5 mt-3 pt-3 border-t border-gray-200">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                >
                  <option value="all">All Statuses</option>
                  <option value="Draft">Draft</option>
                  <option value="Review">Review</option>
                  <option value="Approved">Approved</option>
                  <option value="Quotation Generated">Quotation Generated</option>
                  <option value="Converted to SO">Converted to SO</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                >
                  <option value="all">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Required Date From</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full px-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Required Date To</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full px-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                />
              </div>
            </div>
          )}
        </div>

        {/* Table View */}
        {viewMode === 'table' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    {AVAILABLE_COLUMNS.map(col => {
                      if (!visibleColumns.includes(col.id)) return null;
                      return (
                        <th 
                          key={col.id} 
                          className={`px-3 py-2 text-left text-xs font-medium text-gray-700 ${
                            col.id === 'actions' ? 'text-center' : ''
                          }`}
                        >
                          {col.label}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {filteredRequirements.length === 0 ? (
                    <tr>
                      <td colSpan={visibleColumns.length} className="px-3 py-8 text-center">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <FaExclamationCircle className="text-3xl text-gray-400" />
                          <p className="text-gray-500 font-normal text-sm">No requirements found</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredRequirements.map((req) => (
                      <tr key={req.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        {AVAILABLE_COLUMNS.map(col => {
                          if (!visibleColumns.includes(col.id)) return null;

                          let content = null;
                          switch (col.id) {
                            case 'requirement_number':
                              content = (
                                <div onClick={() => navigate(`/sales/client-requirements/${req.id}`)} className="cursor-pointer hover:opacity-80 transition-opacity">
                                  <ProjectIdentifier
                                    projectName={req.project_name}
                                    orderId={req.requirement_number}
                                    type="sales"
                                    size="small"
                                  />
                                </div>
                              );
                              break;
                            case 'customer_name':
                              content = (
                                <div className="text-xs text-gray-700">
                                  <div className="font-semibold">{req.customer_name}</div>
                                  {req.contact_person && <div className="text-[10px] text-gray-400">{req.contact_person}</div>}
                                </div>
                              );
                              break;
                            case 'project_name':
                              content = <span className="text-xs text-gray-700 font-medium">{req.project_name || 'N/A'}</span>;
                              break;
                            case 'product_category':
                              content = (
                                <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-700 rounded">
                                  {req.product_category}
                                </span>
                              );
                              break;
                            case 'product_name':
                              content = <span className="text-xs text-gray-600">{req.product_name || 'N/A'}</span>;
                              break;
                            case 'quantity':
                              content = (
                                <span className="text-xs font-medium text-gray-800">
                                  {req.quantity} <span className="text-[10px] text-gray-400 font-normal">{req.unit}</span>
                                </span>
                              );
                              break;
                            case 'required_date':
                              content = (
                                <span className="text-xs text-gray-600">
                                  {req.required_date ? new Date(req.required_date).toLocaleDateString() : 'N/A'}
                                </span>
                              );
                              break;
                            case 'status':
                              content = getStatusBadge(req.status);
                              break;
                            case 'actions':
                              content = (
                                <div className="action-menu-container relative flex justify-center gap-1" onClick={(e) => e.stopPropagation()}>
                                  <button
                                    onClick={() => navigate(`/sales/client-requirements/${req.id}`)}
                                    className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                    title="View Details"
                                  >
                                    <FaEye size={13} />
                                  </button>
                                  {req.status !== 'Converted to SO' && (
                                    <button
                                      onClick={() => navigate(`/sales/client-requirements/${req.id}/edit`)}
                                      className="p-1 text-amber-600 hover:bg-amber-50 rounded transition-colors"
                                      title="Edit"
                                    >
                                      <FaEdit size={13} />
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleShowQR(req)}
                                    className="p-1 text-purple-600 hover:bg-purple-50 rounded transition-colors"
                                    title="Show QR Code"
                                  >
                                    <FaQrcode size={13} />
                                  </button>
                                  <button
                                    onClick={(e) => toggleDropdown(req.id, e)}
                                    className="p-1 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                                  >
                                    <FaEllipsisV size={13} />
                                  </button>

                                  {/* Action Menu */}
                                  {activeDropdown === req.id && (
                                    <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 w-48 py-1">
                                      <button
                                        onClick={() => {
                                          navigate(`/sales/client-requirements/${req.id}`);
                                          setActiveDropdown(null);
                                        }}
                                        className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-gray-700 text-xs flex items-center gap-1.5 border-b border-gray-100"
                                      >
                                        <FaEye size={12} /> View Details
                                      </button>
                                      
                                      {req.status !== 'Converted to SO' && (
                                        <button
                                          onClick={() => {
                                            navigate(`/sales/client-requirements/${req.id}/edit`);
                                            setActiveDropdown(null);
                                          }}
                                          className="w-full text-left px-3 py-1.5 hover:bg-blue-50 text-blue-600 text-xs flex items-center gap-1.5 border-b border-gray-100"
                                        >
                                          <FaEdit size={12} /> Edit
                                        </button>
                                      )}

                                      {req.status === 'Approved' && (
                                        <button
                                          onClick={() => {
                                            navigate(`/sales/client-requirements/${req.id}`);
                                            setActiveDropdown(null);
                                          }}
                                          className="w-full text-left px-3 py-1.5 hover:bg-blue-50 text-blue-700 text-xs flex items-center gap-1.5"
                                        >
                                          <FaFileInvoiceDollar size={12} /> Generate Quotation
                                        </button>
                                      )}

                                      {req.status === 'Quotation Generated' && (
                                        <button
                                          onClick={() => {
                                            navigate(`/sales/client-requirements/${req.id}`);
                                            setActiveDropdown(null);
                                          }}
                                          className="w-full text-left px-3 py-1.5 hover:bg-purple-50 text-purple-600 text-xs flex items-center gap-1.5"
                                        >
                                          <FaCheckCircle size={12} /> Convert to SO
                                        </button>
                                      )}

                                      {req.status !== 'Converted to SO' && (
                                        <button
                                          onClick={() => {
                                            handleDeleteRequirement(req.id);
                                            setActiveDropdown(null);
                                          }}
                                          className="w-full text-left px-3 py-1.5 hover:bg-red-50 text-red-600 text-xs flex items-center gap-1.5 border-t border-gray-100"
                                        >
                                          <FaTrash size={12} /> Delete
                                        </button>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                              break;
                            default:
                              content = <span className="text-xs text-gray-600">N/A</span>;
                          }

                          return (
                            <td 
                              key={col.id} 
                              className={`px-3 py-2 ${col.id === 'actions' ? 'text-center' : 'text-left'}`}
                            >
                              {content}
                            </td>
                          );
                        })}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Card View */}
        {viewMode === 'cards' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {filteredRequirements.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-8">
                <FaExclamationCircle className="text-3xl text-gray-400 mb-2" />
                <p className="text-gray-500 font-normal text-sm">No requirements found</p>
              </div>
            ) : (
              filteredRequirements.map((req) => (
                <div
                  key={req.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all overflow-hidden cursor-pointer"
                  onClick={() => navigate(`/sales/client-requirements/${req.id}`)}
                >
                  <div className={`h-0.5 bg-gradient-to-r ${getStatusColor(req.status)}`}></div>
                  <div className="p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <ProjectIdentifier
                          projectName={req.project_name}
                          orderId={req.requirement_number}
                          type="sales"
                          size="default"
                        />
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShowQR(req);
                        }}
                        className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg ml-2"
                      >
                        <FaQrcode size={14} />
                      </button>
                    </div>

                    <div className="space-y-1.5 mb-2">
                      <div>
                        <p className="text-xs text-gray-500">Customer</p>
                        <p className="text-xs font-normal text-gray-800 truncate">{req.customer_name}</p>
                      </div>
                      <div className="flex gap-3">
                        <div className="flex-1">
                          <p className="text-xs text-gray-500">Quantity</p>
                          <p className="text-xs font-semibold text-blue-600">{req.quantity} {req.unit}</p>
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-500">Required Date</p>
                          <p className="text-xs text-gray-700">{req.required_date ? new Date(req.required_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'N/A'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mb-2">{getStatusBadge(req.status)}</div>

                    <div className="flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/sales/client-requirements/${req.id}`);
                        }}
                        className="flex-1 px-2 py-1 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-xs font-medium flex items-center justify-center gap-1"
                      >
                        <FaEye size={12} /> View
                      </button>
                      {(req.status === 'Draft' || req.status === 'Review') && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/sales/client-requirements/${req.id}/edit`);
                          }}
                          className="flex-1 px-2 py-1 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors text-xs font-medium flex items-center justify-center gap-1"
                        >
                          <FaEdit size={12} /> Edit
                        </button>
                      )}
                      {req.status !== 'Converted to SO' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteRequirement(req.id);
                          }}
                          className="px-2 py-1 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-xs font-medium flex items-center justify-center gap-1"
                          title="Delete Requirement"
                        >
                          <FaTrash size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Kanban View */}
        {viewMode === 'kanban' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 overflow-x-auto pb-3">
            {Object.entries(groupRequirementsByStatus()).map(([status, statusRequirements]) => {
              const statusConfig = {
                'Draft': { gradient: 'from-slate-400 to-slate-600', icon: FaClock, lightBg: 'bg-slate-50' },
                'Review': { gradient: 'from-orange-400 to-orange-600', icon: FaClock, lightBg: 'bg-orange-50' },
                'Approved': { gradient: 'from-green-400 to-green-600', icon: FaCheckCircle, lightBg: 'bg-green-50' },
                'Quotation Generated': { gradient: 'from-blue-400 to-blue-600', icon: FaFileInvoiceDollar, lightBg: 'bg-blue-50' },
                'Converted to SO': { gradient: 'from-purple-400 to-purple-600', icon: FaCheck, lightBg: 'bg-purple-50' }
              };
              const config = statusConfig[status] || statusConfig.Draft;
              const HeaderIcon = config.icon;

              return (
                <div key={status} className="flex flex-col min-w-[200px]">
                  {/* Column Header */}
                  <div className={`bg-gradient-to-r ${config.gradient} text-white px-3 py-2 rounded-t-lg shadow-md`}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <HeaderIcon className="text-sm" />
                        <h3 className="font-semibold text-xs truncate" title={status}>{status}</h3>
                      </div>
                      <span className="bg-white/25 backdrop-blur px-2 py-0.5 rounded-full text-xs font-bold">{statusRequirements.length}</span>
                    </div>
                  </div>

                  {/* Column Content */}
                  <div className="bg-gray-50 rounded-b-lg flex-1 min-h-[150px] max-h-[450px] overflow-y-auto p-2 space-y-2 border border-t-0 border-gray-200">
                    {statusRequirements.length === 0 ? (
                      <div className="py-8 text-center text-gray-400">
                        <FaClipboardList className="text-2xl mx-auto mb-1 text-gray-300" />
                        <p className="text-xs font-normal">No items</p>
                      </div>
                    ) : (
                      statusRequirements.map((req) => (
                        <div
                          key={req.id}
                          onClick={() => navigate(`/sales/client-requirements/${req.id}`)}
                          className="group bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer hover:border-blue-400 p-2 space-y-1 overflow-hidden"
                        >
                          <div className="flex justify-between items-start gap-1">
                            <p className="font-semibold text-gray-900 text-xs group-hover:text-blue-600 transition-colors truncate">
                              {req.requirement_number}
                            </p>
                          </div>
                          <p className="text-xs text-gray-600 truncate">{req.customer_name}</p>
                          
                          <div className="flex items-start gap-1">
                            <span className="text-[10px] text-gray-500">P:</span>
                            <span className="text-xs text-gray-700 truncate">{req.product_name || 'N/A'}</span>
                          </div>

                          <div className="flex items-center justify-between pt-1 border-t border-gray-100 text-xs">
                            <span className="font-medium text-blue-600">{req.quantity} {req.unit}</span>
                            {req.required_date && (
                              <span className="text-gray-500">
                                {new Date(req.required_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      {showQRModal && qrRequirement && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">QR Code</h2>
              <button
                onClick={() => setShowQRModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg mb-4 flex justify-center">
              <QRCodeDisplay 
                data={{
                  requirement_id: qrRequirement.id,
                  requirement_number: qrRequirement.requirement_number,
                  status: qrRequirement.status,
                  customer: qrRequirement.customer_name,
                  product: qrRequirement.product_name,
                  quantity: `${qrRequirement.quantity} ${qrRequirement.unit}`,
                  timestamp: new Date().toISOString()
                }}
                size={250}
              />
            </div>
            <p className="text-center text-gray-600 mb-4 font-semibold">{qrRequirement.requirement_number}</p>
            <button
              onClick={() => setShowQRModal(false)}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientRequirementsPage;
