const express = require('express');
const router = express.Router();
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { singleImage } = require('../middleware/upload');
const {
  queryImages,
  text2Image,
  image2Image,
  deleteImage,
  reportImage
} = require('../controllers/imageController');

// 查询图片（可选认证）
router.get('/query', optionalAuth, queryImages);
router.post('/query', optionalAuth, queryImages);

// 文本生成图片（需要认证）
router.post('/text2image', authenticateToken, text2Image);

// 图片转换（需要认证）
router.post('/image2image', authenticateToken, singleImage, image2Image);

// 删除图片（需要认证）
router.delete('/:imageId', authenticateToken, deleteImage);

// 举报图片（需要认证）
router.post('/report', authenticateToken, reportImage);

module.exports = router; 