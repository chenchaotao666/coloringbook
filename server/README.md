# Coloring Book API Server

基于 TypeScript + Express + PostgreSQL + Prisma 构建的涂色书后端API服务。

## 🚀 技术栈

- **框架**: Express.js
- **语言**: TypeScript
- **数据库**: PostgreSQL
- **ORM**: Prisma
- **验证**: Zod
- **安全**: Helmet, CORS
- **日志**: Morgan

## 📁 项目结构

```
server/
├── src/
│   ├── config/          # 配置文件
│   │   ├── database.ts  # 数据库配置
│   │   └── index.ts     # 应用配置
│   ├── controllers/     # 控制器
│   │   ├── categoryController.ts
│   │   └── imageController.ts
│   ├── middleware/      # 中间件
│   │   ├── errorHandler.ts
│   │   └── validation.ts
│   ├── routes/          # 路由
│   │   ├── categoryRoutes.ts
│   │   ├── imageRoutes.ts
│   │   ├── userRoutes.ts
│   │   └── generateRoutes.ts
│   ├── schemas/         # Zod验证模式
│   │   └── index.ts
│   ├── types/           # TypeScript类型定义
│   │   └── index.ts
│   └── index.ts         # 应用入口
├── prisma/
│   └── schema.prisma    # 数据库模式
├── package.json
├── tsconfig.json
└── README.md
```

## 🛠️ 安装和运行

### 1. 安装依赖

```bash
cd server
npm install
```

### 2. 环境配置

复制环境变量示例文件：

```bash
cp env.example .env
```

编辑 `.env` 文件，配置数据库连接等信息：

```env
DATABASE_URL="postgresql://username:password@localhost:5432/coloring_book_db"
PORT=3001
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key
```

### 3. 数据库设置

```bash
# 生成Prisma客户端
npm run db:generate

# 推送数据库模式（开发环境）
npm run db:push

# 或者运行迁移（生产环境）
npm run db:migrate

# 填充初始数据（可选）
npm run db:seed
```

### 4. 启动服务

```bash
# 开发模式（热重载）
npm run dev

# 构建
npm run build

# 生产模式
npm start
```

## 📚 API 文档

### 基础信息

- **Base URL**: `http://localhost:3001`
- **API版本**: v1
- **数据格式**: JSON

### 通用响应格式

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: PaginationInfo;
  searchInfo?: SearchInfo;
}
```

### 端点列表

#### 健康检查
- `GET /health` - 服务器健康检查

#### 分类管理
- `GET /api/categories` - 获取所有分类
- `GET /api/categories/:id` - 获取单个分类详情
- `POST /api/categories` - 创建新分类
- `PUT /api/categories/:id` - 更新分类
- `DELETE /api/categories/:id` - 删除分类

#### 图片管理
- `GET /api/images` - 搜索图片（支持分页、筛选）
- `GET /api/images/category/:categoryId` - 获取分类下的图片
- `GET /api/images/:id` - 获取单个图片详情
- `DELETE /api/images/:id` - 删除图片

#### 用户管理（待实现）
- `GET /api/users/:id` - 获取用户信息
- `PUT /api/users/:id` - 更新用户信息
- `GET /api/users/:id/favorites` - 获取用户收藏
- `POST /api/users/:id/favorites` - 添加收藏
- `DELETE /api/users/:id/favorites/:imageId` - 删除收藏

#### AI生成（待实现）
- `POST /api/generate/text-to-image` - 文本生成图片
- `POST /api/generate/image-to-image` - 图片转换
- `GET /api/generate/status/:taskId` - 查询生成状态

## 🗄️ 数据库模式

### 主要表结构

#### Categories (分类)
```sql
- id: String (主键)
- name: String (唯一)
- displayName: String
- description: String
- imageCount: Int
- thumbnailUrl: String?
- createdAt: DateTime
- updatedAt: DateTime
```

#### Images (图片)
```sql
- id: String (主键)
- title: String
- description: String?
- url: String
- colorUrl: String?
- tags: String[]
- ratio: String
- difficulty: String?
- type: String (default/text2image/image2image)
- isPublic: Boolean
- status: String
- categoryId: String (外键)
- userId: String?
- createdAt: DateTime
- updatedAt: DateTime
```

#### Users (用户)
```sql
- id: String (主键)
- username: String (唯一)
- email: String (唯一)
- avatar: String?
- preferences: Json?
- stats: Json?
- createdAt: DateTime
- updatedAt: DateTime
```

## 🔧 开发指南

### 添加新的API端点

1. 在 `src/schemas/index.ts` 中定义验证模式
2. 在相应的控制器中实现业务逻辑
3. 在路由文件中添加路由定义
4. 更新类型定义（如需要）

### 数据库迁移

```bash
# 创建新的迁移
npx prisma migrate dev --name migration_name

# 重置数据库
npx prisma migrate reset

# 查看数据库
npx prisma studio
```

### 代码规范

- 使用 TypeScript 严格模式
- 遵循 ESLint 规则
- 使用 Zod 进行参数验证
- 使用 Prisma 进行数据库操作
- 错误处理使用统一的错误中间件

## 🚀 部署

### Vercel 部署

1. 安装 Vercel CLI
```bash
npm i -g vercel
```

2. 配置 `vercel.json`
```json
{
  "builds": [
    {
      "src": "dist/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "dist/index.js"
    }
  ]
}
```

3. 设置环境变量
```bash
vercel env add DATABASE_URL
vercel env add JWT_SECRET
```

4. 部署
```bash
npm run build
vercel --prod
```

## 📝 待办事项

- [ ] 完善用户管理功能
- [ ] 实现AI图片生成功能
- [ ] 添加认证和授权
- [ ] 实现文件上传功能
- [ ] 添加单元测试
- [ ] 添加API文档生成
- [ ] 实现缓存机制
- [ ] 添加监控和日志

## 🤝 贡献

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## �� 许可证

MIT License 