import React from 'react';

export interface ColoringPageToolData {
  title: string;
  subtitle: string;
  description: string;
  images: {
    center: string;
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
          <div className="w-full h-[400px] bg-[#F9FAFB] rounded-2xl relative overflow-hidden">
            
            {/* Main center image */}
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <img 
                src={data.images.center} 
                alt="Main coloring page example"
                className="w-[360px] h-[360px] rounded-2xl border border-[#EDEEF0] object-cover"
              />
              
              {/* Created by badge */}
              <div className="absolute top-0 right-[-86px] bg-[rgba(255,92,7,0.10)] backdrop-blur-[5px] rounded-lg px-5 py-3">
                <span className="text-[#FF5C07] text-sm font-bold">
                  Created By Colorpages
                </span>
              </div>
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