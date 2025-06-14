const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { UPLOAD_LIMITS, ERROR_CODES } = require('../config/constants');
const { errorResponse } = require('../utils/response');
const { ensureDir, isAllowedFileType } = require('../utils/fileUtils');

// 确保上传目录存在
async function initUploadDirs() {
  await ensureDir(path.join(process.cwd(), 'uploads'));
  await ensureDir(path.join(process.cwd(), 'uploads/avatars'));
  await ensureDir(path.join(process.cwd(), 'uploads/images'));
  await ensureDir(path.join(process.cwd(), 'uploads/temp'));
}

// 初始化上传目录
initUploadDirs().catch(console.error);

// 头像上传配置
const avatarStorage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), 'uploads/avatars');
    await ensureDir(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `avatar_${req.user.id}_${uuidv4()}${ext}`;
    cb(null, filename);
  }
});

// 图片上传配置
const imageStorage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), 'uploads/images');
    await ensureDir(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `image_${req.user.id}_${uuidv4()}${ext}`;
    cb(null, filename);
  }
});

// 文件过滤器
function createFileFilter(allowedTypes) {
  return (req, file, cb) => {
    if (isAllowedFileType(file.mimetype, allowedTypes)) {
      cb(null, true);
    } else {
      cb(new Error('FILE_TYPE_NOT_ALLOWED'), false);
    }
  };
}

// 头像上传中间件
const uploadAvatar = multer({
  storage: avatarStorage,
  limits: {
    fileSize: UPLOAD_LIMITS.AVATAR_MAX_SIZE
  },
  fileFilter: createFileFilter(UPLOAD_LIMITS.ALLOWED_AVATAR_TYPES)
});

// 图片上传中间件
const uploadImage = multer({
  storage: imageStorage,
  limits: {
    fileSize: UPLOAD_LIMITS.IMAGE_MAX_SIZE
  },
  fileFilter: createFileFilter(UPLOAD_LIMITS.ALLOWED_IMAGE_TYPES)
});

// 错误处理中间件
function handleUploadError(error, req, res, next) {
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        if (req.route.path.includes('avatar')) {
          return errorResponse(res, ERROR_CODES.AVATAR_TOO_LARGE, '头像文件过大，最大支持5MB', 400);
        } else {
          return errorResponse(res, ERROR_CODES.IMAGE_TOO_LARGE, '图片文件过大，最大支持10MB', 400);
        }
      case 'LIMIT_FILE_COUNT':
        return errorResponse(res, ERROR_CODES.VALIDATION_ERROR, '文件数量超出限制', 400);
      case 'LIMIT_UNEXPECTED_FILE':
        return errorResponse(res, ERROR_CODES.VALIDATION_ERROR, '意外的文件字段', 400);
      default:
        return errorResponse(res, ERROR_CODES.VALIDATION_ERROR, '文件上传错误', 400);
    }
  }

  if (error.message === 'FILE_TYPE_NOT_ALLOWED') {
    if (req.route.path.includes('avatar')) {
      return errorResponse(res, ERROR_CODES.AVATAR_FORMAT_ERROR, '头像格式不支持，请上传JPG或PNG格式', 400);
    } else {
      return errorResponse(res, ERROR_CODES.IMAGE_FORMAT_UNSUPPORTED, '图片格式不支持，请上传JPG、PNG、GIF或WebP格式', 400);
    }
  }

  next(error);
}

// 单个头像上传
const singleAvatar = (req, res, next) => {
  uploadAvatar.single('file')(req, res, (error) => {
    if (error) {
      return handleUploadError(error, req, res, next);
    }
    
    if (!req.file) {
      return errorResponse(res, ERROR_CODES.VALIDATION_ERROR, '请选择要上传的头像文件', 400);
    }
    
    next();
  });
};

// 单个图片上传
const singleImage = (req, res, next) => {
  uploadImage.single('file')(req, res, (error) => {
    if (error) {
      return handleUploadError(error, req, res, next);
    }
    
    if (!req.file) {
      return errorResponse(res, ERROR_CODES.VALIDATION_ERROR, '请选择要上传的图片文件', 400);
    }
    
    next();
  });
};

module.exports = {
  singleAvatar,
  singleImage,
  handleUploadError
}; 