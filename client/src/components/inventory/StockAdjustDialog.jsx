import React from 'react';
import { useForm } from 'react-hook-form';

export default function StockAdjustDialog({ open, onClose, onSubmit, initialValues, mode }) {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      current_stock: initialValues?.current_stock ?? 0,
      reserved_stock: initialValues?.reserved_stock ?? 0,
      unit_cost: initialValues?.unit_cost ?? 0,
      adjustment_reason: '',
      notes: ''
    }
  });

  React.useEffect(() => {
    if (open) {
      reset({
        current_stock: initialValues?.current_stock ?? 0,
        reserved_stock: initialValues?.reserved_stock ?? 0,
        unit_cost: initialValues?.unit_cost ?? 0,
        adjustment_reason: '',
        notes: ''
      });
    }
  }, [open, initialValues, reset]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-semibold">
            {mode === 'add' ? 'Increase Stock' : mode === 'remove' ? 'Decrease Stock' : 'Edit Stock'}
          </h2>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Current Stock</label>
                <input type="number" className="w-full border border-gray-300 rounded px-3 py-2" {...register('current_stock')} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Reserved Stock</label>
                <input type="number" className="w-full border border-gray-300 rounded px-3 py-2" {...register('reserved_stock')} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Unit Cost</label>
                <input type="number" step="0.01" className="w-full border border-gray-300 rounded px-3 py-2" {...register('unit_cost')} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Reason</label>
                <input className="w-full border border-gray-300 rounded px-3 py-2" {...register('adjustment_reason')} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea rows={2} className="w-full border border-gray-300 rounded px-3 py-2" {...register('notes')} />
              </div>
            </div>
          </div>
          <div className="px-6 py-4 border-t flex justify-end gap-2">
            <button type="button" className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300" onClick={onClose}>Cancel</button>
            <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}