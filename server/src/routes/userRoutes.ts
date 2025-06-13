import { Router } from 'express';

const router = Router();

// 用户相关路由将在后续实现
router.get('/:id', (req, res) => {
  res.json({ success: true, message: '用户路由待实现' });
});

export default router; 