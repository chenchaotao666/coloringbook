import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { writeFileSync } from 'fs';
import { join } from 'path';
// https://vitejs.dev/config/
// 动态生成robots.txt的插件
const generateRobotsPlugin = () => {
    return {
        name: 'generate-robots',
        writeBundle() {
            const isDevelopment = process.env.NODE_ENV === 'development';
            const isStaging = process.env.VITE_ENV === 'staging';
            
            let robotsContent;
            
            if (isDevelopment || isStaging) {
                // 开发环境或测试环境 - 阻止搜索引擎
                robotsContent = `User-agent: *
Disallow: /

# 阻止所有搜索引擎索引整个网站
# 开发/测试阶段使用`;
            } else {
                // 生产环境 - 自定义robots配置
                robotsContent = `User-agent: *
Disallow:

Sitemap: https://colorpages.art/sitemap.xml
`;
            }
            
            // 写入robots.txt到构建目录
            const robotsPath = join(process.cwd(), 'dist', 'robots.txt');
            writeFileSync(robotsPath, robotsContent);
            console.log('✅ robots.txt generated for', isDevelopment ? 'development' : isStaging ? 'staging' : 'production');
        }
    };
};

export default defineConfig({
    plugins: [react(), generateRobotsPlugin()],
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
                    proxy.on('proxyReq', function (_proxyReq, req, _res) {
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
                    proxy.on('proxyReq', function (_proxyReq, req, _res) {
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
