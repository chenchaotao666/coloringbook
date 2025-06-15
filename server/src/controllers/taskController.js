const { prisma } = require('../config/database');
const { successResponse, errorResponse } = require('../utils/response');
const { ERROR_CODES } = require('../config/constants');
const { validateTaskQuery } = require('../validation/imageValidation');

/**
 * 格式化任务响应数据
 */
function formatTaskResponse(task) {
  const response = {
    taskId: task.taskId,
    status: task.status,
    progress: task.progress,
    type: task.type,
    estimatedTime: task.estimatedTime,
    createdAt: task.createdAt.toISOString()
  };

  // 添加可选字段
  if (task.prompt) {
    response.prompt = task.prompt;
  }

  if (task.ratio) {
    response.ratio = task.ratio;
  }

  if (task.isPublic !== null) {
    response.isPublic = task.isPublic;
  }

  if (task.errorMessage) {
    response.errorMessage = task.errorMessage;
  }

  if (task.errorCode) {
    response.errorCode = task.errorCode;
  }

  if (task.message) {
    response.message = task.message;
  }

  if (task.completedAt) {
    response.completedAt = task.completedAt.toISOString();
  }

  if (task.failedAt) {
    response.failedAt = task.failedAt.toISOString();
  }

  // 如果任务完成且有关联图片，返回图片信息
  if (task.status === 'completed' && task.image) {
    response.result = {
      id: task.image.id,
      title: task.image.title,
      defaultUrl: task.image.defaultUrl,
      colorUrl: task.image.colorUrl,
      tags: task.image.tags
    };
  }

  return response;
}

/**
 * 查询任务状态
 */
async function getTaskStatus(req, res) {
  try {
    // 验证请求参数
    const validation = validateTaskQuery(req.params);
    if (!validation.isValid) {
      return errorResponse(res, validation.errorCode, validation.message, 400);
    }

    const { taskId } = validation.data;

    // 查询任务
    const task = await prisma.generationTask.findUnique({
      where: { taskId },
      include: {
        image: {
          select: {
            id: true,
            title: true,
            defaultUrl: true,
            colorUrl: true,
            tags: true
          }
        }
      }
    });

    if (!task) {
      return errorResponse(res, ERROR_CODES.TASK_NOT_FOUND, '任务不存在', 404);
    }

    // 检查任务是否属于当前用户（如果用户已登录）
    if (req.user && task.userId !== req.user.id) {
      return errorResponse(res, ERROR_CODES.PERMISSION_DENIED, '无权访问此任务', 403);
    }

    return successResponse(res, formatTaskResponse(task));
  } catch (error) {
    console.error('查询任务状态错误:', error);
    return errorResponse(res, ERROR_CODES.INTERNAL_SERVER_ERROR, '服务器内部错误', 500);
  }
}

/**
 * 获取用户的所有任务
 */
async function getUserTasks(req, res) {
  try {
    const userId = req.user.id;
    const { status, type, page = 1, limit = 20 } = req.query;

    // 构建查询条件
    const where = { userId };
    
    if (status) {
      where.status = status;
    }
    
    if (type) {
      where.type = type;
    }

    // 计算分页
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // 查询任务
    const [tasks, total] = await Promise.all([
      prisma.generationTask.findMany({
        where,
        include: {
          image: {
            select: {
              id: true,
              title: true,
              defaultUrl: true,
              colorUrl: true,
              tags: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.generationTask.count({ where })
    ]);

    const formattedTasks = tasks.map(formatTaskResponse);

    return successResponse(res, {
      tasks: formattedTasks,
      pagination: {
        currentPage: parseInt(page),
        pageSize: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    }, total);
  } catch (error) {
    console.error('获取用户任务错误:', error);
    return errorResponse(res, ERROR_CODES.INTERNAL_SERVER_ERROR, '服务器内部错误', 500);
  }
}

/**
 * 取消任务
 */
async function cancelTask(req, res) {
  try {
    const { taskId } = req.params;
    const userId = req.user.id;

    // 查询任务
    const task = await prisma.generationTask.findUnique({
      where: { taskId }
    });

    if (!task) {
      return errorResponse(res, ERROR_CODES.TASK_NOT_FOUND, '任务不存在', 404);
    }

    // 检查任务是否属于当前用户
    if (task.userId !== userId) {
      return errorResponse(res, ERROR_CODES.PERMISSION_DENIED, '无权操作此任务', 403);
    }

    // 检查任务状态是否可以取消
    if (task.status === 'completed' || task.status === 'failed' || task.status === 'cancelled') {
      return errorResponse(res, ERROR_CODES.TASK_CANCELLED, '任务已完成或已取消，无法再次取消', 400);
    }

    // 更新任务状态
    const updatedTask = await prisma.generationTask.update({
      where: { taskId },
      data: {
        status: 'cancelled',
        message: '用户取消任务'
      }
    });

    // 退还用户积分
    const creditsToRefund = 20; // 统一退还20积分
    await prisma.user.update({
      where: { id: userId },
      data: {
        credits: { increment: creditsToRefund }
      }
    });

    return successResponse(res, {
      taskId: updatedTask.taskId,
      status: updatedTask.status,
      message: '任务已取消，积分已退还',
      cancelledAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('取消任务错误:', error);
    return errorResponse(res, ERROR_CODES.INTERNAL_SERVER_ERROR, '服务器内部错误', 500);
  }
}

module.exports = {
  getTaskStatus,
  getUserTasks,
  cancelTask
}; 