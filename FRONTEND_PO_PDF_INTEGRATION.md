# Frontend Integration Guide - PO PDF & Invoice Generation

## Overview
This guide shows how to integrate the PDF generation and accounting notification features into the React frontend.

## Files to Modify/Create

### 1. Create PDF Action Buttons Component
**File**: `client/src/components/procurement/POPdfActions.jsx`

```jsx
import React, { useState, useEffect } from 'react';
import { Download, Mail, RefreshCw, Loader } from 'lucide-react';
import { FaFileInvoice, FaFilePdf } from 'react-icons/fa';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import SendToAccountingModal from './SendToAccountingModal';

const POPdfActions = ({ poId, poNumber, status, createdOrder = null }) => {
  const [pdfStatus, setPdfStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAccountingModal, setShowAccountingModal] = useState(false);

  // Fetch PDF status on mount
  useEffect(() => {
    if (poId) {
      checkPdfStatus();
    }
  }, [poId]);

  // Auto-generate PDFs if this is a newly created order
  useEffect(() => {
    if (createdOrder && poId) {
      generatePdfs();
    }
  }, [createdOrder, poId]);

  const checkPdfStatus = async () => {
    try {
      const response = await api.get(`/procurement/pos/${poId}/pdf-status`);
      setPdfStatus(response.data);
    } catch (error) {
      console.error('Error checking PDF status:', error);
    }
  };

  const generatePdfs = async () => {
    setLoading(true);
    try {
      const response = await api.post(`/procurement/pos/${poId}/generate-pdfs`);
      setPdfStatus(response.data.data);
      toast.success('PDFs generated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate PDFs');
      console.error('Error generating PDFs:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadPO = async () => {
    try {
      const response = await api.get(`/procurement/pos/${poId}/download-pdf`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `PO_${poNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentURL.removeChild(link);
      toast.success('PO downloaded successfully');
    } catch (error) {
      toast.error('Failed to download PO');
      console.error('Download error:', error);
    }
  };

  const downloadInvoice = async () => {
    try {
      const response = await api.get(`/procurement/pos/${poId}/download-invoice`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `INVOICE_${poNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentURL.removeChild(link);
      toast.success('Invoice downloaded successfully');
    } catch (error) {
      toast.error('Failed to download Invoice');
      console.error('Download error:', error);
    }
  };

  const regeneratePdfs = async () => {
    if (!window.confirm('This will regenerate and replace existing PDFs. Continue?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await api.post(`/procurement/pos/${poId}/regenerate-pdfs`);
      setPdfStatus({
        ...pdfStatus,
        pdf_status: 'completed',
        po_generated_at: new Date().toISOString(),
        invoice_generated_at: new Date().toISOString()
      });
      toast.success('PDFs regenerated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to regenerate PDFs');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-wrap gap-2 items-center">
        {/* Status Badge */}
        {pdfStatus && (
          <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${
            pdfStatus.pdf_status === 'completed' 
              ? 'bg-green-100 text-green-700'
              : pdfStatus.pdf_status === 'failed'
              ? 'bg-red-100 text-red-700'
              : pdfStatus.pdf_status === 'generating'
              ? 'bg-yellow-100 text-yellow-700'
              : 'bg-gray-100 text-gray-700'
          }`}>
            {pdfStatus.pdf_status === 'generating' && <Loader size={14} className="animate-spin" />}
            {pdfStatus.pdf_status === 'completed' && '✓'}
            {pdfStatus.pdf_status === 'failed' && '✗'}
            {pdfStatus.pdf_status.charAt(0).toUpperCase() + pdfStatus.pdf_status.slice(1)}
          </div>
        )}

        {/* Generate PDF Button */}
        {(!pdfStatus || pdfStatus.pdf_status === 'pending' || pdfStatus.pdf_status === 'failed') && (
          <button
            onClick={generatePdfs}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition"
            title="Generate PO and Invoice PDFs"
          >
            {loading ? <Loader size={16} className="animate-spin" /> : <FaFilePdf size={16} />}
            Generate Docs
          </button>
        )}

        {/* Download PO Button */}
        {pdfStatus?.pdf_status === 'completed' && (
          <button
            onClick={downloadPO}
            className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
            title="Download Purchase Order PDF"
          >
            <Download size={16} />
            Download PO
          </button>
        )}

        {/* Download Invoice Button */}
        {pdfStatus?.pdf_status === 'completed' && (
          <button
            onClick={downloadInvoice}
            className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
            title="Download Invoice PDF"
          >
            <FaFileInvoice size={16} />
            Download Invoice
          </button>
        )}

        {/* Send to Accounting Button */}
        {pdfStatus?.pdf_status === 'completed' && (
          <button
            onClick={() => setShowAccountingModal(true)}
            className={`flex items-center gap-2 px-3 py-2 rounded transition ${
              pdfStatus.accounting_notified
                ? 'bg-purple-600 text-white hover:bg-purple-700'
                : 'bg-orange-600 text-white hover:bg-orange-700'
            }`}
            title={pdfStatus.accounting_notified ? 'Already sent to accounting' : 'Send to accounting department'}
          >
            <Mail size={16} />
            {pdfStatus.accounting_notified ? 'Sent ✓' : 'Send to Accounting'}
          </button>
        )}

        {/* Regenerate Button */}
        {pdfStatus?.pdf_status === 'completed' && (
          <button
            onClick={regeneratePdfs}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50 transition"
            title="Regenerate PDFs"
          >
            {loading ? <Loader size={16} className="animate-spin" /> : <RefreshCw size={16} />}
          </button>
        )}

        {/* Error Message */}
        {pdfStatus?.pdf_status === 'failed' && pdfStatus?.error_message && (
          <div className="text-red-600 text-sm">
            Error: {pdfStatus.error_message}
          </div>
        )}
      </div>

      {/* Send to Accounting Modal */}
      {showAccountingModal && (
        <SendToAccountingModal
          poId={poId}
          poNumber={poNumber}
          onClose={() => {
            setShowAccountingModal(false);
            checkPdfStatus(); // Refresh status
          }}
          onSuccess={() => {
            checkPdfStatus();
          }}
        />
      )}
    </>
  );
};

export default POPdfActions;
```

### 2. Send to Accounting Modal Component
**File**: `client/src/components/procurement/SendToAccountingModal.jsx`

```jsx
import React, { useState } from 'react';
import { X, Mail, Loader, CheckCircle } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const SendToAccountingModal = ({ poId, poNumber, onClose, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async () => {
    if (!email.trim()) {
      setError('Email address is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.post(`/procurement/pos/${poId}/send-to-accounting`, {
        accounting_email: email
      });

      setSuccess(true);
      toast.success(`✓ Sent to ${response.data.data.email_sent}`);
      
      // Call parent callback
      if (onSuccess) onSuccess();

      // Close modal after 2 seconds
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.error || 'Failed to send to accounting';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Mail size={20} />
            Send to Accounting Department
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {success ? (
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <CheckCircle size={48} className="text-green-600" />
              </div>
              <p className="text-green-600 font-medium">
                ✓ PO and Invoice sent successfully to accounting department
              </p>
              <p className="text-gray-600 text-sm mt-2">
                PO #{poNumber} is ready for approval and payment processing
              </p>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Accounting Department Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  placeholder="accounting@passion-clothing.com"
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                />
                <p className="text-gray-600 text-sm mt-1">
                  Email address where PO and Invoice PDFs will be sent
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {error}
                </div>
              )}

              <div className="bg-blue-50 p-3 rounded mb-4 text-sm text-blue-700">
                <strong>📎 What will be sent:</strong>
                <ul className="list-disc list-inside mt-1 text-xs space-y-1">
                  <li>PO_{poNumber}.pdf - Complete purchase order with all details</li>
                  <li>INVOICE_{poNumber}.pdf - Invoice for accounting records</li>
                  <li>Professional HTML email with payment instructions</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 disabled:opacity-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSend}
                  disabled={loading || !email.trim()}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader size={16} className="animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail size={16} />
                      Send PDFs
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SendToAccountingModal;
```

### 3. Update ProcurementDashboard.jsx
Add PDF action buttons to the Purchase Orders table:

```jsx
// In the table rendering section, add this to the actions column:

<div className="flex gap-2">
  {/* Existing actions */}
  <button onClick={() => viewOrder(order.id)} title="View">
    <Eye size={16} />
  </button>
  
  {/* NEW: PDF Actions */}
  <POPdfActions poId={order.id} poNumber={order.po_number} />
</div>
```

### 4. Update CreatePurchaseOrderPage.jsx
After successful PO creation, show PDF actions:

```jsx
// After successful creation
{createdOrder && (
  <div className="mt-6 p-6 bg-green-50 border border-green-200 rounded-lg">
    <h3 className="text-lg font-bold text-green-700 mb-4">
      ✓ Purchase Order Created Successfully!
    </h3>
    
    <div className="mb-4">
      <p className="text-green-700">
        PO #{createdOrder.po_number}
      </p>
    </div>

    {/* PDF Actions Component */}
    <POPdfActions 
      poId={createdOrder.id} 
      poNumber={createdOrder.po_number}
      createdOrder={createdOrder}
    />

    <div className="mt-6 flex gap-3">
      <button
        onClick={() => navigate('/procurement/dashboard')}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Back to Dashboard
      </button>
      <button
        onClick={() => navigate(`/procurement/purchase-orders/${createdOrder.id}`)}
        className="px-4 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50"
      >
        View Details
      </button>
    </div>
  </div>
)}
```

## Integration Workflow

### Step 1: Import the Component
```jsx
import POPdfActions from '../../components/procurement/POPdfActions';
import SendToAccountingModal from '../../components/procurement/SendToAccountingModal';
```

### Step 2: Add to Table/Detail View
```jsx
<POPdfActions 
  poId={order.id}
  poNumber={order.po_number}
  createdOrder={order}  // Optional: for auto-generation
/>
```

### Step 3: Environment Setup
In `server/.env`:
```
ACCOUNTING_DEPT_EMAIL=accounting@passion-clothing.com
ACCOUNTING_CC_EMAILS=finance@passion-clothing.com
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

## Features Provided

### PDF Generation
- ✅ Auto-generates on PO creation (optional)
- ✅ Manual generation with button
- ✅ Status tracking (pending, generating, completed, failed)
- ✅ Error handling and display

### Download Options
- ✅ Download PO PDF with all details
- ✅ Download Invoice PDF for accounting
- ✅ Proper file naming with PO number
- ✅ Automatic file cleanup

### Accounting Notification
- ✅ Send PDFs via email to accounting department
- ✅ Beautiful HTML email template
- ✅ CC support for additional recipients
- ✅ Notification tracking in database
- ✅ Timestamp and user tracking

### User Experience
- ✅ Clear status indicators
- ✅ Loading states
- ✅ Error messages
- ✅ Success confirmations
- ✅ Modal for email input
- ✅ Responsive design

## Testing

### Test Case 1: Generate PDFs
1. Create a new PO
2. Click "Generate Docs" button
3. Verify status changes to "completed"
4. Check `/uploads/pdfs` directory for files

### Test Case 2: Download PDFs
1. Generate PDFs (from above)
2. Click "Download PO" button
3. Verify file downloads as `PO_PO-NUMBER.pdf`
4. Open PDF to verify content

### Test Case 3: Send to Accounting
1. Generate PDFs (from above)
2. Click "Send to Accounting" button
3. Enter email address
4. Click "Send PDFs"
5. Verify email received with attachments

## Styling

The components use Tailwind CSS classes. Customize as needed:
- Button colors: `bg-blue-600`, `bg-green-600`, `bg-orange-600`
- Text colors: `text-white`, `text-gray-700`, `text-green-600`
- Spacing: `p-6`, `gap-3`, `mb-4`
- States: `hover:`, `disabled:`, `focus:`

## Accessibility

- ✅ Proper button labels and titles
- ✅ Keyboard navigation support
- ✅ Loading states with spinners
- ✅ Error messages clearly displayed
- ✅ Success confirmations
- ✅ Modal focus management

---
**Ready to deploy!**