import { useState } from 'react';
import Layout from '../components/layout/Layout';
import SEOHead from '../components/common/SEOHead';
import BackToTop from '../components/common/BackToTop';
import { useAsyncTranslation, useLanguage } from '../contexts/LanguageContext';

// Blog article interface matching database structure
interface BlogArticle {
  post_id: string;
  title: { en: string; zh: string };
  slug: string;
  author: string;
  published_date: string;
  status: 'draft' | 'published';
  featured_image?: string;
  excerpt?: { en: string; zh: string };
  content: { en: string; zh: string };
  meta_title?: { en: string; zh: string };
  meta_description?: { en: string; zh: string };
  created_at: string;
  updated_at: string;
}

// Mock blog data - matching the database structure
const mockBlogArticles: BlogArticle[] = [
  {
    post_id: '1',
    title: {
      en: 'Mubert vs Suno: Which AI Music Generator Is Right for Your Workflow?',
      zh: 'Mubert vs Suno: 哪个AI音乐生成器适合您的工作流程？'
    },
    slug: 'mubert-vs-suno-which-ai-music-generator-is-right-for-your-workflow',
    author: 'AI Music Team',
    published_date: '2025-07-31T00:00:00Z',
    status: 'published',
    featured_image: '/images/blog/mubert-vs-suno.jpg',
    excerpt: {
      en: 'Artificial intelligence has officially entered the studio. From DAWs to lyric writing tools, AI is helping musicians and creators break creative barriers. Two standout tools in this new era are Mubert and Suno. But what\'s the real difference? And more importantly—which one is right for you? In this guide, we\'ll...',
      zh: '人工智能已经正式进入录音室。从DAW到歌词创作工具，AI正在帮助音乐家和创作者突破创意障碍。在这个新时代中，Mubert和Suno是两个突出的工具。但真正的区别是什么？更重要的是——哪一个适合您？在这个指南中，我们将...'
    },
    content: {
      en: `
        <h2>Introduction</h2>
        <p>Artificial intelligence has officially entered the studio. From DAWs to lyric writing tools, AI is helping musicians and creators break creative barriers. Two standout tools in this new era are Mubert and Suno.</p>
        
        <h2>What is Mubert?</h2>
        <p>Mubert is an AI-powered music generation platform that creates royalty-free music in real-time. It's designed for content creators, developers, and businesses who need background music for their projects.</p>
        
        <h3>Key Features:</h3>
        <ul>
          <li>Real-time music generation</li>
          <li>Multiple genres and moods</li>
          <li>API integration for developers</li>
          <li>Royalty-free licensing</li>
        </ul>
        
        <h2>What is Suno?</h2>
        <p>Suno is an AI music generator that focuses on creating complete songs with vocals, lyrics, and instrumental arrangements. It's more suited for musicians and artists looking to create full compositions.</p>
        
        <h3>Key Features:</h3>
        <ul>
          <li>Complete song generation</li>
          <li>Vocal and lyric creation</li>
          <li>Various musical styles</li>
          <li>High-quality audio output</li>
        </ul>
        
        <h2>Comparison</h2>
        <p>When choosing between Mubert and Suno, consider your specific needs:</p>
        
        <blockquote>
          <p>"Mubert excels at background music and ambient soundscapes, while Suno shines in creating complete musical compositions."</p>
        </blockquote>
        
        <h2>Conclusion</h2>
        <p>Both tools have their strengths. Choose Mubert for background music and content creation, or Suno for complete song composition and artistic expression.</p>
      `,
      zh: `
        <h2>简介</h2>
        <p>人工智能已经正式进入录音室。从DAW到歌词创作工具，AI正在帮助音乐家和创作者突破创意障碍。在这个新时代中，Mubert和Suno是两个突出的工具。</p>
        
        <h2>什么是Mubert？</h2>
        <p>Mubert是一个由AI驱动的音乐生成平台，可以实时创建免版税音乐。它专为需要为项目提供背景音乐的内容创作者、开发者和企业而设计。</p>
        
        <h3>主要特点：</h3>
        <ul>
          <li>实时音乐生成</li>
          <li>多种流派和情绪</li>
          <li>开发者API集成</li>
          <li>免版税许可</li>
        </ul>
        
        <h2>什么是Suno？</h2>
        <p>Suno是一个AI音乐生成器，专注于创建包含人声、歌词和乐器编排的完整歌曲。它更适合寻求创作完整作品的音乐家和艺术家。</p>
        
        <h3>主要特点：</h3>
        <ul>
          <li>完整歌曲生成</li>
          <li>人声和歌词创作</li>
          <li>各种音乐风格</li>
          <li>高质量音频输出</li>
        </ul>
        
        <h2>对比</h2>
        <p>在Mubert和Suno之间选择时，请考虑您的具体需求：</p>
        
        <blockquote>
          <p>"Mubert在背景音乐和环境音景方面表现出色，而Suno在创建完整音乐作品方面表现突出。"</p>
        </blockquote>
        
        <h2>结论</h2>
        <p>两个工具都有各自的优势。选择Mubert用于背景音乐和内容创作，或选择Suno用于完整歌曲创作和艺术表达。</p>
      `
    },
    meta_title: {
      en: 'Mubert vs Suno: Complete AI Music Generator Comparison 2025',
      zh: 'Mubert vs Suno: 2025年完整AI音乐生成器对比'
    },
    meta_description: {
      en: 'Compare Mubert and Suno AI music generators. Learn which tool is best for your creative workflow with our detailed analysis and recommendations.',
      zh: '比较Mubert和Suno AI音乐生成器。通过我们详细的分析和建议，了解哪个工具最适合您的创意工作流程。'
    },
    created_at: '2025-07-31T00:00:00Z',
    updated_at: '2025-07-31T00:00:00Z'
  },
  {
    post_id: '2',
    title: {
      en: 'Aiva vs Soundraw: Which AI Music Tool Belongs in Your Studio?',
      zh: 'Aiva vs Soundraw: 哪个AI音乐工具属于您的工作室？'
    },
    slug: 'aiva-vs-soundraw-which-ai-music-tool-belongs-in-your-studio',
    author: 'Studio Expert',
    published_date: '2025-07-31T00:00:00Z',
    status: 'published',
    excerpt: {
      en: 'Looking for an AI music generator that fits your creative workflow? You\'ve probably come across Aiva and Soundraw—two leading platforms with totally different vibes. One is built for cinematic scores and musical control. The other? Lightning-fast, royalty-free tracks for content creators. In this guide, we\'ll break',
      zh: '正在寻找适合您创意工作流程的AI音乐生成器？您可能已经遇到了Aiva和Soundraw——两个完全不同氛围的领先平台。一个专为电影配乐和音乐控制而构建。另一个？为内容创作者提供闪电般快速的免版税音轨。在这个指南中，我们将分解'
    },
    content: {
      en: 'Looking for an AI music generator that fits your creative workflow? You\'ve probably come across Aiva and Soundraw—two leading platforms with totally different vibes. One is built for cinematic scores and musical control. The other? Lightning-fast, royalty-free tracks for content creators. In this guide, we\'ll break',
      zh: '正在寻找适合您创意工作流程的AI音乐生成器？您可能已经遇到了Aiva和Soundraw——两个完全不同氛围的领先平台。一个专为电影配乐和音乐控制而构建。另一个？为内容创作者提供闪电般快速的免版税音轨。在这个指南中，我们将分解'
    },
    created_at: '2025-07-31T00:00:00Z',
    updated_at: '2025-07-31T00:00:00Z'
  },
  {
    post_id: '3',
    title: {
      en: 'Lalal.ai Review: I Tested It. Is It Really the Ultimate AI Stem Splitter?',
      zh: 'Lalal.ai 评测：我对其进行了测试。它真的是最终的 AI 音轨分离器吗？'
    },
    slug: 'lalal-review',
    author: '音频专家',
    published_date: '2025-07-28T00:00:00Z',
    status: 'published',
    excerpt: {
      en: 'Honestly, for years, separating clean vocals or crisp drum loops from already-finished tracks was a nightmare. You\'d spend hours with EQ tricks and phase inversion, only to end up with a watery, artifact-laden mess of audio. I know because I\'ve been there—it\'s frustrating.',
      zh: '老实说，多年来，从已经完成的音轨中分离出干净的人声或清晰的鼓循环简直是噩梦。你得花上数小时使用均衡器技巧和相位倒置，结果却只得到一堆水声、充满瑕疵的混乱音频。我深有体会，那真是令人沮丧。'
    },
    content: {
      en: 'Honestly, for years, separating clean vocals or crisp drum loops from already-finished tracks was a nightmare. You\'d spend hours with EQ tricks and phase inversion, only to end up with a watery, artifact-laden mess of audio. I know because I\'ve been there—it\'s frustrating.',
      zh: '老实说，多年来，从已经完成的音轨中分离出干净的人声或清晰的鼓循环简直是噩梦。你得花上数小时使用均衡器技巧和相位倒置，结果却只得到一堆水声、充满瑕疵的混乱音频。我深有体会，那真是令人沮丧。'
    },
    created_at: '2025-07-28T00:00:00Z',
    updated_at: '2025-07-28T00:00:00Z'
  }
];

const ITEMS_PER_PAGE = 20;

const BlogPage = () => {
  const { t } = useAsyncTranslation('common');
  const { language } = useLanguage();
  const [currentPage, setCurrentPage] = useState(1);
  
  // Helper function to strip HTML tags and get plain text
  const stripHtmlTags = (html: string) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  // Helper function to get content in current language
  const getLocalizedContent = (content: { en: string; zh: string }) => {
    if (language === 'zh' && content.zh) {
      return content.zh;
    }
    return content.en;
  };
  
  // Calculate pagination
  const totalPages = Math.ceil(mockBlogArticles.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentArticles = mockBlogArticles.slice(startIndex, endIndex);
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const generatePageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push('...');
      }
      
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        if (i !== 1 && i !== totalPages) {
          pages.push(i);
        }
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('...');
      }
      
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <Layout>
      <SEOHead
        title={t('blog.seo.title', 'Blog - AI Coloring Pages')}
        description={t('blog.seo.description', 'Discover the latest insights, tips, and tutorials about AI coloring pages, digital art, and creative technology.')}
        keywords={t('blog.seo.keywords', 'blog, AI coloring pages, digital art, tutorials, tips')}
        ogTitle={t('blog.seo.title', 'Blog - AI Coloring Pages')}
        ogDescription={t('blog.seo.description', 'Discover the latest insights, tips, and tutorials about AI coloring pages, digital art, and creative technology.')}
      />
      
      <div className="min-h-screen bg-white">
        <div className="mx-auto max-w-7xl px-[16px] pb-[60px]">
          {/* Page Title */}
          <h1 className="py-[2.5rem] text-4xl font-bold text-gray-900 px-[1rem]">
            {t('blog.title', 'Blog')}
          </h1>
          
          {/* Blog Articles Section */}
          <section className="body-font text-gray-700">
            <div className="container mx-auto">
              <div className="divide-y divide-gray-200">
                {currentArticles.map((article) => (
                  <div key={article.post_id}>
                    <a
                      href={`/blog/${article.slug}`}
                      className={`flex flex-wrap md:flex-nowrap hover:bg-gray-50 transition-colors duration-200 px-4 py-8`}
                    >
                      <div className="mb-6 flex flex-shrink-0 flex-col md:mb-0 md:w-64">
                        <span className="text-gray-500 mt-1 text-sm">
                          {new Date(article.published_date).toLocaleDateString(language === 'zh' ? 'zh-CN' : language === 'ja' ? 'ja-JP' : 'en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            weekday: 'short'
                          })}
                        </span>
                        <span className="text-gray-400 mt-1 text-xs">
                          {t('blog.author', 'By')} {article.author}
                        </span>
                      </div>
                      <div className="md:flex-grow">
                        <h2 className="title-font text-gray-900 mb-2 text-2xl font-medium">
                          {getLocalizedContent(article.title)}
                        </h2>
                        <p className="text-gray-600 leading-relaxed line-clamp-4">
                          {stripHtmlTags(getLocalizedContent(article.content))}
                        </p>
                        <div className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-500 transition-colors">
                          {t('blog.readMore', 'Read More')}
                          <svg
                            className="ml-2 h-4 w-4"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M5 12h14"></path>
                            <path d="M12 5l7 7-7 7"></path>
                          </svg>
                        </div>
                      </div>
                    </a>
                  </div>
                ))}
              </div>
              
              {/* Pagination */}
              <div className="mt-8 flex items-center justify-center gap-2">
                {/* Previous Button */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`btn btn-sm ${
                    currentPage === 1
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-700 text-white hover:bg-gray-600'
                  } px-3 py-1 rounded`}
                >
                  {t('buttons.previous', 'Previous')}
                </button>
                
                {/* Page Numbers */}
                {generatePageNumbers().map((page, index) => (
                  <button
                    key={index}
                    onClick={() => typeof page === 'number' && handlePageChange(page)}
                    disabled={typeof page !== 'number'}
                    className={`btn btn-sm px-3 py-1 rounded ${
                      page === currentPage
                        ? 'bg-blue-600 text-white'
                        : typeof page === 'number'
                        ? 'bg-gray-700 text-white hover:bg-gray-600'
                        : 'bg-transparent text-gray-500 cursor-default'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                {/* Next Button */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`btn btn-sm ${
                    currentPage === totalPages
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-700 text-white hover:bg-gray-600'
                  } px-3 py-1 rounded`}
                >
                  {t('buttons.next', 'Next')}
                </button>
                
                {/* Total Count */}
                <span className="ml-4 text-sm text-gray-500">
                  {t('blog.totalArticles', 'Total {count} articles', { count: mockBlogArticles.length })}
                </span>
              </div>
            </div>
          </section>
        </div>
      </div>
      
      <BackToTop />
    </Layout>
  );
};

export default BlogPage;