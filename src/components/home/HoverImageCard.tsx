import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HoverColorImage from './HoverColorImage';
import { HomeImage } from '../../services/imageService';
import { downloadImageById } from '../../utils/downloadUtils';
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
          /* 默认：显示下载按钮 */
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
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default HoverImageCard; 