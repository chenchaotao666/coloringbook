import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HoverColorImage from './HoverColorImage';
import { HomeImage, ImageService } from '../../services/imageService';
import { downloadImageById } from '../../utils/downloadUtils';
const downloadIcon = '/images/download.svg';
const downloadColorIcon = '/images/download-hover.svg';
const moreIcon = '/images/more.svg';
const deleteIcon = '/images/delete.svg';
const reportIcon = '/images/report.svg';

interface HoverImageCardProps {
  image: HomeImage;
  title: string;
  tags: string[];
  className?: string;
  variant?: 'default' | 'category'; // 添加变体参数
  onImageDeleted?: (imageId: string) => void; // 删除回调
}

const HoverImageCard: React.FC<HoverImageCardProps> = ({ 
  image, 
  title, 
  tags, 
  className = '',
  variant = 'default',
  onImageDeleted
}) => {
  const navigate = useNavigate();
  const [isDownloadingPng, setIsDownloadingPng] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [pngHovered, setPngHovered] = useState(false);
  const [pdfHovered, setPdfHovered] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const handleDownload = async (format: 'png' | 'pdf', event?: React.MouseEvent) => {
    // 阻止事件冒泡，避免触发卡片点击
    if (event) {
      event.stopPropagation();
    }
    
    try {
      if (format === 'png') {
        setIsDownloadingPng(true);
      } else {
        setIsDownloadingPdf(true);
      }

      // 使用共用的下载函数
      const fileName = `coloring-page-${image.id}.${format}`;
      await downloadImageById(image.id, format, fileName);
    } catch (error) {
      console.error('Download failed:', error);
      // 可以在这里添加错误提示
    } finally {
      if (format === 'png') {
        setIsDownloadingPng(false);
      } else {
        setIsDownloadingPdf(false);
      }
    }
  };

  const handleCardClick = () => {
    // 导航到图片详情页
    navigate(`/image/${image.id}`);
  };

  const handleMoreMenuToggle = (event: React.MouseEvent) => {
    event.stopPropagation();
    setShowMoreMenu(!showMoreMenu);
  };

  const handleDelete = async (event: React.MouseEvent) => {
    event.stopPropagation();
    
    try {
      // 显示确认对话框
      const confirmed = window.confirm('确定要删除这张图片吗？此操作无法撤销。');
      if (!confirmed) {
        setShowMoreMenu(false);
        return;
      }

      // 调用删除API
      const success = await ImageService.deleteImage(image.id);
      
      if (success) {
        // 显示成功提示
        alert('图片删除成功！');
        
        // 调用回调函数通知父组件
        if (onImageDeleted) {
          onImageDeleted(image.id);
        }
      } else {
        // 删除失败
        alert('删除图片失败，请稍后重试。');
      }
    } catch (error) {
      console.error('Delete image error:', error);
      alert('删除图片时发生错误，请稍后重试。');
    } finally {
      setShowMoreMenu(false);
    }
  };

  const handleReport = (event: React.MouseEvent) => {
    event.stopPropagation();
    // TODO: 实现举报功能
    console.log('Report image:', image.id);
    alert('举报功能正在开发中...');
    setShowMoreMenu(false);
  };

  // 点击外部关闭更多选项菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showMoreMenu) {
        const target = event.target as Element;
        if (!target.closest('.more-menu-container')) {
          setShowMoreMenu(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMoreMenu]);

  return (
    <div 
      className={`pt-[1px] pb-3 bg-white rounded-2xl border border-[#EDEEF0] flex flex-col hover:shadow-lg transition-shadow duration-300 cursor-pointer ${className}`}
      onClick={handleCardClick}
    >
      <div className="w-full flex flex-col gap-4">
        {/* 图片区域 */}
        <div className="w-full overflow-hidden rounded-t-2xl">
          {variant === 'category' ? (
            /* 分类卡片：直接显示图片，不需要hover效果 */
            <img 
              src={image.defaultUrl}
              alt={title}
              className="w-full h-auto object-cover"
              onError={(e) => {
                // 如果图片加载失败，使用占位符
                const target = e.target as HTMLImageElement;
                target.src = `https://placehold.co/276x276/F2F3F5/6B7280?text=${encodeURIComponent(title)}`;
              }}
            />
          ) : (
            /* 默认：使用hover效果 */
            <HoverColorImage 
              homeImage={image}
              className="w-full h-auto"
              alt={title}
            />
          )}
        </div>
        
        {/* 内容区域 */}
        <div className="self-stretch px-3 flex flex-col items-start gap-2">
        <div className="w-full">
          <div className="w-full text-[#161616] text-base font-medium capitalize leading-5">
            {title}
          </div>
        </div>
        
        {/* 标签 */}
        <div className="self-stretch flex flex-wrap items-center gap-2">
          {tags.map((tag, index) => (
            <div 
              key={index}
              className="px-2 py-1 bg-[#F9FAFB] rounded-xl flex justify-center items-center"
            >
              <div className="text-[#6B7280] text-xs font-normal leading-4">
                {variant === 'category' ? tag : `#${tag}`}
              </div>
            </div>
          ))}
        </div>

        {/* 根据variant渲染不同的底部内容 */}
        {variant === 'category' ? (
          /* 分类卡片：显示描述和查看按钮 */
          <>
            {image.description && (
              <div className="w-full">
                <div className="text-[#6B7280] text-sm leading-4">
                  {image.description}
                </div>
              </div>
            )}
            <div className="w-full">
              <div className="w-full py-1.5 text-[#6B7280] text-sm text-center border border-[#EDEEF0] rounded hover:bg-[#FF5C07] hover:text-white hover:border-[#FF5C07] transition-all duration-200">
                View Images
              </div>
            </div>
          </>
        ) : (
          /* 默认：显示下载按钮和更多选项 */
          <div className="w-full flex gap-2">
            <button 
              onClick={(e) => handleDownload('png', e)}
              onMouseEnter={() => setPngHovered(true)}
              onMouseLeave={() => setPngHovered(false)}
              disabled={isDownloadingPng}
              className={`flex-1 py-1.5 rounded flex justify-center items-center gap-1 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border ${pngHovered ? 'border-[#FF5C07]' : 'border-[#EDEEF0]'}`}
            >
              <div className="w-4 h-4 relative overflow-hidden">
                <img 
                  src={pngHovered ? downloadColorIcon : downloadIcon} 
                  alt="Download" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div className={`text-sm font-normal leading-4 ${pngHovered ? 'text-[#FF5C07]' : 'text-[#6B7280]'}`}>
                {isDownloadingPng ? '下载中...' : 'PNG'}
              </div>
            </button>
            <button 
              onClick={(e) => handleDownload('pdf', e)}
              onMouseEnter={() => setPdfHovered(true)}
              onMouseLeave={() => setPdfHovered(false)}
              disabled={isDownloadingPdf}
              className={`flex-1 py-1.5 rounded flex justify-center items-center gap-1 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border ${pdfHovered ? 'border-[#FF5C07]' : 'border-[#EDEEF0]'}`}
            >
              <div className="w-4 h-4 relative overflow-hidden">
                <img 
                  src={pdfHovered ? downloadColorIcon : downloadIcon} 
                  alt="Download" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div className={`text-sm font-normal leading-4 ${pdfHovered ? 'text-[#FF5C07]' : 'text-[#6B7280]'}`}>
                {isDownloadingPdf ? '下载中...' : 'PDF'}
              </div>
            </button>
            
            {/* 更多选项按钮 */}
            <div className="relative more-menu-container">
              <button 
                onClick={handleMoreMenuToggle}
                className="w-8 h-8 rounded flex items-center justify-center hover:bg-gray-50 transition-colors border border-[#EDEEF0]"
              >
                <img src={moreIcon} alt="More options" className="w-4 h-4" />
              </button>

              {/* 下拉菜单 */}
              {showMoreMenu && (
                <div className="absolute top-full mt-1 right-0 bg-white border border-[#E5E7EB] rounded-lg shadow-lg py-1 min-w-[100px] z-50">
                  <button
                    onClick={handleDelete}
                    className="w-full px-3 py-1.5 text-left text-[#161616] hover:bg-gray-50 flex items-center gap-2 transition-colors text-sm"
                  >
                    <img src={deleteIcon} alt="Delete" className="w-3 h-3" />
                    <span>Delete</span>
                  </button>
                  <button
                    onClick={handleReport}
                    className="w-full px-3 py-1.5 text-left text-[#161616] hover:bg-gray-50 flex items-center gap-2 transition-colors text-sm"
                  >
                    <img src={reportIcon} alt="Report" className="w-3 h-3" />
                    <span>Report</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default HoverImageCard; 