# Coloring Book API Server

这是一个为涂色页面生成器提供后台服务的 Express.js API 服务器。

## 功能特性

- 🎨 文本转图片生成
- 🖼️ 图片转图片生成
- 📚 示例图片管理
- 🎭 风格建议
- 📥 图片下载
- 📊 任务状态跟踪
- 🔄 示例重新创建

## 安装和运行

### 1. 安装依赖

```bash
cd server
npm install
```

### 2. 启动服务器

开发模式（自动重启）：
```bash
npm run dev
```

生产模式：
```bash
npm start
```

服务器将在 `http://localhost:3001` 启动。

## API 接口文档

### 基础信息

- **Base URL**: `http://localhost:3001/api`
- **Content-Type**: `application/json`

### 接口列表

#### 1. 健康检查
```
GET /api/health
```

#### 2. 文本转图片生成
```
POST /api/generate/text-to-image
```

#### 3. 图片转图片生成
```
POST /api/generate/image-to-image
```

#### 4. 获取示例图片
```
GET /api/examples/:category
```

#### 5. 获取风格建议
```
GET /api/styles/suggestions
```

#### 6. 下载图片
```
GET /api/download/:imageId?format=png
```

#### 7. 获取任务状态
```
GET /api/tasks/:taskId/status
```

#### 8. 重新创建示例
```
POST /api/examples/:exampleId/recreate
```

#### 9. 获取所有生成的图片
```
GET /api/images
``` 