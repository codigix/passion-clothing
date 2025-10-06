import React, { useEffect, useState } from 'react';
import BarcodeDisplay from '../BarcodeDisplay';

const categoryOptions = [
  'fabric','thread','button','zipper','elastic','lace','uniform','shirt','trouser','skirt','blazer','tie','belt','shoes','socks','accessories','raw_material','finished_goods'
];

const productTypeOptions = ['raw_material','semi_finished','finished_goods','accessory'];
const uomOptions = ['piece','meter','yard','kg','gram','liter','dozen','set'];
const statusOptions = ['active','inactive','discontinued'];

export default function ProductFormDialog({ open, onClose, onSubmit, initialValues }) {
  const [formData, setFormData] = useState({
    product_code: '',
    name: '',
    description: '',
    category: 'finished_goods',
    product_type: 'finished_goods',
    unit_of_measurement: 'piece',
    brand: '',
    color: '',
    size: '',
    cost_price: 0,
    selling_price: 0,
    mrp: 0,
    tax_percentage: 0,
    minimum_stock_level: 0,
    maximum_stock_level: 0,
    reorder_level: 0,
    status: 'active'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      if (initialValues) {
        setFormData({ ...initialValues });
      } else {
        setFormData({
          product_code: '',
          name: '',
          description: '',
          category: 'finished_goods',
          product_type: 'finished_goods',
          unit_of_measurement: 'piece',
          brand: '',
          color: '',
          size: '',
          cost_price: 0,
          selling_price: 0,
          mrp: 0,
          tax_percentage: 0,
          minimum_stock_level: 0,
          maximum_stock_level: 0,
          reorder_level: 0,
          status: 'active'
        });
      }
    }
  }, [open, initialValues]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.product_code.trim()) {
      alert('Product Code is required');
      return;
    }
    if (!formData.name.trim()) {
      alert('Product Name is required');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose(); // Close modal after successful submit
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-sm shadow-lg w-full max-w-3xl">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-semibold">{initialValues ? 'Edit Product' : 'New Product'}</h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4 overflow-y-auto max-h-[70vh]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <label className="block text-sm font-medium mb-1">Product Code <span className="text-red-500">*</span></label>
                <input
                  name="product_code"
                  value={formData.product_code}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Name <span className="text-red-500">*</span></label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  rows={2}
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category <span className="text-red-500">*</span></label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  {categoryOptions.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Product Type <span className="text-red-500">*</span></label>
                <select
                  name="product_type"
                  value={formData.product_type}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  {productTypeOptions.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Unit <span className="text-red-500">*</span></label>
                <select
                  name="unit_of_measurement"
                  value={formData.unit_of_measurement}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  {uomOptions.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Brand</label>
                <input
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Color</label>
                <input
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Size</label>
                <input
                  name="size"
                  value={formData.size}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Cost Price</label>
                <input
                  type="number"
                  step="0.01"
                  name="cost_price"
                  value={formData.cost_price}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Selling Price</label>
                <input
                  type="number"
                  step="0.01"
                  name="selling_price"
                  value={formData.selling_price}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">MRP</label>
                <input
                  type="number"
                  step="0.01"
                  name="mrp"
                  value={formData.mrp}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tax %</label>
                <input
                  type="number"
                  step="0.01"
                  name="tax_percentage"
                  value={formData.tax_percentage}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Min Stock</label>
                <input
                  type="number"
                  name="minimum_stock_level"
                  value={formData.minimum_stock_level}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Max Stock</label>
                <input
                  type="number"
                  name="maximum_stock_level"
                  value={formData.maximum_stock_level}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Reorder Level</label>
                <input
                  type="number"
                  name="reorder_level"
                  value={formData.reorder_level}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  {statusOptions.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Barcode Display Section */}
            {(initialValues?.barcode || formData.barcode) && (
              <div className="mt-6 border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Product Barcode</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex flex-col items-center space-y-4">
                    <BarcodeDisplay value={initialValues?.barcode || formData.barcode} />
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Barcode: <span className="font-mono font-medium">{initialValues?.barcode || formData.barcode}</span></p>
                      <p className="text-xs text-gray-500 mt-1">Scan this barcode to quickly access product information</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="px-6 py-4 border-t flex justify-end gap-2">
            <button type="button" className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300" onClick={onClose} disabled={isSubmitting}>Cancel</button>
            <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700" disabled={isSubmitting}>{initialValues ? 'Save Changes' : 'Create'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}