const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { singleAvatar } = require('../middleware/upload');
const {
  register,
  login,
  updateUser,
  uploadAvatar,
  recharge,
  refreshToken
} = require('../controllers/userController');

// 用户注册
router.post('/register', register);

// 用户登录
router.post('/login', login);

// 更新用户信息（需要认证）
router.put('/update', authenticateToken, updateUser);

// 上传头像（需要认证）
router.post('/avatar', authenticateToken, singleAvatar, uploadAvatar);

// 用户充值（需要认证）
router.post('/recharge', authenticateToken, recharge);

// 刷新访问令牌
router.post('/refresh-token', refreshToken);

module.exports = router; 