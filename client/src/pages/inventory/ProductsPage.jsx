import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FaPlus, FaEdit, FaSearch } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';
import clsx from 'clsx';
import api from '../../utils/api';
import ProductFormDialog from '../../components/inventory/ProductFormDialog';
import DataTable from '../../components/tables/DataTable';
import toast from 'react-hot-toast';

const STATUS_CLASS_MAP = {
  active: 'bg-emerald-100 text-emerald-700',
  inactive: 'bg-amber-100 text-amber-700',
  discontinued: 'bg-rose-100 text-rose-700',
};

function getStatusPillClass(status) {
  if (!status) {
    return 'bg-slate-100 text-slate-600';
  }

  const normalized = status.toLowerCase();
  return STATUS_CLASS_MAP[normalized] || 'bg-slate-100 text-slate-600';
}

export default function ProductsPage() {
  const location = useLocation();
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    // Check if search is provided in URL parameters
    const urlParams = new URLSearchParams(location.search);
    const searchParam = urlParams.get('search');
    if (searchParam) {
      setSearch(searchParam);
    }
  }, [location]);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/products', { params: { search } });
      setItems(data.products || []);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const columns = useMemo(() => [
    {
      id: 'product_code',
      label: 'Code',
      className: 'font-semibold text-slate-900',
    },
    {
      id: 'name',
      label: 'Product',
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-medium text-slate-900">{row.name || '—'}</span>
          <span className="text-xs text-slate-500">
            {row.product_type || row.category || 'No type specified'}
          </span>
        </div>
      ),
    },
    {
      id: 'barcode',
      label: 'Barcode',
      render: (row) => (
        <span className="font-mono text-xs text-slate-600">
          {row.barcode || '—'}
        </span>
      ),
    },
    {
      id: 'category',
      label: 'Category',
    },
    {
      id: 'unit_of_measurement',
      label: 'Unit',
      align: 'center',
    },
    {
      id: 'status',
      label: 'Status',
      render: (row) => (
        <span className={clsx('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium capitalize', getStatusPillClass(row.status))}>
          {row.status || 'unknown'}
        </span>
      ),
    },
  ], []);

  const handleCreate = async (form) => {
    try {
      await api.post('/products', form);
      toast.success('Product created');
      setDialogOpen(false);
      fetchItems();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Create failed');
    }
  };

  const handleUpdate = async (form) => {
    try {
      await api.put(`/products/${editing.id}`, form);
      toast.success('Product updated');
      setDialogOpen(false);
      setEditing(null);
      fetchItems();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Update failed');
    }
  };

  const handleSearchSubmit = useCallback((event) => {
    event.preventDefault();
    fetchItems();
  }, [fetchItems]);

  return (
    <div className="p-6 space-y-6">
      <DataTable
        title="Products"
        description="Manage catalog items, types, and availability."
        columns={columns}
        rows={items}
        loading={loading}
        emptyMessage="No products found. Adjust your filters or create a new product."
        headerActions={(
          <button
            type="button"
            className="px-4 py-1 text-sm font-medium text-white bg-primary border border-transparent rounded shadow cursor-pointer select-none transition ease-in-out duration-150 hover:border-primary hover:text-primary  hover:bg-transparent flex gap-2 items-center"
            onClick={() => {
              setEditing(null);
              setDialogOpen(true);
            }}
          >
            <FaPlus size={14} />
            New Product
          </button>
        )}
        toolbar={(
          <form onSubmit={handleSearchSubmit} className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-sm">
              <FaSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                type="search"
                value={search}
                placeholder="Search products by name, code, or category"
                onChange={(event) => setSearch(event.target.value)}
                className="w-full rounded border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </form>
        )}
        rowActions={(row) => (
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full p-2 text-indigo-600 transition hover:bg-indigo-50 hover:text-indigo-700"
            onClick={() => {
              setEditing(row);
              setDialogOpen(true);
            }}
          >
            <FaEdit size={14} />
          </button>
        )}
      />

      <ProductFormDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditing(null);
        }}
        onSubmit={editing ? handleUpdate : handleCreate}
        initialValues={editing}
      />
    </div>
  );
}