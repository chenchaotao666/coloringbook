import { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import SEOHead from '../components/common/SEOHead';
import BackToTop from '../components/common/BackToTop';
import { useAsyncTranslation, useLanguage } from '../contexts/LanguageContext';
import { PostsService, Post } from '../services/postsService';
import { createLanguageAwarePath } from '../utils/navigationUtils';
import { getLocalizedText } from '../utils/textUtils';



const ITEMS_PER_PAGE = 20; // 临时设置为2，便于测试分页功能

const BlogPage = () => {
  const { t } = useAsyncTranslation('common');
  const { language } = useLanguage();
  const [currentPage, setCurrentPage] = useState(1);
  const [posts, setPosts] = useState<Post[]>([]);
  const [totalPosts, setTotalPosts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Helper function to strip HTML tags and get plain text
  const stripHtmlTags = (html: string) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  // Helper function to get content in current language using textUtils
  const getLocalizedContent = (content: any) => {
    return getLocalizedText(content, language as any);
  };

  // Fetch posts data
  const fetchPosts = async (page: number) => {
    try {
      setLoading(true);
      setError(null);
      const result = await PostsService.getPublishedPosts({
        currentPage: page,
        pageSize: ITEMS_PER_PAGE,
        sortBy: 'published_date',
        sortOrder: 'desc',
        lang: language
      });
      console.log('API返回的posts数据:', result.posts);
      setPosts(result.posts);
      setTotalPosts(result.total);
    } catch (err) {
      console.error('Failed to fetch posts:', err);
      setError('Failed to load blog posts');
      setPosts([]);
      setTotalPosts(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(currentPage);
  }, [currentPage, language]);
  
  // Calculate pagination
  const totalPages = Math.ceil(totalPosts / ITEMS_PER_PAGE);
  
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
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-red-600 text-lg">{error}</p>
                  <button 
                    onClick={() => fetchPosts(currentPage)}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    {t('buttons.retry', 'Retry')}
                  </button>
                </div>
              ) : posts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600 text-lg">{t('blog.noPosts', 'No blog posts found.')}</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {posts.map((article) => (
                    <div key={article.post_id}>
                      <a
                        href={createLanguageAwarePath(`/blog/${article.slug}`)}
                        className={`flex flex-wrap md:flex-nowrap hover:bg-gray-50 transition-colors duration-200 px-4 py-8`}
                      >
                        <div className="mb-6 flex flex-shrink-0 flex-col md:mb-0 md:w-64">
                          <span className="text-gray-500 mt-1 text-sm">
                            {new Date(article.published_date).toLocaleDateString(language, {
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
                          <p className="text-gray-600 leading-relaxed line-clamp-3">
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
              )}
              
              {/* Pagination */}
              {!loading && !error && totalPages > 1 && (
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
                    {t('blog.totalArticles', 'Total {count} articles', { count: totalPosts })}
                  </span>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
      
      <BackToTop />
    </Layout>
  );
};

export default BlogPage;