import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

// 获取当前文件的目录路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 读取 categories.json 文件
const categoriesPath = path.join(__dirname, './data/categories.json');
let mockCategories = [];

try {
  const categoriesData = fs.readFileSync(categoriesPath, 'utf8');
  mockCategories = JSON.parse(categoriesData);
} catch (error) {
  console.error('❌ 读取分类数据失败:', error.message);
}

// 获取所有分类
router.get('/', (req, res) => {
  try {
    res.json({
      success: true,
      data: mockCategories,
      total: mockCategories.length
    });
  } catch (error) {
    console.error('Categories API Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal Server Error' 
    });
  }
});

// 获取单个分类
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Category ID is required'
      });
    }
    
    const category = mockCategories.find(cat => cat.id === id || cat.name === id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }
    
    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Category Detail API Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal Server Error' 
    });
  }
});

// 创建新分类（管理员功能）
router.post('/', (req, res) => {
  try {
    const { name, displayName, description, thumbnailUrl } = req.body;
    
    if (!name || !displayName || !description) {
      return res.status(400).json({
        success: false,
        error: 'Name, displayName and description are required'
      });
    }
    
    // 检查是否已存在相同名称的分类
    const existingCategory = mockCategories.find(cat => cat.name === name || cat.id === name);
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        error: 'Category with this name already exists'
      });
    }
    
    const newCategory = {
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name: name.toLowerCase(),
      displayName,
      description,
      imageCount: 0,
      thumbnailUrl: thumbnailUrl || "/images-mock/default.png"
    };
    
    // 添加到内存中的数组
    mockCategories.push(newCategory);
    
    // 在实际应用中，这里应该保存到数据库或文件
    // 这里我们可以选择性地写回到 JSON 文件
    try {
      fs.writeFileSync(categoriesPath, JSON.stringify(mockCategories, null, 2), 'utf8');
      console.log('✅ 新分类已保存到文件');
    } catch (writeError) {
      console.warn('⚠️ 保存分类到文件失败:', writeError.message);
    }
    
    res.status(201).json({
      success: true,
      data: newCategory,
      message: 'Category created successfully'
    });
  } catch (error) {
    console.error('Create Category API Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal Server Error' 
    });
  }
});

// 更新分类信息（管理员功能）
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { displayName, description, thumbnailUrl, imageCount } = req.body;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Category ID is required'
      });
    }
    
    const categoryIndex = mockCategories.findIndex(cat => cat.id === id || cat.name === id);
    
    if (categoryIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }
    
    // 更新分类信息
    if (displayName) mockCategories[categoryIndex].displayName = displayName;
    if (description) mockCategories[categoryIndex].description = description;
    if (thumbnailUrl) mockCategories[categoryIndex].thumbnailUrl = thumbnailUrl;
    if (typeof imageCount === 'number') mockCategories[categoryIndex].imageCount = imageCount;
    
    // 保存到文件
    try {
      fs.writeFileSync(categoriesPath, JSON.stringify(mockCategories, null, 2), 'utf8');
      console.log('✅ 分类更新已保存到文件');
    } catch (writeError) {
      console.warn('⚠️ 保存分类更新到文件失败:', writeError.message);
    }
    
    res.json({
      success: true,
      data: mockCategories[categoryIndex],
      message: 'Category updated successfully'
    });
  } catch (error) {
    console.error('Update Category API Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal Server Error' 
    });
  }
});

// 删除分类（管理员功能）
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Category ID is required'
      });
    }
    
    const categoryIndex = mockCategories.findIndex(cat => cat.id === id || cat.name === id);
    
    if (categoryIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }
    
    // 删除分类
    const deletedCategory = mockCategories.splice(categoryIndex, 1)[0];
    
    // 保存到文件
    try {
      fs.writeFileSync(categoriesPath, JSON.stringify(mockCategories, null, 2), 'utf8');
      console.log('✅ 分类删除已保存到文件');
    } catch (writeError) {
      console.warn('⚠️ 保存分类删除到文件失败:', writeError.message);
    }
    
    res.json({
      success: true,
      data: deletedCategory,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Delete Category API Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal Server Error' 
    });
  }
});

export { router }; 