import { z } from 'zod';

// 分页查询参数
export const paginationSchema = z.object({
  page: z.string().optional().default('1').transform((val: string) => Math.max(1, parseInt(val) || 1)),
  limit: z.string().optional().default('20').transform((val: string) => Math.max(1, Math.min(100, parseInt(val) || 20)))
});

// 图片搜索参数
export const imageSearchSchema = z.object({
  query: z.string().optional(),
  category: z.string().optional(),
  tags: z.string().optional(),
  ratio: z.enum(['1:1', '3:4', '4:3']).optional(),
  difficulty: z.string().optional(),
  type: z.enum(['default', 'text2image', 'image2image']).optional(),
  userId: z.string().optional(),
  search: z.string().optional(), // 兼容旧参数
}).merge(paginationSchema);

// 分类相关
export const categoryCreateSchema = z.object({
  name: z.string().min(1, '分类名称不能为空').max(50, '分类名称不能超过50个字符'),
  displayName: z.string().min(1, '显示名称不能为空').max(100, '显示名称不能超过100个字符'),
  description: z.string().min(1, '描述不能为空').max(500, '描述不能超过500个字符'),
  thumbnailUrl: z.string().url('缩略图URL格式不正确').optional()
});

export const categoryUpdateSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  description: z.string().min(1).max(500).optional(),
  thumbnailUrl: z.string().url().optional(),
  imageCount: z.number().int().min(0).optional()
});

// 用户相关
export const userUpdateSchema = z.object({
  username: z.string().min(3, '用户名至少3个字符').max(30, '用户名不能超过30个字符').optional(),
  email: z.string().email('邮箱格式不正确').optional(),
  avatar: z.string().url('头像URL格式不正确').optional(),
  preferences: z.object({
    theme: z.enum(['light', 'dark']).optional(),
    language: z.string().optional(),
    notifications: z.boolean().optional(),
    autoSave: z.boolean().optional()
  }).optional()
});

export const userFavoriteSchema = z.object({
  imageId: z.string().min(1, '图片ID不能为空')
});

// AI生成相关
export const textToImageSchema = z.object({
  prompt: z.string()
    .min(1, '提示词不能为空')
    .max(500, '提示词不能超过500个字符'),
  ratio: z.enum(['1:1', '3:4', '4:3'], {
    errorMap: () => ({ message: '比例必须是 1:1, 3:4 或 4:3 中的一个' })
  }),
  isPublic: z.boolean({
    errorMap: () => ({ message: 'isPublic 必须是布尔值' })
  }),
  style: z.string().optional(),
  userId: z.string().optional()
});

export const imageToImageSchema = z.object({
  ratio: z.enum(['1:1', '3:4', '4:3']).optional(),
  isPublic: z.boolean().optional(),
  userId: z.string().optional()
});

// 通用参数验证
export const idParamSchema = z.object({
  id: z.string().min(1, 'ID不能为空')
});

export const taskIdParamSchema = z.object({
  taskId: z.string().min(1, '任务ID不能为空')
});

// 图片创建/更新
export const imageCreateSchema = z.object({
  title: z.string().min(1, '标题不能为空').max(200, '标题不能超过200个字符'),
  description: z.string().max(1000, '描述不能超过1000个字符').optional(),
  url: z.string().url('图片URL格式不正确'),
  colorUrl: z.string().url('彩色图片URL格式不正确').optional(),
  tags: z.array(z.string()).default([]),
  ratio: z.enum(['1:1', '3:4', '4:3']),
  difficulty: z.string().optional(),
  type: z.enum(['default', 'text2image', 'image2image']).default('default'),
  isPublic: z.boolean().default(true),
  categoryId: z.string().min(1, '分类ID不能为空'),
  userId: z.string().optional()
});

export const imageUpdateSchema = imageCreateSchema.partial().omit({ categoryId: true });

// 导出类型
export type PaginationQuery = z.infer<typeof paginationSchema>;
export type ImageSearchQuery = z.infer<typeof imageSearchSchema>;
export type CategoryCreateData = z.infer<typeof categoryCreateSchema>;
export type CategoryUpdateData = z.infer<typeof categoryUpdateSchema>;
export type UserUpdateData = z.infer<typeof userUpdateSchema>;
export type UserFavoriteData = z.infer<typeof userFavoriteSchema>;
export type TextToImageData = z.infer<typeof textToImageSchema>;
export type ImageToImageData = z.infer<typeof imageToImageSchema>;
export type IdParam = z.infer<typeof idParamSchema>;
export type TaskIdParam = z.infer<typeof taskIdParamSchema>;
export type ImageCreateData = z.infer<typeof imageCreateSchema>;
export type ImageUpdateData = z.infer<typeof imageUpdateSchema>; 