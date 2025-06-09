import { VercelRequest, VercelResponse } from '@vercel/node';

// Mock 数据 - 生成的图片
const mockGeneratedImages = [
  {
    id: "gen_001",
    prompt: "一只可爱的小猫在花园里玩耍",
    imageUrl: "/images-mock/cat-default.png",
    status: "completed",
    createdAt: "2024-01-01T10:00:00Z",
    userId: "user_123"
  },
  {
    id: "gen_002", 
    prompt: "未来科技城市中的机器人",
    imageUrl: "/images-mock/robot-default.png",
    status: "completed",
    createdAt: "2024-01-01T11:00:00Z",
    userId: "user_123"
  },
  {
    id: "gen_003",
    prompt: "神奇的独角兽在彩虹下",
    imageUrl: "/images-mock/unicorn-default.jpg",
    status: "completed",
    createdAt: "2024-01-01T12:00:00Z",
    userId: "user_456"
  }
];

export default function handler(req: VercelRequest, res: VercelResponse) {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // 处理 OPTIONS 请求
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    switch (req.method) {
      case 'GET':
        // 获取用户生成的图片列表
        const { userId, page = '1', limit = '10', status } = req.query;
        
        let filteredImages = [...mockGeneratedImages];
        
        if (userId && typeof userId === 'string') {
          filteredImages = filteredImages.filter(img => img.userId === userId);
        }
        
        if (status && typeof status === 'string') {
          filteredImages = filteredImages.filter(img => img.status === status);
        }
        
        // 分页
        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const startIndex = (pageNum - 1) * limitNum;
        const endIndex = startIndex + limitNum;
        const paginatedImages = filteredImages.slice(startIndex, endIndex);
        
        res.status(200).json({
          success: true,
          data: paginatedImages,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total: filteredImages.length,
            totalPages: Math.ceil(filteredImages.length / limitNum)
          }
        });
        break;
        
      case 'POST':
        // 创建新的图片生成请求
        const { prompt, userId: postUserId, style = 'default' } = req.body;
        
        if (!prompt || !postUserId) {
          res.status(400).json({
            success: false,
            error: 'Prompt and userId are required'
          });
          return;
        }
        
        // 模拟生成过程
        const newImage = {
          id: `gen_${Date.now()}`,
          prompt,
          imageUrl: "/images-mock/cat-default.png", // 模拟生成的图片
          status: "processing", // processing -> completed
          createdAt: new Date().toISOString(),
          userId: postUserId,
          style
        };
        
        // 模拟异步处理 - 3秒后变为完成状态
        setTimeout(() => {
          newImage.status = "completed";
          // 随机选择一个图片作为生成结果
          const randomImages = [
            "/images-mock/cat-default.png",
            "/images-mock/robot-default.png",
            "/images-mock/unicorn-default.jpg",
            "/images-mock/flower-default.png"
          ];
          newImage.imageUrl = randomImages[Math.floor(Math.random() * randomImages.length)];
        }, 3000);
        
        res.status(201).json({
          success: true,
          data: newImage,
          message: 'Image generation started'
        });
        break;
        
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).json({ 
          success: false, 
          error: `Method ${req.method} Not Allowed` 
        });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal Server Error' 
    });
  }
} 