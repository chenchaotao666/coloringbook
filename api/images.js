import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

// 获取当前文件的目录路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 读取 images.json 文件
const imagesPath = path.join(__dirname, './data/images.json');
let mockImages = [];

try {
  const imagesData = fs.readFileSync(imagesPath, 'utf8');
  mockImages = JSON.parse(imagesData);
} catch (error) {
  console.error('❌ 读取图片数据失败:', error.message);
}

// 图片列表 API
router.get('/', (req, res) => {
  try {
    const { category, difficulty, page = '1', limit = '10', search } = req.query;
    
    let filteredImages = [...mockImages];
    
    // 按分类筛选
    if (category) {
      filteredImages = filteredImages.filter(img => img.category === category);
    }
    
    // 按难度筛选
    if (difficulty) {
      filteredImages = filteredImages.filter(img => img.difficulty === difficulty);
    }
    
    // 搜索功能
    if (search) {
      const searchLower = search.toLowerCase();
      filteredImages = filteredImages.filter(img => 
        img.title.toLowerCase().includes(searchLower) ||
        img.description.toLowerCase().includes(searchLower) ||
        img.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }
    
    // 分页
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedImages = filteredImages.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: paginatedImages,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: filteredImages.length,
        totalPages: Math.ceil(filteredImages.length / limitNum)
      }
    });
  } catch (error) {
    console.error('Images API Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal Server Error' 
    });
  }
});

// 获取单个图片详情
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Image ID is required'
      });
    }
    
    const imageDetail = mockImages.find(img => img.id === id);
    
    if (!imageDetail) {
      return res.status(404).json({
        success: false,
        error: 'Image not found'
      });
    }
    
    res.json({
      success: true,
      data: imageDetail
    });
  } catch (error) {
    console.error('Image Detail API Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal Server Error' 
    });
  }
});

// 更新图片信息（点赞、下载等）
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body;
    
    if (!id || !action) {
      return res.status(400).json({
        success: false,
        error: 'Image ID and action are required'
      });
    }
    
    const targetImageIndex = mockImages.findIndex(img => img.id === id);
    
    if (targetImageIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Image not found'
      });
    }
    
    // 模拟更新操作
    if (action === 'like') {
      mockImages[targetImageIndex].likeCount = (mockImages[targetImageIndex].likeCount || 0) + 1;
    } else if (action === 'download') {
      mockImages[targetImageIndex].downloadCount = (mockImages[targetImageIndex].downloadCount || 0) + 1;
    }
    
    res.json({
      success: true,
      data: mockImages[targetImageIndex],
      message: `${action} action completed`
    });
  } catch (error) {
    console.error('Update Image API Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal Server Error' 
    });
  }
});

export { router }; 