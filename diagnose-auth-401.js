/**
 * 🔍 Authentication 401 Error Diagnostic Script
 * Run in browser console to identify root cause
 */

const AuthDiagnostic = {
  // Color output helpers
  log: {
    success: (msg) => console.log('%c✅ ' + msg, 'color: green; font-weight: bold;'),
    error: (msg) => console.log('%c❌ ' + msg, 'color: red; font-weight: bold;'),
    warn: (msg) => console.log('%c⚠️  ' + msg, 'color: orange; font-weight: bold;'),
    info: (msg) => console.log('%c ℹ️  ' + msg, 'color: blue; font-weight: bold;'),
    section: (msg) => console.log('%c\n📋 ' + msg + '\n' + '═'.repeat(50), 'color: purple; font-weight: bold; font-size: 14px;')
  },

  // Check local storage
  checkLocalStorage: function() {
    this.log.section('Checking LocalStorage');
    
    const token = localStorage.getItem('token');
    const apiUrl = localStorage.getItem('VITE_API_BASE_URL');
    
    if (!token) {
      this.log.error('No token found in localStorage');
      this.log.info('User needs to log in first');
      return { hasToken: false };
    }
    
    this.log.success('Token found in localStorage');
    
    // Decode token to check expiry
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        this.log.error('Token format is invalid (not a valid JWT)');
        return { hasToken: true, valid: false };
      }
      
      const payload = JSON.parse(atob(parts[1]));
      this.log.info(`Token issued to: ${payload.email}`);
      this.log.info(`Token user ID: ${payload.userId}`);
      
      const expiryTime = payload.exp * 1000;
      const now = Date.now();
      const msRemaining = expiryTime - now;
      
      if (msRemaining < 0) {
        this.log.error(`Token EXPIRED ${Math.abs(msRemaining) / 1000 / 60} minutes ago`);
        return { hasToken: true, valid: false, reason: 'expired' };
      } else {
        const hoursRemaining = msRemaining / 1000 / 60 / 60;
        this.log.success(`Token valid for ${hoursRemaining.toFixed(2)} more hours`);
        return { hasToken: true, valid: true };
      }
    } catch (e) {
      this.log.error('Could not decode token: ' + e.message);
      return { hasToken: true, valid: false, reason: 'decode_failed' };
    }
  },

  // Check server connectivity
  checkServerConnection: async function() {
    this.log.section('Checking Server Connection');
    
    try {
      const response = await fetch('http://localhost:5000/api/health', {
        timeout: 5000
      });
      this.log.success('Server is RUNNING on port 5000');
      return { running: true, status: response.status };
    } catch (e) {
      this.log.error('Cannot reach server at http://localhost:5000');
      this.log.warn('Possible causes:');
      this.log.warn('  1. Backend server is not running');
      this.log.warn('  2. Server crashed or stopped');
      this.log.warn('  3. Port 5000 is blocked by firewall');
      this.log.warn('  4. Server running on different port');
      return { running: false, error: e.message };
    }
  },

  // Check auth verify endpoint
  checkAuthVerify: async function() {
    this.log.section('Checking /auth/verify Endpoint');
    
    const token = localStorage.getItem('token');
    
    if (!token) {
      this.log.warn('No token to verify (skip this check)');
      this.log.info('Action: Log in first');
      return { skipped: true, reason: 'no_token' };
    }
    
    try {
      const response = await fetch('/api/auth/verify', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        this.log.success('Token verification SUCCESSFUL');
        this.log.info(`Verified user: ${data.user?.email || 'N/A'}`);
        return { valid: true };
      } else {
        this.log.error(`Token verification FAILED (${response.status})`);
        this.log.error('Error: ' + (data.message || 'Unknown error'));
        
        if (response.status === 401) {
          this.log.warn('Possible causes:');
          this.log.warn('  1. Token has expired (24 hour limit)');
          this.log.warn('  2. JWT_SECRET was changed on server');
          this.log.warn('  3. User status is inactive');
          this.log.warn('  4. User was deleted from database');
        }
        
        return { valid: false, status: response.status, message: data.message };
      }
    } catch (e) {
      this.log.error('Failed to reach /auth/verify: ' + e.message);
      return { error: e.message };
    }
  },

  // Check API base URL
  checkApiUrl: function() {
    this.log.section('Checking API Configuration');
    
    const storedUrl = localStorage.getItem('VITE_API_BASE_URL');
    const currentLocation = window.location.origin;
    
    this.log.info('Current page: ' + currentLocation);
    
    if (storedUrl) {
      this.log.info('Stored API URL override: ' + storedUrl);
    } else {
      this.log.info('No stored API URL (using proxy /api or default)');
    }
    
    // Test actual API endpoint
    try {
      const testUrl = '/api/auth/verify';
      this.log.info('Will attempt requests to: ' + testUrl);
      return { config: 'OK' };
    } catch (e) {
      this.log.error('API URL config error: ' + e.message);
      return { config: 'ERROR' };
    }
  },

  // Check database user status
  checkUserStatus: async function() {
    this.log.section('Checking User Status in Database');
    
    const token = localStorage.getItem('token');
    if (!token) {
      this.log.warn('No token available (skip this check)');
      return { skipped: true };
    }
    
    try {
      const response = await fetch('/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const userStatus = data.user?.status;
        
        if (userStatus === 'active') {
          this.log.success(`User status is ACTIVE`);
          return { status: 'active', user: data.user };
        } else {
          this.log.error(`User status is NOT active: ${userStatus}`);
          this.log.warn('The user account is inactive in database');
          return { status: userStatus, user: data.user };
        }
      } else if (response.status === 401) {
        this.log.error('Cannot fetch user profile (401 Unauthorized)');
        this.log.warn('Token is invalid or expired');
        return { error: 'unauthorized' };
      }
    } catch (e) {
      this.log.error('Error checking user status: ' + e.message);
      return { error: e.message };
    }
  },

  // Check CORS configuration
  checkCors: async function() {
    this.log.section('Checking CORS Configuration');
    
    const currentOrigin = window.location.origin;
    this.log.info('Current origin: ' + currentOrigin);
    
    try {
      const response = await fetch('/api/auth/verify', {
        method: 'OPTIONS'
      });
      
      const corsHeader = response.headers.get('Access-Control-Allow-Origin');
      
      if (corsHeader) {
        this.log.success('CORS header present: ' + corsHeader);
        
        if (corsHeader === '*' || corsHeader === currentOrigin) {
          this.log.success('CORS configuration allows requests from current origin');
          return { corsOk: true };
        } else {
          this.log.warn('CORS allows: ' + corsHeader);
          this.log.warn('Current origin: ' + currentOrigin);
          this.log.error('CORS mismatch!');
          return { corsOk: false, allows: corsHeader };
        }
      } else {
        this.log.info('No CORS headers (check server configuration)');
        return { corsOk: 'unknown' };
      }
    } catch (e) {
      // CORS error would be caught here
      this.log.warn('Could not check CORS headers: ' + e.message);
      return { error: e.message };
    }
  },

  // Main diagnostic run
  runAll: async function() {
    console.clear();
    this.log.section('🔍 AUTHENTICATION 401 ERROR DIAGNOSTIC');
    
    console.log('\nRunning all diagnostic checks...\n');
    
    const results = {
      localStorage: this.checkLocalStorage(),
      apiConfig: this.checkApiUrl(),
      server: await this.checkServerConnection(),
      cors: await this.checkCors(),
      authVerify: await this.checkAuthVerify(),
      userStatus: await this.checkUserStatus()
    };
    
    // Summary
    this.log.section('DIAGNOSTIC SUMMARY');
    
    let hasIssues = false;
    
    if (!results.localStorage.hasToken) {
      this.log.error('No token found - user is not logged in');
      hasIssues = true;
    } else if (!results.localStorage.valid) {
      this.log.error(`Token invalid (${results.localStorage.reason})`);
      hasIssues = true;
    } else {
      this.log.success('Token is present and valid');
    }
    
    if (!results.server.running) {
      this.log.error('Backend server is not running');
      hasIssues = true;
    } else {
      this.log.success('Backend server is running');
    }
    
    if (results.authVerify.error) {
      this.log.error('Auth verify failed: ' + results.authVerify.error);
      hasIssues = true;
    } else if (results.authVerify.valid === false) {
      this.log.error('Auth verify returned error: ' + results.authVerify.message);
      hasIssues = true;
    } else if (!results.authVerify.skipped) {
      this.log.success('Auth verify passed');
    }
    
    if (!hasIssues && results.localStorage.hasToken && results.server.running) {
      this.log.section('✅ EVERYTHING LOOKS OK!');
      this.log.success('All checks passed - system appears to be working correctly');
      this.log.info('If you still see 401 errors, try:');
      this.log.info('  1. Refresh the page (F5)');
      this.log.info('  2. Clear browser cache (Ctrl+Shift+Delete)');
      this.log.info('  3. Log out and log in again');
    } else if (hasIssues) {
      this.log.section('⚠️  ISSUES FOUND - QUICK FIXES');
      
      if (!results.server.running) {
        this.log.error('ACTION: Start backend server');
        console.log('  Command: cd server && npm start');
      }
      
      if (!results.localStorage.hasToken) {
        this.log.warn('ACTION: Log in with correct credentials');
      }
      
      if (results.localStorage.reason === 'expired') {
        this.log.warn('ACTION: Clear token and log in again');
        console.log('  Command: localStorage.clear(); location.reload();');
      }
      
      if (results.userStatus.status && results.userStatus.status !== 'active') {
        this.log.error('ACTION: Update user status in database to "active"');
      }
    }
    
    return results;
  }
};

// Run diagnostics
console.log('\n%cStarting diagnostics... (This may take a few seconds)\n', 'color: blue; font-size: 12px;');
AuthDiagnostic.runAll().then(results => {
  console.log('\n%c📊 Diagnostic Results Saved\n', 'color: green; font-weight: bold; font-size: 14px;');
  console.log('Results object: AuthDiagnostic (run window.AuthDiagnostic for more info)');
});