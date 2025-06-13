import { Router } from 'express';
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/categoryController';
import { validateParams, validateBody } from '../middleware/validation';
import {
  idParamSchema,
  categoryCreateSchema,
  categoryUpdateSchema
} from '../schemas';

const router = Router();

// 获取所有分类
router.get('/', getCategories);

// 获取单个分类
router.get('/:id', validateParams(idParamSchema), getCategoryById);

// 创建分类
router.post('/', validateBody(categoryCreateSchema), createCategory);

// 更新分类
router.put('/:id', 
  validateParams(idParamSchema),
  validateBody(categoryUpdateSchema),
  updateCategory
);

// 删除分类
router.delete('/:id', validateParams(idParamSchema), deleteCategory);

export default router; 