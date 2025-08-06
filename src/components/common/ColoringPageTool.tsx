import React from 'react';
import { useAsyncTranslation } from '../../contexts/LanguageContext';

export interface ColoringPageToolData {
  title: string;
  subtitle: string;
  description: string;
  images: {
    center: string | { left: string; right: string };
    topLeft: string;
    topRight: string;
    bottomLeft: string;
    bottomRight: string;
    farLeft: string;
    farRight: string;
  };
}

interface ColoringPageToolProps {
  className?: string;
  data: ColoringPageToolData;
}

const ColoringPageTool: React.FC<ColoringPageToolProps> = ({ 
  className = "",
  data
}) => {
  const { t } = useAsyncTranslation('common');
  return (
    <div className={`w-full max-w-[1170px] mx-auto px-4 ${className}`}>
      <div className="relative">
        {/* Title */}
        <div className="text-center mb-6">
          <h2 className="text-[46px] font-bold text-[#161616] capitalize leading-tight">
            {data.title}
          </h2>
        </div>
        
        {/* Subtitle */}
        <div className="text-center mb-8">
          <p className="text-lg text-[#161616] max-w-[900px] mx-auto">
            {data.subtitle}
          </p>
        </div>
        
        {/* Description */}
        <div className="text-center mb-12">
          <p className="text-lg text-[#6B7280] leading-[27px] max-w-[900px] mx-auto">
            {data.description}
          </p>
        </div>
        
        {/* Gallery Section */}
        <div className="relative">
          {/* Background container */}
          <div className="w-[1170px] h-[400px] bg-[#F9FAFB] rounded-2xl relative overflow-hidden">
            
            {/* Created by badge - positioned at top-right corner of container */}
            <button 
              className="absolute top-4 right-4 z-10 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              style={{
                paddingLeft: '20px',
                paddingRight: '20px',
                paddingTop: '12px',
                paddingBottom: '12px',
                background: 'rgba(255, 92, 7, 0.10)',
                borderRadius: '8px',
                backdropFilter: 'blur(5px)',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '4px',
                display: 'inline-flex',
                border: 'none'
              }}>
              <img 
                src="/images/text2image/star-2.svg" 
                alt="Colorpages logo"
                className="w-4 h-4"
              />
              <div style={{
                color: '#FF5C07',
                fontSize: '14px',
                fontFamily: 'Inter',
                fontWeight: 700,
                lineHeight: '21px',
                wordWrap: 'break-word'
              }}>
                {t('coloringPageTool.createdBy')}
              </div>
            </button>
            
            {/* Main center image */}
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
              {typeof data.images.center === 'string' ? (
                // Single image
                <img 
                  src={data.images.center} 
                  alt="Main coloring page example"
                  className="w-[360px] h-[360px] rounded-2xl border border-[#EDEEF0] object-cover"
                />
              ) : (
                // Split image - left and right comparison
                <div className="w-[360px] h-[360px] rounded-2xl border border-[#EDEEF0] relative" style={{ overflow: 'hidden' }}>
                  {/* Left half - colored image */}
                  <div 
                    className="absolute left-0 top-0 w-full h-full"
                    style={{
                      clipPath: 'polygon(0 0, 50% 0, 50% 100%, 0 100%)'
                    }}
                  >
                    <img 
                      src={data.images.center.left} 
                      alt="Colored version"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Right half - line art */}
                  <div 
                    className="absolute left-0 top-0 w-full h-full"
                    style={{
                      clipPath: 'polygon(50% 0, 100% 0, 100% 100%, 50% 100%)'
                    }}
                  >
                    <img 
                      src={data.images.center.right} 
                      alt="Line art version"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Divider line */}
                  <div className="absolute left-1/2 top-0 w-px h-full bg-white/50 z-10 transform -translate-x-px"></div>
                </div>
              )}
            </div>
            
            {/* Top left images */}
            <img 
              src={data.images.topLeft} 
              alt="Coloring page example"
              className="absolute left-[193px] top-11 w-[200px] h-[100px] rounded-2xl border border-[#EDEEF0] object-cover"
            />
            
            {/* Top right images */}
            <img 
              src={data.images.topRight} 
              alt="Coloring page example"
              className="absolute right-[193px] top-11 w-[200px] h-[100px] rounded-2xl border border-[#EDEEF0] object-cover"
            />
            
            {/* Bottom left images */}
            <img 
              src={data.images.bottomLeft} 
              alt="Coloring page example"
              className="absolute left-[193px] bottom-[42px] w-[200px] h-[200px] rounded-2xl border border-[#EDEEF0] object-cover"
            />
            
            {/* Bottom right images */}
            <img 
              src={data.images.bottomRight} 
              alt="Coloring page example"
              className="absolute right-[193px] bottom-[42px] w-[200px] h-[200px] rounded-2xl border border-[#EDEEF0] object-cover"
            />
            
            {/* Far left image */}
            <img 
              src={data.images.farLeft} 
              alt="Coloring page example"
              className="absolute left-5 top-1/2 transform -translate-y-1/2 w-[160px] h-[160px] rounded-2xl border border-[#EDEEF0] object-cover"
            />
            
            {/* Far right image */}
            <img 
              src={data.images.farRight} 
              alt="Coloring page example"
              className="absolute right-5 top-1/2 transform -translate-y-1/2 w-[160px] h-[160px] rounded-2xl border border-[#EDEEF0] object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColoringPageTool;