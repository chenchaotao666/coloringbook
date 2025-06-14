const express = require('express');
const router = express.Router();
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const {
  getTaskStatus,
  getUserTasks,
  cancelTask
} = require('../controllers/taskController');

// 查询任务状态（可选认证）
router.get('/:taskId', optionalAuth, getTaskStatus);

// 获取用户的所有任务（需要认证）
router.get('/', authenticateToken, getUserTasks);

// 取消任务（需要认证）
router.post('/:taskId/cancel', authenticateToken, cancelTask);

module.exports = router; 