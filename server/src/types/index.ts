import { Request } from 'express';

// API响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: PaginationInfo;
  searchInfo?: SearchInfo;
  total?: number;
  [key: string]: any; // 允许额外属性
}

// 分页信息
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore?: boolean;
}

// 搜索信息
export interface SearchInfo {
  query: string;
  category: string;
  tags: string[];
  ratio: string;
  type: string;
  userId: string;
  totalResults: number;
}

// 用户偏好设置
export interface UserPreferences {
  theme: 'light' | 'dark';
  language: string;
  notifications: boolean;
  autoSave: boolean;
}

// 用户统计信息
export interface UserStats {
  imagesDownloaded: number;
  imagesGenerated: number;
  favoriteCategories: string[];
  totalTimeSpent: number; // 秒
}

// 图片附加信息
export interface ImageAdditionalInfo {
  features: string[];
  suitableFor: string[];
  coloringSuggestions: string[];
  creativeUses: string[];
}

// 生成任务状态
export type GenerationStatus = 'processing' | 'completed' | 'failed';
export type GenerationType = 'text2image' | 'image2image';

// 图片比例
export type ImageRatio = '1:1' | '3:4' | '4:3';

// 图片类型
export type ImageType = 'default' | 'text2image' | 'image2image';

// 文件上传类型
export interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

// 扩展Request类型以包含文件上传
export interface MulterRequest extends Request {
  file?: UploadedFile;
  files?: UploadedFile[];
}

// 生成任务信息
export interface GenerationTaskInfo {
  taskId: string;
  imageId: string;
  status: GenerationStatus;
  progress: number;
  type: GenerationType;
  prompt?: string;
  userId: string;
  createdAt: string;
  estimatedTime: number;
  completedAt?: string;
  errorMessage?: string;
  image?: any;
} 