import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types';
import { config } from '../config';

// 自定义错误类
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// 全局错误处理中间件
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  console.error('服务器错误:', err);

  // 如果响应已经发送，则交给默认的Express错误处理器
  if (res.headersSent) {
    return next(err);
  }

  let statusCode = 500;
  let message = '服务器内部错误';

  // 处理自定义错误
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  }

  // 处理Prisma错误
  if (err.name === 'PrismaClientKnownRequestError') {
    statusCode = 400;
    message = '数据库操作失败';
  }

  // 处理验证错误
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = '数据验证失败';
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    message: config.isDevelopment ? err.message : '请稍后重试',
    ...(config.isDevelopment && { stack: err.stack })
  });
};

// 404处理中间件
export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'API端点不存在',
    message: `路径 ${req.originalUrl} 不存在`,
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
};

// 异步错误捕获包装器
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}; 