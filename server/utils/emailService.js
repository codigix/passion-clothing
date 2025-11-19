const nodemailer = require('nodemailer');
const twilio = require('twilio');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

let twilioClient = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

const sendPOToVendor = async (purchaseOrder, vendor) => {
  try {
    if (!vendor.email) {
      throw new Error('Vendor email not configured');
    }

    const itemsTable = purchaseOrder.items
      .map(
        (item, index) => `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">${index + 1}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${item.item_code || item.description || 'N/A'}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${item.material_type || 'N/A'}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${item.quantity || 0}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${item.uom || 'pcs'}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">₹${parseFloat(item.price || 0).toFixed(2)}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">₹${parseFloat((item.quantity || 0) * (item.price || 0)).toFixed(2)}</td>
        </tr>
      `
      )
      .join('');

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 800px; margin: 0 auto; padding: 20px; }
          .header { background-color: #0f172a; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9fafb; }
          .po-details { background-color: white; padding: 15px; margin: 15px 0; border-radius: 8px; border: 1px solid #e5e7eb; }
          .po-details h3 { margin-top: 0; color: #0f172a; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; background-color: white; }
          th { background-color: #0f172a; color: white; padding: 10px; text-align: left; }
          td { padding: 8px; border: 1px solid #ddd; }
          .total-row { font-weight: bold; background-color: #f3f4f6; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
          .button { display: inline-block; padding: 12px 24px; background-color: #0f172a; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${process.env.COMPANY_NAME || 'Passion Clothing Factory'}</h1>
            <p>Purchase Order</p>
          </div>
          
          <div class="content">
            <div class="po-details">
              <h3>Purchase Order: ${purchaseOrder.po_number}</h3>
              <p><strong>Date:</strong> ${new Date(purchaseOrder.po_date).toLocaleDateString('en-IN')}</p>
              <p><strong>Expected Delivery:</strong> ${purchaseOrder.expected_delivery_date ? new Date(purchaseOrder.expected_delivery_date).toLocaleDateString('en-IN') : 'TBD'}</p>
              ${purchaseOrder.project_name ? `<p><strong>Project:</strong> ${purchaseOrder.project_name}</p>` : ''}
              <p><strong>Priority:</strong> <span style="text-transform: uppercase; color: ${purchaseOrder.priority === 'urgent' ? '#dc2626' : purchaseOrder.priority === 'high' ? '#ea580c' : '#059669'};">${purchaseOrder.priority || 'medium'}</span></p>
            </div>

            <div class="po-details">
              <h3>Vendor Details</h3>
              <p><strong>Name:</strong> ${vendor.name}</p>
              ${vendor.contact_person ? `<p><strong>Contact Person:</strong> ${vendor.contact_person}</p>` : ''}
              ${vendor.phone ? `<p><strong>Phone:</strong> ${vendor.phone}</p>` : ''}
              ${vendor.email ? `<p><strong>Email:</strong> ${vendor.email}</p>` : ''}
            </div>

            <div class="po-details">
              <h3>Order Items</h3>
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Item</th>
                    <th>Type</th>
                    <th>Quantity</th>
                    <th>UOM</th>
                    <th>Rate</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsTable}
                  <tr class="total-row">
                    <td colspan="6" style="text-align: right;">Total Amount:</td>
                    <td>₹${parseFloat(purchaseOrder.final_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            ${purchaseOrder.delivery_address ? `
            <div class="po-details">
              <h3>Delivery Address</h3>
              <p>${purchaseOrder.delivery_address}</p>
            </div>
            ` : ''}

            ${purchaseOrder.payment_terms ? `
            <div class="po-details">
              <h3>Payment Terms</h3>
              <p>${purchaseOrder.payment_terms}</p>
            </div>
            ` : ''}

            ${purchaseOrder.special_instructions ? `
            <div class="po-details">
              <h3>Special Instructions</h3>
              <p>${purchaseOrder.special_instructions}</p>
            </div>
            ` : ''}

            ${purchaseOrder.terms_conditions ? `
            <div class="po-details">
              <h3>Terms & Conditions</h3>
              <p style="white-space: pre-line;">${purchaseOrder.terms_conditions}</p>
            </div>
            ` : ''}

            <div style="text-align: center; margin: 20px 0;">
              <p>Please confirm receipt of this purchase order.</p>
            </div>
          </div>

          <div class="footer">
            <p>${process.env.COMPANY_NAME || 'Passion Clothing Factory'}</p>
            <p>${process.env.COMPANY_ADDRESS || ''}</p>
            <p>Phone: ${process.env.COMPANY_PHONE || ''} | Email: ${process.env.COMPANY_EMAIL || ''}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"${process.env.COMPANY_NAME || 'Passion Clothing'}" <${process.env.SMTP_USER}>`,
      to: vendor.email,
      subject: `Purchase Order ${purchaseOrder.po_number} - ${process.env.COMPANY_NAME || 'Passion Clothing'}`,
      html: emailHtml,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

const sendWhatsAppMessage = async (purchaseOrder, vendor) => {
  try {
    if (!vendor.phone) {
      throw new Error('Vendor phone number not configured');
    }

    let phoneNumber = vendor.phone.trim();
    if (!phoneNumber.startsWith('+')) {
      if (phoneNumber.startsWith('91')) {
        phoneNumber = '+' + phoneNumber;
      } else if (phoneNumber.startsWith('0')) {
        phoneNumber = '+91' + phoneNumber.substring(1);
      } else {
        phoneNumber = '+91' + phoneNumber;
      }
    }

    const message = `
*${process.env.COMPANY_NAME || 'Passion Clothing Factory'}*
📋 *Purchase Order: ${purchaseOrder.po_number}*

Dear ${vendor.name},

We have issued a new purchase order for your review:

📅 *PO Date:* ${new Date(purchaseOrder.po_date).toLocaleDateString('en-IN')}
📦 *Expected Delivery:* ${purchaseOrder.expected_delivery_date ? new Date(purchaseOrder.expected_delivery_date).toLocaleDateString('en-IN') : 'TBD'}
${purchaseOrder.project_name ? `🏗️ *Project:* ${purchaseOrder.project_name}\n` : ''}⚡ *Priority:* ${(purchaseOrder.priority || 'medium').toUpperCase()}

💰 *Total Amount:* ₹${parseFloat(purchaseOrder.final_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}

📧 Please check your email for complete order details.

For any queries, contact us at:
📞 ${process.env.COMPANY_PHONE || ''}
✉️ ${process.env.COMPANY_EMAIL || ''}

Thank you for your business!
    `.trim();

    if (!twilioClient) {
      console.warn('⚠️ Twilio not configured. WhatsApp message prepared but not sent.');
      console.log('WhatsApp message for:', phoneNumber);
      console.log('Message:', message);
      return { 
        success: false, 
        message: 'Twilio credentials not configured. Please set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in .env file.',
        messagePreview: message
      };
    }

    const twilioMessage = await twilioClient.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886',
      to: `whatsapp:${phoneNumber}`,
      body: message
    });

    console.log('✓ WhatsApp message sent successfully:', twilioMessage.sid);
    console.log('  To:', phoneNumber);
    console.log('  Status:', twilioMessage.status);
    
    return { 
      success: true, 
      messageId: twilioMessage.sid,
      status: twilioMessage.status,
      to: phoneNumber
    };
  } catch (error) {
    console.error('❌ Error sending WhatsApp message:', error.message);
    if (error.code === 21211) {
      throw new Error('Invalid phone number format. Please check vendor phone number.');
    } else if (error.code === 21408) {
      throw new Error('WhatsApp number not registered with Twilio sandbox. Please send "join <sandbox-keyword>" to the Twilio WhatsApp number first.');
    } else if (error.code === 20003) {
      throw new Error('Twilio authentication failed. Please check TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN.');
    }
    throw error;
  }
};

const sendReopenedPOToVendor = async (purchaseOrder, vendor, vendorRequest) => {
  try {
    if (!vendor.email) {
      throw new Error('Vendor email not configured');
    }

    const itemsTable = vendorRequest.items
      .map(
        (item, index) => `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">${index + 1}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${item.material_name || 'N/A'}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${item.ordered_qty || 0}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${item.received_qty || 0}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${item.shortage_qty || item.overage_qty || 0}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${item.uom || 'pcs'}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">₹${parseFloat(item.rate || 0).toFixed(2)}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">₹${parseFloat((item.shortage_qty || item.overage_qty || 0) * (item.rate || 0)).toFixed(2)}</td>
        </tr>
      `
      )
      .join('');

    const requestTypeLabel = vendorRequest.request_type === 'shortage' ? 'Shortage' : 'Overage';
    const requestTypeColor = vendorRequest.request_type === 'shortage' ? '#dc2626' : '#ea580c';

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 800px; margin: 0 auto; padding: 20px; }
          .header { background-color: #0f172a; color: white; padding: 20px; text-align: center; }
          .alert-banner { background-color: ${requestTypeColor}; color: white; padding: 15px; text-align: center; font-weight: bold; }
          .content { padding: 20px; background-color: #f9fafb; }
          .po-details { background-color: white; padding: 15px; margin: 15px 0; border-radius: 8px; border: 1px solid #e5e7eb; }
          .po-details h3 { margin-top: 0; color: #0f172a; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; background-color: white; }
          th { background-color: #0f172a; color: white; padding: 10px; text-align: left; }
          td { padding: 8px; border: 1px solid #ddd; }
          .total-row { font-weight: bold; background-color: #f3f4f6; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${process.env.COMPANY_NAME || 'Passion Clothing Factory'}</h1>
            <p>Purchase Order - REOPENED</p>
          </div>
          
          <div class="alert-banner">
            ⚠️ ${requestTypeLabel.toUpperCase()} NOTIFICATION - IMMEDIATE ACTION REQUIRED
          </div>

          <div class="content">
            <div class="po-details">
              <h3>Vendor Request: ${vendorRequest.request_number}</h3>
              <p><strong>Original PO:</strong> ${purchaseOrder.po_number}</p>
              <p><strong>Request Type:</strong> <span style="color: ${requestTypeColor}; font-weight: bold;">${requestTypeLabel}</span></p>
              <p><strong>Date:</strong> ${new Date().toLocaleDateString('en-IN')}</p>
              <p><strong>GRN Number:</strong> ${vendorRequest.grn?.grn_number || 'N/A'}</p>
            </div>

            <div class="po-details">
              <h3>Vendor Details</h3>
              <p><strong>Name:</strong> ${vendor.name}</p>
              ${vendor.contact_person ? `<p><strong>Contact Person:</strong> ${vendor.contact_person}</p>` : ''}
              ${vendor.phone ? `<p><strong>Phone:</strong> ${vendor.phone}</p>` : ''}
              ${vendor.email ? `<p><strong>Email:</strong> ${vendor.email}</p>` : ''}
            </div>

            <div class="po-details">
              <h3>${requestTypeLabel} Items</h3>
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Material</th>
                    <th>Ordered</th>
                    <th>Received</th>
                    <th>${requestTypeLabel}</th>
                    <th>UOM</th>
                    <th>Rate</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsTable}
                  <tr class="total-row">
                    <td colspan="7" style="text-align: right;">Total ${requestTypeLabel} Value:</td>
                    <td>₹${parseFloat(vendorRequest.total_value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="po-details">
              <h3>Message</h3>
              <p style="white-space: pre-line;">${vendorRequest.message_to_vendor}</p>
            </div>

            <div style="text-align: center; margin: 20px 0; padding: 15px; background-color: #fef3c7; border-radius: 8px;">
              <p style="margin: 0; font-weight: bold; color: #92400e;">
                ${vendorRequest.request_type === 'shortage' 
                  ? '⚠️ Please arrange to send the shortage materials at the earliest.' 
                  : '⚠️ Please review and provide instructions on how to proceed with the excess materials.'}
              </p>
            </div>
          </div>

          <div class="footer">
            <p>${process.env.COMPANY_NAME || 'Passion Clothing Factory'}</p>
            <p>${process.env.COMPANY_ADDRESS || ''}</p>
            <p>Phone: ${process.env.COMPANY_PHONE || ''} | Email: ${process.env.COMPANY_EMAIL || ''}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"${process.env.COMPANY_NAME || 'Passion Clothing'}" <${process.env.SMTP_USER}>`,
      to: vendor.email,
      subject: `🔔 ${requestTypeLabel} Alert - PO ${purchaseOrder.po_number} Reopened - ${vendorRequest.request_number}`,
      html: emailHtml,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Reopened PO email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending reopened PO email:', error);
    throw error;
  }
};

const sendReopenedPOWhatsApp = async (purchaseOrder, vendor, vendorRequest) => {
  try {
    if (!vendor.phone) {
      throw new Error('Vendor phone number not configured');
    }

    let phoneNumber = vendor.phone.trim();
    if (!phoneNumber.startsWith('+')) {
      if (phoneNumber.startsWith('91')) {
        phoneNumber = '+' + phoneNumber;
      } else if (phoneNumber.startsWith('0')) {
        phoneNumber = '+91' + phoneNumber.substring(1);
      } else {
        phoneNumber = '+91' + phoneNumber;
      }
    }

    const requestTypeLabel = vendorRequest.request_type === 'shortage' ? 'SHORTAGE' : 'OVERAGE';
    const requestTypeEmoji = vendorRequest.request_type === 'shortage' ? '⚠️' : '📦';

    const itemsList = vendorRequest.items
      .map((item, index) => 
        `${index + 1}. ${item.material_name}\n   Ordered: ${item.ordered_qty}, Received: ${item.received_qty}, ${requestTypeLabel}: ${item.shortage_qty || item.overage_qty || 0} ${item.uom || 'pcs'}`
      )
      .join('\n\n');

    const message = `
*${process.env.COMPANY_NAME || 'Passion Clothing Factory'}*
${requestTypeEmoji} *${requestTypeLabel} ALERT - PO REOPENED*

Dear ${vendor.name},

🔔 *Vendor Request: ${vendorRequest.request_number}*
📋 *Original PO: ${purchaseOrder.po_number}*
📅 *Date:* ${new Date().toLocaleDateString('en-IN')}

*${requestTypeLabel} ITEMS:*
${itemsList}

💰 *Total ${requestTypeLabel} Value:* ₹${parseFloat(vendorRequest.total_value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}

${vendorRequest.request_type === 'shortage' 
  ? '⚠️ *ACTION REQUIRED:* Please arrange to send the shortage materials immediately.' 
  : '⚠️ *ACTION REQUIRED:* Please review and advise on the excess materials.'}

📧 Complete details sent via email.

For queries, contact:
📞 ${process.env.COMPANY_PHONE || ''}
✉️ ${process.env.COMPANY_EMAIL || ''}

Thank you!
    `.trim();

    if (!twilioClient) {
      console.warn('⚠️ Twilio not configured. WhatsApp message prepared but not sent.');
      console.log('WhatsApp message for:', phoneNumber);
      console.log('Message:', message);
      return { 
        success: false, 
        message: 'Twilio credentials not configured.',
        messagePreview: message
      };
    }

    const twilioMessage = await twilioClient.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886',
      to: `whatsapp:${phoneNumber}`,
      body: message
    });

    console.log('✓ Reopened PO WhatsApp sent successfully:', twilioMessage.sid);
    console.log('  To:', phoneNumber);
    
    return { 
      success: true, 
      messageId: twilioMessage.sid,
      status: twilioMessage.status,
      to: phoneNumber
    };
  } catch (error) {
    console.error('❌ Error sending reopened PO WhatsApp:', error.message);
    throw error;
  }
};

const sendOverageMaterialToVendor = async (grn, vendor, overageItems, totalOverageValue) => {
  try {
    if (!vendor.email) {
      throw new Error('Vendor email not configured');
    }

    const itemsTable = overageItems
      .map(
        (item, index) => `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">${index + 1}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${item.material_name || 'N/A'}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${item.ordered_qty || 0}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${item.received_qty || 0}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${item.overage_qty || 0}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${item.uom || 'pcs'}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">₹${parseFloat(item.rate || 0).toFixed(2)}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">₹${parseFloat((item.overage_qty || 0) * (item.rate || 0)).toFixed(2)}</td>
        </tr>
      `
      )
      .join('');

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 800px; margin: 0 auto; padding: 20px; }
          .header { background-color: #0f172a; color: white; padding: 20px; text-align: center; }
          .alert-banner { background-color: #ea580c; color: white; padding: 15px; text-align: center; font-weight: bold; }
          .content { padding: 20px; background-color: #f9fafb; }
          .details-box { background-color: white; padding: 15px; margin: 15px 0; border-radius: 8px; border: 1px solid #e5e7eb; }
          .details-box h3 { margin-top: 0; color: #0f172a; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; background-color: white; }
          th { background-color: #0f172a; color: white; padding: 10px; text-align: left; }
          td { padding: 8px; border: 1px solid #ddd; }
          .total-row { font-weight: bold; background-color: #f3f4f6; }
          .action-box { background-color: #fef3c7; border-left: 4px solid #ea580c; padding: 15px; margin: 15px 0; border-radius: 4px; }
          .action-box p { margin: 5px 0; color: #92400e; font-weight: bold; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
          .summary { background-color: #f0f9ff; padding: 15px; border-radius: 8px; margin: 15px 0; }
          .summary-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #bfdbfe; }
          .summary-row:last-child { border-bottom: none; }
          .summary-label { font-weight: bold; color: #0f172a; }
          .summary-value { color: #ea580c; font-weight: bold; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${process.env.COMPANY_NAME || 'Passion Clothing Factory'}</h1>
            <p>Material Overage Notification</p>
          </div>
          
          <div class="alert-banner">
            📦 MATERIAL OVERAGE DETECTED - ACTION REQUIRED
          </div>

          <div class="content">
            <div class="details-box">
              <h3>Overage Summary</h3>
              <p><strong>GRN Number:</strong> ${grn.grn_number}</p>
              <p><strong>PO Number:</strong> ${grn.po_number || 'N/A'}</p>
              <p><strong>Receipt Date:</strong> ${new Date(grn.grn_date).toLocaleDateString('en-IN')}</p>
              <p><strong>Notification Date:</strong> ${new Date().toLocaleDateString('en-IN')}</p>
            </div>

            <div class="details-box">
              <h3>Vendor Information</h3>
              <p><strong>Name:</strong> ${vendor.name}</p>
              ${vendor.contact_person ? `<p><strong>Contact Person:</strong> ${vendor.contact_person}</p>` : ''}
              ${vendor.phone ? `<p><strong>Phone:</strong> ${vendor.phone}</p>` : ''}
              ${vendor.email ? `<p><strong>Email:</strong> ${vendor.email}</p>` : ''}
              ${vendor.address ? `<p><strong>Address:</strong> ${vendor.address}</p>` : ''}
            </div>

            <div class="details-box">
              <h3>Overage Material Details</h3>
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Material Name</th>
                    <th>Ordered Qty</th>
                    <th>Received Qty</th>
                    <th>Overage Qty</th>
                    <th>UOM</th>
                    <th>Rate (₹)</th>
                    <th>Total Value (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsTable}
                  <tr class="total-row">
                    <td colspan="7" style="text-align: right;">Total Overage Value:</td>
                    <td>₹${parseFloat(totalOverageValue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="summary">
              <div class="summary-row">
                <span class="summary-label">Total Overage Items:</span>
                <span class="summary-value">${overageItems.length}</span>
              </div>
              <div class="summary-row">
                <span class="summary-label">Total Overage Quantity:</span>
                <span class="summary-value">${overageItems.reduce((sum, item) => sum + (item.overage_qty || 0), 0)} units</span>
              </div>
              <div class="summary-row">
                <span class="summary-label">Total Overage Value:</span>
                <span class="summary-value">₹${parseFloat(totalOverageValue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            <div class="action-box">
              <p>📌 IMMEDIATE ACTION REQUIRED:</p>
              <p style="margin-top: 10px; font-weight: normal;">
                Please review the excess materials received and provide your instructions within 5 business days on:
              </p>
              <ul style="margin: 10px 0; color: #92400e;">
                <li><strong>Return arrangement:</strong> How would you like to handle the return of excess materials?</li>
                <li><strong>Credit note option:</strong> Would you prefer a credit note adjustment for the overage value?</li>
                <li><strong>Retention option:</strong> Would you like to retain the materials at the listed rate?</li>
              </ul>
              <p style="margin-top: 10px; font-weight: normal;">
                Please reply to this email with your preferred resolution method.
              </p>
            </div>

            <div class="details-box">
              <h3>Next Steps</h3>
              <ol>
                <li>Review the overage materials received against this GRN</li>
                <li>Verify quantities and condition of excess materials</li>
                <li>Reply with your preferred handling method</li>
                <li>We will process accordingly upon your confirmation</li>
              </ol>
            </div>
          </div>

          <div class="footer">
            <p><strong>${process.env.COMPANY_NAME || 'Passion Clothing Factory'}</strong></p>
            <p>${process.env.COMPANY_ADDRESS || ''}</p>
            <p>📞 ${process.env.COMPANY_PHONE || ''} | 📧 ${process.env.COMPANY_EMAIL || ''}</p>
            <p style="margin-top: 10px; color: #9ca3af;">This is an automated notification. Please do not reply to this address.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"${process.env.COMPANY_NAME || 'Passion Clothing'}" <${process.env.SMTP_USER}>`,
      to: vendor.email,
      subject: `📦 Material Overage Alert - GRN ${grn.grn_number} - Action Required`,
      html: emailHtml,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✓ Overage material email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending overage material email:', error);
    throw error;
  }
};

const sendOverageMaterialWhatsApp = async (grn, vendor, overageItems, totalOverageValue) => {
  try {
    if (!vendor.phone) {
      throw new Error('Vendor phone number not configured');
    }

    let phoneNumber = vendor.phone.trim();
    if (!phoneNumber.startsWith('+')) {
      if (phoneNumber.startsWith('91')) {
        phoneNumber = '+' + phoneNumber;
      } else if (phoneNumber.startsWith('0')) {
        phoneNumber = '+91' + phoneNumber.substring(1);
      } else {
        phoneNumber = '+91' + phoneNumber;
      }
    }

    const itemsList = overageItems
      .map((item, index) => 
        `${index + 1}. *${item.material_name}*\n   Ordered: ${item.ordered_qty}, Received: ${item.received_qty}\n   Overage: ${item.overage_qty} ${item.uom || 'pcs'} @ ₹${item.rate || 0}/unit`
      )
      .join('\n\n');

    const totalOverageQty = overageItems.reduce((sum, item) => sum + (item.overage_qty || 0), 0);

    const message = `
*${process.env.COMPANY_NAME || 'Passion Clothing Factory'}*
📦 *MATERIAL OVERAGE NOTIFICATION*

Dear ${vendor.name},

We have identified excess materials in your delivery against GRN *${grn.grn_number}*.

*OVERAGE ITEMS:*
${itemsList}

*OVERAGE SUMMARY:*
📊 Total Items: ${overageItems.length}
📦 Total Qty: ${totalOverageQty} units
💰 Total Value: ₹${parseFloat(totalOverageValue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}

⚠️ *ACTION REQUIRED:*
Please advise within 5 business days on:
✓ Return of excess materials
✓ Credit note adjustment
✓ Retention at listed rate

📧 Full details sent via email.

For urgent queries:
📞 ${process.env.COMPANY_PHONE || ''}
✉️ ${process.env.COMPANY_EMAIL || ''}

Thank you!
    `.trim();

    if (!twilioClient) {
      console.warn('⚠️ Twilio not configured. WhatsApp message prepared but not sent.');
      console.log('WhatsApp message for:', phoneNumber);
      console.log('Message:', message);
      return { 
        success: false, 
        message: 'Twilio credentials not configured.',
        messagePreview: message
      };
    }

    const twilioMessage = await twilioClient.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886',
      to: `whatsapp:${phoneNumber}`,
      body: message
    });

    console.log('✓ Overage material WhatsApp sent successfully:', twilioMessage.sid);
    console.log('  To:', phoneNumber);
    
    return { 
      success: true, 
      messageId: twilioMessage.sid,
      status: twilioMessage.status,
      to: phoneNumber
    };
  } catch (error) {
    console.error('❌ Error sending overage material WhatsApp:', error.message);
    throw error;
  }
};

module.exports = {
  sendPOToVendor,
  sendWhatsAppMessage,
  sendReopenedPOToVendor,
  sendReopenedPOWhatsApp,
  sendOverageMaterialToVendor,
  sendOverageMaterialWhatsApp,
};
