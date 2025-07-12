import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HoverColorImage from './HoverColorImage';
import { HomeImage } from '../../services/imageService';
import { downloadImageByUrl, downloadImageAsPdf } from '../../utils/downloadUtils';
import { useLanguage } from '../../contexts/LanguageContext';
import { getLocalizedText } from '../../utils/textUtils';
import { getImageNameById } from '../../utils/imageUtils';
const downloadIcon = '/images/download.svg';
const downloadColorIcon = '/images/download-hover.svg';

interface HoverImageCardProps {
  image: HomeImage;
  title: string;
  tags: string[];
  className?: string;
  variant?: 'default' | 'category'; // 添加变体参数
}

const HoverImageCard: React.FC<HoverImageCardProps> = ({ 
  image, 
  title, 
  tags, 
  className = '',
  variant = 'default'
}) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [isDownloadingPng, setIsDownloadingPng] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [pngHovered, setPngHovered] = useState(false);
  const [pdfHovered, setPdfHovered] = useState(false);

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

      // 生成文件名
      const imageTitle = getLocalizedText(image.title, language);
      const fileName = `coloring-page-${imageTitle.replace(/[^a-zA-Z0-9]/g, '-').substring(0, 20)}-${image.id.slice(-8)}.${format}`;
      
      // 根据格式选择不同的下载方式
      if (format === 'png') {
        await downloadImageByUrl(image.defaultUrl, fileName);
      } else {
        await downloadImageAsPdf(image.defaultUrl, fileName);
      }
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
    // 导航到图片详情页，使用SEO友好的图片路径
    const imagePath = getImageNameById(image.id);
    navigate(`/image/${imagePath}`);
  };



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
        <div className="self-stretch px-2 sm:px-3 flex flex-col items-start gap-1.5 sm:gap-2">
        <div className="w-full">
          <div className="w-full text-[#161616] text-sm sm:text-base font-medium capitalize leading-tight sm:leading-5 line-clamp-2">
            {title}
          </div>
        </div>
        
        {/* 标签 */}
        <div className="self-stretch flex flex-wrap items-center gap-1 sm:gap-2">
          {tags.map((tag, index) => (
            <div 
              key={index}
              className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-[#F9FAFB] rounded-lg sm:rounded-xl flex justify-center items-center min-w-0 flex-shrink-0"
            >
              <div className="text-[#6B7280] text-[10px] sm:text-xs font-normal leading-tight sm:leading-4 truncate">
                {variant === 'category' ? tag : `#${tag}`}
              </div>
            </div>
          ))}
        </div>

        {/* 根据variant渲染不同的底部内容 */}
        {variant === 'category' ? (
          /* 分类卡片：显示描述和查看按钮 */
          <>
            {getLocalizedText(image.description, language) && (
              <div className="w-full">
                <div className="text-[#6B7280] text-sm leading-4">
                  {getLocalizedText(image.description, language)}
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
          /* 默认：显示下载按钮 */
          <div className="w-full flex gap-1 sm:gap-2">
            <button 
              onClick={(e) => handleDownload('png', e)}
              onMouseEnter={() => setPngHovered(true)}
              onMouseLeave={() => setPngHovered(false)}
              disabled={isDownloadingPng}
              className={`flex-1 py-1 sm:py-1.5 rounded flex justify-center items-center gap-0.5 sm:gap-1 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border ${pngHovered ? 'border-[#FF5C07]' : 'border-[#EDEEF0]'}`}
            >
              <div className="w-3 h-3 sm:w-4 sm:h-4 relative overflow-hidden">
                <img 
                  src={pngHovered ? downloadColorIcon : downloadIcon} 
                  alt="Download" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div className={`text-xs sm:text-sm font-normal leading-3 sm:leading-4 ${pngHovered ? 'text-[#FF5C07]' : 'text-[#6B7280]'}`}>
                {isDownloadingPng ? '下载中...' : 'PNG'}
              </div>
            </button>
            <button 
              onClick={(e) => handleDownload('pdf', e)}
              onMouseEnter={() => setPdfHovered(true)}
              onMouseLeave={() => setPdfHovered(false)}
              disabled={isDownloadingPdf}
              className={`flex-1 py-1 sm:py-1.5 rounded flex justify-center items-center gap-0.5 sm:gap-1 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border ${pdfHovered ? 'border-[#FF5C07]' : 'border-[#EDEEF0]'}`}
            >
              <div className="w-3 h-3 sm:w-4 sm:h-4 relative overflow-hidden">
                <img 
                  src={pdfHovered ? downloadColorIcon : downloadIcon} 
                  alt="Download" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div className={`text-xs sm:text-sm font-normal leading-3 sm:leading-4 ${pdfHovered ? 'text-[#FF5C07]' : 'text-[#6B7280]'}`}>
                {isDownloadingPdf ? '下载中...' : 'PDF'}
              </div>
            </button>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default HoverImageCard; 