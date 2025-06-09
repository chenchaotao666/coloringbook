import express from 'express';

const router = express.Router();

// Mock 数据 - 用户信息
const mockUsers = [
  {
    id: "user_123",
    username: "colorlover",
    email: "colorlover@example.com",
    avatar: "/images/Avatar.png",
    createdAt: "2024-01-01T00:00:00Z",
    lastLoginAt: "2024-01-10T10:30:00Z",
    preferences: {
      theme: "light",
      language: "zh-CN",
      notifications: true,
      autoSave: true
    },
    stats: {
      imagesDownloaded: 45,
      imagesGenerated: 12,
      favoriteCategories: ["animals", "nature"],
      totalTimeSpent: 3600 // 秒
    }
  },
  {
    id: "user_456",
    username: "artmaster",
    email: "artmaster@example.com",
    avatar: "/images/Avatar.png",
    createdAt: "2024-01-02T00:00:00Z",
    lastLoginAt: "2024-01-10T15:45:00Z",
    preferences: {
      theme: "dark",
      language: "en-US",
      notifications: false,
      autoSave: true
    },
    stats: {
      imagesDownloaded: 78,
      imagesGenerated: 25,
      favoriteCategories: ["fantasy", "superhero"],
      totalTimeSpent: 7200
    }
  },
  {
    id: "user_789",
    username: "designer",
    email: "designer@example.com",
    avatar: "/images/Avatar.png",
    createdAt: "2024-01-03T00:00:00Z",
    lastLoginAt: "2024-01-10T09:15:00Z",
    preferences: {
      theme: "light",
      language: "zh-CN",
      notifications: true,
      autoSave: false
    },
    stats: {
      imagesDownloaded: 156,
      imagesGenerated: 8,
      favoriteCategories: ["technology", "cartoon"],
      totalTimeSpent: 5400
    }
  }
];

// Mock 数据 - 用户收藏
const mockUserFavorites = [
  { userId: "user_123", imageId: "cat", createdAt: "2024-01-05T10:00:00Z" },
  { userId: "user_123", imageId: "flower", createdAt: "2024-01-06T11:00:00Z" },
  { userId: "user_123", imageId: "unicorn", createdAt: "2024-01-07T12:00:00Z" },
  { userId: "user_456", imageId: "spiderman", createdAt: "2024-01-05T13:00:00Z" },
  { userId: "user_456", imageId: "robot", createdAt: "2024-01-06T14:00:00Z" },
  { userId: "user_789", imageId: "cartoon", createdAt: "2024-01-07T15:00:00Z" }
];

// 获取用户信息
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }
    
    const user = mockUsers.find(u => u.id === id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // 不返回敏感信息
    const { ...userProfile } = user;
    
    res.json({
      success: true,
      data: userProfile
    });
  } catch (error) {
    console.error('Get User Profile API Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal Server Error' 
    });
  }
});

// 更新用户信息
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, avatar, preferences } = req.body;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }
    
    const userIndex = mockUsers.findIndex(u => u.id === id);
    
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // 更新用户信息
    if (username) mockUsers[userIndex].username = username;
    if (email) mockUsers[userIndex].email = email;
    if (avatar) mockUsers[userIndex].avatar = avatar;
    if (preferences) {
      mockUsers[userIndex].preferences = {
        ...mockUsers[userIndex].preferences,
        ...preferences
      };
    }
    
    res.json({
      success: true,
      data: mockUsers[userIndex],
      message: 'User profile updated successfully'
    });
  } catch (error) {
    console.error('Update User Profile API Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal Server Error' 
    });
  }
});

// 获取用户收藏列表
router.get('/:id/favorites', (req, res) => {
  try {
    const { id } = req.params;
    const { page = '1', limit = '10' } = req.query;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }
    
    // 获取用户收藏
    let userFavorites = mockUserFavorites.filter(fav => fav.userId === id);
    
    // 按时间倒序排列
    userFavorites.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // 分页
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedFavorites = userFavorites.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: paginatedFavorites,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: userFavorites.length,
        totalPages: Math.ceil(userFavorites.length / limitNum)
      }
    });
  } catch (error) {
    console.error('Get User Favorites API Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal Server Error' 
    });
  }
});

// 添加收藏
router.post('/:id/favorites', (req, res) => {
  try {
    const { id } = req.params;
    const { imageId } = req.body;
    
    if (!id || !imageId) {
      return res.status(400).json({
        success: false,
        error: 'User ID and Image ID are required'
      });
    }
    
    // 检查是否已经收藏
    const existingFavorite = mockUserFavorites.find(
      fav => fav.userId === id && fav.imageId === imageId
    );
    
    if (existingFavorite) {
      return res.status(400).json({
        success: false,
        error: 'Image already in favorites'
      });
    }
    
    // 添加收藏
    const newFavorite = {
      userId: id,
      imageId: imageId,
      createdAt: new Date().toISOString()
    };
    
    mockUserFavorites.push(newFavorite);
    
    res.status(201).json({
      success: true,
      data: newFavorite,
      message: 'Added to favorites successfully'
    });
  } catch (error) {
    console.error('Add to Favorites API Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal Server Error' 
    });
  }
});

// 删除收藏
router.delete('/:id/favorites/:imageId', (req, res) => {
  try {
    const { id, imageId } = req.params;
    
    if (!id || !imageId) {
      return res.status(400).json({
        success: false,
        error: 'User ID and Image ID are required'
      });
    }
    
    const favoriteIndex = mockUserFavorites.findIndex(
      fav => fav.userId === id && fav.imageId === imageId
    );
    
    if (favoriteIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Favorite not found'
      });
    }
    
    // 删除收藏
    const removedFavorite = mockUserFavorites.splice(favoriteIndex, 1)[0];
    
    res.json({
      success: true,
      data: removedFavorite,
      message: 'Removed from favorites successfully'
    });
  } catch (error) {
    console.error('Remove from Favorites API Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal Server Error' 
    });
  }
});

// 获取用户统计
router.get('/:id/stats', (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }
    
    const user = mockUsers.find(u => u.id === id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // 计算额外统计信息
    const favoriteCount = mockUserFavorites.filter(fav => fav.userId === id).length;
    
    const stats = {
      ...user.stats,
      favoriteCount,
      joinDate: user.createdAt,
      lastActive: user.lastLoginAt
    };
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get User Stats API Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal Server Error' 
    });
  }
});

export { router }; 