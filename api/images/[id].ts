import { VercelRequest, VercelResponse } from '@vercel/node';

// Mock 数据 - 图片详情
const mockImageDetails = {
  "cat": {
    id: "cat",
    name: "cat",
    defaultUrl: "/images-mock/cat-default.png",
    colorUrl: "/images-mock/cat-color.png",
    title: "小猫",
    description: "可爱的小猫咪，适合初学者练习涂色",
    category: "animals",
    tags: ["动物", "宠物", "可爱"],
    difficulty: "easy",
    createdAt: "2024-01-01T00:00:00Z",
    downloadCount: 1250,
    likeCount: 89,
    relatedImages: ["flower", "robot", "unicorn"]
  },
  "flower": {
    id: "flower",
    name: "flower",
    defaultUrl: "/images-mock/flower-default.png",
    colorUrl: "/images-mock/flower-color.png",
    title: "花朵",
    description: "美丽的花朵图案，包含多种花卉元素",
    category: "nature",
    tags: ["自然", "花朵", "植物"],
    difficulty: "medium",
    createdAt: "2024-01-02T00:00:00Z",
    downloadCount: 980,
    likeCount: 67,
    relatedImages: ["cat", "unicorn", "icecream"]
  },
  "robot": {
    id: "robot",
    name: "robot",
    defaultUrl: "/images-mock/robot-default.png",
    colorUrl: "/images-mock/robot-color.png",
    title: "机器人",
    description: "未来科技机器人，复杂的机械结构设计",
    category: "technology",
    tags: ["科技", "机器人", "未来"],
    difficulty: "hard",
    createdAt: "2024-01-03T00:00:00Z",
    downloadCount: 756,
    likeCount: 45,
    relatedImages: ["spiderman", "cat", "magician"]
  },
  "spiderman": {
    id: "spiderman",
    name: "spiderman",
    defaultUrl: "/images-mock/spider-man-default.png",
    colorUrl: "/images-mock/spider-man-color.png",
    title: "蜘蛛侠",
    description: "超级英雄蜘蛛侠，经典的漫画角色",
    category: "superhero",
    tags: ["超级英雄", "蜘蛛侠", "漫画"],
    difficulty: "hard",
    createdAt: "2024-01-04T00:00:00Z",
    downloadCount: 1456,
    likeCount: 123,
    relatedImages: ["robot", "cartoon", "magician"]
  }
};

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
        const { id } = req.query;
        
        if (!id || typeof id !== 'string') {
          res.status(400).json({
            success: false,
            error: 'Image ID is required'
          });
          return;
        }
        
        const imageDetail = mockImageDetails[id as keyof typeof mockImageDetails];
        
        if (!imageDetail) {
          res.status(404).json({
            success: false,
            error: 'Image not found'
          });
          return;
        }
        
        res.status(200).json({
          success: true,
          data: imageDetail
        });
        break;
        
      case 'POST':
        // 更新图片信息（如点赞、下载计数等）
        const { id: postId, action } = req.body;
        
        if (!postId || !action) {
          res.status(400).json({
            success: false,
            error: 'Image ID and action are required'
          });
          return;
        }
        
        const targetImage = mockImageDetails[postId as keyof typeof mockImageDetails];
        
        if (!targetImage) {
          res.status(404).json({
            success: false,
            error: 'Image not found'
          });
          return;
        }
        
        // 模拟更新操作
        if (action === 'like') {
          targetImage.likeCount += 1;
        } else if (action === 'download') {
          targetImage.downloadCount += 1;
        }
        
        res.status(200).json({
          success: true,
          data: targetImage,
          message: `${action} action completed`
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