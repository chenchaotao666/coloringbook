#!/bin/bash

# Render部署脚本 - 前端项目
echo "🚀 开始部署前端到Render..."

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