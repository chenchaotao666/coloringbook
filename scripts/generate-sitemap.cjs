const fs = require('fs');
const path = require('path');

// 加载.env文件
function loadEnvFile() {
  const envPath = path.join(__dirname, '../.env');
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf8');
    const envLines = envFile.split('\n');
    
    envLines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').trim();
          // 只设置未定义的环境变量
          if (!process.env[key]) {
            process.env[key] = value;
          }
        }
      }
    });
    console.log('✅ Loaded .env file');
  } else {
    console.log('⚠️  No .env file found');
  }
}

// 加载环境变量
loadEnvFile();

const DOMAIN = 'https://colorpages.art';
const OUTPUT_PATH = path.join(__dirname, '../public/sitemap.xml');

// API配置 - 从环境变量读取，支持多种配置方式
const API_BASE_URL = process.env.VITE_API_BASE_URL || 
                     process.env.API_BASE_URL || 
                     'http://localhost:3001'; // 开发环境默认值

// 允许跳过API调用的选项（用于CI/CD环境）
const SKIP_API = process.env.SKIP_API === 'true';

console.log(`Using API base URL: ${API_BASE_URL}`);
console.log(`Environment: VITE_API_BASE_URL=${process.env.VITE_API_BASE_URL}`);
if (SKIP_API) {
  console.log('⚠️  API calls will be skipped (SKIP_API=true)');
}

// 简单的http/https请求函数，不依赖外部库
function httpRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const http = isHttps ? require('https') : require('http');
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Sitemap Generator',
        ...options.headers,
      }
    };
    
    const req = http.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            resolve(data);
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
        }
      });
    });
    
    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    
    req.end();
  });
}

// 静态路由配置
const staticRoutes = [
  {
    path: '/',
    priority: 1.0,
    changefreq: 'weekly',
    multilang: true
  },
  {
    path: '/price',
    priority: 0.8,
    changefreq: 'monthly',
    multilang: true
  },
  {
    path: '/text-coloring-page',
    priority: 0.9,
    changefreq: 'weekly',
    multilang: true
  },
  {
    path: '/image-coloring-page',
    priority: 0.9,
    changefreq: 'weekly',
    multilang: true
  },
  {
    path: '/categories',
    priority: 0.8,
    changefreq: 'weekly',
    multilang: true
  },
  {
    path: '/register',
    priority: 0.5,
    changefreq: 'monthly',
    multilang: false
  },
  {
    path: '/login',
    priority: 0.5,
    changefreq: 'monthly',
    multilang: false
  },
  {
    path: '/privacy-policy',
    priority: 0.3,
    changefreq: 'yearly',
    multilang: true
  },
  {
    path: '/terms',
    priority: 0.3,
    changefreq: 'yearly',
    multilang: true
  },
  {
    path: '/refund-policy',
    priority: 0.3,
    changefreq: 'yearly',
    multilang: true
  },
  {
    path: '/blog',
    priority: 0.6,
    changefreq: 'weekly',
    multilang: true
  }
];

// 支持的语言
const languages = ['en', 'zh'];

// 工具函数：将displayName转换为SEO友好的URL路径
function convertDisplayNameToPath(displayName) {
  return displayName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // 移除特殊字符
    .replace(/\s+/g, '-') // 空格替换为短划线
    .replace(/-+/g, '-') // 多个短划线合并为一个
    .trim();
}

// 工具函数：从分类数据中提取英文名称作为SEO路径
function getEnglishNameFromCategory(displayName) {
  if (typeof displayName === 'string') {
    return convertDisplayNameToPath(displayName);
  }
  
  // 如果是LocalizedText对象，优先使用英文
  const englishName = displayName.en || displayName.zh || '';
  return convertDisplayNameToPath(englishName);
}

// API请求函数
async function apiRequest(endpoint, options = {}) {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log(`Fetching: ${url}`);
    
    const data = await httpRequest(url, options);
    
    // 检查API响应格式
    if (data && data.status === 'success') {
      return data.data || data;
    } else if (data && Array.isArray(data)) {
      // 直接返回数组数据
      return data;
    } else if (data) {
      return data;
    } else {
      throw new Error('No data received');
    }
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error.message);
    return null;
  }
}

// 获取动态路由（分类和图片详情页）
async function getDynamicRoutes() {
  const dynamicRoutes = [];
  
  // 如果设置了SKIP_API，直接使用本地数据
  if (SKIP_API) {
    console.log('📁 Using local data only (API calls skipped)');
    return loadLocalData();
  }
  
  try {
    console.log('🌐 Fetching categories from API...');
    
    // 从API获取分类数据
    const categories = await apiRequest('/api/images/categories');
    
    if (categories && Array.isArray(categories)) {
      console.log(`Found ${categories.length} categories`);
      
      // 添加分类详情页
      categories.forEach(category => {
        // 使用SEO友好的英文名称作为路径参数
        const seoName = getEnglishNameFromCategory(category.displayName || category.display_name || category.name || '');
        if (seoName && seoName.length > 0) {
          dynamicRoutes.push({
            path: `/categories/${seoName}`,
            priority: 0.7,
            changefreq: 'weekly',
            multilang: true
          });
        } else {
          // 降级使用categoryId
          const fallbackParam = category.categoryId || category.name || category.id;
          if (fallbackParam) {
            console.warn(`Using fallback categoryId for category: ${JSON.stringify(category)}`);
            dynamicRoutes.push({
              path: `/categories/${fallbackParam}`,
              priority: 0.7,
              changefreq: 'weekly',
              multilang: true
            });
          }
        }
      });
    } else {
      console.warn('No categories data received from API');
    }

    // 获取blog posts
    try {
      console.log('🌐 Fetching blog posts from API...');
      const postsResult = await apiRequest('/api/blog/posts?status=published&sortBy=published_date');
      
      if (postsResult && postsResult.posts && Array.isArray(postsResult.posts)) {
        console.log(`Found ${postsResult.posts.length} published blog posts`);
        
        // 添加blog详情页
        postsResult.posts.forEach(post => {
          if (post.slug) {
            // URL编码处理slug中的特殊字符和空格
            const encodedSlug = encodeURIComponent(post.slug);
            dynamicRoutes.push({
              path: `/blog/${encodedSlug}`,
              priority: 0.6,
              changefreq: 'monthly',
              multilang: true
            });
          }
        });
      } else {
        console.warn('No blog posts data received from API');
      }
    } catch (blogError) {
      console.warn('Failed to fetch blog posts:', blogError.message);
    }

  } catch (error) {
    console.error('Error loading dynamic routes:', error);
    
    // 降级处理：使用本地数据作为备用
    console.log('🔄 Falling back to local data...');
    return loadLocalData();
  }
  
  return dynamicRoutes;
}

// 加载本地数据的函数
function loadLocalData() {
  return [];
}

// 生成hreflang链接
function generateHreflangLinks(path) {
  return languages.map(lang => {
    const href = lang === 'en' ? `${DOMAIN}${path}` : `${DOMAIN}/${lang}${path}`;
    return `    <xhtml:link rel="alternate" hreflang="${lang}" href="${href}"/>`;
  }).join('\n');
}

// 生成URL条目
function generateUrlEntry(route) {
  const lastmod = new Date().toISOString().split('T')[0];
  const entries = [];
  
  if (route.multilang) {
    // 为每种语言生成条目
    languages.forEach(lang => {
      const loc = lang === 'en' ? `${DOMAIN}${route.path}` : `${DOMAIN}/${lang}${route.path}`;
      const hreflangLinks = generateHreflangLinks(route.path);
      
      entries.push(`  <url>
    <loc>${loc}</loc>
${hreflangLinks}
    <lastmod>${lastmod}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`);
    });
  } else {
    // 单语言页面
    entries.push(`  <url>
    <loc>${DOMAIN}${route.path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`);
  }
  
  return entries;
}

// 主函数
async function generateSitemap() {
  console.log('Generating sitemap...');
  
  // 合并静态和动态路由
  const dynamicRoutes = await getDynamicRoutes();
  const allRoutes = [...staticRoutes, ...dynamicRoutes];
  
  // 生成所有URL条目
  const urlEntries = [];
  allRoutes.forEach(route => {
    urlEntries.push(...generateUrlEntry(route));
  });
  
  // 构建完整的sitemap XML
  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urlEntries.join('\n\n')}
</urlset>`;
  
  // 写入文件
  fs.writeFileSync(OUTPUT_PATH, sitemapXml);
  console.log(`Sitemap generated successfully at ${OUTPUT_PATH}`);
  console.log(`Total URLs: ${urlEntries.length}`);
}

// 如果直接运行此脚本
if (require.main === module) {
  generateSitemap().catch(console.error);
}

module.exports = { generateSitemap };