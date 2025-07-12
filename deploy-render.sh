#!/bin/bash

# Render部署脚本 - 前端项目
echo "🚀 开始部署前端到Render..."

# 检查Node.js版本
echo "📋 检查Node.js版本..."
node_version=$(node --version)
echo "当前Node.js版本: $node_version"

# 检查是否支持空值合并操作符（需要Node.js 14+）
node_major_version=$(echo $node_version | cut -d'.' -f1 | sed 's/v//')
if [ "$node_major_version" -lt 14 ]; then
    echo "❌ 错误: Node.js版本过低 ($node_version)"
    echo "   需要Node.js 14.0.0或更高版本以支持空值合并操作符"
    echo "   请升级Node.js版本"
    exit 1
fi
echo "✅ Node.js版本检查通过"

# 检查必要的环境变量
if [ -z "$VITE_API_BASE_URL" ]; then
    echo "⚠️  警告: VITE_API_BASE_URL 环境变量未设置，使用默认值"
    export VITE_API_BASE_URL="https://coloringbook-backend-n6f5.onrender.com"
fi

echo "📦 安装依赖..."
npm ci

echo "🔧 构建项目..."
npm run build

echo "✅ 构建完成! 静态文件已生成到 ./dist 目录"
echo "🌐 后端API地址: $VITE_API_BASE_URL"

# 显示构建信息
echo "📊 构建统计:"
if [ -d "dist" ]; then
    echo "  - 总文件数: $(find dist -type f | wc -l)"
    echo "  - 总大小: $(du -sh dist | cut -f1)"
fi

echo "🎉 部署准备完成!"
echo ""
echo "📝 请确保在 Render Dashboard 中设置以下环境变量："
echo "   - VITE_API_BASE_URL"
echo "   - VITE_GOOGLE_CLIENT_ID"
echo ""
echo "🔐 如果遇到 Google 登录问题，请参考："
echo "   - GOOGLE_OAUTH_SETUP.md" 