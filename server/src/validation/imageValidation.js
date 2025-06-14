const Joi = require('joi');
const { ERROR_CODES, IMAGE_TYPES, IMAGE_RATIOS } = require('../config/constants');

// 图片查询验证
const querySchema = Joi.object({
  imageId: Joi.string().optional(),
  query: Joi.string().max(100).optional(),
  category: Joi.string().optional(),
  tags: Joi.string().optional(),
  ratio: Joi.string().valid(...Object.values(IMAGE_RATIOS)).optional(),
  type: Joi.string().valid(...Object.values(IMAGE_TYPES)).optional(),
  userId: Joi.string().optional(),
  isPublic: Joi.boolean().optional(),
  currentPage: Joi.number().integer().min(1).default(1),
  pageSize: Joi.number().integer().min(1).max(100).default(20),
  isRelated: Joi.boolean().default(false)
});

// 文本生成图片验证
const text2ImageSchema = Joi.object({
  prompt: Joi.string()
    .min(1)
    .max(500)
    .required()
    .messages({
      'string.min': '提示词不能为空',
      'string.max': '提示词最多500个字符',
      'any.required': '提示词不能为空'
    }),
  ratio: Joi.string()
    .valid(...Object.values(IMAGE_RATIOS))
    .required()
    .messages({
      'any.only': '图片比例无效',
      'any.required': '图片比例不能为空'
    }),
  isPublic: Joi.boolean()
    .required()
    .messages({
      'any.required': '是否公开不能为空'
    })
});

// 图片转换验证
const image2ImageSchema = Joi.object({
  isPublic: Joi.boolean()
    .required()
    .messages({
      'any.required': '是否公开不能为空'
    })
});

// 图片举报验证
const reportSchema = Joi.object({
  content: Joi.string()
    .min(1)
    .max(500)
    .required()
    .messages({
      'string.min': '举报内容不能为空',
      'string.max': '举报内容最多500个字符',
      'any.required': '举报内容不能为空'
    }),
  imageId: Joi.string()
    .required()
    .messages({
      'any.required': '图片ID不能为空'
    })
});

// 任务查询验证
const taskQuerySchema = Joi.object({
  taskId: Joi.string()
    .required()
    .messages({
      'any.required': '任务ID不能为空'
    })
});

/**
 * 验证图片查询参数
 */
function validateImageQuery(data) {
  const { error, value } = querySchema.validate(data, { abortEarly: false });
  if (error) {
    const message = error.details.map(detail => detail.message).join(', ');
    return { 
      isValid: false, 
      errorCode: ERROR_CODES.VALIDATION_ERROR, 
      message 
    };
  }
  return { isValid: true, data: value };
}

/**
 * 验证文本生成图片数据
 */
function validateText2Image(data) {
  const { error, value } = text2ImageSchema.validate(data, { abortEarly: false });
  if (error) {
    const message = error.details.map(detail => detail.message).join(', ');
    return { 
      isValid: false, 
      errorCode: ERROR_CODES.VALIDATION_ERROR, 
      message 
    };
  }
  return { isValid: true, data: value };
}

/**
 * 验证图片转换数据
 */
function validateImage2Image(data) {
  const { error, value } = image2ImageSchema.validate(data, { abortEarly: false });
  if (error) {
    const message = error.details.map(detail => detail.message).join(', ');
    return { 
      isValid: false, 
      errorCode: ERROR_CODES.VALIDATION_ERROR, 
      message 
    };
  }
  return { isValid: true, data: value };
}

/**
 * 验证图片举报数据
 */
function validateImageReport(data) {
  const { error, value } = reportSchema.validate(data, { abortEarly: false });
  if (error) {
    const message = error.details.map(detail => detail.message).join(', ');
    return { 
      isValid: false, 
      errorCode: ERROR_CODES.VALIDATION_ERROR, 
      message 
    };
  }
  return { isValid: true, data: value };
}

/**
 * 验证任务查询数据
 */
function validateTaskQuery(data) {
  const { error, value } = taskQuerySchema.validate(data, { abortEarly: false });
  if (error) {
    const message = error.details.map(detail => detail.message).join(', ');
    return { 
      isValid: false, 
      errorCode: ERROR_CODES.VALIDATION_ERROR, 
      message 
    };
  }
  return { isValid: true, data: value };
}

module.exports = {
  validateImageQuery,
  validateText2Image,
  validateImage2Image,
  validateImageReport,
  validateTaskQuery
}; 