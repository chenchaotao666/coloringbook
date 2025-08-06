import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import MasonryGrid from '../components/layout/MasonryGrid';
import CreationImageCard from '../components/creations/CreationImageCard';
import { useAuth } from '../contexts/AuthContext';
import { ImageService, HomeImage } from '../services/imageService';
import DeleteImageConfirmDialog from '../components/ui/DeleteImageConfirmDialog';
import BackToTop from '../components/common/BackToTop';
import SEOHead from '../components/common/SEOHead';
import { useAsyncTranslation } from '../contexts/LanguageContext';

// 图标导入
const noResultIcon = '/images/no-result.svg';

interface CreationsPageProps {}

const CreationsPage: React.FC<CreationsPageProps> = () => {
  const { t } = useAsyncTranslation('creations');
  const { t: tCommon } = useAsyncTranslation('common');
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  
  // 状态管理
  const [images, setImages] = useState<HomeImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<'all' | 'text2image' | 'image2image'>('all');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showReportDialog, setShowReportDialog] = useState<string | null>(null);
  const [reportContent, setReportContent] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);
  
  // 添加固定的图片类型计数
  const [typeCounts, setTypeCounts] = useState({
    all: 0,
    text2image: 0,
    image2image: 0
  });

  // 存储所有图片数据的缓存
  const [allImages, setAllImages] = useState<HomeImage[]>([]);

  // 根据选择的类型过滤图片
  useEffect(() => {
    if (selectedType === 'all') {
      setImages(allImages);
    } else {
      setImages(allImages.filter(img => img.type === selectedType));
    }
  }, [selectedType, allImages]);

  // 检查用户登录状态并加载数据
  useEffect(() => {
    // 等待认证初始化完成
    if (authLoading) {
      return;
    }
    
    // 如果认证完成但用户未登录，跳转到登录页面
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    // 如果用户已登录，加载用户图片
    loadUserImages();
  }, [authLoading, isAuthenticated]);

  // 加载用户图片 - 一次性加载所有数据
  const loadUserImages = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);

      const searchParams = {
        sortBy: 'createdAt' as const,
        sortOrder: 'desc' as const
      };

      // 使用新的专用用户图片接口
      const result = await ImageService.getUserOwnImages(searchParams);
      
      // 添加调试日志
      console.log('API Response:', result);
      console.log('First image example:', result.images[0]);
      
      // 保存所有图片到缓存
      setAllImages(result.images);
      
      // 根据当前选择的类型设置显示的图片
      if (selectedType === 'all') {
        setImages(result.images);
      } else {
        setImages(result.images.filter(img => img.type === selectedType));
      }
      
      // 更新计数
      setTypeCounts({
        all: result.images.length,
        text2image: result.images.filter(img => img.type === 'text2image').length,
        image2image: result.images.filter(img => img.type === 'image2image').length
      });
      
    } catch (err) {
      console.error('Failed to load user images:', err);
      setError('加载图片失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 删除图片
  const handleDelete = async (imageId: string) => {
    try {
      const success = await ImageService.deleteImage(imageId);
      if (success) {
        // 同时更新缓存和显示的图片
        const newAllImages = allImages.filter(img => img.id !== imageId);
        setAllImages(newAllImages);
        setImages(images.filter(img => img.id !== imageId));
        
        // 更新计数
        setTypeCounts({
          all: newAllImages.length,
          text2image: newAllImages.filter(img => img.type === 'text2image').length,
          image2image: newAllImages.filter(img => img.type === 'image2image').length
        });
        
        setShowDeleteConfirm(null);
      } else {
        setError('删除失败，请稍后重试');
      }
    } catch (error) {
      console.error('Delete failed:', error);
      setError('删除失败，请稍后重试');
    }
  };

  // 举报图片
  const handleReport = async (imageId: string) => {
    if (!reportContent.trim()) {
      setError('请输入举报内容');
      return;
    }

    try {
      setSubmittingReport(true);
      const success = await ImageService.reportImage({
        imageId,
        content: reportContent
      });
      
      if (success) {
        setShowReportDialog(null);
        setReportContent('');
        setError(null);
        // 可以显示成功提示
      } else {
        setError('举报失败，请稍后重试');
      }
    } catch (error) {
      console.error('Report failed:', error);
      setError('举报失败，请稍后重试');
    } finally {
      setSubmittingReport(false);
    }
  };

  // 处理删除确认
  const handleDeleteConfirm = (imageId: string) => {
    setShowDeleteConfirm(imageId);
  };

  // 自定义渲染卡片
  const renderCard = (image: HomeImage, _index: number) => (
    <CreationImageCard
      key={image.id}
      image={image}
      onDelete={handleDeleteConfirm}
    />
  );

  return (
    <Layout>
      <SEOHead
        title={tCommon('seo.creations.title', 'AI-Generated Coloring Pages Gallery - User Creations & Inspiration')}
        description={tCommon('seo.creations.description', 'Explore amazing AI-generated coloring pages created by our community. Get inspired and discover new ideas for your next coloring project.')}
        keywords={tCommon('seo.creations.keywords', 'AI coloring gallery, user creations, coloring page inspiration, AI-generated art, community coloring pages')}
        ogTitle={tCommon('seo.creations.title', 'AI-Generated Coloring Pages Gallery - User Creations & Inspiration')}
        ogDescription={tCommon('seo.creations.description', 'Explore amazing AI-generated coloring pages created by our community. Get inspired and discover new ideas for your next coloring project.')}
        noIndex={true}
      />
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* 页面标题 */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{t('title')}</h1>
          </div>

          {/* 筛选标签 */}
          <div className="mb-6 flex justify-center">
            <div className="inline-flex gap-2 bg-white rounded-lg p-1 shadow-sm">
              <button
                onClick={() => setSelectedType('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedType === 'all'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {t('filters.all')} ({typeCounts.all})
              </button>
              <button
                onClick={() => setSelectedType('text2image')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedType === 'text2image'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {t('filters.textToImage')} ({typeCounts.text2image})
              </button>
              <button
                onClick={() => setSelectedType('image2image')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedType === 'image2image'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {t('filters.imageToImage')} ({typeCounts.image2image})
              </button>
            </div>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* 内容区域 */}
          {loading ? null : (
            <div className="mb-8 lg:mb-20">
              <MasonryGrid
                images={images}
                isLoading={false}
                emptyState={{
                  icon: noResultIcon,
                  title: "No creations yet",
                  description: "Start creating your first coloring page!"
                }}
                renderCard={renderCard}
              />
            </div>
          )}
        </div>
      </div>

      {/* 删除确认对话框 */}
      <DeleteImageConfirmDialog
        isOpen={!!showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(null)}
        onConfirm={() => showDeleteConfirm && handleDelete(showDeleteConfirm)}
      />

      {/* 举报对话框 */}
      {showReportDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Report Image</h3>
            <textarea
              value={reportContent}
              onChange={(e) => setReportContent(e.target.value)}
              placeholder="Please describe the issue with this image..."
              className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              maxLength={500}
            />
            <div className="text-right text-xs text-gray-500 mt-1">
              {reportContent.length}/500
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowReportDialog(null);
                  setReportContent('');
                }}
                className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => showReportDialog && handleReport(showReportDialog)}
                disabled={!reportContent.trim() || submittingReport}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Report
              </button>
            </div>
          </div>
        </div>
      )}

      <BackToTop />
    </Layout>
  );
};

export default CreationsPage; 