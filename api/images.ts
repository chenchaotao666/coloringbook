import { VercelRequest, VercelResponse } from '@vercel/node';

// Mock 数据 - 图片列表
const mockImages = [
  {
    id: "cat",
    name: "cat",
    defaultUrl: "/images-mock/cat-default.png",
    colorUrl: "/images-mock/cat-color.png",
    title: "小猫",
    description: "可爱的小猫咪",
    category: "animals",
    tags: ["动物", "宠物", "可爱"],
    difficulty: "easy",
    createdAt: "2024-01-01T00:00:00Z"
  },
  {
    id: "flower",
    name: "flower", 
    defaultUrl: "/images-mock/flower-default.png",
    colorUrl: "/images-mock/flower-color.png",
    title: "花朵",
    description: "美丽的花朵图案",
    category: "nature",
    tags: ["自然", "花朵", "植物"],
    difficulty: "medium",
    createdAt: "2024-01-02T00:00:00Z"
  },
  {
    id: "robot",
    name: "robot",
    defaultUrl: "/images-mock/robot-default.png", 
    colorUrl: "/images-mock/robot-color.png",
    title: "机器人",
    description: "未来科技机器人",
    category: "technology",
    tags: ["科技", "机器人", "未来"],
    difficulty: "hard",
    createdAt: "2024-01-03T00:00:00Z"
  },
  {
    id: "spiderman",
    name: "spiderman",
    defaultUrl: "/images-mock/spider-man-default.png",
    colorUrl: "/images-mock/spider-man-color.png", 
    title: "蜘蛛侠",
    description: "超级英雄蜘蛛侠",
    category: "superhero",
    tags: ["超级英雄", "蜘蛛侠", "漫画"],
    difficulty: "hard",
    createdAt: "2024-01-04T00:00:00Z"
  },
  {
    id: "cartoon",
    name: "cartoon",
    defaultUrl: "/images-mock/cartoon-default.png",
    colorUrl: "/images-mock/cartoon-color.png",
    title: "卡通角色",
    description: "有趣的卡通角色",
    category: "cartoon",
    tags: ["卡通", "角色", "有趣"],
    difficulty: "medium",
    createdAt: "2024-01-05T00:00:00Z"
  },
  {
    id: "unicorn",
    name: "unicorn",
    defaultUrl: "/images-mock/unicorn-default.jpg",
    colorUrl: "/images-mock/unicorn-color.jpg",
    title: "独角兽",
    description: "神奇的独角兽",
    category: "fantasy",
    tags: ["幻想", "独角兽", "神奇"],
    difficulty: "medium",
    createdAt: "2024-01-06T00:00:00Z"
  },
  {
    id: "magician",
    name: "magician",
    defaultUrl: "/images-mock/magician-default.jpg",
    colorUrl: "/images-mock/magician-color.jpg",
    title: "魔法师",
    description: "神秘的魔法师",
    category: "fantasy",
    tags: ["魔法", "魔法师", "神秘"],
    difficulty: "hard",
    createdAt: "2024-01-07T00:00:00Z"
  },
  {
    id: "icecream",
    name: "icecream",
    defaultUrl: "/images-mock/icecream-default.jpg",
    colorUrl: "/images-mock/icecream-color.jpg",
    title: "冰淇淋",
    description: "美味的冰淇淋",
    category: "food",
    tags: ["食物", "冰淇淋", "美味"],
    difficulty: "easy",
    createdAt: "2024-01-08T00:00:00Z"
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
        // 获取查询参数
        const { category, difficulty, page = '1', limit = '10', search } = req.query;
        
        let filteredImages = [...mockImages];
        
        // 按分类筛选
        if (category && typeof category === 'string') {
          filteredImages = filteredImages.filter(img => img.category === category);
        }
        
        // 按难度筛选
        if (difficulty && typeof difficulty === 'string') {
          filteredImages = filteredImages.filter(img => img.difficulty === difficulty);
        }
        
        // 搜索功能
        if (search && typeof search === 'string') {
          const searchLower = search.toLowerCase();
          filteredImages = filteredImages.filter(img => 
            img.title.toLowerCase().includes(searchLower) ||
            img.description.toLowerCase().includes(searchLower) ||
            img.tags.some(tag => tag.toLowerCase().includes(searchLower))
          );
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