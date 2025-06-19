import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    base: '/',
    build: {
        outDir: 'dist',
        sourcemap: false,
        assetsDir: 'assets',
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['react', 'react-dom'],
                    router: ['react-router-dom']
                }
            }
        }
    },
    server: {
        port: 3000,
        open: true,
        proxy: {
            '/api': {
                target: process.env.VITE_API_BASE_URL || 'http://localhost:3001',
                changeOrigin: true,
                secure: false,
                timeout: 10000, // 10秒超时
                configure: function (proxy, _options) {
                    proxy.on('error', function (err, _req, _res) {
                        console.log('proxy error', err);
                    });
                    proxy.on('proxyReq', function (proxyReq, req, _res) {
                        console.log('Sending Request to the Target:', req.method, req.url);
                    });
                    proxy.on('proxyRes', function (proxyRes, req, _res) {
                        console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
                    });
                },
            },
            '/uploads': {
                target: process.env.VITE_API_BASE_URL || 'http://localhost:3001',
                changeOrigin: true,
                secure: false,
                timeout: 10000, // 10秒超时
                configure: function (proxy, _options) {
                    proxy.on('error', function (err, _req, _res) {
                        console.log('uploads proxy error', err);
                    });
                    proxy.on('proxyReq', function (proxyReq, req, _res) {
                        console.log('Sending Uploads Request to the Target:', req.method, req.url);
                    });
                    proxy.on('proxyRes', function (proxyRes, req, _res) {
                        console.log('Received Uploads Response from the Target:', proxyRes.statusCode, req.url);
                    });
                },
            }
        }
    }
});
