#!/usr/bin/env node

require('dotenv').config();
const fs = require('fs');
const path = require('path');

console.log('\n' + '='.repeat(70));
console.log('🔍 EMAIL & WHATSAPP INTEGRATION - SETUP VERIFICATION');
console.log('='.repeat(70) + '\n');

let allGood = true;
const warnings = [];
const errors = [];

console.log('📦 1. CHECKING DEPENDENCIES...\n');

try {
  require('nodemailer');
  console.log('   ✅ nodemailer installed');
} catch (e) {
  console.log('   ❌ nodemailer NOT installed');
  errors.push('Run: npm install nodemailer');
  allGood = false;
}

try {
  require('twilio');
  console.log('   ✅ twilio installed');
} catch (e) {
  console.log('   ❌ twilio NOT installed');
  errors.push('Run: npm install twilio');
  allGood = false;
}

console.log('\n📄 2. CHECKING FILES...\n');

const requiredFiles = [
  { path: '.env', critical: true },
  { path: 'server/utils/emailService.js', critical: true },
  { path: 'server/routes/procurement.js', critical: true },
  { path: 'EMAIL_WHATSAPP_SETUP.md', critical: false },
  { path: 'INTEGRATION_SUMMARY.md', critical: false },
];

requiredFiles.forEach(({ path: filePath, critical }) => {
  const fullPath = path.join(__dirname, filePath);
  if (fs.existsSync(fullPath)) {
    console.log(`   ✅ ${filePath}`);
  } else {
    console.log(`   ${critical ? '❌' : '⚠️'} ${filePath} NOT FOUND`);
    if (critical) {
      errors.push(`Missing file: ${filePath}`);
      allGood = false;
    } else {
      warnings.push(`Missing documentation: ${filePath}`);
    }
  }
});

console.log('\n⚙️  3. CHECKING CONFIGURATION...\n');

const requiredEnvVars = [
  { key: 'SMTP_HOST', critical: false, default: 'smtp.gmail.com' },
  { key: 'SMTP_PORT', critical: false, default: '587' },
  { key: 'SMTP_USER', critical: true, type: 'email' },
  { key: 'SMTP_PASS', critical: true, type: 'password' },
  { key: 'TWILIO_ACCOUNT_SID', critical: false, type: 'twilio' },
  { key: 'TWILIO_AUTH_TOKEN', critical: false, type: 'twilio' },
  { key: 'TWILIO_WHATSAPP_FROM', critical: false, default: 'whatsapp:+14155238886' },
  { key: 'COMPANY_NAME', critical: false, default: 'Passion Clothing Factory' },
  { key: 'COMPANY_EMAIL', critical: false },
  { key: 'COMPANY_PHONE', critical: false },
];

let emailConfigured = true;
let whatsappConfigured = true;

requiredEnvVars.forEach(({ key, critical, default: defaultValue, type }) => {
  const value = process.env[key];
  
  if (value) {
    if (type === 'password') {
      console.log(`   ✅ ${key}: ${'*'.repeat(16)} (configured)`);
    } else if (type === 'email') {
      console.log(`   ✅ ${key}: ${value}`);
    } else if (type === 'twilio') {
      console.log(`   ✅ ${key}: ${value.substring(0, 10)}... (configured)`);
    } else {
      console.log(`   ✅ ${key}: ${value}`);
    }
  } else if (defaultValue) {
    console.log(`   ⚠️  ${key}: ${defaultValue} (using default)`);
  } else {
    console.log(`   ${critical ? '❌' : '⚠️'} ${key}: NOT SET`);
    
    if (type === 'email' || key === 'SMTP_USER' || key === 'SMTP_PASS') {
      emailConfigured = false;
      if (critical) {
        errors.push(`${key} is required for email functionality`);
        allGood = false;
      } else {
        warnings.push(`${key} not configured - email may not work`);
      }
    }
    
    if (type === 'twilio' || key.startsWith('TWILIO_')) {
      whatsappConfigured = false;
      warnings.push(`${key} not configured - WhatsApp will not work`);
    }
  }
});

console.log('\n🔌 4. SERVICE STATUS...\n');

if (emailConfigured) {
  console.log('   ✅ EMAIL SERVICE: Ready to send');
  console.log(`      From: ${process.env.SMTP_USER || 'Not configured'}`);
  console.log(`      Via: ${process.env.SMTP_HOST || 'smtp.gmail.com'}:${process.env.SMTP_PORT || '587'}`);
} else {
  console.log('   ❌ EMAIL SERVICE: Not configured');
  console.log('      Action: Set SMTP_USER and SMTP_PASS in .env');
  console.log('      Guide: See EMAIL_WHATSAPP_SETUP.md');
}

console.log('');

if (whatsappConfigured) {
  console.log('   ✅ WHATSAPP SERVICE: Ready to send');
  console.log(`      From: ${process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886'}`);
  console.log('      ⚠️  Remember: Vendors must join Twilio sandbox!');
} else {
  console.log('   ⚠️  WHATSAPP SERVICE: Not configured (optional)');
  console.log('      Messages will be logged but not sent');
  console.log('      Action: Set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in .env');
  console.log('      Guide: See EMAIL_WHATSAPP_SETUP.md');
}

console.log('\n📋 5. INTEGRATION POINTS...\n');

try {
  const emailService = require('./server/utils/emailService');
  console.log('   ✅ Email service module loads correctly');
} catch (e) {
  console.log('   ❌ Email service module failed to load');
  console.log(`      Error: ${e.message}`);
  errors.push('Email service module error');
  allGood = false;
}

const procurementRoute = path.join(__dirname, 'server/routes/procurement.js');
if (fs.existsSync(procurementRoute)) {
  const content = fs.readFileSync(procurementRoute, 'utf8');
  if (content.includes('sendPOToVendor') && content.includes('sendWhatsAppMessage')) {
    console.log('   ✅ Procurement route has email/WhatsApp integration');
  } else {
    console.log('   ❌ Procurement route missing integration code');
    errors.push('Procurement route not properly integrated');
    allGood = false;
  }
}

console.log('\n' + '='.repeat(70));

if (errors.length > 0) {
  console.log('❌ ERRORS FOUND:\n');
  errors.forEach((err, i) => console.log(`   ${i + 1}. ${err}`));
  console.log('');
}

if (warnings.length > 0) {
  console.log('⚠️  WARNINGS:\n');
  warnings.forEach((warn, i) => console.log(`   ${i + 1}. ${warn}`));
  console.log('');
}

console.log('='.repeat(70));

if (allGood && emailConfigured) {
  console.log('✅ SETUP COMPLETE - READY TO USE!');
  console.log('\nNext steps:');
  console.log('1. Start the server: npm run dev');
  console.log('2. Create a PO and approve it');
  console.log('3. Click "Send to Vendor"');
  console.log('4. Check vendor email and WhatsApp');
} else if (allGood && !emailConfigured) {
  console.log('⚠️  SETUP INCOMPLETE - EMAIL NOT CONFIGURED');
  console.log('\nNext steps:');
  console.log('1. Configure SMTP credentials in .env file');
  console.log('2. See EMAIL_WHATSAPP_SETUP.md for instructions');
  console.log('3. Restart server after configuration');
} else {
  console.log('❌ SETUP FAILED - PLEASE FIX ERRORS ABOVE');
  console.log('\nRefer to EMAIL_WHATSAPP_SETUP.md for help');
}

console.log('='.repeat(70) + '\n');

process.exit(allGood ? 0 : 1);
