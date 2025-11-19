# Email & WhatsApp Integration Setup Guide

## Overview
This guide will help you configure email (SMTP) and WhatsApp (Twilio) integrations for sending Purchase Orders to vendors.

---

## 📧 Email Setup (Gmail SMTP)

### Step 1: Enable 2-Factor Authentication
1. Go to your Google Account: https://myaccount.google.com/
2. Navigate to **Security** → **2-Step Verification**
3. Follow the steps to enable 2FA

### Step 2: Generate App Password
1. Go to: https://myaccount.google.com/apppasswords
2. Select **Mail** as the app
3. Select **Other (Custom name)** as the device
4. Enter "Passion ERP" as the name
5. Click **Generate**
6. Copy the 16-character password (remove spaces)

### Step 3: Update .env File
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-char-app-password
```

### Alternative SMTP Providers

#### **Outlook/Office 365**
```env
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

#### **SendGrid**
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

---

## 📱 WhatsApp Setup (Twilio)

### Step 1: Create Twilio Account
1. Go to: https://www.twilio.com/try-twilio
2. Sign up for a free account
3. Verify your email and phone number
4. You'll get **$15 free credit** for testing

### Step 2: Get Twilio Credentials
1. Go to Twilio Console: https://console.twilio.com/
2. Copy your **Account SID** and **Auth Token** from the dashboard

### Step 3: Set Up WhatsApp Sandbox (For Testing)
1. In Twilio Console, go to: **Messaging** → **Try it out** → **Send a WhatsApp message**
2. You'll see a sandbox number like: `+1 415 523 8886`
3. You'll see a join code like: `join <your-code>`
4. **Important**: Send this join message from your WhatsApp to the sandbox number
   - Open WhatsApp on your phone
   - Send message to: `+1 415 523 8886`
   - Message: `join <your-code>` (e.g., `join happy-tiger`)
5. You'll receive a confirmation message

### Step 4: Update .env File
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your-auth-token-here
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

### Step 5: Test WhatsApp Number Format
Vendor phone numbers should be in one of these formats:
- `+919876543210` (Preferred - with country code)
- `919876543210` (Will auto-add +)
- `9876543210` (Will auto-add +91)
- `09876543210` (Will convert to +919876543210)

---

## 🏢 Company Information Setup

Update these in your `.env` file:

```env
COMPANY_NAME=Passion Clothing Factory
COMPANY_ADDRESS=123 Factory Street, Industrial Area, City - 123456
COMPANY_PHONE=+91-1234567890
COMPANY_EMAIL=info@passionclothing.com
```

---

## 🚀 Testing the Integration

### Test Email Sending

1. **Start the server**:
   ```bash
   npm run dev
   ```

2. **Create a test vendor** with a valid email address

3. **Create and approve a PO**:
   - Go to Procurement Dashboard
   - Create a new PO
   - Submit for approval
   - Approve the PO (as admin)

4. **Send to vendor**:
   - Click "Send to Vendor" button
   - Check the vendor's email inbox
   - Check server console for logs

### Test WhatsApp Sending

1. **Join Twilio Sandbox** (if not done):
   - Send `join <your-code>` to Twilio's WhatsApp number

2. **Update vendor phone number**:
   - Format: `+919876543210` or `9876543210`

3. **Send PO to vendor**:
   - Click "Send to Vendor" button
   - Check WhatsApp on the vendor's phone
   - Check server console for logs

---

## 🔍 Troubleshooting

### Email Issues

**Error: "Invalid login"**
- ✅ Make sure you're using App Password, not your regular Gmail password
- ✅ Check if 2FA is enabled on your Google account

**Error: "Connection timeout"**
- ✅ Check your firewall settings
- ✅ Try port 465 with `secure: true` instead of 587

**Emails going to spam**
- ✅ Add SPF and DKIM records to your domain
- ✅ Use a professional email service like SendGrid for production

### WhatsApp Issues

**Error: "WhatsApp number not registered with Twilio sandbox"**
- ✅ Send `join <your-code>` from the vendor's WhatsApp to Twilio number
- ✅ Wait for confirmation message before testing

**Error: "Invalid phone number format"**
- ✅ Use international format: `+919876543210`
- ✅ Remove spaces, dashes, or brackets

**Error: "Twilio authentication failed"**
- ✅ Double-check Account SID and Auth Token
- ✅ Make sure there are no extra spaces in .env file

**WhatsApp not configured warning**
- ✅ Set `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN` in .env
- ✅ Restart the server after updating .env

---

## 🎯 Production Setup

### For Email (Production)

**Option 1: Use SendGrid (Recommended)**
- Sign up: https://sendgrid.com/
- Get API key
- Update .env with SendGrid credentials
- Better deliverability and analytics

**Option 2: Use AWS SES**
- Lower cost for high volume
- Requires domain verification
- Good for large-scale operations

### For WhatsApp (Production)

**Option 1: Twilio WhatsApp Business**
1. Apply for WhatsApp Business API access through Twilio
2. Get your business verified
3. Get a dedicated WhatsApp Business number
4. Update `TWILIO_WHATSAPP_FROM` with your business number

**Option 2: WhatsApp Business API (Direct)**
1. Apply directly to Meta: https://business.whatsapp.com/
2. Get approved for WhatsApp Business API
3. Update code to use WhatsApp Business API instead of Twilio

---

## 📊 Monitoring & Logs

### Server Logs
Check console output for:
- ✅ `✓ Email sent successfully: <message-id>`
- ✅ `✓ WhatsApp message sent successfully: <sid>`
- ⚠️ `⚠️ Twilio not configured`
- ❌ `❌ Error sending email/WhatsApp`

### Twilio Dashboard
- View message delivery status
- Check usage and credits
- Monitor failed messages
- View detailed logs

---

## 💰 Cost Estimation

### Twilio WhatsApp Pricing (as of 2024)
- **Sandbox**: Free for testing
- **Production**: ~$0.005 per message (varies by country)
- **Free credit**: $15 (enough for ~3000 test messages)

### Email Pricing
- **Gmail**: Free (with limits: 500 emails/day)
- **SendGrid**: Free tier (100 emails/day), Paid plans from $15/month
- **AWS SES**: $0.10 per 1000 emails

---

## 🔐 Security Best Practices

1. **Never commit .env file to Git**
   - Already in .gitignore
   - Use environment variables in production

2. **Rotate credentials regularly**
   - Change App Passwords every 90 days
   - Rotate Twilio Auth Tokens periodically

3. **Use different credentials for dev/prod**
   - Separate Twilio accounts for testing and production
   - Different email accounts for dev and prod

4. **Monitor usage**
   - Set up alerts in Twilio for unusual activity
   - Monitor email sending patterns

---

## 📞 Support

### Twilio Support
- Documentation: https://www.twilio.com/docs/whatsapp
- Support: https://support.twilio.com/

### Gmail/Google Support
- App Passwords: https://support.google.com/accounts/answer/185833
- SMTP Settings: https://support.google.com/mail/answer/7126229

---

## ✅ Quick Checklist

Before going live, ensure:

- [ ] .env file is configured with all credentials
- [ ] Email sending tested successfully
- [ ] WhatsApp sandbox joined and tested
- [ ] Vendor contact information (email/phone) is accurate
- [ ] Server logs show successful sends
- [ ] Production Twilio account set up (for production)
- [ ] Professional email service configured (for production)
- [ ] Monitoring and alerts configured
- [ ] Backup communication method available

---

## 🎉 You're All Set!

Your Purchase Order communication system is now ready to use. Vendors will receive professional emails and WhatsApp notifications when POs are approved and sent.

For any issues, check the server console logs first, then refer to the troubleshooting section above.
