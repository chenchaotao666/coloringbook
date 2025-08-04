import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import SEOHead from '../components/common/SEOHead';
import BackToTop from '../components/common/BackToTop';
import Breadcrumb from '../components/common/Breadcrumb';
import { Button } from '../components/ui/button';
import { useAsyncTranslation, useLanguage } from '../contexts/LanguageContext';
import { PostsService, Post } from '../services/postsService';
import { createLanguageAwarePath } from '../utils/navigationUtils';
import { getLocalizedText } from '../utils/textUtils';

const arrowRightIcon = '/images/arrow-right-outline.svg';



const BlogDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { t } = useAsyncTranslation('common');
  const { t: navT } = useAsyncTranslation('navigation');
  const { language } = useLanguage();
  const [article, setArticle] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function to get content in current language using textUtils
  const getLocalizedContent = (content: any) => {
    return getLocalizedText(content, language as any);
  };

  const getLocalizedContentOptional = (content?: any) => {
    if (!content) return '';
    return getLocalizedText(content, language as any);
  };

  // Fetch post data by slug
  const fetchPost = async (slug: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await PostsService.getPosts({
        slug: slug,
        status: 'published',
        lang: language
      });
      
      if (!result.posts || result.posts.length === 0) {
        setError('Article not found');
        return;
      }
      
      setArticle(result.posts[0]);
    } catch (err) {
      console.error('Failed to fetch post:', err);
      setError('Failed to load article');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!slug) {
      navigate('/blog');
      return;
    }

    fetchPost(slug);
  }, [slug, navigate, language]);

  if (loading) {
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

  if (error || !article) {
    return (
      <Layout>
        <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {error === 'Article not found' ? t('blog.notFound', 'Article not found') : t('blog.errorLoading', 'Error loading article')}
            </h1>
            <p className="text-gray-600 mb-6">
              {error === 'Article not found' 
                ? t('blog.notFoundMessage', 'The article you are looking for does not exist.')
                : t('blog.errorMessage', 'Failed to load the article. Please try again.')
              }
            </p>
            <div className="space-y-4">
              {error !== 'Article not found' && (
                <button 
                  onClick={() => slug && fetchPost(slug)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors mr-4"
                >
                  {t('buttons.retry', 'Retry')}
                </button>
              )}
              <Link to={createLanguageAwarePath('/blog')}>
                <Button variant="outline">
                  {t('blog.backToBlog', 'Back to Blog')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Since API returns content in the requested language, we can use it directly
  // But keep the helper functions for backward compatibility
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
                { label: navT('breadcrumb.home', 'Home'), path: '/' },
                { label: navT('breadcrumb.blog', 'Blog'), path: '/blog' },
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
                  {t('blog.publishedOn', 'Published on')} {new Date(article.published_date).toLocaleDateString(language, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
            </div>

            {/* Featured Image */}
            {article.featured_image && article.featured_image.trim() !== '' && (
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
              className="prose max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-blue-600 prose-strong:text-gray-900"
              dangerouslySetInnerHTML={{ __html: currentContent }}
            />
          </article>


          {/* Back to Blog */}
          <div className="flex justify-center">
            <Link to={createLanguageAwarePath('/blog')}>
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