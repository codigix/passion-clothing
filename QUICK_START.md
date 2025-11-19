# 🚀 Quick Start - Email & WhatsApp Integration

## ⚡ 5-Minute Setup

### Step 1: Configure Email (Required)

1. **Get Gmail App Password**:
   - Go to: https://myaccount.google.com/apppasswords
   - Enable 2FA if not already enabled
   - Create app password for "Mail"
   - Copy the 16-character password

2. **Update `.env` file**:
   ```env
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=abcd efgh ijkl mnop  # Your 16-char app password
   ```

### Step 2: Configure WhatsApp (Optional)

1. **Get Twilio Credentials**:
   - Sign up: https://www.twilio.com/try-twilio
   - Copy Account SID and Auth Token from dashboard

2. **Join Sandbox**:
   - Go to: Messaging → Try it out → Send a WhatsApp message
   - Send `join <your-code>` to the Twilio number from your WhatsApp

3. **Update `.env` file**:
   ```env
   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_AUTH_TOKEN=your-auth-token-here
   ```

### Step 3: Verify Setup

```bash
node verify-setup.js
```

### Step 4: Start Server

```bash
npm run dev
```

### Step 5: Test

1. Login to application
2. Go to Procurement Dashboard
3. Create a PO with vendor (add email and phone)
4. Approve the PO
5. Click "Send to Vendor"
6. ✅ Check email and WhatsApp!

---

## 📋 Checklist

- [ ] Gmail App Password generated
- [ ] SMTP_USER and SMTP_PASS in .env
- [ ] Twilio account created (optional)
- [ ] Twilio sandbox joined (optional)
- [ ] TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in .env (optional)
- [ ] `node verify-setup.js` shows ✅
- [ ] Server started with `npm run dev`
- [ ] Test PO sent successfully

---

## 🆘 Need Help?

- **Full Setup Guide**: `EMAIL_WHATSAPP_SETUP.md`
- **Implementation Details**: `INTEGRATION_SUMMARY.md`
- **Verify Setup**: Run `node verify-setup.js`

---

## 🎯 What You Get

### Email Features:
- ✅ Professional HTML email template
- ✅ Complete PO details (items, vendor, terms)
- ✅ Company branding
- ✅ Automatic sending on PO approval

### WhatsApp Features:
- ✅ Instant notification to vendor
- ✅ Formatted message with emojis
- ✅ PO summary with key details
- ✅ Link to check email for full details

---

**Time to setup**: 5-10 minutes  
**Status**: ✅ Production Ready  
**Support**: See documentation files
