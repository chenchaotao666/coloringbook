const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const { prisma } = require('../config/database');
const { successResponse, errorResponse, createdResponse } = require('../utils/response');
const { ERROR_CODES, USER_TYPES, ORDER_STATUS } = require('../config/constants');
const { 
  validateRegister, 
  validateLogin, 
  validateUpdate, 
  validateRecharge,
  validateRefreshToken 
} = require('../validation/userValidation');
const { deleteFile, compressImage } = require('../utils/fileUtils');

/**
 * 生成JWT令牌
 */
function generateTokens(userId) {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
  
  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
  
  return { accessToken, refreshToken };
}

/**
 * 格式化用户响应数据
 */
function formatUserResponse(user) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    avatar: user.avatar || '',
    credits: user.credits,
    userType: user.userType,
    membershipExpiry: user.membershipExpiry ? user.membershipExpiry.toISOString() : '',
    createdAt: user.createdAt.toISOString()
  };
}

/**
 * 用户注册
 */
async function register(req, res) {
  try {
    // 验证请求数据
    const validation = validateRegister(req.body);
    if (!validation.isValid) {
      return errorResponse(res, validation.errorCode, validation.message, 400);
    }

    const { username, email, password } = validation.data;

    // 检查邮箱是否已存在
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email }
    });
    if (existingUserByEmail) {
      return errorResponse(res, ERROR_CODES.EMAIL_EXISTS, '该邮箱已被注册', 409);
    }

    // 检查用户名是否已存在
    const existingUserByUsername = await prisma.user.findUnique({
      where: { username }
    });
    if (existingUserByUsername) {
      return errorResponse(res, ERROR_CODES.USERNAME_EXISTS, '该用户名已被使用', 409);
    }

    // 加密密码
    const passwordHash = await bcrypt.hash(password, 12);

    // 创建用户
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
        credits: 40,
        userType: USER_TYPES.FREE
      }
    });

    return createdResponse(res, formatUserResponse(newUser));
  } catch (error) {
    console.error('用户注册错误:', error);
    return errorResponse(res, ERROR_CODES.INTERNAL_SERVER_ERROR, '服务器内部错误', 500);
  }
}

/**
 * 用户登录
 */
async function login(req, res) {
  try {
    // 验证请求数据
    const validation = validateLogin(req.body);
    if (!validation.isValid) {
      return errorResponse(res, validation.errorCode, validation.message, 400);
    }

    const { email, password } = validation.data;

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return errorResponse(res, ERROR_CODES.USER_NOT_FOUND, '该邮箱未注册', 404);
    }

    // 检查账户是否被禁用
    if (!user.isActive) {
      return errorResponse(res, ERROR_CODES.ACCOUNT_DISABLED, '账户已被禁用，请联系客服', 403);
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return errorResponse(res, ERROR_CODES.WRONG_PASSWORD, '密码错误', 401);
    }

    // 更新最后登录时间
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    // 生成令牌
    const { accessToken, refreshToken } = generateTokens(user.id);

    return successResponse(res, {
      user: formatUserResponse(user),
      accessToken,
      refreshToken,
      expiresIn: '15m'
    });
  } catch (error) {
    console.error('用户登录错误:', error);
    return errorResponse(res, ERROR_CODES.INTERNAL_SERVER_ERROR, '服务器内部错误', 500);
  }
}

/**
 * 获取当前用户信息
 */
async function getCurrentUser(req, res) {
  try {
    const userId = req.user.id;

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return errorResponse(res, ERROR_CODES.USER_NOT_FOUND, '用户不存在', 404);
    }

    // 检查账户是否被禁用
    if (!user.isActive) {
      return errorResponse(res, ERROR_CODES.ACCOUNT_DISABLED, '账户已被禁用，请联系客服', 403);
    }

    return successResponse(res, formatUserResponse(user));
  } catch (error) {
    console.error('获取用户信息错误:', error);
    return errorResponse(res, ERROR_CODES.INTERNAL_SERVER_ERROR, '服务器内部错误', 500);
  }
}

/**
 * 更新用户信息
 */
async function updateUser(req, res) {
  try {
    // 验证请求数据
    const validation = validateUpdate(req.body);
    if (!validation.isValid) {
      return errorResponse(res, validation.errorCode, validation.message, 400);
    }

    const { username, password } = validation.data;
    const userId = req.user.id;

    const updateData = {};

    // 更新用户名
    if (username) {
      // 检查用户名是否已被其他用户使用
      const existingUser = await prisma.user.findFirst({
        where: {
          username,
          NOT: { id: userId }
        }
      });
      if (existingUser) {
        return errorResponse(res, ERROR_CODES.USERNAME_EXISTS, '该用户名已被使用', 409);
      }
      updateData.username = username;
    }

    // 更新密码
    if (password) {
      updateData.passwordHash = await bcrypt.hash(password, 12);
    }

    // 更新用户信息
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData
    });

    return successResponse(res, {
      ...formatUserResponse(updatedUser),
      updatedAt: updatedUser.updatedAt.toISOString()
    });
  } catch (error) {
    console.error('更新用户信息错误:', error);
    return errorResponse(res, ERROR_CODES.INTERNAL_SERVER_ERROR, '服务器内部错误', 500);
  }
}

/**
 * 上传头像
 */
async function uploadAvatar(req, res) {
  try {
    if (!req.file) {
      return errorResponse(res, ERROR_CODES.VALIDATION_ERROR, '请选择要上传的头像文件', 400);
    }

    const userId = req.user.id;
    const originalPath = req.file.path;
    const filename = req.file.filename;

    // 压缩头像
    const compressedPath = path.join(path.dirname(originalPath), `compressed_${filename}`);
    await compressImage(originalPath, compressedPath, {
      width: 200,
      height: 200,
      quality: 80
    });

    // 删除原始文件
    await deleteFile(originalPath);

    // 生成头像URL
    const avatarUrl = `/uploads/avatars/compressed_${filename}`;

    // 获取用户当前头像
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { avatar: true }
    });

    // 删除旧头像文件
    if (currentUser.avatar) {
      const oldAvatarPath = path.join(process.cwd(), currentUser.avatar);
      await deleteFile(oldAvatarPath);
    }

    // 更新用户头像
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { avatar: avatarUrl }
    });

    return successResponse(res, {
      avatar: avatarUrl,
      updatedAt: updatedUser.updatedAt.toISOString()
    });
  } catch (error) {
    console.error('上传头像错误:', error);
    
    // 清理上传的文件
    if (req.file) {
      await deleteFile(req.file.path);
    }
    
    return errorResponse(res, ERROR_CODES.INTERNAL_SERVER_ERROR, '服务器内部错误', 500);
  }
}

/**
 * 用户充值
 */
async function recharge(req, res) {
  try {
    // 验证请求数据
    const validation = validateRecharge(req.body);
    if (!validation.isValid) {
      return errorResponse(res, validation.errorCode, validation.message, 400);
    }

    const { type, level, payType } = validation.data;
    const userId = req.user.id;

    // 计算充值金额
    let amount = 0;
    let additionalCredits = 0;
    let membershipExpiry = null;

    if (type === 'monthly') {
      amount = level === 'lite' ? 9.99 : 29.99;
      additionalCredits = level === 'lite' ? 300 : 600;
      
      const expiry = new Date();
      expiry.setMonth(expiry.getMonth() + 1);
      membershipExpiry = expiry;
    } else if (type === 'yearly') {
      amount = level === 'lite' ? 99.99 : 299.99;
      additionalCredits = level === 'lite' ? 3600 : 7200; // 12个月的积分
      
      const expiry = new Date();
      expiry.setFullYear(expiry.getFullYear() + 1);
      membershipExpiry = expiry;
    }

    // 创建订单并更新用户信息（使用事务）
    const result = await prisma.$transaction(async (tx) => {
      // 创建订单
      const orderId = `order_${uuidv4()}`;
      const order = await tx.order.create({
        data: {
          orderId,
          userId,
          amount,
          currency: 'USD',
          type,
          level,
          payType,
          status: ORDER_STATUS.COMPLETED // 模拟支付成功
        }
      });

      // 更新用户信息
      const currentUser = await tx.user.findUnique({
        where: { id: userId }
      });

      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          credits: currentUser.credits + additionalCredits,
          userType: level || currentUser.userType,
          membershipExpiry: membershipExpiry || currentUser.membershipExpiry
        }
      });

      return { order, user: updatedUser };
    });

    return successResponse(res, {
      order: {
        orderId: result.order.orderId,
        amount: result.order.amount,
        currency: result.order.currency,
        type: result.order.type,
        level: result.order.level,
        payType: result.order.payType,
        status: result.order.status,
        createdAt: result.order.createdAt.toISOString()
      },
      user: {
        ...formatUserResponse(result.user),
        updatedAt: result.user.updatedAt.toISOString()
      }
    });
  } catch (error) {
    console.error('用户充值错误:', error);
    return errorResponse(res, ERROR_CODES.PAYMENT_FAILED, '支付失败，请检查支付信息或稍后重试', 402);
  }
}

/**
 * 刷新访问令牌
 */
async function refreshToken(req, res) {
  try {
    // 验证请求数据
    const validation = validateRefreshToken(req.body);
    if (!validation.isValid) {
      return errorResponse(res, validation.errorCode, validation.message, 400);
    }

    const { refreshToken: token } = validation.data;

    // 验证刷新令牌
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    
    // 检查用户是否存在且激活
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, isActive: true }
    });

    if (!user || !user.isActive) {
      return errorResponse(res, ERROR_CODES.TOKEN_INVALID, '刷新令牌无效', 401);
    }

    // 生成新的访问令牌
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user.id);

    return successResponse(res, {
      accessToken,
      refreshToken: newRefreshToken,
      expiresIn: '15m'
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return errorResponse(res, ERROR_CODES.TOKEN_INVALID, '刷新令牌无效或已过期', 401);
    }
    
    console.error('刷新令牌错误:', error);
    return errorResponse(res, ERROR_CODES.INTERNAL_SERVER_ERROR, '服务器内部错误', 500);
  }
}

module.exports = {
  register,
  login,
  getCurrentUser,
  updateUser,
  uploadAvatar,
  recharge,
  refreshToken
}; 