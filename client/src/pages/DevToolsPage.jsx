import React, { useState, useEffect } from 'react';
import { setApiBaseUrl, getCurrentApiBaseUrl, testApiConnection } from '../utils/api';

const DevToolsPage = () => {
  const [apiUrl, setApiUrl] = useState('');
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setApiUrl(getCurrentApiBaseUrl());
  }, []);

  const handleTestConnection = async () => {
    setLoading(true);
    setTestResult(null);
    try {
      const result = await testApiConnection();
      setTestResult(result);
    } catch (error) {
      setTestResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveUrl = () => {
    setApiBaseUrl(apiUrl);
    alert('API URL updated! Please refresh the page for changes to take effect.');
  };

  const handleResetUrl = () => {
    setApiBaseUrl(null);
    setApiUrl('/api');
    alert('API URL reset to default! Please refresh the page.');
  };

  const presetUrls = [
    { label: 'Default Proxy (/api)', value: '/api' },
    { label: 'Direct Backend (5000)', value: 'http://localhost:5000/api' },
    { label: 'Backend Port 5001', value: 'http://localhost:5001/api' },
    { label: 'Backend Port 8000', value: 'http://localhost:8000/api' },
    { label: 'Production API', value: 'https://api.example.com' },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
        <h2 className="text-lg font-semibold text-yellow-800 mb-2">⚠️ Development Tools</h2>
        <p className="text-yellow-700 text-sm">
          This page is for development and debugging purposes only. Changes made here affect the API configuration.
        </p>
      </div>

      <div className="bg-white rounded shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-semibold mb-4">API Configuration</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current API Base URL
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 focus:border-blue-500"
                placeholder="Enter API base URL"
              />
              <button
                onClick={handleSaveUrl}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Save
              </button>
              <button
                onClick={handleResetUrl}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Reset
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quick Presets
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {presetUrls.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => setApiUrl(preset.value)}
                  className="px-3 py-2 text-left border border-gray-300 rounded hover:bg-gray-50 text-sm"
                >
                  {preset.label}: <code className="text-blue-600">{preset.value}</code>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-semibold mb-4">Connection Test</h3>

        <div className="space-y-4">
          <button
            onClick={handleTestConnection}
            disabled={loading}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test API Connection'}
          </button>

          {testResult && (
            <div className={`p-4 rounded ${testResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <h4 className={`font-medium ${testResult.success ? 'text-green-800' : 'text-red-800'}`}>
                {testResult.success ? '✅ Connection Successful' : '❌ Connection Failed'}
              </h4>
              {testResult.success ? (
                <pre className="mt-2 text-sm text-green-700">
                  {JSON.stringify(testResult.data, null, 2)}
                </pre>
              ) : (
                <div className="mt-2 text-sm text-red-700">
                  <p><strong>Error:</strong> {testResult.error}</p>
                  {testResult.status && <p><strong>Status:</strong> {testResult.status}</p>}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-semibold mb-4">Usage Instructions</h3>

        <div className="space-y-3 text-sm text-gray-600">
          <p>
            <strong>1. Environment Variables:</strong> Set <code className="bg-gray-100 px-1 rounded">VITE_API_URL</code> in your .env file
          </p>
          <p>
            <strong>2. Runtime Override:</strong> Use the form above to set a URL that persists in localStorage
          </p>
          <p>
            <strong>3. Direct Backend:</strong> If you want to bypass the proxy, set the URL to <code className="bg-gray-100 px-1 rounded">http://localhost:PORT/api</code>
          </p>
          <p>
            <strong>4. Browser Console:</strong> Use <code className="bg-gray-100 px-1 rounded">window.apiConfig</code> for debugging
          </p>
          <p>
            <strong>5. Backend Port:</strong> Set <code className="bg-gray-100 px-1 rounded">VITE_BACKEND_URL</code> to change the proxy target
          </p>
        </div>
      </div>
    </div>
  );
};

export default DevToolsPage;