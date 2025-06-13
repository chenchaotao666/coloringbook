import { Router } from 'express';
import {
  searchImages,
  getImagesByCategory,
  getImageById,
  deleteImage
} from '../controllers/imageController';
import { validateParams, validateQuery } from '../middleware/validation';
import {
  idParamSchema,
  imageSearchSchema
} from '../schemas';

const router = Router();

// 搜索图片
router.get('/', validateQuery(imageSearchSchema), searchImages);

// 通过分类ID获取图片列表
router.get('/category/:categoryId', validateQuery(imageSearchSchema), getImagesByCategory);

// 获取单个图片详情
router.get('/:id', validateParams(idParamSchema), getImageById);

// 删除图片
router.delete('/:id', validateParams(idParamSchema), deleteImage);

export default router; 