import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HoverColorImage from '../home/HoverColorImage';
import { HomeImage } from '../../services/imageService';
import { downloadImageByUrl, downloadImageAsPdf } from '../../utils/downloadUtils';
import { useLanguage } from '../../contexts/LanguageContext';
import { getLocalizedText } from '../../utils/textUtils';
import { getImageNameById } from '../../utils/imageUtils';

const downloadIcon = '/images/download.svg';
const downloadColorIcon = '/images/download-hover.svg';
const moreIcon = '/images/more.svg';
const deleteIcon = '/images/delete.svg';
const reportIcon = '/images/report.svg';

interface CreationImageCardProps {
  image: HomeImage;
  className?: string;
  onDelete?: (imageId: string) => void;
  onReport?: (imageId: string) => void;
}

const CreationImageCard: React.FC<CreationImageCardProps> = ({ 
  image, 
  className = '',
  onDelete,
  onReport
}) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
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

      // 生成文件名
      const imageTitle = getLocalizedText(image.title, language) || 'untitled';
      const fileName = `coloring-page-${imageTitle.replace(/[^a-zA-Z0-9]/g, '-').substring(0, 20)}-${image.id.slice(-8)}.${format}`;
      
      // 根据格式选择不同的下载方式
      if (format === 'png') {
        await downloadImageByUrl(image.defaultUrl, fileName);
      } else {
        await downloadImageAsPdf(image.defaultUrl, fileName);
      }
    } catch (error) {
      console.error('Download failed:', error);
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

  const handleRecreate = async (event: React.MouseEvent) => {
    event.stopPropagation();
    
    // 根据图片类型跳转到对应页面
    if (image.type === 'text2image') {
      // 构建查询参数
      const params = new URLSearchParams();
      const promptText = getLocalizedText(image.prompt, language);
      if (promptText) params.set('prompt', promptText);
      if (image.ratio) params.set('ratio', image.ratio);
      if (image.isPublic !== undefined) params.set('isPublic', image.isPublic.toString());
      
      navigate(`/text-coloring-page?${params.toString()}`);
    } else {
      // Image to Image 类型 - 需要将原始彩色图片传递过去
      const params = new URLSearchParams();
      if (image.isPublic !== undefined) params.set('isPublic', image.isPublic.toString());
      // 传递原始彩色图片URL，用于在GeneratePage中下载并填充到上传组件
      if (image.colorUrl) params.set('sourceImageUrl', image.colorUrl);
      
      navigate(`/image-coloring-page?${params.toString()}`);
    }
  };

  const handleMoreClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    setShowMoreMenu(!showMoreMenu);
  };

  const handleDelete = (event: React.MouseEvent) => {
    event.stopPropagation();
    setShowMoreMenu(false);
    if (onDelete) {
      onDelete(image.id);
    }
  };

  const handleReport = (event: React.MouseEvent) => {
    event.stopPropagation();
    setShowMoreMenu(false);
    if (onReport) {
      onReport(image.id);
    }
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
  };

  // 点击外部关闭菜单
  React.useEffect(() => {
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
      className={`group pt-[1px] pb-3 bg-white rounded-2xl border border-[#EDEEF0] flex flex-col hover:shadow-lg transition-shadow duration-300 cursor-pointer ${className}`}
      onClick={handleCardClick}
    >
      <div className="w-full flex flex-col gap-4">
        {/* 图片区域 */}
        <div className="w-full overflow-hidden rounded-t-2xl relative">
          {image.type === 'image2image' ? (
            <HoverColorImage 
              homeImage={{
                ...image,
                coloringUrl: image.colorUrl || image.defaultUrl // 使用colorUrl作为hover效果的图片
              }}
              className="w-full h-auto"
              alt={getLocalizedText(image.title, language) || getLocalizedText(image.description, language)}
            />
          ) : (
            <img 
              src={image.defaultUrl}
              className="w-full h-auto"
              alt={getLocalizedText(image.title, language) || getLocalizedText(image.description, language)}
            />
          )}
          
          {/* Recreate按钮 */}
          <div className="absolute top-3 left-3">
            <button
              onClick={handleRecreate}
              className="inline-flex items-center justify-center whitespace-nowrap ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-gradient-to-r from-[#FF9D00] to-[#FF5907] text-white hover:from-[#FFB84D] hover:to-[#FF7A47] transition-all duration-300 px-3 py-1.5 rounded-full text-xs font-bold cursor-pointer"
            >
              Recreate
            </button>
          </div>

          {/* 比例标签 - 只对text2image显示 */}
          {image.ratio && image.type === 'text2image' && (
            <div className="absolute top-2 right-2">
              <span className="bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                {image.ratio}
              </span>
            </div>
          )}
        </div>
        
        {/* 内容区域 */}
        <div className="self-stretch px-2 sm:px-3 flex flex-col items-start gap-1.5 sm:gap-2">
          {/* 标题 */}
          {getLocalizedText(image.title, language) && (
            <div className="w-full">
              <div 
                className="w-full text-[#161616] text-sm sm:text-base font-medium leading-tight sm:leading-5 break-words line-clamp-2"
                title={getLocalizedText(image.title, language)}
              >
                {getLocalizedText(image.title, language)}
              </div>
            </div>
          )}

          {/* 描述 */}
          {getLocalizedText(image.description, language) && (
            <div className="w-full">
              <div 
                className="text-[#6B7280] text-xs sm:text-sm leading-4 break-words line-clamp-3"
                title={getLocalizedText(image.description, language)}
              >
                {getLocalizedText(image.description, language)}
              </div>
            </div>
          )}

          {/* Prompt（仅对text2image显示） */}
          {image.type === 'text2image' && getLocalizedText(image.prompt, language) && (
            <div className="w-full">
              <div className="text-[#6B7280] text-xs bg-gray-50 rounded p-2">
                <div className="line-clamp-3 group-hover:line-clamp-none transition-all duration-200">
                  {getLocalizedText(image.prompt, language)}
                </div>
                {getLocalizedText(image.prompt, language).length > 100 && (
                  <div className="text-[10px] text-gray-400 mt-1 text-right">
                    悬停查看完整内容
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 元信息 */}
          <div className="w-full">
            {/* 移动端：垂直布局 */}
            <div className="flex flex-col gap-2 sm:hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">{formatDate(image.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2">
                {/* 类型标签 */}
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  image.type === 'text2image' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {image.type === 'text2image' ? 'Text To Image' : 'Image To Image'}
                </span>
                {/* 公开状态标签 - 只显示public */}
                {Number(image.isPublic) === 1 && (
                  <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-700">
                    Public
                  </span>
                )}
              </div>
            </div>
            
            {/* 桌面端：水平布局 */}
            <div className="hidden sm:flex items-center justify-between text-xs text-gray-500">
              <span>{formatDate(image.createdAt)}</span>
              <div className="flex items-center gap-2">
                {/* 类型标签 */}
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  image.type === 'text2image' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {image.type === 'text2image' ? 'Text To Image' : 'Image To Image'}
                </span>
                {/* 公开状态标签 - 只显示public */}
                {Number(image.isPublic) === 1 && (
                  <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-700">
                    Public
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="w-full flex gap-1 sm:gap-2">
            {/* 下载按钮 */}
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

            {/* 更多操作按钮 */}
            <div className="relative more-menu-container">
              <button
                onClick={handleMoreClick}
                className="py-1 sm:py-1.5 px-2 rounded border border-[#EDEEF0] hover:bg-gray-50 transition-colors"
              >
                <img src={moreIcon} alt="More" className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>

              {/* 下拉菜单 */}
              {showMoreMenu && (
                <div className="absolute top-full mt-1 right-0 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[100px] z-50">
                  <button
                    onClick={handleDelete}
                    className="w-full px-3 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2 text-xs"
                  >
                    <img src={deleteIcon} alt="Delete" className="w-3 h-3" />
                    Delete
                  </button>
                  {/* <button
                    onClick={handleReport}
                    className="w-full px-3 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2 text-xs"
                  >
                    <img src={reportIcon} alt="Report" className="w-3 h-3" />
                    Report
                  </button> */}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreationImageCard; 