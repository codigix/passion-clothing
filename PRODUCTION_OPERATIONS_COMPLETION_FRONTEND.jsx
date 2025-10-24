/**
 * Production Operations View - Completion & Shipment Flow
 * 
 * Add this code to: ProductionOperationsViewPage.jsx
 * 
 * Features:
 * 1. Auto-detect when all stages are completed
 * 2. Show "Complete & Ready for Shipment" button
 * 3. Material reconciliation dialog
 * 4. Completion success screen
 * 5. Auto-redirect to Shipment Dashboard
 */

import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Package, X, ChevronRight } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

// ============================================================
// STATE ADDITIONS (Add to ProductionOperationsViewPage useState)
// ============================================================

const ProductionOperationsViewPage = () => {
  // ... existing states ...
  
  // ADD THESE STATES FOR COMPLETION WORKFLOW:
  const [allStagesCompleted, setAllStagesCompleted] = useState(false);
  const [completionDialogOpen, setCompletionDialogOpen] = useState(false);
  const [materialReconciliationOpen, setMaterialReconciliationOpen] = useState(false);
  const [completionSuccessOpen, setCompletionSuccessOpen] = useState(false);
  
  // Material reconciliation states
  const [availableMaterials, setAvailableMaterials] = useState([]);
  const [selectedMaterials, setSelectedMaterials] = useState({});
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [completingProduction, setCompletingProduction] = useState(false);
  const [completionSummary, setCompletionSummary] = useState(null);

  // ============================================================
  // EFFECT: Check if all stages are completed
  // ============================================================
  useEffect(() => {
    if (productionOrder && productionOrder.stages) {
      const completed = productionOrder.stages.length > 0 && 
                       productionOrder.stages.every(s => s.status === 'completed');
      setAllStagesCompleted(completed);
    }
  }, [productionOrder]);

  // ============================================================
  // HANDLER: Fetch Materials for Reconciliation
  // ============================================================
  const fetchMaterialsForReconciliation = async () => {
    setLoadingMaterials(true);
    try {
      const response = await api.get(`/manufacturing/orders/${id}/materials/reconciliation`);
      
      if (response.data.success) {
        setAvailableMaterials(response.data.materials || []);
        
        // Initialize selected materials - all checked by default for return
        const initialSelection = {};
        response.data.materials.forEach(material => {
          initialSelection[material.inventory_id] = true;
        });
        setSelectedMaterials(initialSelection);
      } else {
        toast.error(response.data.message || 'Failed to fetch materials');
      }
    } catch (error) {
      console.error('Error fetching materials:', error);
      toast.error('Failed to load materials for reconciliation');
      // If error, allow to continue anyway
      setAvailableMaterials([]);
    } finally {
      setLoadingMaterials(false);
    }
  };

  // ============================================================
  // HANDLER: Open Completion Dialog (Pre-check)
  // ============================================================
  const handleCompleteProduction = () => {
    // Validate production order
    if (productionOrder.status === 'completed') {
      toast.error('This production order is already completed');
      return;
    }

    if (productionOrder.approved_quantity <= 0) {
      toast.error('No approved quantity. Please ensure items are approved before completion');
      return;
    }

    if (!allStagesCompleted) {
      const completedCount = productionOrder.stages?.filter(s => s.status === 'completed').length || 0;
      const totalCount = productionOrder.stages?.length || 0;
      toast.error(`Cannot complete. Only ${completedCount}/${totalCount} stages completed`);
      return;
    }

    setCompletionDialogOpen(true);
  };

  // ============================================================
  // HANDLER: Proceed to Material Reconciliation
  // ============================================================
  const handleProceedToMaterialReconciliation = async () => {
    setCompletionDialogOpen(false);
    setMaterialReconciliationOpen(true);
    await fetchMaterialsForReconciliation();
  };

  // ============================================================
  // HANDLER: Toggle Material Selection
  // ============================================================
  const handleToggleMaterialReturn = (inventoryId) => {
    setSelectedMaterials(prev => ({
      ...prev,
      [inventoryId]: !prev[inventoryId]
    }));
  };

  // ============================================================
  // HANDLER: Complete Production & Create Shipment
  // ============================================================
  const handleCompleteAndShip = async () => {
    setCompletingProduction(true);
    try {
      // Prepare material reconciliation data
      const materialsToReturn = availableMaterials
        .filter(m => selectedMaterials[m.inventory_id])
        .map(m => ({
          inventory_id: m.inventory_id,
          quantity_used: m.quantity_used,
          quantity_leftover: m.quantity_leftover,
          return_to_stock: true
        }));

      const hasAnythingToReturn = materialsToReturn.length > 0;

      const payload = {
        material_reconciliation: {
          return_to_inventory: hasAnythingToReturn,
          leftover_materials: materialsToReturn,
          notes: `Material reconciliation completed. ${materialsToReturn.length} items returned to inventory.`
        },
        shipment_details: {
          expected_delivery_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          special_instructions: productionOrder.special_instructions || ''
        }
      };

      // Call completion endpoint
      const response = await api.post(
        `/manufacturing/orders/${id}/complete-and-ship`,
        payload
      );

      if (response.data.success) {
        // Show success summary
        setCompletionSummary({
          production_order: response.data.production_order,
          shipment: response.data.shipment,
          materials_returned: response.data.material_reconciliation.items_returned
        });

        setMaterialReconciliationOpen(false);
        setCompletionSuccessOpen(true);

        // Auto-redirect after 3 seconds
        setTimeout(() => {
          navigate('/shipment');
        }, 3000);

        toast.success('Production completed and shipment created!');
      } else {
        toast.error(response.data.message || 'Failed to complete production');
      }
    } catch (error) {
      console.error('Error completing production:', error);
      const errorMsg = error.response?.data?.message || 'Failed to complete production';
      toast.error(errorMsg);
    } finally {
      setCompletingProduction(false);
    }
  };

  // ============================================================
  // RENDER: "Complete & Ready for Shipment" Button
  // Add this to the main stage view area (next to Edit button)
  // ============================================================
  const renderCompletionButton = () => {
    if (!allStagesCompleted || productionOrder.status === 'completed') {
      return null;
    }

    return (
      <button
        onClick={handleCompleteProduction}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-lg"
        title="Mark all stages as complete and prepare for shipment"
      >
        <CheckCircle className="w-5 h-5" />
        <span className="font-semibold">Complete & Ready for Shipment</span>
        <ChevronRight className="w-4 h-4" />
      </button>
    );
  };

  // ============================================================
  // COMPONENT: Completion Confirmation Dialog
  // ============================================================
  const CompletionConfirmationDialog = () => (
    <div className={`fixed inset-0 z-50 ${completionDialogOpen ? 'block' : 'hidden'}`}>
      <div className="fixed inset-0 bg-black bg-opacity-50"></div>
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Complete Production?</h2>
            <button
              onClick={() => setCompletionDialogOpen(false)}
              className="ml-auto p-1 hover:bg-gray-100 rounded"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="space-y-3 bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900">Summary:</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex justify-between">
                <span>Production Order:</span>
                <span className="font-semibold">{productionOrder?.production_number}</span>
              </li>
              <li className="flex justify-between">
                <span>Total Quantity:</span>
                <span className="font-semibold">{productionOrder?.quantity}</span>
              </li>
              <li className="flex justify-between">
                <span>Approved Quantity:</span>
                <span className="font-semibold text-green-600">{productionOrder?.approved_quantity}</span>
              </li>
              <li className="flex justify-between">
                <span>All Stages:</span>
                <span className="font-semibold text-green-600">✓ Completed</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3 bg-amber-50 p-4 rounded-lg border border-amber-200">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-amber-800">
                <p className="font-semibold mb-1">Next Steps:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Review leftover materials</li>
                  <li>Return materials to inventory (optional)</li>
                  <li>Shipment will be created automatically</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setCompletionDialogOpen(false)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleProceedToMaterialReconciliation}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Proceed
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // ============================================================
  // COMPONENT: Material Reconciliation Dialog
  // ============================================================
  const MaterialReconciliationDialog = () => (
    <div className={`fixed inset-0 z-50 ${materialReconciliationOpen ? 'block' : 'hidden'}`}>
      <div className="fixed inset-0 bg-black bg-opacity-50"></div>
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6">
          
          {/* Header */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-full">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Material Reconciliation</h2>
                <p className="text-sm text-gray-600">Review and return leftover materials to inventory</p>
              </div>
            </div>
            <button
              onClick={() => setMaterialReconciliationOpen(false)}
              className="p-1 hover:bg-gray-100 rounded"
              disabled={completingProduction}
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Loading State */}
          {loadingMaterials && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading materials...</span>
            </div>
          )}

          {/* No Materials Message */}
          {!loadingMaterials && availableMaterials.length === 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-green-800 font-medium">All materials were used in production</p>
              <p className="text-sm text-green-700">No leftover materials to return</p>
            </div>
          )}

          {/* Materials Table */}
          {!loadingMaterials && availableMaterials.length > 0 && (
            <div className="space-y-4">
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Material</th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-700">Used Qty</th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-700">Leftover</th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-700">Return?</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {availableMaterials.map(material => (
                      <tr key={material.inventory_id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-gray-900">{material.material_name}</p>
                            <p className="text-xs text-gray-600">{material.category}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center text-gray-700">
                          {material.quantity_used} {material.unit}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="font-semibold text-blue-600">
                            {material.quantity_leftover} {material.unit}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={selectedMaterials[material.inventory_id] || false}
                            onChange={() => handleToggleMaterialReturn(material.inventory_id)}
                            disabled={completingProduction}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">
                    {Object.values(selectedMaterials).filter(v => v).length}
                  </span>
                  {' '}of{' '}
                  <span className="font-semibold">{availableMaterials.length}</span>
                  {' '}materials selected to return
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={() => setMaterialReconciliationOpen(false)}
              disabled={completingProduction}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleCompleteAndShip}
              disabled={completingProduction || loadingMaterials}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {completingProduction && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              <span>{completingProduction ? 'Processing...' : 'Complete & Create Shipment'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // ============================================================
  // COMPONENT: Completion Success Dialog
  // ============================================================
  const CompletionSuccessDialog = () => (
    <div className={`fixed inset-0 z-50 ${completionSuccessOpen ? 'block' : 'hidden'}`}>
      <div className="fixed inset-0 bg-black bg-opacity-50"></div>
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 space-y-6 text-center">
          
          {/* Success Icon */}
          <div className="flex justify-center">
            <div className="p-4 bg-green-100 rounded-full animate-bounce">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>

          {/* Title */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Production Complete!</h2>
            <p className="text-sm text-gray-600 mt-1">Your order is ready for shipment</p>
          </div>

          {/* Summary */}
          {completionSummary && (
            <div className="space-y-3 bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="text-left space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-700">Production:</span>
                  <span className="font-semibold text-gray-900">
                    {completionSummary.production_order.production_number}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Approved Qty:</span>
                  <span className="font-semibold text-green-600">
                    {completionSummary.production_order.approved_quantity} units
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Shipment:</span>
                  <span className="font-semibold text-blue-600">
                    {completionSummary.shipment.shipment_number}
                  </span>
                </div>
                {completionSummary.materials_returned > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-700">Materials Returned:</span>
                    <span className="font-semibold text-amber-600">
                      {completionSummary.materials_returned} items
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Redirect Message */}
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              Redirecting to Shipment Dashboard in <span className="font-bold">3 seconds</span>...
            </p>
          </div>

          {/* Close Button */}
          <button
            onClick={() => {
              setCompletionSuccessOpen(false);
              navigate('/shipment');
            }}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Go to Shipment Dashboard Now
          </button>
        </div>
      </div>
    </div>
  );

  // ============================================================
  // RENDER: Add button to the page header
  // Add this in the header section next to other action buttons
  // ============================================================
  
  return (
    <div className="space-y-6">
      {/* Header with completion button */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Production Operations</h1>
        <div className="flex gap-2">
          {renderCompletionButton()}
          {/* Existing buttons */}
        </div>
      </div>

      {/* Existing content */}
      {/* ... */}

      {/* Dialogs */}
      <CompletionConfirmationDialog />
      <MaterialReconciliationDialog />
      <CompletionSuccessDialog />
    </div>
  );
};

export default ProductionOperationsViewPage;