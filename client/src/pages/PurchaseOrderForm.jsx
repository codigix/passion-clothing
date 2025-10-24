import React, { useState } from 'react';

const initialFabricRow = { fabricType: '', color: '', hsn: '', quality: '', uom: '', quantity: '', rate: '', total: 0 };
const initialAccessoryRow = { item: '', description: '', hsn: '', uom: '', quantity: '', rate: '', total: 0 };

function calculateRowTotal(quantity, rate) {
  const q = parseFloat(quantity) || 0;
  const r = parseFloat(rate) || 0;
  return q * r;
}

const PurchaseOrderForm = () => {
  // General Info
  const [general, setGeneral] = useState({
    poNumber: '',
    poDate: '',
    linkedSO: '',
    supplier: '',
    orderDate: '',
    expectedDelivery: '',
  });

  // Fabric Section
  const [fabrics, setFabrics] = useState([ { ...initialFabricRow } ]);

  // Accessories Section
  const [accessories, setAccessories] = useState([ { ...initialAccessoryRow } ]);

  // Cost Summary
  const [freight, setFreight] = useState('');

  // Handlers
  const handleGeneralChange = (e) => {
    setGeneral({ ...general, [e.target.name]: e.target.value });
  };

  const handleFabricChange = (idx, e) => {
    const updated = fabrics.map((row, i) =>
      i === idx ? { ...row, [e.target.name]: e.target.value, total: calculateRowTotal(e.target.name === 'quantity' ? e.target.value : row.quantity, e.target.name === 'rate' ? e.target.value : row.rate) } : row
    );
    setFabrics(updated);
  };

  const handleAccessoryChange = (idx, e) => {
    const updated = accessories.map((row, i) =>
      i === idx ? { ...row, [e.target.name]: e.target.value, total: calculateRowTotal(e.target.name === 'quantity' ? e.target.value : row.quantity, e.target.name === 'rate' ? e.target.value : row.rate) } : row
    );
    setAccessories(updated);
  };

  const addAccessoryRow = () => {
    setAccessories([...accessories, { ...initialAccessoryRow }]);
  };

  // Calculations
  const fabricSubtotal = fabrics.reduce((sum, row) => sum + (parseFloat(row.total) || 0), 0);
  const accessorySubtotal = accessories.reduce((sum, row) => sum + (parseFloat(row.total) || 0), 0);
  const subtotal = fabricSubtotal + accessorySubtotal;
  const tax = subtotal * 0.12;
  const freightVal = parseFloat(freight) || 0;
  const grandTotal = subtotal + tax + freightVal;

  // Actions
  const handleSave = (e) => {
    e.preventDefault();
    // Here, you would send the PO data to the backend
    alert('PO Saved! (Backend integration pending)');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <form className="max-w-4xl mx-auto p-6 bg-white rounded shadow" onSubmit={handleSave}>
      <h2 className="text-2xl font-bold mb-4">Create Purchase Order</h2>
      {/* General Order Info */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <input name="poNumber" value={general.poNumber} onChange={handleGeneralChange} placeholder="PO Number" className="border p-2" />
        <input name="poDate" type="date" value={general.poDate} onChange={handleGeneralChange} placeholder="PO Date" className="border p-2" />
        <input name="linkedSO" value={general.linkedSO} onChange={handleGeneralChange} placeholder="Linked Sales Order" className="border p-2" />
        <input name="supplier" value={general.supplier} onChange={handleGeneralChange} placeholder="Supplier Name" className="border p-2" />
        <input name="orderDate" type="date" value={general.orderDate} onChange={handleGeneralChange} placeholder="Order Date" className="border p-2" />
        <input name="expectedDelivery" type="date" value={general.expectedDelivery} onChange={handleGeneralChange} placeholder="Expected Delivery Date" className="border p-2" />
      </div>
      {/* Fabric Section */}
      <h3 className="font-semibold mt-6 mb-2">Fabric Section</h3>
      <table className="w-full mb-4 border">
        <thead>
          <tr className="bg-gray-100">
            <th>Fabric Type</th><th>Color</th><th>HSN</th><th>Quality</th><th>UOM</th><th>Quantity</th><th>Rate</th><th>Total</th>
          </tr>
        </thead>
        <tbody>
          {fabrics.map((row, idx) => (
            <tr key={idx}>
              <td><input name="fabricType" value={row.fabricType} onChange={e => handleFabricChange(idx, e)} className="border p-1 w-full" /></td>
              <td><input name="color" value={row.color} onChange={e => handleFabricChange(idx, e)} className="border p-1 w-full" /></td>
              <td><input name="hsn" value={row.hsn} onChange={e => handleFabricChange(idx, e)} className="border p-1 w-full" /></td>
              <td><input name="quality" value={row.quality} onChange={e => handleFabricChange(idx, e)} className="border p-1 w-full" /></td>
              <td><input name="uom" value={row.uom} onChange={e => handleFabricChange(idx, e)} className="border p-1 w-full" /></td>
              <td><input name="quantity" type="number" value={row.quantity} onChange={e => handleFabricChange(idx, e)} className="border p-1 w-full" /></td>
              <td><input name="rate" type="number" value={row.rate} onChange={e => handleFabricChange(idx, e)} className="border p-1 w-full" /></td>
              <td>{row.total.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Accessories Section */}
      <h3 className="font-semibold mt-6 mb-2">Accessories Section</h3>
      <table className="w-full mb-2 border">
        <thead>
          <tr className="bg-gray-100">
            <th>Item</th><th>Description</th><th>HSN</th><th>UOM</th><th>Quantity</th><th>Rate</th><th>Total</th>
          </tr>
        </thead>
        <tbody>
          {accessories.map((row, idx) => (
            <tr key={idx}>
              <td><input name="item" value={row.item} onChange={e => handleAccessoryChange(idx, e)} className="border p-1 w-full" /></td>
              <td><input name="description" value={row.description} onChange={e => handleAccessoryChange(idx, e)} className="border p-1 w-full" /></td>
              <td><input name="hsn" value={row.hsn} onChange={e => handleAccessoryChange(idx, e)} className="border p-1 w-full" /></td>
              <td><input name="uom" value={row.uom} onChange={e => handleAccessoryChange(idx, e)} className="border p-1 w-full" /></td>
              <td><input name="quantity" type="number" value={row.quantity} onChange={e => handleAccessoryChange(idx, e)} className="border p-1 w-full" /></td>
              <td><input name="rate" type="number" value={row.rate} onChange={e => handleAccessoryChange(idx, e)} className="border p-1 w-full" /></td>
              <td>{row.total.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button type="button" onClick={addAccessoryRow} className="mb-4 px-3 py-1 bg-blue-500 text-white rounded">Add Accessory</button>
      {/* Cost Summary */}
      <div className="mt-6 p-4 bg-gray-50 rounded">
        <div className="flex justify-between mb-2"><span>Subtotal:</span><span>{subtotal.toFixed(2)}</span></div>
        <div className="flex justify-between mb-2"><span>Tax (12%):</span><span>{tax.toFixed(2)}</span></div>
        <div className="flex justify-between mb-2"><span>Freight:</span><input name="freight" type="number" value={freight} onChange={e => setFreight(e.target.value)} className="border p-1 w-24" /></div>
        <div className="flex justify-between font-bold text-lg"><span>Grand Total:</span><span>{grandTotal.toFixed(2)}</span></div>
      </div>
      {/* Actions */}
      <div className="mt-6 flex gap-4">
        <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded">Save PO</button>
        <button type="button" onClick={handlePrint} className="px-4 py-2 bg-gray-500 text-white rounded">Print PO</button>
      </div>
    </form>
  );
};

export default PurchaseOrderForm;
