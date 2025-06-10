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

// 存储生成任务的状态
const generationTasks = new Map();

try {
  const imagesData = fs.readFileSync(imagesPath, 'utf8');
  mockImages = JSON.parse(imagesData);
} catch (error) {
  console.error('❌ 读取图片数据失败:', error.message);
}

// 通过分类ID获取图片列表
router.get('/category/:categoryId', (req, res) => {
  try {
    const { categoryId } = req.params;
    const { page = '1', limit = '20', search } = req.query;
    
    if (!categoryId) {
      return res.status(400).json({
        success: false,
        error: 'Category ID is required'
      });
    }
    
    // 按分类筛选图片
    let filteredImages = mockImages.filter(img => img.category === categoryId);
    
    // 搜索功能（在分类内搜索）
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
    console.error('Category Images API Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal Server Error' 
    });
  }
});

// 图片搜索 API - 支持 searchImages 方法调用
router.get('/', (req, res) => {
  try {
    const { 
      query,           // 搜索关键词
      category,        // 分类筛选
      tags,           // 标签筛选（可以是逗号分隔的字符串）
      ratio,          // 比例筛选（映射到difficulty）
      difficulty,     // 难度筛选
      type,           // 类型筛选（text2image 或 image2image）
      userId,         // 用户ID筛选
      page = '1', 
      limit = '20',   // 默认限制改为20
      search          // 兼容旧的search参数
    } = req.query;
    
    let filteredImages = [...mockImages];
    
    // 处理搜索关键词（优先使用query，兼容search）
    const searchTerm = query || search;
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filteredImages = filteredImages.filter(img => 
        img.title.toLowerCase().includes(searchLower) ||
        img.description.toLowerCase().includes(searchLower) ||
        img.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }
    
    // 按分类筛选
    if (category) {
      filteredImages = filteredImages.filter(img => img.category === category);
    }
    
    // 按标签筛选
    if (tags) {
      const tagList = typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : [];
      if (tagList.length > 0) {
        filteredImages = filteredImages.filter(img => 
          tagList.some(tag => 
            img.tags.some(imgTag => 
              imgTag.toLowerCase().includes(tag.toLowerCase())
            )
          )
        );
      }
    }
    
    // 按比例筛选（ratio映射到difficulty）
    const difficultyFilter = ratio || difficulty;
    if (difficultyFilter) {
      filteredImages = filteredImages.filter(img => img.difficulty === difficultyFilter);
    }
    
    // 按类型筛选
    if (type) {
      filteredImages = filteredImages.filter(img => img.type === type);
    }
    
    // 按用户ID筛选
    if (userId) {
      filteredImages = filteredImages.filter(img => img.userId === userId);
    }
    
    // 分页处理
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 20)); // 限制最大100条
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedImages = filteredImages.slice(startIndex, endIndex);
    
    // 返回结果
    res.json({
      success: true,
      data: paginatedImages,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: filteredImages.length,
        totalPages: Math.ceil(filteredImages.length / limitNum),
        hasMore: endIndex < filteredImages.length
      },
      // 添加搜索元信息
      searchInfo: {
        query: searchTerm || '',
        category: category || '',
        tags: tags ? (typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : []) : [],
        ratio: ratio || '',
        type: type || '',
        userId: userId || '',
        totalResults: filteredImages.length
      }
    });
  } catch (error) {
    console.error('Images Search API Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal Server Error',
      message: error.message 
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

export { router }; 