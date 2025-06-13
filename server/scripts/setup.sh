#!/bin/bash

echo "🚀 设置 Coloring Book API Server..."

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js"
    exit 1
fi

# 检查 npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm 未安装，请先安装 npm"
    exit 1
fi

echo "📦 安装依赖..."
npm install

# 检查是否存在 .env 文件
if [ ! -f .env ]; then
    echo "📝 创建环境变量文件..."
    cp env.example .env
    echo "⚠️  请编辑 .env 文件配置数据库连接信息"
fi

echo "🗄️ 生成 Prisma 客户端..."
npm run db:generate

echo "✅ 设置完成！"
echo ""
echo "下一步："
echo "1. 编辑 .env 文件配置数据库连接"
echo "2. 运行 'npm run db:push' 创建数据库表"
echo "3. 运行 'npm run db:seed' 填充示例数据（可选）"
echo "4. 运行 'npm run dev' 启动开发服务器" 