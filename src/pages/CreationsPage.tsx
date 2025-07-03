import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import MasonryGrid from '../components/layout/MasonryGrid';
import CreationImageCard from '../components/creations/CreationImageCard';
import { useAuth } from '../contexts/AuthContext';
import { ImageService, HomeImage } from '../services/imageService';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import CircularProgress from '../components/ui/CircularProgress';
import BackToTop from '../components/common/BackToTop';

// 图标导入
const noResultIcon = '/images/no-result.svg';

interface CreationsPageProps {}

const CreationsPage: React.FC<CreationsPageProps> = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  // 状态管理
  const [images, setImages] = useState<HomeImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<'all' | 'text2image' | 'image2image'>('all');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showReportDialog, setShowReportDialog] = useState<string | null>(null);
  const [reportContent, setReportContent] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);
  
  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const pageSize = 20;

  // 检查用户登录状态
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadUserImages();
  }, [isAuthenticated, selectedType]);

  // 加载用户图片
  const loadUserImages = async (page: number = 1, append: boolean = false) => {
    if (!user) return;
    
    try {
      if (!append) {
        setLoading(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }

      const searchParams: any = {
        userId: user.userId,
        currentPage: page,
        pageSize: pageSize
      };

      if (selectedType !== 'all') {
        searchParams.type = selectedType;
      }

      const result = await ImageService.searchImages(searchParams);
      
      if (append) {
        setImages(prev => [...prev, ...result.images]);
      } else {
        setImages(result.images);
      }
      
      setHasMore(result.hasMore);
      setCurrentPage(page);
    } catch (err) {
      console.error('Failed to load user images:', err);
      setError('加载图片失败，请稍后重试');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // 加载更多图片
  const loadMore = () => {
    if (!loadingMore && hasMore) {
      loadUserImages(currentPage + 1, true);
    }
  };

  // 删除图片
  const handleDelete = async (imageId: string) => {
    try {
      const success = await ImageService.deleteImage(imageId);
      if (success) {
        setImages(prev => prev.filter(img => img.id !== imageId));
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

  // 处理举报确认
  const handleReportConfirm = (imageId: string) => {
    setShowReportDialog(imageId);
  };

  // 自定义渲染卡片
  const renderCard = (image: HomeImage, _index: number) => (
    <CreationImageCard
      key={image.id}
      image={image}
      onDelete={handleDeleteConfirm}
      onReport={handleReportConfirm}
    />
  );

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* 页面标题 */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Creations</h1>
            <p className="text-gray-600">View and manage all your generated coloring pages</p>
          </div>

          {/* 筛选标签 */}
          <div className="mb-6">
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedType('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedType === 'all'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                All ({images.length})
              </button>
              <button
                onClick={() => setSelectedType('text2image')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedType === 'text2image'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Text to Image
              </button>
              <button
                onClick={() => setSelectedType('image2image')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedType === 'image2image'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Image to Image
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
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <CircularProgress progress={0} size="large" showPercentage={false} />
            </div>
          ) : (
            <>
                        <MasonryGrid
            images={images}
            isLoading={loading}
            emptyState={{
              icon: noResultIcon,
              title: "No creations yet",
              description: "Start creating your first coloring page!",
              actionButton: {
                text: "Create Now",
                onClick: () => {
                  // 根据当前筛选类型跳转到对应页面
                  if (selectedType === 'text2image') {
                    navigate('/text-coloring-page');
                  } else if (selectedType === 'image2image') {
                    navigate('/image-coloring-page');
                  } else {
                    // 默认跳转到text to image页面
                    navigate('/text-coloring-page');
                  }
                }
              }
            }}
            renderCard={renderCard}
            className="mb-8"
          />

              {/* 加载更多按钮 */}
              {hasMore && images.length > 0 && (
                <div className="text-center mt-8">
                  <button
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingMore ? 'Loading...' : 'Load More'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* 删除确认对话框 */}
      <ConfirmDialog
        isOpen={!!showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(null)}
        onConfirm={() => showDeleteConfirm && handleDelete(showDeleteConfirm)}
        message="Are you sure you want to delete this image? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonVariant="danger"
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
                {submittingReport ? 'Submitting...' : 'Report'}
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