import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

export const config = {
  // 服务器配置
  port: parseInt(process.env['PORT'] || '3001', 10),
  nodeEnv: process.env['NODE_ENV'] || 'development',
  
  // 数据库配置
  databaseUrl: process.env['DATABASE_URL'] || '',
  
  // JWT配置
  jwtSecret: process.env['JWT_SECRET'] || 'your-super-secret-jwt-key',
  jwtExpiresIn: process.env['JWT_EXPIRES_IN'] || '7d',
  
  // CORS配置
  allowedOrigins: process.env['ALLOWED_ORIGINS']?.split(',') || [
    'http://localhost:3000',
    'http://localhost:5173'
  ],
  
  // 文件上传配置
  maxFileSize: parseInt(process.env['MAX_FILE_SIZE'] || '10485760', 10), // 10MB
  uploadDir: process.env['UPLOAD_DIR'] || 'uploads',
  
  // AI服务配置
  openaiApiKey: process.env['OPENAI_API_KEY'] || '',
  stabilityApiKey: process.env['STABILITY_API_KEY'] || '',
  
  // 开发模式
  isDevelopment: process.env['NODE_ENV'] === 'development',
  isProduction: process.env['NODE_ENV'] === 'production',
}; 