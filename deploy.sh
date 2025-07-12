#!/bin/bash

echo "🚀 开始部署到 Vercel..."

# 检查是否安装了 Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "📦 安装 Vercel CLI..."
    npm install -g vercel
fi

# 构建前端
echo "🔨 构建前端..."
npm run build

# 部署到 Vercel
echo "🚀 部署到 Vercel..."
vercel --prod

echo "✅ 部署完成！"
echo "📝 请确保在 Vercel Dashboard 中设置以下环境变量："
echo "   - DATABASE_URL"
echo "   - JWT_SECRET"
echo "   - JWT_REFRESH_SECRET"
echo "   - CORS_ORIGIN"
echo "   - VITE_GOOGLE_CLIENT_ID"
echo ""
echo "🔐 如果遇到 Google 登录问题，请参考："
echo "   - GOOGLE_OAUTH_SETUP.md" 