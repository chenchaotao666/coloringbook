import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import SEOHead from '../components/common/SEOHead';
import BackToTop from '../components/common/BackToTop';
import Breadcrumb from '../components/common/Breadcrumb';
import { Button } from '../components/ui/button';
import { useAsyncTranslation, useLanguage } from '../contexts/LanguageContext';

const arrowRightIcon = '/images/arrow-right-outline.svg';

// Blog article interface (same as BlogPage)
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

// Extended mock data with full content
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
    featured_image: '',
    excerpt: {
      en: 'Artificial intelligence has officially entered the studio. From DAWs to lyric writing tools, AI is helping musicians and creators break creative barriers.',
      zh: '人工智能已经正式进入录音室。从DAW到歌词创作工具，AI正在帮助音乐家和创作者突破创意障碍。'
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
      en: 'Compare Mubert and Suno AI music generators. Learn which tool is best for your creative workflow with our detailed analysis.',
      zh: '比较Mubert和Suno AI音乐生成器。通过我们详细的分析，了解哪个工具最适合您的创意工作流程。'
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
      en: 'Looking for an AI music generator that fits your creative workflow? Discover the differences between Aiva and Soundraw.',
      zh: '正在寻找适合您创意工作流程的AI音乐生成器？了解Aiva和Soundraw之间的差异。'
    },
    content: {
      en: `
        <h2>Studio AI Music Tools Overview</h2>
        <p>Looking for an AI music generator that fits your creative workflow? You've probably come across Aiva and Soundraw—two leading platforms with totally different approaches to AI music creation.</p>
        
        <h2>About Aiva</h2>
        <p>Aiva specializes in cinematic and orchestral compositions, making it perfect for film scoring and classical music creation.</p>
        
        <h2>About Soundraw</h2>
        <p>Soundraw focuses on quick, royalty-free track generation for content creators and commercial use.</p>
        
        <h2>Which Should You Choose?</h2>
        <p>Your choice depends on your specific creative needs and workflow requirements.</p>
      `,
      zh: `
        <h2>工作室AI音乐工具概述</h2>
        <p>正在寻找适合您创意工作流程的AI音乐生成器？您可能已经遇到了Aiva和Soundraw——两个在AI音乐创作方面采用完全不同方法的领先平台。</p>
        
        <h2>关于Aiva</h2>
        <p>Aiva专门从事电影和管弦乐作品，非常适合电影配乐和古典音乐创作。</p>
        
        <h2>关于Soundraw</h2>
        <p>Soundraw专注于为内容创作者和商业用途快速生成免版税音轨。</p>
        
        <h2>您应该选择哪个？</h2>
        <p>您的选择取决于您的具体创意需求和工作流程要求。</p>
      `
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
      en: 'An in-depth review of Lalal.ai stem splitting technology and its real-world performance.',
      zh: '对Lalal.ai音轨分离技术及其实际性能的深入评测。'
    },
    content: {
      en: `
        <h2>My Experience with Lalal.ai</h2>
        <p>Honestly, for years, separating clean vocals or crisp drum loops from already-finished tracks was a nightmare. You'd spend hours with EQ tricks and phase inversion, only to end up with a watery, artifact-laden mess of audio.</p>
        
        <h2>Testing Results</h2>
        <p>After extensive testing with various complex tracks, here's what I discovered about Lalal.ai's capabilities.</p>
        
        <h2>Pros and Cons</h2>
        <p>Like any tool, Lalal.ai has its strengths and limitations that you should know about.</p>
      `,
      zh: `
        <h2>我使用Lalal.ai的体验</h2>
        <p>老实说，多年来，从已经完成的音轨中分离出干净的人声或清晰的鼓循环简直是噩梦。你得花上数小时使用均衡器技巧和相位倒置，结果却只得到一堆水声、充满瑕疵的混乱音频。</p>
        
        <h2>测试结果</h2>
        <p>在对各种复杂音轨进行广泛测试后，我发现了Lalal.ai的能力。</p>
        
        <h2>优缺点</h2>
        <p>像任何工具一样，Lalal.ai有其优势和局限性，您应该了解。</p>
      `
    },
    created_at: '2025-07-28T00:00:00Z',
    updated_at: '2025-07-28T00:00:00Z'
  }
];

const BlogDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { t } = useAsyncTranslation('common');
  const { language } = useLanguage();
  const [article, setArticle] = useState<BlogArticle | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper function to get content in current language
  const getLocalizedContent = (content: { en: string; zh: string }) => {
    if (language === 'zh' && content.zh) {
      return content.zh;
    }
    return content.en;
  };

  const getLocalizedContentOptional = (content?: { en: string; zh: string }) => {
    if (!content) return '';
    if (language === 'zh' && content.zh) {
      return content.zh;
    }
    return content.en;
  };

  useEffect(() => {
    if (!slug) {
      navigate('/blog');
      return;
    }

    // Find the article by slug
    const foundArticle = mockBlogArticles.find(article => article.slug === slug);
    
    if (!foundArticle) {
      navigate('/blog');
      return;
    }

    setArticle(foundArticle);
    
    setLoading(false);
  }, [slug, navigate]);

  if (loading || !article) {
    return (
      <Layout>
        <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">{t('common.loading', 'Loading...')}</p>
          </div>
        </div>
      </Layout>
    );
  }

  const currentTitle = getLocalizedContent(article.title);
  const currentContent = getLocalizedContent(article.content);
  const currentExcerpt = getLocalizedContentOptional(article.excerpt);
  const currentMetaTitle = getLocalizedContentOptional(article.meta_title);
  const currentMetaDescription = getLocalizedContentOptional(article.meta_description);

  return (
    <Layout>
      <SEOHead
        title={currentMetaTitle || currentTitle}
        description={currentMetaDescription || currentExcerpt || ''}
        keywords="AI music, blog, tutorial"
        ogTitle={currentMetaTitle || currentTitle}
        ogDescription={currentMetaDescription || currentExcerpt || ''}
        ogImage={article.featured_image}
      />
      
      <div className="min-h-screen bg-white">
        <div className="mx-auto max-w-7xl px-[16px] pt-10 pb-20">
          {/* Breadcrumb */}
          <div className="mb-8">
            <Breadcrumb
              items={[
                { label: t('breadcrumb.home', 'Home'), path: '/' },
                { label: t('breadcrumb.blog', 'Blog'), path: '/blog' },
                { label: currentTitle, current: true }
              ]}
            />
          </div>

          {/* Article Header */}
          <header className="mb-4">
            <h1 className="text-4xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
              {currentTitle}
            </h1>
            
            <div className="flex items-center gap-6 text-gray-600">
              <div className="flex items-center gap-2">
                <span className="text-sm">
                  {t('blog.by', 'By')} <span className="font-medium">{article.author}</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">
                  {new Date(article.published_date).toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
            </div>

            {/* Featured Image */}
            {article.featured_image && (
              <div className="mb-4">
                <img
                  src={article.featured_image}
                  alt={currentTitle}
                  className="w-full h-64 md:h-96 object-cover rounded-lg shadow-lg"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
          </header>

          {/* Article Content */}
          <article className="mb-12">
            <div 
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: currentContent }}
            />
          </article>


          {/* Back to Blog */}
          <div className="flex justify-center">
            <Link to="/blog">
              <Button 
                variant="gradient"
                className="w-[200px] sm:w-[200px] h-12 sm:h-14 px-4 sm:px-5 py-2.5 rounded-lg flex justify-center items-center gap-2 text-lg sm:text-xl font-bold"
              >
                {t('blog.backToBlog', 'Back to Blog')}
                <img src={arrowRightIcon} alt="Arrow right" className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <BackToTop />
    </Layout>
  );
};

export default BlogDetailPage;