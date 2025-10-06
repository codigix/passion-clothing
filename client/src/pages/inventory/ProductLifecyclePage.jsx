import React, { useState } from 'react';
import ProductLifecycleTracker from '../../components/inventory/ProductLifecycleTracker';
import ProductLifecycleDashboard from '../../components/inventory/ProductLifecycleDashboard';

export default function ProductLifecyclePage() {
  const [activeTab, setActiveTab] = useState('tracker');

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Product Lifecycle Management</h1>
        <p className="text-gray-600">Track products from creation to delivery using barcode scanning</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('tracker')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'tracker'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Barcode Tracker
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'dashboard'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Analytics Dashboard
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'tracker' && <ProductLifecycleTracker />}
        {activeTab === 'dashboard' && <ProductLifecycleDashboard />}
      </div>
    </div>
  );
}