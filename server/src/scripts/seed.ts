import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 分类数据
const categories = [
  {
    name: "animals",
    displayName: "Animals",
    description: "Cute and wild animals coloring pages",
    imageCount: 156,
    thumbnailUrl: "/images-mock/cat-default.png"
  },
  {
    name: "disney",
    displayName: "Disney",
    description: "Disney characters and princesses",
    imageCount: 89,
    thumbnailUrl: "/images-mock/mario-default.png"
  },
  {
    name: "flowers",
    displayName: "Flowers",
    description: "Beautiful flowers and plants",
    imageCount: 124,
    thumbnailUrl: "/images-mock/flower-default.png"
  },
  {
    name: "vehicles",
    displayName: "Vehicles",
    description: "Cars, trucks, planes and more",
    imageCount: 78,
    thumbnailUrl: "/images-mock/robot-default.png"
  },
  {
    name: "fantasy",
    displayName: "Fantasy",
    description: "Dragons, unicorns and magical creatures",
    imageCount: 92,
    thumbnailUrl: "/images-mock/cartoon-default.png"
  },
  {
    name: "nature",
    displayName: "Nature",
    description: "Trees, landscapes and natural scenes",
    imageCount: 67,
    thumbnailUrl: "/images-mock/flower1-default.png"
  }
];

// 示例图片数据
const sampleImages = [
  {
    title: "Cute Cat",
    description: "A cute cat sitting and looking adorable",
    url: "/images-mock/cat-default.png",
    colorUrl: "/images-mock/cat-color.png",
    tags: ["cat", "pet", "cute"],
    ratio: "3:4",
    type: "default",
    categoryName: "animals"
  },
  {
    title: "Another Cat",
    description: "Another cute cat design",
    url: "/images-mock/cat1-default.png",
    colorUrl: "/images-mock/cat1-color.png",
    tags: ["cat", "pet", "adorable"],
    ratio: "1:1",
    type: "default",
    categoryName: "animals"
  },
  {
    title: "Mario Character",
    description: "Classic Mario character",
    url: "/images-mock/mario-default.png",
    colorUrl: "/images-mock/mario-color.png",
    tags: ["mario", "game", "character"],
    ratio: "1:1",
    type: "default",
    categoryName: "disney"
  },
  {
    title: "Beautiful Flower",
    description: "A beautiful flower design",
    url: "/images-mock/flower-default.png",
    colorUrl: "/images-mock/flower-color.png",
    tags: ["flower", "beautiful", "nature"],
    ratio: "3:4",
    type: "default",
    categoryName: "flowers"
  },
  {
    title: "Robot Vehicle",
    description: "A futuristic robot vehicle",
    url: "/images-mock/robot-default.png",
    colorUrl: "/images-mock/robot-color.png",
    tags: ["robot", "vehicle", "futuristic"],
    ratio: "4:3",
    type: "default",
    categoryName: "vehicles"
  }
];

// 示例用户数据
const sampleUsers = [
  {
    username: "colorlover",
    email: "colorlover@example.com",
    avatar: "/images/Avatar.png",
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
      totalTimeSpent: 3600
    }
  },
  {
    username: "artmaster",
    email: "artmaster@example.com",
    avatar: "/images/Avatar.png",
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
  }
];

async function main() {
  console.log('🌱 开始填充数据库...');

  // 清理现有数据
  console.log('🧹 清理现有数据...');
  await prisma.userFavorite.deleteMany();
  await prisma.generationTask.deleteMany();
  await prisma.image.deleteMany();
  await prisma.user.deleteMany();
  await prisma.category.deleteMany();

  // 创建分类
  console.log('📁 创建分类...');
  const createdCategories = await Promise.all(
    categories.map(category =>
      prisma.category.create({
        data: category
      })
    )
  );
  console.log(`✅ 创建了 ${createdCategories.length} 个分类`);

  // 创建用户
  console.log('👥 创建用户...');
  const createdUsers = await Promise.all(
    sampleUsers.map(user =>
      prisma.user.create({
        data: user
      })
    )
  );
  console.log(`✅ 创建了 ${createdUsers.length} 个用户`);

  // 创建图片
  console.log('🖼️ 创建图片...');
  const createdImages = await Promise.all(
    sampleImages.map(async (image) => {
             const category = createdCategories.find((cat: any) => cat.name === image.categoryName);
      if (!category) {
        throw new Error(`找不到分类: ${image.categoryName}`);
      }

      const { categoryName, ...imageData } = image;
      return prisma.image.create({
        data: {
          ...imageData,
          categoryId: category.id
        }
      });
    })
  );
  console.log(`✅ 创建了 ${createdImages.length} 张图片`);

  // 创建一些收藏关系
  console.log('❤️ 创建收藏关系...');
  const favorites = [
    { userId: createdUsers[0]?.id, imageId: createdImages[0]?.id },
    { userId: createdUsers[0]?.id, imageId: createdImages[1]?.id },
    { userId: createdUsers[1]?.id, imageId: createdImages[2]?.id },
  ].filter(fav => fav.userId && fav.imageId);

  const createdFavorites = await Promise.all(
    favorites.map(favorite =>
      prisma.userFavorite.create({
        data: favorite as { userId: string; imageId: string }
      })
    )
  );
  console.log(`✅ 创建了 ${createdFavorites.length} 个收藏关系`);

  console.log('🎉 数据库填充完成！');
  console.log('');
  console.log('📊 数据统计:');
  console.log(`   分类: ${createdCategories.length}`);
  console.log(`   用户: ${createdUsers.length}`);
  console.log(`   图片: ${createdImages.length}`);
  console.log(`   收藏: ${createdFavorites.length}`);
}

main()
  .catch((e) => {
    console.error('❌ 数据填充失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 