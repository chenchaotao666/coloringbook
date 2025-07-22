import React from 'react';

interface TextToColoringPageProps {
  className?: string;
}

const TextToColoringPage: React.FC<TextToColoringPageProps> = ({ 
  className = "" 
}) => {
  return (
    <div className={`w-full max-w-[1170px] mx-auto px-4 ${className}`}>
      <div className="relative">
        {/* Title */}
        <div className="text-center mb-6">
          <h2 className="text-[46px] font-bold text-[#161616] capitalize leading-tight">
            What Is a Text to Coloring Page Tool?
          </h2>
        </div>
        
        {/* Subtitle */}
        <div className="text-center mb-8">
          <p className="text-lg text-[#161616] max-w-[900px] mx-auto">
            AI makes it easier than ever to create coloring pages from your words.
          </p>
        </div>
        
        {/* Description */}
        <div className="text-center mb-12">
          <p className="text-lg text-[#6B7280] leading-[27px] max-w-[900px] mx-auto">
            Our Text to Coloring Page tool transforms simple text descriptions into unique, hand-drawn-style coloring pages. It's great for parents, teachers, creative explorers, or anyone who loves to imagine! This tool opens a world of fun, learning, and creativity, turning your words into black-and-white line drawings ready to print or share.
          </p>
        </div>
        
        {/* Gallery Section */}
        <div className="relative">
          {/* Background container */}
          <div className="w-full h-[400px] bg-[#F9FAFB] rounded-2xl relative overflow-hidden">
            
            {/* Main center image */}
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <img 
                src="/images/text2image/left-7.png" 
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
              src="/images/text2image/left-1.png" 
              alt="Coloring page example"
              className="absolute left-[193px] top-11 w-[200px] h-[100px] rounded-2xl border border-[#EDEEF0] object-cover"
            />
            
            {/* Top right images */}
            <img 
              src="/images/text2image/left-2.png" 
              alt="Coloring page example"
              className="absolute right-[193px] top-11 w-[200px] h-[100px] rounded-2xl border border-[#EDEEF0] object-cover"
            />
            
            {/* Bottom left images */}
            <img 
              src="/images/text2image/left-3.png" 
              alt="Coloring page example"
              className="absolute left-[193px] bottom-[42px] w-[200px] h-[200px] rounded-2xl border border-[#EDEEF0] object-cover"
            />
            
            {/* Bottom right images */}
            <img 
              src="/images/text2image/left-4.png" 
              alt="Coloring page example"
              className="absolute right-[193px] bottom-[42px] w-[200px] h-[200px] rounded-2xl border border-[#EDEEF0] object-cover"
            />
            
            {/* Far left image */}
            <img 
              src="/images/text2image/left-5.png" 
              alt="Coloring page example"
              className="absolute left-5 top-1/2 transform -translate-y-1/2 w-[160px] h-[160px] rounded-2xl border border-[#EDEEF0] object-cover"
            />
            
            {/* Far right image */}
            <img 
              src="/images/text2image/left-6.png" 
              alt="Coloring page example"
              className="absolute right-5 top-1/2 transform -translate-y-1/2 w-[160px] h-[160px] rounded-2xl border border-[#EDEEF0] object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextToColoringPage;