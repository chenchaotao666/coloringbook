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
          thumbnailUrl: '/uploads/preset-images/cartoon-default.png'
        }
      }),
      prisma.category.create({
        data: {
          name: 'animal',
          displayName: '动物世界',
          description: '各种可爱的动物涂色图',
          thumbnailUrl: '/uploads/preset-images/cat-default.png'
        }
      }),
      prisma.category.create({
        data: {
          name: 'nature',
          displayName: '自然风光',
          description: '美丽的花朵和自然景观涂色图',
          thumbnailUrl: '/uploads/preset-images/flower-default.png'
        }
      }),
      prisma.category.create({
        data: {
          name: 'fantasy',
          displayName: '奇幻世界',
          description: '魔法师、独角兽等奇幻主题涂色图',
          thumbnailUrl: '/uploads/preset-images/unicorn-default.jpg'
        }
      }),
      prisma.category.create({
        data: {
          name: 'food',
          displayName: '美食天地',
          description: '各种美味食物涂色图',
          thumbnailUrl: '/uploads/preset-images/icecream-default.jpg'
        }
      }),
      prisma.category.create({
        data: {
          name: 'custom',
          displayName: '用户创作',
          description: '用户上传和生成的个性化涂色图',
          thumbnailUrl: '/uploads/preset-images/robot-default.png'
        }
      })
    ]);

    console.log(`✅ 创建了 ${categories.length} 个分类`);

    // 创建示例图片
    console.log('🖼️ 创建示例图片...');
    const images = [
      {
        name: 'spider-man-coloring',
        title: '蜘蛛侠涂色图',
        description: '经典的蜘蛛侠角色涂色图，适合超级英雄爱好者',
        defaultUrl: '/uploads/preset-images/spider-man-default.png',
        colorUrl: '/uploads/preset-images/spider-man-color.png',
        tags: ['superhero', 'spiderman', 'marvel'],
        ratio: '1:1',
        type: 'text2image',
        isPublic: true,
        categoryId: categories.find(c => c.name === 'cartoon').id,
        size: '512,512',
        additionalInfo: JSON.stringify({
          features: [
            "经典超级英雄造型，动感十足",
            "标志性的蜘蛛网图案设计",
            "肌肉线条清晰，展现英雄力量",
            "面具和服装细节丰富，涂色层次多样"
          ],
          suitableFor: [
            "5-12岁儿童：培养正义感和勇气",
            "漫画爱好者：重现经典超级英雄",
            "中级涂色者：适中难度的挑战",
            "英雄主题活动：生日派对或主题装饰"
          ],
          coloringSuggestions: [
            "经典配色：红色和蓝色的经典蜘蛛侠配色",
            "蜘蛛网细节：用深色勾勒蜘蛛网图案",
            "肌肉阴影：用深浅对比表现立体感",
            "背景搭配：可添加城市建筑或蜘蛛网背景"
          ],
          creativeUses: [
            "超级英雄主题装饰：男孩房间的完美装饰",
            "生日派对道具：蜘蛛侠主题生日派对",
            "勇气教育：通过英雄故事传递正能量",
            "收藏展示：漫画迷的珍贵收藏品"
          ]
        })
        
      },
      {
        name: 'cute-cat-coloring',
        title: '可爱小猫涂色图',
        description: '萌萌的小猫咪涂色图，孩子们的最爱',
        defaultUrl: '/uploads/preset-images/cat-default.png',
        colorUrl: '/uploads/preset-images/cat-color.png',
        tags: ['cat', 'cute', 'pet'],
        ratio: '1:1',
        type: 'text2image',
        isPublic: true,
        categoryId: categories.find(c => c.name === 'animal').id,
        size: '512,512',
        additionalInfo: JSON.stringify({
          features: [
            "温馨可爱的小猫造型设计",
            "简洁友好的线条，适合幼儿",
            "大眼睛和圆润的身体轮廓",
            "细节适中，不会过于复杂"
          ],
          suitableFor: [
            "2-7岁幼儿：培养对小动物的关爱",
            "猫咪爱好者：表达对宠物的喜爱",
            "初学者：简单易上手的入门选择",
            "亲子涂色：适合家长陪伴孩子一起完成"
          ],
          coloringSuggestions: [
            "温柔色调：使用柔和的粉色、米色等温暖色彩",
            "真实模拟：参考真实猫咪的毛色进行涂色",
            "创意发挥：尝试彩虹色或梦幻色彩的创意搭配",
            "细节装饰：可为小猫添加蝴蝶结或小帽子等装饰"
          ],
          creativeUses: [
            "宠物主题装饰：儿童房间的温馨装饰",
            "情感教育：教导孩子关爱小动物",
            "礼物制作：送给喜欢小动物的朋友",
            "亲子时光：增进家长与孩子的感情"
          ]
        })
      },
      {
        name: 'mario-adventure',
        title: '马里奥冒险涂色图',
        description: '经典游戏角色马里奥的冒险涂色图',
        defaultUrl: '/uploads/preset-images/mario-default.png',
        colorUrl: '/uploads/preset-images/mario-color.png',
        tags: ['mario', 'game', 'adventure'],
        ratio: '1:1',
        type: 'text2image',
        isPublic: true,
        categoryId: categories.find(c => c.name === 'cartoon').id,
        size: '512,512',
        additionalInfo: JSON.stringify({
          features: [
            "经典游戏角色的标志性造型",
            "红色帽子和蓝色工装裤的经典搭配",
            "友好的面部表情和标志性胡须",
            "适中的细节复杂度，适合多年龄段"
          ],
          suitableFor: [
            "4-10岁儿童：培养对经典游戏的兴趣",
            "游戏爱好者：重温童年经典角色",
            "中级涂色者：适中难度的涂色挑战",
            "怀旧主题活动：80后90后的童年回忆"
          ],
          coloringSuggestions: [
            "经典配色：红色帽子、蓝色工装裤、黄色纽扣",
            "肤色自然：使用温暖的肉色调",
            "细节突出：用深色勾勒轮廓和细节",
            "背景搭配：可添加蘑菇、金币等游戏元素"
          ],
          creativeUses: [
            "游戏主题装饰：适合游戏房或儿童房",
            "生日派对道具：马里奥主题生日派对",
            "怀旧收藏：经典游戏角色收藏品",
            "亲子游戏：与孩子分享童年游戏回忆"
          ]
        })
      },
      {
        name: 'beautiful-flower',
        title: '美丽花朵涂色图',
        description: '精美的花朵图案，适合喜欢自然的朋友',
        defaultUrl: '/uploads/preset-images/flower-default.png',
        colorUrl: '/uploads/preset-images/flower-color.png',
        tags: ['flower', 'nature', 'beautiful'],
        ratio: '1:1',
        type: 'text2image',
        isPublic: true,
        categoryId: categories.find(c => c.name === 'nature').id,
        size: '512,512',
        additionalInfo: JSON.stringify({
          features: [
            "精致的花瓣层次设计，细节丰富",
            "自然优雅的植物美学表现",
            "复杂的花蕊和花脉结构",
            "适合提高涂色技巧的挑战性图案"
          ],
          suitableFor: [
            "5-11岁儿童：培养对自然之美的感知",
            "植物爱好者：表达对花卉的热爱",
            "中高级涂色者：在花朵主题上进阶练习",
            "艺术学习者：学习花卉绘画的基础结构"
          ],
          coloringSuggestions: [
            "季节主题：根据不同季节选择相应的花朵颜色",
            "渐变美学：花瓣从内到外的自然色彩过渡",
            "对比层次：花朵与叶子、花茎的颜色层次对比",
            "细腻表现：注重花蕊、花脉等细节的精细涂色"
          ],
          creativeUses: [
            "季节装饰：根据季节更换不同的花朵装饰",
            "植物教育：结合植物知识进行自然教育",
            "艺术练习：作为花卉绘画技巧的练习素材",
            "情感表达：通过花朵颜色表达不同的情感"
          ]
        })
      },
      {
        name: 'robot-future',
        title: '未来机器人涂色图',
        description: '科幻风格的机器人涂色图',
        defaultUrl: '/uploads/preset-images/robot-default.png',
        colorUrl: '/uploads/preset-images/robot-color.png',
        tags: ['robot', 'future', 'technology'],
        ratio: '1:1',
        type: 'text2image',
        isPublic: true,
        categoryId: categories.find(c => c.name === 'custom').id,
        size: '512,512',
        additionalInfo: JSON.stringify({
          features: [
            "未来科技感的机器人设计",
            "复杂的机械结构和细节",
            "科幻风格的装甲和武器系统",
            "高难度的涂色挑战，适合进阶者"
          ],
          suitableFor: [
            "8-15岁青少年：培养对科技的兴趣",
            "科技爱好者：表达对未来科技的憧憬",
            "有经验的涂色者：复杂图案提供挑战",
            "STEM教育：结合科技知识的学习"
          ],
          coloringSuggestions: [
            "金属质感：银色、灰色、蓝色等科技感颜色",
            "霓虹配色：亮蓝、绿色、紫色等未来感颜色",
            "层次渐变：不同部件使用不同深浅的颜色",
            "细节突出：用对比色突出重要的机械部件"
          ],
          creativeUses: [
            "科技主题装饰：适合现代风格的房间布置",
            "STEM教育工具：激发对机器人技术的兴趣",
            "创意挑战：测试和提高涂色技巧",
            "未来主题活动：科技展览或机器人比赛装饰"
          ]
        })
      },
      {
        name: 'magical-unicorn',
        title: '神奇独角兽涂色图',
        description: '梦幻的独角兽涂色图，充满魔法色彩',
        defaultUrl: '/uploads/preset-images/unicorn-default.jpg',
        colorUrl: '/uploads/preset-images/unicorn-color.jpg',
        tags: ['unicorn', 'magic', 'fantasy'],
        ratio: '4:3',
        type: 'text2image',
        isPublic: true,
        categoryId: categories.find(c => c.name === 'fantasy').id,
        size: '640,480',
        additionalInfo: JSON.stringify({
          features: [
            "梦幻的独角兽造型，充满魔法气息",
            "优雅的鬃毛和尾巴设计",
            "标志性的螺旋角和翅膀",
            "适中的细节复杂度，适合多年龄段"
          ],
          suitableFor: [
            "3-10岁儿童：培养想象力和对美的感知",
            "奇幻爱好者：表达对魔法世界的向往",
            "中级涂色者：适中难度的梦幻主题",
            "女孩主题活动：公主派对或独角兽主题装饰"
          ],
          coloringSuggestions: [
            "梦幻配色：粉色、紫色、蓝色等柔美色彩",
            "彩虹效果：鬃毛和尾巴可使用彩虹渐变",
            "珠光质感：使用亮色表现魔法光泽",
            "背景搭配：可添加星星、云朵等梦幻元素"
          ],
          creativeUses: [
            "女孩房装饰：营造梦幻公主房间氛围",
            "生日派对道具：独角兽主题生日派对",
            "想象力培养：激发孩子的创造力和想象力",
            "情感表达：通过梦幻色彩表达美好愿望"
          ]
        })
      },
      {
        name: 'delicious-icecream',
        title: '美味冰淇淋涂色图',
        description: '诱人的冰淇淋涂色图，夏日必备',
        defaultUrl: '/uploads/preset-images/icecream-default.jpg',
        colorUrl: '/uploads/preset-images/icecream-color.jpg',
        tags: ['icecream', 'food', 'summer'],
        ratio: '3:4',
        type: 'text2image',
        isPublic: true,
        categoryId: categories.find(c => c.name === 'food').id,
        size: '480,640',
        additionalInfo: JSON.stringify({
          features: [
            "诱人的冰淇淋造型设计",
            "多层次的冰淇淋球和装饰",
            "简单友好的线条，适合幼儿",
            "夏日清爽的美食主题"
          ],
          suitableFor: [
            "2-8岁儿童：培养对美食的兴趣",
            "美食爱好者：表达对甜品的喜爱",
            "初学者：简单易上手的美食主题",
            "夏日主题活动：适合夏季派对装饰"
          ],
          coloringSuggestions: [
            "清爽配色：粉色、黄色、绿色等清爽色彩",
            "真实模拟：参考真实冰淇淋的颜色搭配",
            "创意发挥：尝试彩虹色或梦幻色彩组合",
            "装饰细节：为冰淇淋添加樱桃、巧克力等装饰"
          ],
          creativeUses: [
            "夏日主题装饰：营造清爽的夏日氛围",
            "美食教育：结合食物知识进行教育",
            "生日派对道具：冰淇淋主题生日派对",
            "情感表达：通过甜美色彩表达快乐心情"
          ]
        })
      },
      {
        name: 'wise-magician',
        title: '智慧魔法师涂色图',
        description: '神秘的魔法师涂色图，充满智慧与力量',
        defaultUrl: '/uploads/preset-images/magician-default.jpg',
        colorUrl: '/uploads/preset-images/magician-color.jpg',
        tags: ['magician', 'wizard', 'magic'],
        ratio: '3:4',
        type: 'text2image',
        isPublic: true,
        categoryId: categories.find(c => c.name === 'fantasy').id,
        size: '480,640',
        additionalInfo: JSON.stringify({
          features: [
            "神秘的魔法师造型，充满智慧气息",
            "复杂的法袍和魔法道具细节",
            "长胡须和尖帽的经典魔法师形象",
            "高难度的涂色挑战，适合进阶者"
          ],
          suitableFor: [
            "6-14岁儿童：培养对奇幻世界的兴趣",
            "奇幻爱好者：表达对魔法世界的向往",
            "高级涂色者：复杂图案提供挑战",
            "魔法主题活动：哈利波特主题或魔法派对"
          ],
          coloringSuggestions: [
            "神秘配色：深蓝、紫色、金色等神秘色彩",
            "魔法效果：使用亮色表现魔法光芒",
            "层次渐变：法袍的褶皱和阴影表现",
            "细节突出：魔法道具和装饰的精细涂色"
          ],
          creativeUses: [
            "奇幻主题装饰：营造神秘的魔法氛围",
            "教育工具：结合奇幻文学进行想象力教育",
            "技巧挑战：作为高级涂色技巧的练习",
            "主题收藏：奇幻角色系列收藏品"
          ]
        })
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