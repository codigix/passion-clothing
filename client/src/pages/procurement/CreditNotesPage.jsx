import React, { useState, useEffect } from 'react';
import {
  FaMoneyBillWave,
  FaSearch,
  FaFilter,
  FaChevronRight,
  FaSpinner,
  FaPlus,
  FaDownload,
  FaEye,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaFileAlt,
  FaSync
} from 'react-icons/fa';
import { CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import CreditNoteFlow from '../../components/procurement/CreditNoteFlow';

const CreditNotesPage = () => {
  const navigate = useNavigate();
  const [creditNotes, setCreditNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedNote, setSelectedNote] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  });

  useEffect(() => {
    fetchCreditNotes();
  }, [pagination.page]);

  useEffect(() => {
    applyFilters();
  }, [creditNotes, searchTerm, statusFilter]);

  const fetchCreditNotes = async () => {
    setLoading(true);
    try {
      const response = await api.get('/credit-notes/', {
        params: {
          limit: pagination.limit,
          offset: (pagination.page - 1) * pagination.limit
        }
      });

      const notes = response.data.creditNotes || [];
      setCreditNotes(notes);
      setPagination(prev => ({
        ...prev,
        total: response.data.total || 0
      }));
    } catch (error) {
      console.error('Error fetching credit notes:', error);
      toast.error('Failed to load credit notes');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = creditNotes;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(note =>
        note.credit_note_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.Vendor?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.GRN?.grn_number?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(note => note.status === statusFilter);
    }

    setFilteredNotes(filtered);
  };

  const statusColors = {
    draft: 'bg-slate-100 text-slate-700 border-slate-300',
    issued: 'bg-blue-100 text-blue-700 border-blue-300',
    accepted: 'bg-green-100 text-green-700 border-green-300',
    rejected: 'bg-red-100 text-red-700 border-red-300',
    settled: 'bg-purple-100 text-purple-700 border-purple-300',
    cancelled: 'bg-gray-100 text-gray-700 border-gray-300'
  };

  const statusIcons = {
    draft: FaClock,
    issued: FaFileAlt,
    accepted: FaCheckCircle,
    rejected: FaTimesCircle,
    settled: CreditCard,
    cancelled: FaTimesCircle
  };

  const handleViewDetail = (note) => {
    setSelectedNote(note);
    setShowDetail(true);
  };

  const handleCloseDetail = () => {
    setShowDetail(false);
    setTimeout(() => setSelectedNote(null), 300);
  };

  if (showDetail && selectedNote) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={handleCloseDetail}
            className="mb-6 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-semibold transition flex items-center gap-2"
          >
            <FaChevronRight className="w-4 h-4 rotate-180" />
            Back to List
          </button>
          <CreditNoteFlow
            creditNote={selectedNote}
            onUpdate={(updated) => {
              setSelectedNote(updated);
              fetchCreditNotes();
            }}
            onClose={handleCloseDetail}
          />
        </div>
      </div>
    );
  }

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
              <FaMoneyBillWave className="text-blue-600" />
              Credit Notes
            </h1>
            <p className="text-slate-600 mt-1">Manage and track credit notes for material overage</p>
          </div>
          <button
            onClick={() => navigate('/procurement/dashboard')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition flex items-center gap-2 w-fit"
          >
            <FaPlus className="w-4 h-4" />
            Create Credit Note
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border-2 border-slate-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                <FaSearch className="inline w-4 h-4 mr-2" />
                Search
              </label>
              <input
                type="text"
                placeholder="Search by CN #, Vendor, or GRN #..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Status Filter */}
            <div className="md:w-64">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                <FaFilter className="inline w-4 h-4 mr-2" />
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
                className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="issued">Issued</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
                <option value="settled">Settled</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Refresh */}
            <div className="flex items-end">
              <button
                onClick={fetchCreditNotes}
                disabled={loading}
                className="w-full md:w-auto px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <FaSpinner className="w-4 h-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <FaSync className="w-4 h-4" />
                    Refresh
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Credit Notes Table */}
        {loading && filteredNotes.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <FaSpinner className="w-12 h-12 animate-spin text-blue-600" />
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="bg-white rounded-lg border-2 border-slate-200 p-12 text-center">
            <FaFileAlt className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 text-lg">No credit notes found</p>
            <p className="text-slate-500 text-sm mt-2">Try adjusting your search or filters</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg border-2 border-slate-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-100 border-b-2 border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left font-bold text-slate-700">Credit Note #</th>
                    <th className="px-6 py-4 text-left font-bold text-slate-700">Vendor</th>
                    <th className="px-6 py-4 text-left font-bold text-slate-700">GRN #</th>
                    <th className="px-6 py-4 text-right font-bold text-slate-700">Amount</th>
                    <th className="px-6 py-4 text-center font-bold text-slate-700">Type</th>
                    <th className="px-6 py-4 text-center font-bold text-slate-700">Status</th>
                    <th className="px-6 py-4 text-center font-bold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredNotes.map((note) => {
                    const StatusIcon = statusIcons[note.status] || FaClock;
                    const statusColor = statusColors[note.status] || statusColors.draft;

                    return (
                      <tr key={note.id} className="hover:bg-slate-50 transition">
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-800">{note.credit_note_number}</p>
                          <p className="text-xs text-slate-500 mt-1">
                            {new Date(note.created_at).toLocaleDateString()}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-slate-800">
                            {note.Vendor?.name || 'N/A'}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-slate-700">{note.GRN?.grn_number || 'N/A'}</p>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <p className="font-bold text-blue-600 text-lg">
                            ₹{Number(note.total_credit_amount || 0).toFixed(2)}
                          </p>
                          <p className="text-xs text-slate-500">
                            {note.credit_note_type?.replace('_', ' ')}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-block px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-semibold">
                            {note.settlement_method?.replace('_', ' ') || 'Pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border-2 ${statusColor}`}>
                            <StatusIcon className="w-4 h-4" />
                            {note.status?.toUpperCase().replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleViewDetail(note)}
                            className="inline-flex items-center gap-1 px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg font-semibold transition text-sm"
                          >
                            <FaEye className="w-4 h-4" />
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-slate-600">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                  {pagination.total} credit notes
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPagination(prev => ({
                      ...prev,
                      page: Math.max(1, prev.page - 1)
                    }))}
                    disabled={pagination.page === 1}
                    className="px-4 py-2 border-2 border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 font-semibold transition"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setPagination(prev => ({ ...prev, page }))}
                      className={`px-4 py-2 rounded-lg font-semibold transition ${
                        pagination.page === page
                          ? 'bg-blue-600 text-white'
                          : 'border-2 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setPagination(prev => ({
                      ...prev,
                      page: Math.min(totalPages, prev.page + 1)
                    }))}
                    disabled={pagination.page === totalPages}
                    className="px-4 py-2 border-2 border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 font-semibold transition"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CreditNotesPage;
