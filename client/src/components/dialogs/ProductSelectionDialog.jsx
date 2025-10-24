import React, { useState, useMemo } from 'react';
import { X, Plus, Search } from 'lucide-react';

const ProductSelectionDialog = ({ isOpen, onClose, availableProducts, setSelectedProduct, onConfirm, onCreateNewProduct }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProductId, setSelectedProductId] = useState(null);

  const filteredProducts = useMemo(() => {
    if (!availableProducts || availableProducts.length === 0) return [];
    return availableProducts.filter(product =>
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.product_code?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [availableProducts, searchTerm]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (selectedProductId) {
      setSelectedProduct(selectedProductId);
      onConfirm();
      setSearchTerm('');
      setSelectedProductId(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex justify-between items-center p-6 border-b bg-white">
          <h2 className="text-xl font-bold text-gray-800">Select Product for Production</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by product name or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Product List */}
          {availableProducts && availableProducts.length > 0 ? (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <label key={product.id} className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                    <input
                      type="radio"
                      name="product"
                      value={product.id}
                      checked={selectedProductId === product.id}
                      onChange={() => setSelectedProductId(product.id)}
                      className="w-4 h-4"
                    />
                    <div className="ml-4 flex-1">
                      <p className="font-semibold text-gray-800">{product.name}</p>
                      <p className="text-sm text-gray-500">Code: {product.product_code || 'N/A'}</p>
                    </div>
                  </label>
                ))
              ) : (
                <p className="text-center text-gray-500 py-4">No products match your search</p>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No products available</p>
              <button
                onClick={onCreateNewProduct}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Product</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex justify-end space-x-3 p-6 border-t bg-gray-50">
          {availableProducts && availableProducts.length > 0 && (
            <button
              onClick={onCreateNewProduct}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition"
            >
              Create New Product
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedProductId}
            className={`px-4 py-2 text-white rounded transition ${
              selectedProductId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            Confirm Selection
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductSelectionDialog;