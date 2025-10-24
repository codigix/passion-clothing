import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // Load .env variables for the current mode
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react({ jsxRuntime: 'automatic' })],
    optimizeDeps: {
      esbuildOptions: {
        loader: { '.js': 'jsx' },
      },
    },
    server: {
      host: '0.0.0.0', // Listen on all network interfaces
      port: 3000,
      proxy: mode === 'development' ? {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
          secure: false,
          configure: (proxy, options) => {
            proxy.on('error', (err, req, res) => console.log('Proxy error:', err))
            proxy.on('proxyReq', (proxyReq, req, res) =>
              console.log('Proxy request:', req.method, req.url, '->', options.target + req.url)
            )
          },
        },
      } : undefined,
    },
    define: {
      // Expose API URL to frontend code
      __API_BASE_URL__: JSON.stringify(env.VITE_API_BASE_URL || '/api'),
    },
  }
})
