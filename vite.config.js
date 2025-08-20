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
                robotsContent = `# NOTICE: The collection of content and other data on this
# site through automated means, including any device, tool,
# or process designed to data mine or scrape content, is
# prohibited except (1) for the purpose of search engine indexing or
# artificial intelligence retrieval augmented generation or (2) with express
# written permission from this site's operator.

# To request permission to license our intellectual
# property and/or other materials, please contact this
# site's operator directly.

# BEGIN Cloudflare Managed content

User-agent: Amazonbot
Disallow: /

User-agent: Applebot-Extended
Disallow: /

User-agent: Bytespider
Disallow: /

User-agent: CCBot
Disallow: /

User-agent: ClaudeBot
Disallow: /

User-agent: Google-Extended
Disallow: /

User-agent: GPTBot
Disallow: /

User-agent: meta-externalagent
Disallow: /

# END Cloudflare Managed Content
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
