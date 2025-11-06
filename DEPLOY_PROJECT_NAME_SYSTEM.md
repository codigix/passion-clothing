# Project Name Display System - Deployment Guide

**Estimated Time**: 60-90 minutes  
**Risk Level**: Low  
**Rollback Time**: 10 minutes

---

## ⚠️ Pre-Deployment Checklist

- [ ] Backup production database
- [ ] Have rollback scripts ready
- [ ] Schedule maintenance window (if applicable)
- [ ] Notify users of changes (if applicable)
- [ ] Test on staging environment first
- [ ] Clear browser cache instructions ready
- [ ] Have database access ready
- [ ] Have code deployment access ready

---

## 📋 Step-by-Step Deployment

### STEP 1: Database Backup & Preparation (5-10 minutes)

**1.1 Create Database Backup**
```bash
# Create a backup of the entire database
mysqldump -u root -p passion_erp > backup_before_project_names_$(date +%Y%m%d_%H%M%S).sql

# Or on production, use your backup tool
# Contact DevOps for backup procedure
```

**1.2 Verify Backup**
```bash
# List recent backups
ls -lh backup_*.sql | head -5

# Verify backup integrity (sample)
head -20 backup_before_project_names_*.sql
```

**1.3 Connect to Database**
```bash
# Connect to MySQL
mysql -u root -p

# Select the database
USE passion_erp;

# Verify you're in the right database
SELECT DATABASE();
```

---

### STEP 2: Run Database Migration (10-15 minutes)

**2.1 Execute Migration Script**
```bash
# Method 1: Direct file execution
mysql -u root -p passion_erp < add-project-name-columns.sql

# Method 2: From MySQL client
mysql> source add-project-name-columns.sql;

# Method 3: From MySQL prompt (paste contents)
mysql> ALTER TABLE production_orders ADD COLUMN project_name VARCHAR(200) COMMENT 'Human-friendly project name for dashboards and reports' AFTER team_notes;

mysql> ALTER TABLE shipments ADD COLUMN project_name VARCHAR(200) COMMENT 'Human-friendly project name for dashboards and reports' AFTER created_by;

mysql> CREATE INDEX idx_production_orders_project_name ON production_orders(project_name);

mysql> CREATE INDEX idx_shipments_project_name ON shipments(project_name);
```

**2.2 Verify Migration Success**
```bash
# Check production_orders table structure
DESCRIBE production_orders | grep project_name;

# Check shipments table structure
DESCRIBE shipments | grep project_name;

# Expected output:
# project_name | varchar(200) | YES | | NULL |

# Verify indexes were created
SHOW INDEX FROM production_orders WHERE Column_name = 'project_name';
SHOW INDEX FROM shipments WHERE Column_name = 'project_name';
```

**2.3 Check Row Count
```sql
-- Verify tables are still intact
SELECT COUNT(*) as production_orders_count FROM production_orders;
SELECT COUNT(*) as shipments_count FROM shipments;

-- Should match pre-migration counts (usually with some new data)
```

**2.4 Sample Data Verification**
```sql
-- Check a few records
SELECT id, production_number, sales_order_id, project_name 
FROM production_orders 
LIMIT 5;

SELECT id, shipment_number, sales_order_id, project_name 
FROM shipments 
LIMIT 5;

-- project_name should be NULL for now (will be populated in next step)
```

---

### STEP 3: Populate Project Names (5-10 minutes)

**3.1 Run Population Script**
```bash
# Navigate to project root
cd /path/to/passion-clothing

# Run the population script
node populate-project-names.js

# Expected output:
# 🔄 Starting Project Name Population Script...
# 📦 Processing Production Orders...
#    Found X production orders to update
#    ✓ Updated: PRD-202501... → "Project Name"
# 🚚 Processing Shipments...
#    Found X shipments to update
#    ✓ Updated: SHP-202501... → "Project Name"
# 📊 Verification Report:
# Production Orders: Y% coverage
# Shipments: Z% coverage
# ✅ Project Name Population Complete!
```

**3.2 Verify Population Success**
```sql
-- Check production_orders coverage
SELECT 
  COUNT(*) as total,
  SUM(CASE WHEN project_name IS NOT NULL THEN 1 ELSE 0 END) as with_project_name,
  ROUND(100 * SUM(CASE WHEN project_name IS NOT NULL THEN 1 ELSE 0 END) / COUNT(*), 2) as coverage_percent
FROM production_orders;

-- Check shipments coverage
SELECT 
  COUNT(*) as total,
  SUM(CASE WHEN project_name IS NOT NULL THEN 1 ELSE 0 END) as with_project_name,
  ROUND(100 * SUM(CASE WHEN project_name IS NOT NULL THEN 1 ELSE 0 END) / COUNT(*), 2) as coverage_percent
FROM shipments;

-- Expected: > 95% coverage
-- If less than 95%, investigate records without project_name:
SELECT id, production_number, sales_order_id 
FROM production_orders 
WHERE project_name IS NULL 
LIMIT 10;
```

---

### STEP 4: Backend Deployment (5-10 minutes)

**4.1 Deploy Model Changes**
```bash
# Copy updated model files to server
# File: server/models/ProductionOrder.js (updated)
# File: server/models/Shipment.js (updated)

# Option 1: Via Git (recommended)
git pull origin main
git checkout -- .

# Option 2: Via manual copy
cp /path/to/updated/ProductionOrder.js /path/to/server/models/
cp /path/to/updated/Shipment.js /path/to/server/models/

# Option 3: Verify changes
git diff server/models/ProductionOrder.js
git diff server/models/Shipment.js
```

**4.2 Restart Backend Services**
```bash
# Stop the backend server
pm2 stop all  # or: systemctl stop passion-backend

# Clear cache if applicable
rm -rf /path/to/server/cache/*

# Start the backend server
pm2 start all  # or: systemctl start passion-backend

# Verify it's running
pm2 status  # or: systemctl status passion-backend

# Check logs for errors
pm2 logs passion-erp-backend --lines 50
```

**4.3 Verify API Responses**
```bash
# Test if APIs include project_name
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/manufacturing/orders?limit=5

# Look for project_name field in response (should be there now)

curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/shipments?limit=5

# Look for project_name field in response (should be there now)
```

---

### STEP 5: Frontend Deployment (5-10 minutes)

**5.1 Deploy Component and Page Changes**
```bash
# Navigate to client directory
cd /path/to/client

# Copy/commit updated files
# File: src/components/common/ProjectIdentifier.jsx (new)
# File: src/pages/sales/SalesOrdersPage.jsx (updated)
# File: src/pages/manufacturing/ProductionOrdersPage.jsx (updated)
# File: src/pages/procurement/PurchaseOrdersPage.jsx (updated)

# Via Git
git pull origin main
git checkout -- .

# Verify changes
git status
```

**5.2 Build Frontend**
```bash
# Install dependencies (if new ones added)
npm install

# Build for production
npm run build

# Expected: Should complete without errors
# Check output for warnings
```

**5.3 Deploy Built Files**
```bash
# Copy build output to server
# Usually: /var/www/passion-clothing/client/dist

cp -r /path/to/client/dist/* /var/www/passion-clothing/client/

# Or via deployment tool:
# ansible-playbook deploy.yml
# docker push passion-client:latest

# Clear CDN cache if applicable
curl -X POST https://cdn.example.com/purge \
  -H "Authorization: Bearer $CDN_TOKEN" \
  -d '{"paths": ["/*"]}'
```

**5.4 Verify Frontend Deployment**
```bash
# Check if files are in place
ls -la /var/www/passion-clothing/client/dist/

# Verify webpack bundles were created
ls -la /var/www/passion-clothing/client/dist/js/

# Restart web server if needed
systemctl restart nginx  # or apache2

# Check web server status
systemctl status nginx
```

---

### STEP 6: Testing & Verification (15-20 minutes)

**6.1 Frontend Testing**

**Smoke Test - All Modules:**
1. Open browser and navigate to app
2. Go to Sales Orders page (`/sales/orders`)
   - ✅ See "Project Details" header
   - ✅ See project names displayed with order numbers
   - ✅ Click on project identifier
   - ✅ Hover to see tooltip
   - ✅ Try copy-to-clipboard

3. Go to Production Orders (`/manufacturing/orders`)
   - ✅ See "Project Details" header
   - ✅ See project names displayed
   - ✅ Project names match related sales orders

4. Go to Purchase Orders (`/procurement/pos`)
   - ✅ See "Project Details" header
   - ✅ See project names displayed
   - ✅ Project names are relevant to linked sales orders

5. Go to Shipments
   - ⏳ (Currently being updated, may not show project names yet)

**6.2 Browser Console Check**
```javascript
// Open browser DevTools (F12)
// Check Console tab - should be NO red errors

// Clear cache first
// Press Ctrl+Shift+Delete or Cmd+Shift+Delete
```

**6.3 Mobile Responsiveness Test**
```
Device Testing:
- [ ] iPad (7.9") - Landscape & Portrait
- [ ] iPad (9.7") - Landscape & Portrait
- [ ] iPhone SE - Portrait & Landscape
- [ ] iPhone 12/13 - Portrait & Landscape
- [ ] Android phone - Portrait & Landscape

Expected: Project identifier should be readable, not cut off
```

**6.4 Performance Test**
```bash
# Test on a slow connection (Chrome DevTools)
# 1. Open DevTools
# 2. Go to Network tab
# 3. Select "Slow 3G"
# 4. Navigate to orders page
# 5. Should still load and display correctly

# Check page load time (should be < 3 seconds)
# Check no UI jank or layout shift
```

---

### STEP 7: User Notification & Training (10-15 minutes)

**7.1 Send User Communication**
```text
Subject: System Update - Project Names Now Displayed Prominently

Dear Team,

We've just deployed an enhancement to our order management system!

WHAT'S NEW:
- Project names now appear as the primary identifier in all order tables
- Easier to identify and track projects across sales, production, and procurement
- New copy-to-clipboard feature for quick reference sharing

WHERE TO SEE IT:
- Sales Orders
- Production Orders  
- Purchase Orders
- (Shipments - coming soon)

BENEFITS:
- Better project visibility
- Easier cross-module tracking
- Improved communication with vendors

HOW TO USE:
- Look for project names above order IDs in all tables
- Hover over project identifier to see tooltip
- Click copy icon to copy to clipboard

QUESTIONS?
- Check the Quick Start Guide: [link to PROJECT_NAME_QUICK_START.md]
- Contact support: [email/phone]

Happy working!
```

**7.2 Create Quick Reference**
- Print or email: `PROJECT_NAME_QUICK_START.md`
- Show example screenshots
- Highlight key features

---

### STEP 8: Post-Deployment Monitoring (30 minutes+)

**8.1 Real-Time Monitoring**
```bash
# Monitor application logs
pm2 logs passion-erp-backend --lines 100 --err

# Monitor database
# Watch for slow queries
# MySQL: SET GLOBAL slow_query_log = 'ON';

# Monitor user reports
# Check support tickets
# Monitor error tracking (Sentry, etc.)
```

**8.2 Error Tracking Check**
```bash
# Check for any new errors in error tracking system
# Look for:
# - ProjectIdentifier component errors
# - API response errors
# - Database connection errors
# - Missing project_name in data

# If errors found, see Rollback section below
```

**8.3 User Feedback**
```
- Monitor for user feedback/complaints
- Check Slack/Teams for messages
- Review support tickets
- If major issue found, execute rollback

- If working well:
  - Document success
  - Monitor for 24+ hours
  - Complete deployment
```

---

## 🆘 Rollback Procedure

If critical issues are found, rollback can be done quickly:

### Database Rollback (2-3 minutes)
```sql
-- Connect to database
mysql -u root -p passion_erp

-- Drop the new columns
ALTER TABLE production_orders DROP COLUMN project_name;
ALTER TABLE shipments DROP COLUMN project_name;

-- Drop the indexes
DROP INDEX idx_production_orders_project_name ON production_orders;
DROP INDEX idx_shipments_project_name ON shipments;

-- Verify
DESCRIBE production_orders;  -- Should NOT show project_name
DESCRIBE shipments;          -- Should NOT show project_name
```

### Code Rollback (3-5 minutes)
```bash
# Backend
git checkout -- server/models/ProductionOrder.js
git checkout -- server/models/Shipment.js
pm2 restart all

# Frontend
git checkout -- client/src/pages/sales/SalesOrdersPage.jsx
git checkout -- client/src/pages/manufacturing/ProductionOrdersPage.jsx
git checkout -- client/src/pages/procurement/PurchaseOrdersPage.jsx
npm run build
# Copy build files to server
```

### Restore from Backup (Complete rollback)
```bash
# Stop services
systemctl stop passion-backend

# Restore database
mysql -u root -p passion_erp < backup_before_project_names_YYYYMMDD_HHMMSS.sql

# Start services
systemctl start passion-backend

# Notify users
# Post: System restored to previous state. Investigating issue.
```

---

## ✅ Deployment Checklist

- [ ] Database backup created and tested
- [ ] Migration script executed successfully
- [ ] Project names populated (>95% coverage)
- [ ] Backend models updated and deployed
- [ ] Backend services restarted
- [ ] Frontend component deployed
- [ ] Frontend pages updated and built
- [ ] Sales Orders page tested ✓
- [ ] Production Orders page tested ✓
- [ ] Purchase Orders page tested ✓
- [ ] Browser console shows no errors
- [ ] Copy-to-clipboard works
- [ ] Mobile responsiveness verified
- [ ] Performance acceptable
- [ ] User notifications sent
- [ ] Team trained on new features
- [ ] Support team informed
- [ ] Monitoring enabled
- [ ] No critical errors after 1 hour
- [ ] No critical errors after 4 hours
- [ ] No critical errors after 24 hours
- [ ] Mark deployment as successful

---

## 📞 Support Contacts

**During Deployment**:
- Development Lead: [contact]
- Database Admin: [contact]
- DevOps: [contact]

**Post-Deployment**:
- Support Team: [contact]
- Product Manager: [contact]

---

## 📊 Success Metrics

After deployment, verify:
- ✅ All tables display project names correctly
- ✅ No increase in error rates
- ✅ No performance degradation
- ✅ User feedback is positive
- ✅ No database issues
- ✅ All features working as expected

---

## 🎉 Deployment Complete!

Once all checklist items are verified and no critical issues found, the deployment is complete.

**Next Steps**:
1. Close any related tickets
2. Document lessons learned
3. Plan for next features (Shipment pages)
4. Celebrate! 🎊

---

**Document Version**: 1.0  
**Created**: January 15, 2025  
**Estimated Deployment Duration**: 60-90 minutes

For technical details, see: `PROJECT_NAME_SYSTEM_IMPLEMENTATION.md`