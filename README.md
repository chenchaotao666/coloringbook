# 🎨 Coloring Book Frontend

这是着色书项目的前端应用，使用 React + TypeScript + Tailwind CSS 构建。

## 🚀 快速开始

### 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 环境配置

创建 `.env.local` 文件配置后端 API 地址：

```env
# 后端 API 地址
VITE_API_BASE_URL=https://your-backend-api.com
```

## 📦 部署

### Vercel 部署

1. 在 Vercel 项目设置中添加环境变量：
   - `VITE_API_BASE_URL`: 你的后端 API 地址

2. 推送代码，Vercel 会自动构建和部署

详细部署指南请查看 [FRONTEND_DEPLOYMENT.md](./FRONTEND_DEPLOYMENT.md)

## 🛠️ 技术栈

- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite
- **样式**: Tailwind CSS
- **路由**: React Router
- **HTTP 客户端**: Axios
- **部署**: Vercel

## 📁 项目结构

```
src/
├── components/     # 可复用组件
├── pages/         # 页面组件
├── services/      # API 服务
├── utils/         # 工具函数
├── contexts/      # React Context
├── hooks/         # 自定义 Hooks
└── styles/        # 样式文件
```

## 🔗 相关链接

- 后端项目：[单独的 server 项目]
- 设计稿：`/sourcehtmls` 目录
- API 文档：查看后端项目文档

## 📄 许可证

[许可证信息] 