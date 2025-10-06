import React, { useState } from 'react';
import { Building, Receipt, Star, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import VendorsPage from './VendorsPage';
import GoodsReceiptPage from './GoodsReceiptPage';
import VendorPerformancePage from './VendorPerformancePage';

const VendorManagementPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    { id: 0, label: 'Vendor Details', icon: Building, component: VendorsPage },
    { id: 1, label: 'Goods Receipt', icon: Receipt, component: GoodsReceiptPage },
    { id: 2, label: 'Vendor Performance', icon: Star, component: VendorPerformancePage },
  ];

  const ActiveComponent = tabs[activeTab].component;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/procurement/dashboard')}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                title="Back to Dashboard"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Vendor Management
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Manage vendors, track receipts, and monitor performance
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 border-b border-gray-200 -mb-px">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    group inline-flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                    ${activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'}`} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="transition-all duration-200">
        <ActiveComponent />
      </div>
    </div>
  );
};

export default VendorManagementPage;