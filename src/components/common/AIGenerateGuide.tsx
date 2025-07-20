import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAsyncTranslation } from '../../contexts/LanguageContext';
import { navigateWithLanguage } from '../../utils/navigationUtils';

const AIGenerateGuide: React.FC = () => {
  const { t } = useAsyncTranslation('categories');
  const navigate = useNavigate();
  const { language } = useLanguage();

  const handleTextToImageClick = () => {
    navigateWithLanguage(navigate, '/generate');
  };

  const handleImageToImageClick = () => {
    navigateWithLanguage(navigate, '/image-coloring-page');
  };

  return (
    <div className="max-w-[1380px] mx-auto mb-12">
      <div className="flex flex-col gap-4 md:grid md:grid-cols-2 md:gap-6 xl:gap-6">
        {/* 文字转填色页 */}
        <div className="col-span-1 bg-white border border-[#E5E7EB] rounded-xl p-5 w-[660px] h-[380px]" style={{ boxShadow: 'rgba(0, 0, 0, 0.1) 0px 10px 15px 0px' }}>
          <div className="relative">
            <img 
              src="/images/guide2.png" 
              alt={t('detail.aiGuide.textToImage.alt', 'Text to Image')}
              className="w-full h-auto rounded-lg"
            />
            <span className="absolute flex items-center gap-1 px-4 py-2 bottom-3 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
                <g clipPath="url(#clip0_67_1922)">
                  <g>
                    <path d="M8.66634 1.99967L9.82246 5.00558C10.0105 5.4944 10.1045 5.73881 10.2507 5.9444C10.3802 6.12661 10.5394 6.2858 10.7216 6.41536C10.9272 6.56154 11.1716 6.65555 11.6604 6.84356L14.6663 7.99967L11.6604 9.15579C11.1716 9.3438 10.9272 9.4378 10.7216 9.58399C10.5394 9.71355 10.3802 9.87274 10.2507 10.055C10.1045 10.2605 10.0105 10.5049 9.82246 10.9938L8.66634 13.9997L7.51022 10.9938C7.32221 10.5049 7.22821 10.2605 7.08203 10.055C6.95247 9.87274 6.79327 9.71355 6.61107 9.58399C6.40548 9.4378 6.16107 9.3438 5.67225 9.15579L2.66634 7.99967L5.67225 6.84356C6.16107 6.65555 6.40548 6.56154 6.61106 6.41536C6.79327 6.2858 6.95247 6.12661 7.08203 5.9444C7.22821 5.73881 7.32221 5.4944 7.51022 5.00558L8.66634 1.99967Z" fill="#111827" />
                    <path d="M2.99967 14.6663V11.333M2.99967 4.66634V1.33301M1.33301 2.99967H4.66634M1.33301 12.9997H4.66634M8.66634 1.99967L7.51022 5.00558C7.32221 5.4944 7.22821 5.73881 7.08203 5.9444C6.95247 6.12661 6.79327 6.2858 6.61106 6.41536C6.40548 6.56154 6.16107 6.65555 5.67225 6.84356L2.66634 7.99967L5.67225 9.15579C6.16107 9.3438 6.40548 9.4378 6.61107 9.58399C6.79327 9.71355 6.95247 9.87274 7.08203 10.055C7.22821 10.2605 7.32221 10.5049 7.51022 10.9938L8.66634 13.9997L9.82246 10.9938C10.0105 10.5049 10.1045 10.2605 10.2507 10.055C10.3802 9.87274 10.5394 9.71355 10.7216 9.58399C10.9272 9.4378 11.1716 9.3438 11.6604 9.15579L14.6663 7.99967L11.6604 6.84356C11.1716 6.65555 10.9272 6.56154 10.7216 6.41536C10.5394 6.2858 10.3802 6.12661 10.2507 5.9444C10.1045 5.73881 10.0105 5.4944 9.82246 5.00558L8.66634 1.99967Z" stroke="#111827" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
                  </g>
                </g>
                <defs>
                  <clipPath id="clip0_67_1922">
                    <rect width="16" height="16" fill="white" />
                  </clipPath>
                </defs>
              </svg>
              <span className="text-sm font-medium text-[#111827]">
                {t('detail.aiGuide.textToImage.badge', '独角兽在云端跳舞')}
              </span>
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4 mt-4 sm:flex-nowrap">
            <div>
              <p className="text-lg text-[#111827] font-semibold">
                {t('detail.aiGuide.textToImage.title', '文字转填色页工具')}
              </p>
              <p className="text-sm mt-1 text-[#6B7280]">
                {t('detail.aiGuide.textToImage.description', '从幼儿到成人，支持4种难度的选择')}
              </p>
            </div>
            <button
              onClick={handleTextToImageClick}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-gradient-to-r from-[#FF9D00] to-[#FF5907] text-white hover:from-[#FFB84D] hover:to-[#FF7A47] transition-all duration-300 h-12 px-6 py-2 text-base font-bold flex-shrink-0 w-full sm:w-auto"
            >
              {t('detail.aiGuide.textToImage.button', '立即生成')}
            </button>
          </div>
        </div>

        {/* 图片变成填色页 */}
        <div className="col-span-1 bg-white border border-[#E5E7EB] rounded-xl p-5 w-[660px] h-[380px]" style={{ boxShadow: 'rgba(0, 0, 0, 0.1) 0px 10px 15px 0px' }}>
          <div className="relative">
            <img 
              src="/images/guide1.png" 
              alt={t('detail.aiGuide.imageToImage.alt', 'Image to Image')}
              className="w-full h-auto rounded-lg"
            />
            <span className="absolute flex items-center gap-1 px-4 py-2 bottom-3 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
                <g clipPath="url(#clip0_67_1922_2)">
                  <g>
                    <path d="M8.66634 1.99967L9.82246 5.00558C10.0105 5.4944 10.1045 5.73881 10.2507 5.9444C10.3802 6.12661 10.5394 6.2858 10.7216 6.41536C10.9272 6.56154 11.1716 6.65555 11.6604 6.84356L14.6663 7.99967L11.6604 9.15579C11.1716 9.3438 10.9272 9.4378 10.7216 9.58399C10.5394 9.71355 10.3802 9.87274 10.2507 10.055C10.1045 10.2605 10.0105 10.5049 9.82246 10.9938L8.66634 13.9997L7.51022 10.9938C7.32221 10.5049 7.22821 10.2605 7.08203 10.055C6.95247 9.87274 6.79327 9.71355 6.61107 9.58399C6.40548 9.4378 6.16107 9.3438 5.67225 9.15579L2.66634 7.99967L5.67225 6.84356C6.16107 6.65555 6.40548 6.56154 6.61106 6.41536C6.79327 6.2858 6.95247 6.12661 7.08203 5.9444C7.22821 5.73881 7.32221 5.4944 7.51022 5.00558L8.66634 1.99967Z" fill="#111827" />
                    <path d="M2.99967 14.6663V11.333M2.99967 4.66634V1.33301M1.33301 2.99967H4.66634M1.33301 12.9997H4.66634M8.66634 1.99967L7.51022 5.00558C7.32221 5.4944 7.22821 5.73881 7.08203 5.9444C6.95247 6.12661 6.79327 6.2858 6.61106 6.41536C6.40548 6.56154 6.16107 6.65555 5.67225 6.84356L2.66634 7.99967L5.67225 9.15579C6.16107 9.3438 6.40548 9.4378 6.61107 9.58399C6.79327 9.71355 6.95247 9.87274 7.08203 10.055C7.22821 10.2605 7.32221 10.5049 7.51022 10.9938L8.66634 13.9997L9.82246 10.9938C10.0105 10.5049 10.1045 10.2605 10.2507 10.055C10.3802 9.87274 10.5394 9.71355 10.7216 9.58399C10.9272 9.4378 11.1716 9.3438 11.6604 9.15579L14.6663 7.99967L11.6604 6.84356C11.1716 6.65555 10.9272 6.56154 10.7216 6.41536C10.5394 6.2858 10.3802 6.12661 10.2507 5.9444C10.1045 5.73881 10.0105 5.4944 9.82246 5.00558L8.66634 1.99967Z" stroke="#111827" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
                  </g>
                </g>
                <defs>
                  <clipPath id="clip0_67_1922_2">
                    <rect width="16" height="16" fill="white" />
                  </clipPath>
                </defs>
              </svg>
              <span className="text-sm font-medium text-[#111827]">
                {t('detail.aiGuide.imageToImage.badge', '一键转换')}
              </span>
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4 mt-4 sm:flex-nowrap">
            <div>
              <p className="text-lg text-[#111827] font-semibold">
                {t('detail.aiGuide.imageToImage.title', '图片变成填色页工具')}
              </p>
              <p className="text-sm mt-1 text-[#6B7280]">
                {t('detail.aiGuide.imageToImage.description', '把你的图片，变成填色页')}
              </p>
            </div>
            <button
              onClick={handleImageToImageClick}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-gradient-to-r from-[#FF9D00] to-[#FF5907] text-white hover:from-[#FFB84D] hover:to-[#FF7A47] transition-all duration-300 h-12 px-6 py-2 text-base font-bold flex-shrink-0 w-full sm:w-auto"
            >
              {t('detail.aiGuide.imageToImage.button', '立即生成')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIGenerateGuide;