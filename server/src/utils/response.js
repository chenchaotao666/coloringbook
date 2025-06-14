/**
 * 统一响应格式工具
 */

/**
 * 成功响应
 * @param {Object} res - Express响应对象
 * @param {*} data - 响应数据
 * @param {number} total - 总数（可选，用于分页）
 * @param {number} statusCode - HTTP状态码
 */
function successResponse(res, data = {}, total = null, statusCode = 200) {
  const response = {
    status: 'success',
    data
  };

  if (total !== null) {
    response.total = total;
  }

  return res.status(statusCode).json(response);
}

/**
 * 错误响应
 * @param {Object} res - Express响应对象
 * @param {string} errorCode - 错误码
 * @param {string} message - 错误消息
 * @param {number} statusCode - HTTP状态码
 */
function errorResponse(res, errorCode, message, statusCode = 400) {
  return res.status(statusCode).json({
    status: 'fail',
    errorCode,
    message
  });
}

/**
 * 创建响应
 * @param {Object} res - Express响应对象
 * @param {*} data - 响应数据
 * @param {number} statusCode - HTTP状态码
 */
function createdResponse(res, data, statusCode = 201) {
  return successResponse(res, data, null, statusCode);
}

module.exports = {
  successResponse,
  errorResponse,
  createdResponse
}; 