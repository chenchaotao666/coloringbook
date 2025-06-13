import { Router } from 'express';

const router = Router();

// AI生成相关路由将在后续实现
router.post('/text-to-image', (req, res) => {
  res.json({ success: true, message: 'AI生成路由待实现' });
});

router.post('/image-to-image', (req, res) => {
  res.json({ success: true, message: 'AI生成路由待实现' });
});

router.get('/status/:taskId', (req, res) => {
  res.json({ success: true, message: 'AI生成状态查询待实现' });
});

export default router; 