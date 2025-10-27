# ⚡ QUICK FIX - 401 Unauthorized Error

## Immediate Action (5 minutes)

### 1️⃣ Clear Your Token & Cache
**In browser console (F12):**
```javascript
localStorage.clear();
sessionStorage.clear();
```
Then **refresh the page** (F5 or Ctrl+R)

---

### 2️⃣ Make Sure Backend is Running
**In PowerShell:**
```powershell
# Check if server is listening on port 5000
Test-NetConnection -ComputerName localhost -Port 5000

# Should show: TcpTestSucceeded : True
```

**If False → Start the server:**
```powershell
cd "d:\projects\passion-clothing\server"
npm install  # Run once if first time
npm start
```

---

### 3️⃣ Verify MySQL is Running
**In PowerShell:**
```powershell
# Check if MySQL service is running
Get-Service MySQL80 | Select-Object Status

# Should show: Running
```

**If Stopped:**
```powershell
# Start MySQL
net start MySQL80
```

---

### 4️⃣ Make Frontend is Running
**In another PowerShell window:**
```powershell
cd "d:\projects\passion-clothing\client"
npm start

# Should open browser to http://localhost:3000
```

---

### 5️⃣ Log In Again
- Go to **http://localhost:3000**
- Enter your **email** and **password**
- ✅ If login works, 401 error is fixed!

---

## Still Getting 401?

### Check Token Expiry
**In browser console (F12):**
```javascript
const token = localStorage.getItem('token');
if (token) {
  const payload = JSON.parse(atob(token.split('.')[1]));
  console.log('Expires:', new Date(payload.exp * 1000));
}
```

**If expired:** Log in again to get new token

---

### Test API Connection
**In browser console:**
```javascript
fetch('/api/auth/verify', {
  headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`}
})
.then(r => r.json())
.then(d => console.log(d))
```

**Expected output:**
```json
{ "valid": true, "user": { ... } }
```

**If 401:** Token is invalid (log in again)

---

### Run Full Diagnostic
**In browser console:**
```javascript
// First, make sure server is running
// Then paste this:
// (Copy from diagnose-auth-401.js)
```

---

## Common Scenarios

### 🔴 Scenario 1: First Time Login After Fresh Start
```
1. Server not running
2. Backend needs to connect to database
3. User might not exist yet

👉 FIX:
   • Start MySQL: net start MySQL80
   • Start server: npm start (in server folder)
   • Wait 5 seconds for server to fully start
   • Open browser to localhost:3000
   • Create new account (Register)
```

### 🔴 Scenario 2: Was Working, Now Getting 401
```
Likely causes:
1. Token expired (older than 24 hours)
2. Server was restarted (different token secret)
3. User status changed in database
4. Database connection lost

👉 FIX:
   • Clear localStorage: localStorage.clear()
   • Refresh page: F5
   • Log in again with same credentials
```

### 🔴 Scenario 3: Getting 401 on Every Request
```
Likely causes:
1. Backend server is down
2. Token not being sent with requests
3. CORS misconfiguration

👉 FIX:
   • Check backend is running: npm start (in server folder)
   • Check port 5000: Test-NetConnection localhost -Port 5000
   • Check token exists: localStorage.getItem('token')
   • If token empty, log in again
```

---

## One-Command Fix (All-in-One)

**If you have admin access, run this PowerShell:**
```powershell
# Start MySQL
net start MySQL80

# Kill old Node processes
taskkill /IM node.exe /F 2>$null

# Start backend (in background)
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'd:\projects\passion-clothing\server'; npm start"

# Wait for server to start
Start-Sleep -Seconds 3

# Start frontend (in new window)
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'd:\projects\passion-clothing\client'; npm start"

Write-Host "✅ Backend: http://localhost:5000"
Write-Host "✅ Frontend: http://localhost:3000"
Write-Host "⏳ Waiting for frontend to load..."
Start-Sleep -Seconds 5
```

---

## Browser DevTools Checklist

**Press F12 to open DevTools:**

```
✅ Network Tab
   └─ api/auth/verify
      ├─ Status should be 200 (not 401)
      ├─ Headers should show "Authorization: Bearer ..."

✅ Application Tab
   └─ LocalStorage
      ├─ Should have 'token' key
      ├─ Token should start with "eyJ"

✅ Console Tab
   ├─ No red errors
   ├─ Should show "[API] Using base URL: /api"
```

---

## Need Help Debugging?

1. **Open browser console (F12)**
2. **Copy this and paste:**
```javascript
// This will show your current auth status
console.log('Token:', localStorage.getItem('token')?.substring(0, 50) + '...');
console.log('Base URL:', localStorage.getItem('VITE_API_BASE_URL') || 'using /api proxy');
window.apiConfig?.testApiConnection('/auth/verify')
  .then(r => console.log('API Test:', r));
```

3. **Share the output**

---

## Files for Reference

| File | Purpose |
|------|---------|
| `AUTH_401_ERROR_FIX.md` | Complete diagnostic guide |
| `diagnose-auth-401.js` | Browser console diagnostic tool |
| `start-servers.ps1` | Automated server startup script |
| `QUICK_FIX_401_ERROR.md` | This file (quick reference) |

---

## Still Not Working?

### Try Full Reset:
```powershell
# 1. Stop everything
taskkill /IM node.exe /F
net stop MySQL80

# 2. Clear browser
# Ctrl+Shift+Delete (Clear browsing data)

# 3. Restart
net start MySQL80
cd "d:\projects\passion-clothing\server"
npm start

# 4. In new terminal:
cd "d:\projects\passion-clothing\client"
npm start

# 5. Try again at http://localhost:3000
```

### Check Server Logs:
Look for errors in the terminal running `npm start`

---

**Most Common Fix**: 
- ❌ Old token expired → ✅ `localStorage.clear()` → ✅ Log in again

**99% of cases fixed by**: Restarting both servers and clearing token

---

## Success Indicators ✅

1. Frontend loads without errors at http://localhost:3000
2. Login form appears (or dashboard if already logged in)
3. No red errors in browser console
4. Network tab shows successful requests (200 status)
5. Dashboard loads with data

**If all above are ✅, then 401 error is FIXED!**

---

**Status**: Ready to use - start with sections 1-5 above