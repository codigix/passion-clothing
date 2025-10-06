import React, { useMemo, useState } from 'react';
import { FaPlus, FaEdit, FaTrash, FaEye, FaSearch, FaFilter, FaFileExport } from 'react-icons/fa';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import api from '../../utils/api';
import DataTable from '../../components/tables/DataTable';
import VendorForm from '../../components/procurement/VendorForm';

const STATUS_CLASS_MAP = {
  active: 'bg-emerald-100 text-emerald-700',
  inactive: 'bg-slate-100 text-slate-600',
  blacklisted: 'bg-rose-100 text-rose-700',
};

const VENDOR_TYPE_CLASS_MAP = {
  material_supplier: 'bg-blue-100 text-blue-700',
  outsource_partner: 'bg-purple-100 text-purple-700',
  service_provider: 'bg-cyan-100 text-cyan-700',
  both: 'bg-indigo-100 text-indigo-700',
};

function getStatusPill(status) {
  const key = (status || '').toLowerCase();
  return STATUS_CLASS_MAP[key] || STATUS_CLASS_MAP.active;
}

function getVendorTypePill(type) {
  const key = (type || '').toLowerCase();
  return VENDOR_TYPE_CLASS_MAP[key] || VENDOR_TYPE_CLASS_MAP.material_supplier;
}

const QUERY_KEY = ['procurement', 'vendors'];

function useVendors(filters) {
  return useQuery({
    queryKey: [...QUERY_KEY, filters],
    queryFn: async () => {
      const { data } = await api.get('/procurement/vendors', { params: filters });
      return data?.vendors || [];
    },
  });
}

function useDeleteVendor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (vendorId) => {
      await api.delete(`/procurement/vendors/${vendorId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success('Vendor deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete vendor');
    },
  });
}

export default function VendorsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [modalMode, setModalMode] = useState(null);
  const [isDeleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const { data: vendors = [], isFetching } = useVendors({ search });
  const deleteMutation = useDeleteVendor();

  // Handler functions
  const handleCreate = () => {
    setSelectedVendor(null);
    setModalMode('create');
  };

  const handleView = (row) => {
    setSelectedVendor(row);
    setModalMode('view');
  };

  const handleEdit = (row) => {
    setSelectedVendor(row);
    setModalMode('edit');
  };

  const handleDelete = (row) => {
    setSelectedVendor(row);
    setDeleteConfirmOpen(true);
  };

  const columns = useMemo(() => [
    {
      id: 'vendor_code',
      label: 'Vendor Code',
      className: 'font-medium text-slate-900',
    },
    {
      id: 'name',
      label: 'Vendor Name',
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-medium text-slate-900">{row.name}</span>
          {row.company_name && (
            <span className="text-xs text-slate-500">{row.company_name}</span>
          )}
        </div>
      ),
    },
    {
      id: 'vendor_type',
      label: 'Type',
      render: (row) => (
        <span className={clsx('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium capitalize', getVendorTypePill(row.vendor_type))}>
          {row.vendor_type?.replace('_', ' ') || 'N/A'}
        </span>
      ),
    },
    {
      id: 'category',
      label: 'Category',
      render: (row) => (
        <span className="capitalize">
          {row.category || '—'}
        </span>
      ),
    },
    {
      id: 'contact',
      label: 'Contact',
      render: (row) => (
        <div className="flex flex-col">
          {row.contact_person && (
            <span className="text-sm text-slate-900">{row.contact_person}</span>
          )}
          {row.phone && (
            <span className="text-xs text-slate-500">{row.phone}</span>
          )}
          {row.email && (
            <span className="text-xs text-blue-600">{row.email}</span>
          )}
        </div>
      ),
    },
    {
      id: 'location',
      label: 'Location',
      render: (row) => (
        <div className="flex flex-col">
          {row.city && <span className="text-sm">{row.city}</span>}
          {row.state && <span className="text-xs text-slate-500">{row.state}</span>}
        </div>
      ),
    },
    {
      id: 'rating',
      label: 'Rating',
      align: 'center',
      render: (row) => (
        row.rating ? (
          <div className="flex items-center justify-center gap-1">
            <span className="text-yellow-500">★</span>
            <span className="font-medium">{parseFloat(row.rating).toFixed(1)}</span>
          </div>
        ) : (
          <span className="text-slate-400">—</span>
        )
      ),
    },
    {
      id: 'status',
      label: 'Status',
      render: (row) => (
        <span className={clsx('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium capitalize', getStatusPill(row.status))}>
          {row.status || 'active'}
        </span>
      ),
    },
    {
      id: 'actions',
      label: 'Actions',
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-indigo-600"
            onClick={() => handleView(row)}
            aria-label="View details"
          >
            <FaEye size={14} />
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-indigo-600"
            onClick={() => handleEdit(row)}
            aria-label="Edit vendor"
          >
            <FaEdit size={14} />
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full p-2 text-rose-500 transition hover:bg-rose-50 hover:text-rose-600"
            onClick={() => handleDelete(row)}
            aria-label="Delete vendor"
          >
            <FaTrash size={14} />
          </button>
        </div>
      ),
    },
  ], []);

  // Filter vendors based on filters
  const filteredVendors = useMemo(() => {
    return vendors.filter(vendor => {
      if (filterStatus !== 'all' && vendor.status !== filterStatus) return false;
      if (filterType !== 'all' && vendor.vendor_type !== filterType) return false;
      if (filterCategory !== 'all' && vendor.category !== filterCategory) return false;
      return true;
    });
  }, [vendors, filterStatus, filterType, filterCategory]);

  // Get unique categories from vendors
  const categories = useMemo(() => {
    const cats = [...new Set(vendors.map(v => v.category).filter(Boolean))];
    return cats.sort();
  }, [vendors]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Vendors</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your vendor database and relationships
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <FaFilter className="h-4 w-4" />
            Filters
          </button>
          <button
            type="button"
            onClick={handleCreate}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <FaPlus className="h-4 w-4" />
            Add Vendor
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="rounded-md bg-blue-500 p-3">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Vendors</dt>
                  <dd className="text-lg font-semibold text-gray-900">{vendors.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="rounded-md bg-green-500 p-3">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active</dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {vendors.filter(v => v.status === 'active').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="rounded-md bg-purple-500 p-3">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Material Suppliers</dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {vendors.filter(v => v.vendor_type === 'material_supplier' || v.vendor_type === 'both').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="rounded-md bg-orange-500 p-3">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Service Providers</dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {vendors.filter(v => v.vendor_type === 'service_provider' || v.vendor_type === 'both').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="blacklisted">Blacklisted</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Vendor Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              >
                <option value="all">All Types</option>
                <option value="material_supplier">Material Supplier</option>
                <option value="outsource_partner">Outsource Partner</option>
                <option value="service_provider">Service Provider</option>
                <option value="both">Both</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat} className="capitalize">{cat}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={() => {
                  setFilterStatus('all');
                  setFilterType('all');
                  setFilterCategory('all');
                }}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <FaSearch className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full rounded-lg border-slate-300 pl-10 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="Search vendors by name, code, or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Vendors Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <DataTable
          columns={columns}
          rows={filteredVendors}
          loading={isFetching}
          emptyMessage="No vendors found. Create your first vendor to get started."
        />
      </div>

      {/* Vendor Form Modal */}
      <VendorForm
        open={!!modalMode}
        mode={modalMode}
        initialValues={selectedVendor}
        onClose={() => {
          setModalMode(null);
          setSelectedVendor(null);
        }}
        onSubmit={async (values, closeModal) => {
          try {
            if (modalMode === 'create') {
              await api.post('/procurement/vendors', values);
              toast.success('Vendor created successfully');
            } else if (modalMode === 'edit') {
              await api.put(`/procurement/vendors/${selectedVendor.id}`, values);
              toast.success('Vendor updated successfully');
            }
            queryClient.invalidateQueries({ queryKey: QUERY_KEY });
            closeModal();
          } catch (error) {
            toast.error(error.response?.data?.message || `Failed to ${modalMode} vendor`);
          }
        }}
      />

      {/* Delete Confirmation Dialog */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Delete Vendor</h3>
              <p className="mt-2 text-sm text-slate-600">
                Are you sure you want to delete vendor "{selectedVendor?.name}"? This action cannot be undone.
              </p>
              {selectedVendor?.total_orders > 0 && (
                <p className="mt-2 text-sm text-amber-600 font-medium">
                  Note: This vendor has {selectedVendor.total_orders} purchase order(s). Deletion may not be allowed.
                </p>
              )}
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded shadow-sm hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  await deleteMutation.mutateAsync(selectedVendor.id);
                  setDeleteConfirmOpen(false);
                  setSelectedVendor(null);
                }}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-rose-600 rounded shadow-sm hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}