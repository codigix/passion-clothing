const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');

const PDF_OUTPUT_DIR = path.join(__dirname, '../../../uploads/pdfs');

// Ensure PDF directory exists
if (!fs.existsSync(PDF_OUTPUT_DIR)) {
  fs.mkdirSync(PDF_OUTPUT_DIR, { recursive: true });
}

class PDFGenerationService {
  /**
   * Generate Purchase Order PDF
   * @param {Object} purchaseOrder - Purchase order data from database
   * @param {Object} vendor - Vendor details
   * @param {Object} customer - Customer details (optional)
   * @returns {Promise<{success: boolean, filePath: string, error?: string}>}
   */
  static async generatePOPDF(purchaseOrder, vendor, customer = null) {
    try {
      const filename = `PO_${purchaseOrder.po_number}_${Date.now()}.pdf`;
      const filePath = path.join(PDF_OUTPUT_DIR, filename);

      return new Promise((resolve, reject) => {
        try {
          const doc = new PDFDocument({
            margin: 40,
            size: 'A4',
            bufferPages: true
          });

          const stream = fs.createWriteStream(filePath);
          doc.pipe(stream);

          // Header
          this._addPOHeader(doc, purchaseOrder);

          // Company Info & Vendor Details
          doc.fontSize(11).font('Helvetica-Bold').text('Vendor Information:', { underline: true });
          doc.fontSize(10).font('Helvetica');
          doc.text(`Name: ${vendor.name || 'N/A'}`);
          doc.text(`Email: ${vendor.email || 'N/A'}`);
          doc.text(`Contact: ${vendor.phone || 'N/A'}`);
          doc.text(`Address: ${vendor.address || 'N/A'}`);
          
          if (customer) {
            doc.moveDown(0.5);
            doc.fontSize(11).font('Helvetica-Bold').text('Customer Information:', { underline: true });
            doc.fontSize(10).font('Helvetica');
            doc.text(`Name: ${customer.name || 'N/A'}`);
            doc.text(`Email: ${customer.email || 'N/A'}`);
            doc.text(`Contact: ${customer.phone || 'N/A'}`);
          }

          // Order Details
          doc.moveDown(0.8);
          doc.fontSize(11).font('Helvetica-Bold').text('Order Details:', { underline: true });
          doc.fontSize(10).font('Helvetica');
          doc.text(`PO Number: ${purchaseOrder.po_number}`);
          doc.text(`PO Date: ${new Date(purchaseOrder.po_date).toLocaleDateString('en-IN')}`);
          doc.text(`Expected Delivery: ${new Date(purchaseOrder.expected_delivery_date).toLocaleDateString('en-IN')}`);
          doc.text(`Priority: ${purchaseOrder.priority.toUpperCase()}`);
          doc.text(`Project: ${purchaseOrder.project_name || 'N/A'}`);

          if (purchaseOrder.delivery_address) {
            doc.text(`Delivery Address: ${purchaseOrder.delivery_address}`);
          }

          // Items Table
          doc.moveDown(0.8);
          doc.fontSize(11).font('Helvetica-Bold').text('Order Items', { underline: true });
          this._addItemsTable(doc, purchaseOrder.items);

          // Cost Summary
          doc.moveDown(0.5);
          this._addCostSummary(doc, purchaseOrder);

          // Payment Terms
          if (purchaseOrder.payment_terms) {
            doc.moveDown(0.5);
            doc.fontSize(11).font('Helvetica-Bold').text('Payment Terms:', { underline: true });
            doc.fontSize(9).font('Helvetica').text(purchaseOrder.payment_terms, { align: 'left' });
          }

          // Special Instructions
          if (purchaseOrder.special_instructions) {
            doc.moveDown(0.5);
            doc.fontSize(11).font('Helvetica-Bold').text('Special Instructions:', { underline: true });
            doc.fontSize(9).font('Helvetica').text(purchaseOrder.special_instructions, { align: 'left' });
          }

          // Terms & Conditions
          if (purchaseOrder.terms_conditions) {
            doc.moveDown(0.5);
            doc.fontSize(11).font('Helvetica-Bold').text('Terms & Conditions:', { underline: true });
            doc.fontSize(8).font('Helvetica').text(purchaseOrder.terms_conditions, { align: 'left' });
          }

          // Internal Notes
          if (purchaseOrder.internal_notes) {
            doc.moveDown(0.5);
            doc.fontSize(11).font('Helvetica-Bold').text('Internal Notes:', { underline: true });
            doc.fontSize(9).font('Helvetica').text(purchaseOrder.internal_notes, { align: 'left' });
          }

          // QR Code
          doc.moveDown(1);
          this._addQRCode(doc, purchaseOrder);

          // Footer
          this._addFooter(doc);

          doc.end();

          stream.on('finish', () => {
            resolve({
              success: true,
              filePath,
              filename,
              url: `/api/documents/po/${filename}`
            });
          });

          stream.on('error', (err) => {
            reject(new Error(`Stream error: ${err.message}`));
          });
        } catch (err) {
          reject(new Error(`PDF generation error: ${err.message}`));
        }
      });
    } catch (error) {
      console.error('Error generating PO PDF:', error);
      throw error;
    }
  }

  /**
   * Generate Invoice PDF
   * @param {Object} purchaseOrder - Purchase order data
   * @param {Object} vendor - Vendor details
   * @returns {Promise<{success: boolean, filePath: string, error?: string}>}
   */
  static async generateInvoicePDF(purchaseOrder, vendor) {
    try {
      const filename = `INVOICE_${purchaseOrder.po_number}_${Date.now()}.pdf`;
      const filePath = path.join(PDF_OUTPUT_DIR, filename);

      return new Promise((resolve, reject) => {
        try {
          const doc = new PDFDocument({
            margin: 40,
            size: 'A4',
            bufferPages: true
          });

          const stream = fs.createWriteStream(filePath);
          doc.pipe(stream);

          // Invoice Header
          doc.fontSize(20).font('Helvetica-Bold').text('INVOICE', { align: 'center' });
          doc.fontSize(10).font('Helvetica').text(`Generated from PO: ${purchaseOrder.po_number}`, { align: 'center' });
          doc.fontSize(9).text(`Invoice Date: ${new Date().toLocaleDateString('en-IN')}`, { align: 'center' });

          // Invoice Details
          doc.moveDown(0.8);
          doc.fontSize(11).font('Helvetica-Bold').text('Bill To:', { underline: true });
          doc.fontSize(10).font('Helvetica');
          doc.text(`Vendor: ${vendor.name || 'N/A'}`);
          doc.text(`Email: ${vendor.email || 'N/A'}`);
          doc.text(`Contact: ${vendor.phone || 'N/A'}`);
          doc.text(`GST/Tax ID: ${vendor.gst_number || 'N/A'}`);

          // Invoice Summary
          doc.moveDown(0.8);
          doc.fontSize(11).font('Helvetica-Bold').text('Invoice Summary', { underline: true });

          // Items Table
          this._addItemsTable(doc, purchaseOrder.items);

          // Cost Breakdown
          doc.moveDown(0.5);
          this._addCostSummary(doc, purchaseOrder);

          // Payment Terms
          doc.moveDown(0.8);
          doc.fontSize(11).font('Helvetica-Bold').text('Payment Information:', { underline: true });
          doc.fontSize(10).font('Helvetica');
          doc.text(`Payment Terms: ${purchaseOrder.payment_terms || 'COD'}`);
          doc.text(`Due Date: ${this._calculateDueDate(purchaseOrder.po_date, purchaseOrder.payment_terms)}`);

          // Notes
          if (purchaseOrder.internal_notes) {
            doc.moveDown(0.5);
            doc.fontSize(11).font('Helvetica-Bold').text('Notes:', { underline: true });
            doc.fontSize(9).font('Helvetica').text(purchaseOrder.internal_notes);
          }

          // Footer
          doc.moveDown(1);
          this._addFooter(doc);

          doc.end();

          stream.on('finish', () => {
            resolve({
              success: true,
              filePath,
              filename,
              url: `/api/documents/invoice/${filename}`
            });
          });

          stream.on('error', (err) => {
            reject(new Error(`Stream error: ${err.message}`));
          });
        } catch (err) {
          reject(new Error(`Invoice PDF generation error: ${err.message}`));
        }
      });
    } catch (error) {
      console.error('Error generating Invoice PDF:', error);
      throw error;
    }
  }

  /**
   * Add header to document
   */
  static _addPOHeader(doc, purchaseOrder) {
    doc.fontSize(24).font('Helvetica-Bold').text('PURCHASE ORDER', { align: 'left' });
    doc.fontSize(11).font('Helvetica-Bold');
    doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();
    doc.moveDown(0.3);

    // Right-aligned PO info
    doc.fontSize(10).font('Helvetica');
    const rightX = 400;
    doc.text(`PO #: ${purchaseOrder.po_number}`, rightX, doc.y - 30);
    doc.text(`Date: ${new Date(purchaseOrder.po_date).toLocaleDateString('en-IN')}`, rightX, doc.y);
    doc.text(`Status: ${purchaseOrder.status.toUpperCase()}`, rightX, doc.y);
    doc.moveDown(0.5);
  }

  /**
   * Add items table to document
   */
  static _addItemsTable(doc, items) {
    if (!items || items.length === 0) {
      doc.fontSize(10).text('No items');
      return;
    }

    const tableTop = doc.y;
    const col1 = 50;
    const col2 = 150;
    const col3 = 280;
    const col4 = 380;
    const col5 = 480;

    // Header
    doc.fontSize(9).font('Helvetica-Bold');
    doc.text('Item', col1, tableTop);
    doc.text('Description', col2, tableTop);
    doc.text('Qty', col3, tableTop);
    doc.text('Unit', col4, tableTop);
    doc.text('Rate', col5, tableTop);

    doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

    // Rows
    doc.fontSize(8).font('Helvetica');
    let y = tableTop + 25;

    items.forEach((item, index) => {
      const itemName = item.item_name || item.fabric_name || `Item ${index + 1}`;
      const description = item.description || item.color || '';
      const qty = item.quantity || 0;
      const uom = item.uom || '';
      const rate = parseFloat(item.rate || 0).toFixed(2);

      doc.text(index + 1, col1, y);
      doc.text(itemName, col2, y, { width: 120, height: 20 });
      doc.text(description, col2, y + 10, { width: 120, fontSize: 7, align: 'left' });
      doc.text(qty.toString(), col3, y);
      doc.text(uom, col4, y);
      doc.text(`₹${rate}`, col5, y);

      y += 30;

      if (y > 700) {
        doc.addPage();
        y = 50;
      }
    });

    doc.moveTo(50, y - 5).lineTo(550, y - 5).stroke();
  }

  /**
   * Add cost summary section
   */
  static _addCostSummary(doc, purchaseOrder) {
    const summaryX = 350;
    doc.fontSize(10).font('Helvetica');

    doc.text(`Subtotal: ₹${parseFloat(purchaseOrder.total_amount).toFixed(2)}`, summaryX, doc.y);

    if (purchaseOrder.discount_percentage > 0) {
      doc.text(`Discount (${purchaseOrder.discount_percentage}%): -₹${parseFloat(purchaseOrder.discount_amount).toFixed(2)}`, summaryX, doc.y);
    }

    if (purchaseOrder.tax_percentage > 0) {
      doc.text(`Tax (${purchaseOrder.tax_percentage}%): +₹${parseFloat(purchaseOrder.tax_amount).toFixed(2)}`, summaryX, doc.y);
    }

    if (purchaseOrder.freight > 0) {
      doc.text(`Freight: +₹${parseFloat(purchaseOrder.freight).toFixed(2)}`, summaryX, doc.y);
    }

    doc.font('Helvetica-Bold').fontSize(12);
    doc.text(`Total: ₹${parseFloat(purchaseOrder.final_amount).toFixed(2)}`, summaryX, doc.y);
  }

  /**
   * Add QR code to document
   */
  static async _addQRCode(doc, purchaseOrder) {
    try {
      const qrData = JSON.stringify({
        po_number: purchaseOrder.po_number,
        vendor_id: purchaseOrder.vendor_id,
        final_amount: purchaseOrder.final_amount,
        po_date: purchaseOrder.po_date,
        expected_delivery: purchaseOrder.expected_delivery_date,
        status: purchaseOrder.status,
        generated_at: new Date().toISOString()
      });

      // Generate QR code (we'll add a placeholder for now)
      doc.fontSize(9).font('Helvetica').text('QR Code: Scan for details', 50, doc.y);
    } catch (err) {
      console.error('Error adding QR code:', err);
    }
  }

  /**
   * Add footer to document
   */
  static _addFooter(doc) {
    const pageCount = doc.bufferedPageRange().count;
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      doc.fontSize(8).font('Helvetica').text(
        `Generated on ${new Date().toLocaleString('en-IN')} | Page ${i + 1} of ${pageCount}`,
        50,
        doc.page.height - 30,
        { align: 'center' }
      );
    }
  }

  /**
   * Calculate due date from payment terms
   */
  static _calculateDueDate(poDate, paymentTerms) {
    const date = new Date(poDate);
    if (paymentTerms && paymentTerms.includes('Net 30')) {
      date.setDate(date.getDate() + 30);
    }
    return date.toLocaleDateString('en-IN');
  }

  /**
   * Delete PDF files
   */
  static async deletePDFs(poData) {
    try {
      const files = [poData.po_pdf_path, poData.invoice_pdf_path];
      for (const file of files) {
        if (file && fs.existsSync(file)) {
          fs.unlinkSync(file);
        }
      }
      return true;
    } catch (err) {
      console.error('Error deleting PDF files:', err);
      return false;
    }
  }

  /**
   * Get PDF file path for download
   */
  static getPDFFilePath(filename) {
    const filePath = path.join(PDF_OUTPUT_DIR, filename);
    if (fs.existsSync(filePath)) {
      return filePath;
    }
    return null;
  }
}

module.exports = PDFGenerationService;