#!/bin/bash

echo "🔧 设置 Vercel 环境变量..."

# 确保已登录 Vercel
echo "📝 请确保您已经登录 Vercel CLI (vercel login)"

# 设置数据库 URL
echo "🗄️ 设置 DATABASE_URL..."
echo "请输入您的 PostgreSQL 数据库 URL:"
echo "格式: postgresql://username:password@hostname:port/database"
read -p "DATABASE_URL: " DATABASE_URL
vercel env add DATABASE_URL production <<< "$DATABASE_URL"
vercel env add DATABASE_URL preview <<< "$DATABASE_URL"
vercel env add DATABASE_URL development <<< "$DATABASE_URL"

# 设置 JWT Secret
echo "🔐 设置 JWT_SECRET..."
echo "请输入 JWT 密钥 (至少32位字符):"
read -p "JWT_SECRET: " JWT_SECRET
vercel env add JWT_SECRET production <<< "$JWT_SECRET"
vercel env add JWT_SECRET preview <<< "$JWT_SECRET"
vercel env add JWT_SECRET development <<< "$JWT_SECRET"

# 设置 JWT Refresh Secret
echo "🔐 设置 JWT_REFRESH_SECRET..."
echo "请输入 JWT 刷新密钥 (至少32位字符，与上面不同):"
read -p "JWT_REFRESH_SECRET: " JWT_REFRESH_SECRET
vercel env add JWT_REFRESH_SECRET production <<< "$JWT_REFRESH_SECRET"
vercel env add JWT_REFRESH_SECRET preview <<< "$JWT_REFRESH_SECRET"
vercel env add JWT_REFRESH_SECRET development <<< "$JWT_REFRESH_SECRET"

# 设置 CORS Origin
echo "🌐 设置 CORS_ORIGIN..."
echo "请输入您的 Vercel 项目域名:"
echo "格式: https://your-project-name.vercel.app"
read -p "CORS_ORIGIN: " CORS_ORIGIN
vercel env add CORS_ORIGIN production <<< "$CORS_ORIGIN"
vercel env add CORS_ORIGIN preview <<< "$CORS_ORIGIN"
vercel env add CORS_ORIGIN development <<< "$CORS_ORIGIN"

# 设置 NODE_ENV
echo "⚙️ 设置 NODE_ENV..."
vercel env add NODE_ENV production <<< "production"

echo "✅ 环境变量设置完成！"
echo "🚀 现在可以重新部署项目: vercel --prod" 