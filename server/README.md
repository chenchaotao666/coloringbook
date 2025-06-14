# 涂色书 API 服务器

基于 Express.js 和 PostgreSQL 的完整涂色书后端服务，支持用户管理、图片生成、文件上传等功能。

## 🚀 功能特性

- **用户管理**: 注册、登录、更新信息、头像上传、充值
- **图片管理**: 查询、文本生成图片、图片转换、删除、举报
- **分类管理**: 获取所有分类和分类详情
- **任务管理**: 查询任务状态、获取用户任务、取消任务
- **文件上传**: 支持头像和图片上传，自动压缩和处理
- **参数验证**: 完整的请求参数验证和错误处理
- **认证授权**: JWT 令牌认证和权限控制
- **错误处理**: 统一的错误码和响应格式

## 📋 环境要求

- Node.js >= 18.0.0
- PostgreSQL >= 12
- npm 或 yarn

## 🛠️ 安装和配置

### 1. 安装依赖

```bash
npm install
```

### 2. 环境变量配置

复制环境变量示例文件并配置：

```bash
cp env.example .env
```

编辑 `.env` 文件，配置以下变量：

```env
# 数据库连接
DATABASE_URL="postgresql://username:password@localhost:5432/coloring_book_db"

# 服务器配置
PORT=3001
NODE_ENV=development

# JWT密钥
JWT_SECRET=your-super-secret-jwt-key-here-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here-change-in-production

# 文件上传配置
UPLOAD_DIR=uploads
MAX_FILE_SIZE=10485760
ALLOWED_IMAGE_TYPES=image/jpeg,image/png,image/gif,image/webp

# CORS配置
CORS_ORIGIN=http://localhost:3000
```

### 3. 数据库设置

生成 Prisma 客户端：

```bash
npm run db:generate
```

推送数据库模式：

```bash
npm run db:push
```

初始化种子数据：

```bash
npm run db:seed
```

## 🚀 启动服务

### 开发模式

```bash
npm run dev
```

### 生产模式

```bash
npm start
```

服务器将在 `http://localhost:3001` 启动。

## 📚 API 文档

详细的 API 文档请参考 [API_DOCS.md](./API_DOCS.md)。

### 主要端点

- **健康检查**: `GET /health`
- **用户管理**: `/api/users/*`
- **图片管理**: `/api/images/*`
- **分类管理**: `/api/categories/*`
- **任务管理**: `/api/tasks/*`

## 🗂️ 项目结构

```
server/
├── prisma/
│   └── schema.prisma          # 数据库模式定义
├── src/
│   ├── config/
│   │   ├── database.js        # 数据库配置
│   │   └── constants.js       # 常量定义
│   ├── controllers/
│   │   ├── userController.js  # 用户控制器
│   │   ├── imageController.js # 图片控制器
│   │   ├── categoryController.js # 分类控制器
│   │   └── taskController.js  # 任务控制器
│   ├── middleware/
│   │   ├── auth.js           # 认证中间件
│   │   └── upload.js         # 文件上传中间件
│   ├── routes/
│   │   ├── userRoutes.js     # 用户路由
│   │   ├── imageRoutes.js    # 图片路由
│   │   ├── categoryRoutes.js # 分类路由
│   │   └── taskRoutes.js     # 任务路由
│   ├── scripts/
│   │   └── seed.js           # 数据库种子脚本
│   ├── utils/
│   │   ├── response.js       # 响应工具
│   │   └── fileUtils.js      # 文件工具
│   ├── validation/
│   │   ├── userValidation.js # 用户验证
│   │   └── imageValidation.js # 图片验证
│   └── server.js             # 主服务器文件
├── uploads/                  # 上传文件目录
├── images-mock/              # 预制图片目录
├── package.json
├── env.example
└── README.md
```

## 🧪 测试账户

种子数据包含以下测试账户：

**Pro 用户**
- 邮箱: `test@example.com`
- 密码: `password123`
- 积分: 100

**Lite 用户**
- 邮箱: `demo@example.com`
- 密码: `password123`
- 积分: 50

## 🔧 开发工具

### 数据库管理

```bash
# 查看数据库
npm run db:studio

# 重置数据库
npm run db:push --force-reset

# 重新初始化种子数据
npm run db:seed
```

### 日志和调试

- 开发环境下会显示详细的请求日志
- 所有错误都会记录到控制台
- 支持 Prisma 查询日志

## 🛡️ 安全特性

- **Helmet**: 设置安全相关的 HTTP 头
- **CORS**: 跨域资源共享配置
- **速率限制**: 防止 API 滥用
- **JWT 认证**: 安全的用户认证
- **参数验证**: 防止恶意输入
- **文件上传限制**: 限制文件类型和大小

## 📝 错误处理

API 使用统一的错误响应格式：

```json
{
  "status": "fail",
  "errorCode": "1001",
  "message": "错误描述"
}
```

错误码分类：
- 1000-1999: 用户相关错误
- 2000-2999: 图片相关错误
- 3000-3999: 分类相关错误
- 4000-4999: 举报相关错误
- 9000-9999: 系统相关错误

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。 