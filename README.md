# 🎨 Coloring Book Frontend

这是着色书项目的前端应用，使用 React + TypeScript + Tailwind CSS 构建。

## 🚀 快速开始

### 系统要求

- **Node.js**: 14.0.0 或更高版本（推荐 18.19.0）
- **npm**: 6.0.0 或更高版本

> ⚠️ **重要**: 本项目使用了 ES2020 特性（如空值合并操作符 `??`），需要 Node.js 14+ 才能正常构建。

### 本地开发

```bash
# 检查 Node.js 版本
node --version

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 检查 Google OAuth 配置（可选）
npm run check-google-oauth
```

### 环境配置

创建 `.env.local` 文件配置后端 API 地址和 Google 登录：

```env
# 后端 API 地址
VITE_API_BASE_URL=http://localhost:3001

# Google OAuth 2.0 客户端 ID
# 从 Google Cloud Console 获取
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com

# PayPal 客户端 ID（可选）
# VITE_PAYPAL_CLIENT_ID=your_paypal_client_id_here
```

> ⚠️ **重要**: 如果遇到 Google 登录错误，请参考 [Google OAuth 2.0 配置指南](./GOOGLE_OAUTH_SETUP.md)

#### Google 登录配置步骤

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. 启用 Google Sign-In API
4. 在 "APIs & Services" > "Credentials" 中创建 OAuth 2.0 客户端 ID
5. 在 "Authorized JavaScript origins" 中添加你的域名：
   - 本地开发：`http://localhost:5173`
   - 生产环境：`https://your-domain.com`
6. 复制客户端 ID 到 `VITE_GOOGLE_CLIENT_ID` 环境变量

## 📦 部署

### Vercel 部署

1. 在 Vercel 项目设置中添加环境变量：
   - `VITE_API_BASE_URL`: 你的后端 API 地址
   - `VITE_GOOGLE_CLIENT_ID`: 你的 Google OAuth 2.0 客户端 ID

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
- 故障排除：[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- Google 登录配置：[GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md)

## 📄 许可证

[许可证信息] 