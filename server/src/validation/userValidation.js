const Joi = require('joi');
const { ERROR_CODES, USER_TYPES, PAYMENT_TYPES, RECHARGE_TYPES } = require('../config/constants');

// 用户注册验证
const registerSchema = Joi.object({
  username: Joi.string()
    .min(3)
    .max(30)
    .pattern(/^[a-zA-Z0-9_]+$/)
    .required()
    .messages({
      'string.min': '用户名至少3个字符',
      'string.max': '用户名最多30个字符',
      'string.pattern.base': '用户名只能包含字母、数字和下划线',
      'any.required': '用户名不能为空'
    }),
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': '邮箱格式不正确',
      'any.required': '邮箱不能为空'
    }),
  password: Joi.string()
    .min(6)
    .max(50)
    .pattern(/^(?=.*[A-Za-z])(?=.*\d)/)
    .required()
    .messages({
      'string.min': '密码至少6个字符',
      'string.max': '密码最多50个字符',
      'string.pattern.base': '密码必须包含字母和数字',
      'any.required': '密码不能为空'
    })
});

// 用户登录验证
const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': '邮箱格式不正确',
      'any.required': '邮箱不能为空'
    }),
  password: Joi.string()
    .required()
    .messages({
      'any.required': '密码不能为空'
    })
});

// 用户更新验证
const updateSchema = Joi.object({
  username: Joi.string()
    .min(3)
    .max(30)
    .pattern(/^[a-zA-Z0-9_]+$/)
    .optional()
    .messages({
      'string.min': '用户名至少3个字符',
      'string.max': '用户名最多30个字符',
      'string.pattern.base': '用户名只能包含字母、数字和下划线'
    }),
  password: Joi.string()
    .min(6)
    .max(50)
    .pattern(/^(?=.*[A-Za-z])(?=.*\d)/)
    .optional()
    .messages({
      'string.min': '密码至少6个字符',
      'string.max': '密码最多50个字符',
      'string.pattern.base': '密码必须包含字母和数字'
    })
}).min(1).messages({
  'object.min': '至少需要提供一个要更新的字段'
});

// 用户充值验证
const rechargeSchema = Joi.object({
  type: Joi.string()
    .valid(...Object.values(RECHARGE_TYPES))
    .required()
    .messages({
      'any.only': '充值类型无效',
      'any.required': '充值类型不能为空'
    }),
  level: Joi.string()
    .valid(USER_TYPES.LITE, USER_TYPES.PRO)
    .when('type', {
      is: Joi.valid(RECHARGE_TYPES.MONTHLY, RECHARGE_TYPES.YEARLY),
      then: Joi.required(),
      otherwise: Joi.optional()
    })
    .messages({
      'any.only': '会员等级无效',
      'any.required': '会员等级不能为空'
    }),
  credits: Joi.number()
    .integer()
    .min(1)
    .when('type', {
      is: RECHARGE_TYPES.CREDITS,
      then: Joi.required(),
      otherwise: Joi.forbidden()
    })
    .messages({
      'number.min': '充值积分必须大于0',
      'any.required': '充值积分不能为空',
      'any.unknown': '此充值类型不支持积分参数'
    }),
  payType: Joi.string()
    .valid(...Object.values(PAYMENT_TYPES))
    .required()
    .messages({
      'any.only': '支付方式不支持',
      'any.required': '支付方式不能为空'
    })
});

// 刷新令牌验证
const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string()
    .required()
    .messages({
      'any.required': '刷新令牌不能为空'
    })
});

/**
 * 验证用户注册数据
 */
function validateRegister(data) {
  const { error, value } = registerSchema.validate(data, { abortEarly: false });
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
 * 验证用户登录数据
 */
function validateLogin(data) {
  const { error, value } = loginSchema.validate(data, { abortEarly: false });
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
 * 验证用户更新数据
 */
function validateUpdate(data) {
  const { error, value } = updateSchema.validate(data, { abortEarly: false });
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
 * 验证用户充值数据
 */
function validateRecharge(data) {
  const { error, value } = rechargeSchema.validate(data, { abortEarly: false });
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
 * 验证刷新令牌数据
 */
function validateRefreshToken(data) {
  const { error, value } = refreshTokenSchema.validate(data, { abortEarly: false });
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
  validateRegister,
  validateLogin,
  validateUpdate,
  validateRecharge,
  validateRefreshToken
}; 