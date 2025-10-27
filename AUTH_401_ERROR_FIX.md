# 🔒 401 Unauthorized Error - Complete Fix Guide

## Error Analysis

Your application is throwing a **401 Unauthorized** error when trying to verify authentication tokens. Here's what's happening:

```
❌ Session expired - logging out
❌ Auth check failed: AxiosError
❌ Failed to load resource: the server responded with a status of 401 (Unauthorized)
```

---

## Root Causes (In Order of Likelihood)

### 1. **Server Not Running** (Most Common)
The backend server is offline or crashed.

**Check:**
```powershell
# Terminal 1: Check if server is running
netstat -ano | findstr :5000
```

**Fix:**
```powershell
# Navigate to server directory
cd "d:\projects\passion-clothing\server"

# Install dependencies (if needed)
npm install

# Start server with environment
npm start

# OR with debugging
npm run dev
```

### 2. **JWT_SECRET Changed or Corrupted**
If JWT_SECRET in `.env` was changed, existing tokens become invalid.

**Current `.env` value:**
```
JWT_SECRET=passion_erp_super_secret_jwt_key_2024_make_it_long_and_complex_for_security
```

**Check if it matches:**
- Look in `server/.env`
- Verify it hasn't been modified
- Check that there are no extra spaces or quotes

**Fix:**
```bash
# Reset token in browser console
localStorage.removeItem('token');
location.reload();
# Then log in again
```

### 3. **Token Expired**
JWT tokens expire after **24 hours** (set by `JWT_EXPIRES_IN=24h`)

**Fix:**
```javascript
// In browser console:
localStorage.removeItem('token');
location.reload();
// Then log in again
```

### 4. **Database Connection Failed**
Server running but can't query User from database.

**Check:**
```powershell
# Verify MySQL is running
mysql -u root -p
# Password: root
# Command: show databases;
```

**Fix:**
```powershell
# Start MySQL service on Windows
net start MySQL80  # or your MySQL version

# Or verify credentials in server/.env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root
DB_NAME=passion_erp
```

### 5. **Database User Inactive**
The logged-in user's `status` is not 'active' in the database.

**Fix (in MySQL):**
```sql
UPDATE users SET status = 'active' WHERE email = 'your.email@example.com';
```

### 6. **Token Not Being Sent**
The Authorization header might not be attached to requests.

**Check in `client/src/utils/api.js`:**
```javascript
// Line 36-43: Request interceptor adds token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);
```

**Verify token exists:**
```javascript
// In browser console:
localStorage.getItem('token');
// Should return a long JWT string like:
// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 7. **CORS Issue**
Server CORS settings don't match client URL.

**Check `server/.env`:**
```
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
```

**Check if client is running at one of these URLs:**
- `http://localhost:3000` ✅
- `http://localhost:3001` ✅
- `http://127.0.0.1:3000` ❌ (Different from localhost)

---

## Step-by-Step Troubleshooting

### Step 1: Verify Server is Running
```powershell
# Check if port 5000 is listening
Test-NetConnection -ComputerName localhost -Port 5000
```

**Expected output:**
```
TcpTestSucceeded : True
```

**If False:** Start the server

### Step 2: Clear Token and Try Login Again
```javascript
// In browser console (F12):
localStorage.clear();
sessionStorage.clear();
location.reload();
```

Then log in with credentials:
- Email: (your registered email)
- Password: (your password)

### Step 3: Check Browser Console
Open DevTools (F12) → Console tab

**You should see:**
```
✅ [API] Using base URL: /api
```

**If you see errors like:**
```
❌ 404 Not Found
❌ Network error
❌ CORS error
```

→ Server is not running or CORS misconfigured

### Step 4: Test API Connection Directly
```javascript
// In browser console:
window.apiConfig.testApiConnection('/auth/verify')
  .then(result => console.log(result));
```

**Expected with valid token:**
```json
{
  "success": true,
  "data": { "valid": true, ... }
}
```

**If success: false with 401:**
→ Token is expired or invalid

### Step 5: Check Database Connection
```powershell
# In server directory:
npm run dev

# Look for this message in console:
# ✅ Database connected successfully
```

**If you see:**
```
❌ Database connection failed
❌ ER_ACCESS_DENIED_FOR_USER
```

→ Check MySQL is running and credentials are correct

### Step 6: Verify User Status in Database
```sql
SELECT id, email, status FROM users WHERE email = 'your.email@example.com';
```

**User status must be: `'active'`**

If status is `'inactive'`, update it:
```sql
UPDATE users SET status = 'active' WHERE email = 'your.email@example.com';
```

---

## Quick Fix Checklist

```
☐ Is MySQL running? (Required)
  → Windows: Services app or "net start MySQL80"
  → Command: mysql -u root -p

☐ Is backend server running on port 5000? (Required)
  → Command: npm start (in server folder)
  → Check: http://localhost:5000 in browser

☐ Is frontend running on port 3000 or 3001? (Required)
  → Command: npm start (in client folder)

☐ Are credentials correct?
  → Email and password match what you registered

☐ Is token present in localStorage?
  → Browser Console: localStorage.getItem('token')
  → Should show a JWT string

☐ Is user status 'active'?
  → MySQL: SELECT status FROM users WHERE email='...';

☐ Is JWT_SECRET consistent?
  → Check server/.env hasn't been modified

☐ Is CORS configured correctly?
  → Check CORS_ORIGIN includes your client URL
```

---

## Common Error Messages

| Error | Cause | Fix |
|-------|-------|-----|
| `Status 401 - Access token required` | No token sent | Log in again |
| `Status 401 - Token expired` | Token is old | Clear localStorage, log in |
| `Status 401 - Invalid token` | Token corrupted | Clear localStorage, log in |
| `Status 401 - Invalid or inactive user` | User status ≠ active | Update user.status = 'active' |
| `Status 403 - Invalid token` | JWT_SECRET mismatch | Restart server |
| `Network error - backend may be offline` | Server not running | Start server with npm start |

---

## Debug Mode: Enable Detailed Logging

### Client Side Logging
Edit `client/src/utils/api.js` (line 127-136):

```javascript
// Add this for debugging
if (import.meta.env.DEV) {
  console.info(`[API] Using base URL: ${currentBaseUrl}`);
  console.info('[API] Request interceptor active - will attach tokens');
  window.apiConfig = {
    api,
    setApiBaseUrl,
    getCurrentApiBaseUrl,
    testApiConnection,
    // Add token debug
    getToken: () => localStorage.getItem('token'),
    checkAuth: async () => {
      try {
        const result = await api.get('/auth/verify');
        return { authenticated: true, data: result.data };
      } catch (e) {
        return { authenticated: false, error: e.message };
      }
    }
  };
}
```

### Server Side Logging
Edit `server/routes/auth.js` (add logging):

```javascript
// Add at top of /verify endpoint
router.get('/verify', authenticateToken, (req, res) => {
  console.log('[AUTH] Verify endpoint called');
  console.log('[AUTH] User ID:', req.user?.id);
  console.log('[AUTH] User Email:', req.user?.email);
  
  res.json({ 
    valid: true, 
    user: { id: req.user.id, email: req.user.email }
  });
});
```

---

## Full System Restart

If nothing else works, do a complete restart:

```powershell
# 1. Kill all Node processes
taskkill /IM node.exe /F

# 2. Stop MySQL
net stop MySQL80

# 3. Clear browser cache
# → Chrome: Ctrl+Shift+Delete

# 4. Start MySQL
net start MySQL80

# 5. Start backend
cd "d:\projects\passion-clothing\server"
npm start

# 6. Start frontend (new terminal)
cd "d:\projects\passion-clothing\client"
npm start

# 7. Clear localStorage in browser console
localStorage.clear()

# 8. Log in again
```

---

## Testing Authentication Flow

### Manual Login Test
```javascript
// In browser console:
const testLogin = async () => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'your.email@example.com',
      password: 'your.password'
    })
  });
  const data = await response.json();
  console.log('Login response:', data);
  if (data.token) {
    localStorage.setItem('token', data.token);
    console.log('Token saved successfully');
  }
};
testLogin();
```

### Verify Token Test
```javascript
// In browser console (after login):
const testVerify = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch('/api/auth/verify', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  console.log('Verify response:', data);
};
testVerify();
```

---

## Environment Files Reference

### `server/.env` (check these values)
```
PORT=5000                                    ← Backend port
JWT_SECRET=passion_erp_super_secret_...     ← Must not change
JWT_EXPIRES_IN=24h                          ← Token lifetime
DB_HOST=localhost                           ← Database host
DB_USER=root                                ← Database user
DB_PASSWORD=root                            ← Database password
CORS_ORIGIN=http://localhost:3000,...      ← Allowed client URLs
```

### `client/.env` (if exists) or `vite.config.js`
```javascript
// Should have proxy or VITE_API_BASE_URL
VITE_API_BASE_URL=/api
```

---

## Contact Server API Directly

Test if server is responding:

```powershell
# PowerShell test
Invoke-WebRequest -Uri "http://localhost:5000/api/auth/verify" `
  -Headers @{"Authorization"="Bearer YOUR_TOKEN_HERE"} `
  -ErrorAction SilentlyContinue | Select-Object StatusCode, Content
```

---

## Still Not Working?

If you've checked everything:

1. **Check server error logs:**
   ```powershell
   # Look for error messages in:
   tail -f "d:\projects\passion-clothing\server\logs\app.log"
   ```

2. **Check MySQL error log:**
   ```powershell
   # MySQL error log location (Windows):
   # C:\ProgramData\MySQL\MySQL Server 8.0\Data\
   ```

3. **Verify network connectivity:**
   ```powershell
   ping localhost
   curl http://localhost:5000/
   ```

4. **Try different port:**
   ```javascript
   // If port 5000 is blocked, edit server/.env:
   PORT=5001
   ```

---

## Summary

**Most Common Fix (80% of cases):**
```powershell
# Stop current processes
taskkill /IM node.exe /F

# Clear token
# (In browser console: localStorage.clear())

# Restart both servers
cd server && npm start
# In another terminal:
cd client && npm start

# Log in again
```

**Verify working state:**
- ✅ Backend responds: `http://localhost:5000`
- ✅ Frontend loads: `http://localhost:3000`
- ✅ Token appears in localStorage after login
- ✅ Console shows no errors
- ✅ Dashboard loads successfully

---

**Status**: 🔍 Diagnostic guide - Use above steps to identify root cause