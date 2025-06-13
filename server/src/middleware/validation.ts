import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ApiResponse } from '../types';

// 验证请求体
export const validateBody = (schema: ZodSchema) => {
  return (req: Request, res: Response<ApiResponse>, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          error: '请求参数验证失败',
          message: error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ')
        });
      }
      next(error);
    }
  };
};

// 验证查询参数
export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, res: Response<ApiResponse>, next: NextFunction) => {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          error: '查询参数验证失败',
          message: error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ')
        });
      }
      next(error);
    }
  };
};

// 验证路径参数
export const validateParams = (schema: ZodSchema) => {
  return (req: Request, res: Response<ApiResponse>, next: NextFunction) => {
    try {
      req.params = schema.parse(req.params);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          error: '路径参数验证失败',
          message: error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ')
        });
      }
      next(error);
    }
  };
}; 