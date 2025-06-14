const jwt = require('jsonwebtoken');
const { prisma } = require('../config/database');
const { errorResponse } = require('../utils/response');
const { ERROR_CODES } = require('../config/constants');

/**
 * JWT认证中间件
 */
async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return errorResponse(res, ERROR_CODES.TOKEN_INVALID, '访问令牌缺失', 401);
    }

    // 验证token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 查询用户信息
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        username: true,
        email: true,
        isActive: true,
        userType: true,
        credits: true
      }
    });

    if (!user) {
      return errorResponse(res, ERROR_CODES.USER_NOT_FOUND, '用户不存在', 401);
    }

    if (!user.isActive) {
      return errorResponse(res, ERROR_CODES.ACCOUNT_DISABLED, '账户已被禁用，请联系客服', 403);
    }

    // 将用户信息添加到请求对象
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return errorResponse(res, ERROR_CODES.TOKEN_INVALID, '访问令牌无效', 401);
    }
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, ERROR_CODES.TOKEN_INVALID, '访问令牌已过期', 401);
    }
    
    console.error('认证中间件错误:', error);
    return errorResponse(res, ERROR_CODES.INTERNAL_SERVER_ERROR, '服务器内部错误', 500);
  }
}

/**
 * 可选认证中间件（用户可以是匿名的）
 */
async function optionalAuth(req, res, next) {
  console.log('into optionalAuth', req.headers);
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      req.user = null;
      return next();
    }

    // 验证token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 查询用户信息
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        username: true,
        email: true,
        isActive: true,
        userType: true,
        credits: true
      }
    });

    req.user = user && user.isActive ? user : null;
    next();
  } catch (error) {
    // 可选认证失败时，继续执行，但用户为null
    req.user = null;
    next();
  }
}

/**
 * 检查用户权限中间件
 */
function requirePermission(permission) {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, ERROR_CODES.TOKEN_INVALID, '需要登录', 401);
    }

    // 这里可以根据需要实现更复杂的权限检查
    // 目前简单检查用户是否激活
    if (!req.user.isActive) {
      return errorResponse(res, ERROR_CODES.ACCOUNT_DISABLED, '账户已被禁用', 403);
    }

    next();
  };
}

/**
 * 检查用户类型中间件
 */
function requireUserType(userTypes) {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, ERROR_CODES.TOKEN_INVALID, '需要登录', 401);
    }

    if (!userTypes.includes(req.user.userType)) {
      return errorResponse(res, ERROR_CODES.PERMISSION_DENIED, '权限不足', 403);
    }

    next();
  };
}

module.exports = {
  authenticateToken,
  optionalAuth,
  requirePermission,
  requireUserType
}; 