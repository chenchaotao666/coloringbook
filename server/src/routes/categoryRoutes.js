const express = require('express');
const router = express.Router();
const {
  getAllCategories,
  getCategoryByName
} = require('../controllers/categoryController');

// 获取所有分类
router.get('/', getAllCategories);

// 根据分类名称获取分类详情
router.get('/:categoryName', getCategoryByName);

module.exports = router; 