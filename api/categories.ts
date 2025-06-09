import { VercelRequest, VercelResponse } from '@vercel/node';

// Mock 数据 - 分类列表
const mockCategories = [
  {
    id: "animals",
    name: "动物",
    description: "各种可爱的动物图案",
    imageUrl: "/images-mock/cat-default.png",
    imageCount: 15,
    createdAt: "2024-01-01T00:00:00Z"
  },
  {
    id: "nature", 
    name: "自然",
    description: "花朵、树木等自然元素",
    imageUrl: "/images-mock/flower-default.png",
    imageCount: 12,
    createdAt: "2024-01-02T00:00:00Z"
  },
  {
    id: "technology",
    name: "科技",
    description: "机器人、太空等科技主题",
    imageUrl: "/images-mock/robot-default.png", 
    imageCount: 8,
    createdAt: "2024-01-03T00:00:00Z"
  },
  {
    id: "superhero",
    name: "超级英雄",
    description: "各种超级英雄角色",
    imageUrl: "/images-mock/spider-man-default.png",
    imageCount: 10,
    createdAt: "2024-01-04T00:00:00Z"
  },
  {
    id: "cartoon",
    name: "卡通",
    description: "有趣的卡通角色",
    imageUrl: "/images-mock/cartoon-default.png",
    imageCount: 6,
    createdAt: "2024-01-05T00:00:00Z"
  },
  {
    id: "fantasy",
    name: "幻想",
    description: "独角兽、魔法师等幻想元素",
    imageUrl: "/images-mock/unicorn-default.jpg",
    imageCount: 9,
    createdAt: "2024-01-06T00:00:00Z"
  },
  {
    id: "food",
    name: "食物",
    description: "美味的食物图案",
    imageUrl: "/images-mock/icecream-default.jpg",
    imageCount: 7,
    createdAt: "2024-01-07T00:00:00Z"
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
        const { id } = req.query;
        
        if (id && typeof id === 'string') {
          // 获取单个分类
          const category = mockCategories.find(cat => cat.id === id);
          if (!category) {
            res.status(404).json({
              success: false,
              error: 'Category not found'
            });
            return;
          }
          res.status(200).json({
            success: true,
            data: category
          });
        } else {
          // 获取所有分类
          res.status(200).json({
            success: true,
            data: mockCategories,
            total: mockCategories.length
          });
        }
        break;
        
      default:
        res.setHeader('Allow', ['GET']);
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