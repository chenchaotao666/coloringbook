require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 开始数据库种子数据初始化...');

  try {
    // 清理现有数据（开发环境）
    if (process.env.NODE_ENV === 'development') {
      console.log('🧹 清理现有数据...');
      await prisma.imageReport.deleteMany();
      await prisma.userFavorite.deleteMany();
      await prisma.order.deleteMany();
      await prisma.generationTask.deleteMany();
      await prisma.image.deleteMany();
      await prisma.category.deleteMany();
      await prisma.user.deleteMany();
    }

    // 创建分类
    console.log('📂 创建分类...');
    const categories = await Promise.all([
      prisma.category.create({
        data: {
          name: 'cartoon',
          displayName: '卡通动漫',
          description: '可爱的卡通角色和动漫人物涂色图',
          thumbnailUrl: '/images-mock/cartoon-default.png'
        }
      }),
      prisma.category.create({
        data: {
          name: 'animal',
          displayName: '动物世界',
          description: '各种可爱的动物涂色图',
          thumbnailUrl: '/images-mock/cat-default.png'
        }
      }),
      prisma.category.create({
        data: {
          name: 'nature',
          displayName: '自然风光',
          description: '美丽的花朵和自然景观涂色图',
          thumbnailUrl: '/images-mock/flower-default.png'
        }
      }),
      prisma.category.create({
        data: {
          name: 'fantasy',
          displayName: '奇幻世界',
          description: '魔法师、独角兽等奇幻主题涂色图',
          thumbnailUrl: '/images-mock/unicorn-default.jpg'
        }
      }),
      prisma.category.create({
        data: {
          name: 'food',
          displayName: '美食天地',
          description: '各种美味食物涂色图',
          thumbnailUrl: '/images-mock/icecream-default.jpg'
        }
      }),
      prisma.category.create({
        data: {
          name: 'custom',
          displayName: '用户创作',
          description: '用户上传和生成的个性化涂色图',
          thumbnailUrl: '/images-mock/robot-default.png'
        }
      })
    ]);

    console.log(`✅ 创建了 ${categories.length} 个分类`);

    // 创建示例用户
    console.log('👤 创建示例用户...');
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    const users = await Promise.all([
      prisma.user.create({
        data: {
          username: 'testuser',
          email: 'test@example.com',
          passwordHash: hashedPassword,
          credits: 100,
          userType: 'pro',
          isActive: true
        }
      }),
      prisma.user.create({
        data: {
          username: 'demouser',
          email: 'demo@example.com',
          passwordHash: hashedPassword,
          credits: 50,
          userType: 'lite',
          isActive: true
        }
      })
    ]);

    console.log(`✅ 创建了 ${users.length} 个用户`);

    // 创建示例图片
    console.log('🖼️ 创建示例图片...');
    const images = [
      {
        name: 'spider-man-coloring',
        title: '蜘蛛侠涂色图',
        description: '经典的蜘蛛侠角色涂色图，适合超级英雄爱好者',
        defaultUrl: '/images-mock/spider-man-default.png',
        colorUrl: '/images-mock/spider-man-color.png',
        tags: ['superhero', 'spiderman', 'marvel'],
        ratio: '1:1',
        type: 'text2image',
        isPublic: true,
        categoryId: categories.find(c => c.name === 'cartoon').id,
        size: '512,512',
        additionalInfo: JSON.stringify({ difficulty: 'medium', ageGroup: '6+' })
      },
      {
        name: 'cute-cat-coloring',
        title: '可爱小猫涂色图',
        description: '萌萌的小猫咪涂色图，孩子们的最爱',
        defaultUrl: '/images-mock/cat-default.png',
        colorUrl: '/images-mock/cat-color.png',
        tags: ['cat', 'cute', 'pet'],
        ratio: '1:1',
        type: 'text2image',
        isPublic: true,
        categoryId: categories.find(c => c.name === 'animal').id,
        size: '512,512',
        additionalInfo: JSON.stringify({ difficulty: 'easy', ageGroup: '3+' })
      },
      {
        name: 'mario-adventure',
        title: '马里奥冒险涂色图',
        description: '经典游戏角色马里奥的冒险涂色图',
        defaultUrl: '/images-mock/mario-default.png',
        colorUrl: '/images-mock/mario-color.png',
        tags: ['mario', 'game', 'adventure'],
        ratio: '1:1',
        type: 'text2image',
        isPublic: true,
        categoryId: categories.find(c => c.name === 'cartoon').id,
        size: '512,512',
        additionalInfo: JSON.stringify({ difficulty: 'medium', ageGroup: '5+' })
      },
      {
        name: 'beautiful-flower',
        title: '美丽花朵涂色图',
        description: '精美的花朵图案，适合喜欢自然的朋友',
        defaultUrl: '/images-mock/flower-default.png',
        colorUrl: '/images-mock/flower-color.png',
        tags: ['flower', 'nature', 'beautiful'],
        ratio: '1:1',
        type: 'text2image',
        isPublic: true,
        categoryId: categories.find(c => c.name === 'nature').id,
        size: '512,512',
        additionalInfo: JSON.stringify({ difficulty: 'hard', ageGroup: '8+' })
      },
      {
        name: 'robot-future',
        title: '未来机器人涂色图',
        description: '科幻风格的机器人涂色图',
        defaultUrl: '/images-mock/robot-default.png',
        colorUrl: '/images-mock/robot-color.png',
        tags: ['robot', 'future', 'technology'],
        ratio: '1:1',
        type: 'text2image',
        isPublic: true,
        categoryId: categories.find(c => c.name === 'custom').id,
        size: '512,512',
        additionalInfo: JSON.stringify({ difficulty: 'hard', ageGroup: '10+' })
      },
      {
        name: 'magical-unicorn',
        title: '神奇独角兽涂色图',
        description: '梦幻的独角兽涂色图，充满魔法色彩',
        defaultUrl: '/images-mock/unicorn-default.jpg',
        colorUrl: '/images-mock/unicorn-color.jpg',
        tags: ['unicorn', 'magic', 'fantasy'],
        ratio: '4:3',
        type: 'text2image',
        isPublic: true,
        categoryId: categories.find(c => c.name === 'fantasy').id,
        size: '640,480',
        additionalInfo: JSON.stringify({ difficulty: 'medium', ageGroup: '4+' })
      },
      {
        name: 'delicious-icecream',
        title: '美味冰淇淋涂色图',
        description: '诱人的冰淇淋涂色图，夏日必备',
        defaultUrl: '/images-mock/icecream-default.jpg',
        colorUrl: '/images-mock/icecream-color.jpg',
        tags: ['icecream', 'food', 'summer'],
        ratio: '3:4',
        type: 'text2image',
        isPublic: true,
        categoryId: categories.find(c => c.name === 'food').id,
        size: '480,640',
        additionalInfo: JSON.stringify({ difficulty: 'easy', ageGroup: '3+' })
      },
      {
        name: 'wise-magician',
        title: '智慧魔法师涂色图',
        description: '神秘的魔法师涂色图，充满智慧与力量',
        defaultUrl: '/images-mock/magician-default.jpg',
        colorUrl: '/images-mock/magician-color.jpg',
        tags: ['magician', 'wizard', 'magic'],
        ratio: '3:4',
        type: 'text2image',
        isPublic: true,
        categoryId: categories.find(c => c.name === 'fantasy').id,
        size: '480,640',
        additionalInfo: JSON.stringify({ difficulty: 'hard', ageGroup: '8+' })
      }
    ];

    const createdImages = [];
    for (const imageData of images) {
      const image = await prisma.image.create({
        data: imageData
      });
      createdImages.push(image);
    }

    console.log(`✅ 创建了 ${createdImages.length} 张示例图片`);

    // 更新分类的图片数量
    console.log('🔄 更新分类图片数量...');
    for (const category of categories) {
      const imageCount = await prisma.image.count({
        where: {
          categoryId: category.id,
          isPublic: true
        }
      });
      
      await prisma.category.update({
        where: { id: category.id },
        data: { imageCount }
      });
    }

    // 创建示例生成任务
    console.log('⚙️ 创建示例任务...');
    await prisma.generationTask.create({
      data: {
        taskId: 'task_example_completed',
        status: 'completed',
        progress: 100,
        type: 'text2image',
        prompt: '一只可爱的小猫在花园里玩耍',
        ratio: '1:1',
        isPublic: true,
        userId: users[0].id,
        imageId: createdImages[1].id,
        estimatedTime: 30,
        completedAt: new Date()
      }
    });

    console.log('✅ 数据库种子数据初始化完成！');
    console.log(`
📊 初始化统计:
- 分类: ${categories.length} 个
- 用户: ${users.length} 个  
- 图片: ${createdImages.length} 张
- 任务: 1 个

🔑 测试账户:
- 邮箱: test@example.com
- 密码: password123
- 积分: 100 (Pro用户)

- 邮箱: demo@example.com  
- 密码: password123
- 积分: 50 (Lite用户)
    `);

  } catch (error) {
    console.error('❌ 数据库种子数据初始化失败:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 