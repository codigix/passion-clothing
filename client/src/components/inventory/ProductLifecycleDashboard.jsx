import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const STAGE_COLORS = {
  'created': 'bg-gray-100 text-gray-800',
  'material_allocated': 'bg-blue-100 text-blue-800',
  'in_production': 'bg-yellow-100 text-yellow-800',
  'cutting': 'bg-orange-100 text-orange-800',
  'embroidery': 'bg-purple-100 text-purple-800',
  'printing': 'bg-pink-100 text-pink-800',
  'stitching': 'bg-indigo-100 text-indigo-800',
  'finishing': 'bg-cyan-100 text-cyan-800',
  'ironing': 'bg-teal-100 text-teal-800',
  'quality_check': 'bg-amber-100 text-amber-800',
  'packing': 'bg-lime-100 text-lime-800',
  'ready_for_dispatch': 'bg-emerald-100 text-emerald-800',
  'dispatched': 'bg-green-100 text-green-800',
  'in_transit': 'bg-blue-100 text-blue-800',
  'delivered': 'bg-green-200 text-green-900',
  'returned': 'bg-red-100 text-red-800',
  'rejected': 'bg-red-200 text-red-900'
};

export default function ProductLifecycleDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedStage, setSelectedStage] = useState(null);
  const [stageProducts, setStageProducts] = useState([]);
  const [loadingStageProducts, setLoadingStageProducts] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await api.get('/product-lifecycle/analytics/dashboard');
      setAnalytics(response.data);
    } catch (error) {
      toast.error('Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  const fetchStageProducts = async (stage) => {
    setLoadingStageProducts(true);
    try {
      const response = await api.get(`/product-lifecycle/stage/${stage}`);
      setStageProducts(response.data.products);
      setSelectedStage(stage);
    } catch (error) {
      toast.error('Failed to fetch stage products');
    } finally {
      setLoadingStageProducts(false);
    }
  };

  const formatStageLabel = (stage) => {
    return stage.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading analytics...</div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-500">No analytics data available</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Total Products</p>
              <p className="text-2xl font-semibold text-gray-900">{analytics.summary.total_products}</p>
            </div>
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">📦</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Active Products</p>
              <p className="text-2xl font-semibold text-green-600">{analytics.summary.active_products}</p>
            </div>
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">✅</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Completed Products</p>
              <p className="text-2xl font-semibold text-blue-600">{analytics.summary.completed_products}</p>
            </div>
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">🏁</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stage Statistics */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Products by Stage</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {analytics.stage_statistics.map((stage) => (
            <div
              key={stage.current_stage}
              className="cursor-pointer hover:shadow-md transition-shadow border rounded-lg p-3"
              onClick={() => fetchStageProducts(stage.current_stage)}
            >
              <div className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium mb-2 ${STAGE_COLORS[stage.current_stage] || 'bg-gray-100 text-gray-800'}`}>
                {formatStageLabel(stage.current_stage)}
              </div>
              <p className="text-xl font-semibold">{stage.count}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Transitions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Transitions (Last 24 Hours)</h3>
        {analytics.recent_transitions.length > 0 ? (
          <div className="space-y-3">
            {analytics.recent_transitions.map((transition) => (
              <div key={transition.id} className="flex items-center justify-between border-b pb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{transition.lifecycle.product.name}</span>
                    <span className="text-sm text-gray-500">({transition.lifecycle.product.product_code})</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {transition.stage_from && (
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${STAGE_COLORS[transition.stage_from] || 'bg-gray-100 text-gray-800'}`}>
                        {formatStageLabel(transition.stage_from)}
                      </span>
                    )}
                    <span className="text-xs text-gray-400">→</span>
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${STAGE_COLORS[transition.stage_to] || 'bg-gray-100 text-gray-800'}`}>
                      {formatStageLabel(transition.stage_to)}
                    </span>
                  </div>
                </div>
                <div className="text-right text-sm text-gray-500">
                  <p>{formatDate(transition.transition_time)}</p>
                  {transition.operator && <p>by {transition.operator.name}</p>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No recent transitions</p>
        )}
      </div>

      {/* Overdue Products */}
      {analytics.overdue_products.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 text-red-600">Overdue Products</h3>
          <div className="space-y-3">
            {analytics.overdue_products.map((product) => (
              <div key={product.id} className="flex items-center justify-between border-b pb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{product.product.name}</span>
                    <span className="text-sm text-gray-500">({product.product.product_code})</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${STAGE_COLORS[product.current_stage] || 'bg-gray-100 text-gray-800'}`}>
                      {formatStageLabel(product.current_stage)}
                    </span>
                    {product.customer && (
                      <span className="text-sm text-gray-500">for {product.customer.name}</span>
                    )}
                  </div>
                </div>
                <div className="text-right text-sm text-red-600">
                  <p>Due: {formatDate(product.estimated_delivery_date)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stage Products Modal */}
      {selectedStage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[80vh] overflow-hidden">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold">
                Products in {formatStageLabel(selectedStage)} Stage
              </h2>
              <button
                onClick={() => setSelectedStage(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="px-6 py-4 overflow-y-auto max-h-[60vh]">
              {loadingStageProducts ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-lg">Loading products...</div>
                </div>
              ) : stageProducts.length > 0 ? (
                <div className="space-y-3">
                  {stageProducts.map((product) => (
                    <div key={product.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{product.product.name}</h4>
                          <p className="text-sm text-gray-600">Code: {product.product.product_code}</p>
                          <p className="text-sm text-gray-600">Barcode: {product.barcode}</p>
                          {product.customer && (
                            <p className="text-sm text-gray-600">Customer: {product.customer.name}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${STAGE_COLORS[product.current_stage] || 'bg-gray-100 text-gray-800'}`}>
                            {formatStageLabel(product.current_stage)}
                          </span>
                          <p className="text-sm text-gray-500 mt-1">
                            Updated: {formatDate(product.updated_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No products found in this stage</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}