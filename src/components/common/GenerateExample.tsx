import React, { useState } from 'react';

interface ImageSlide {
  url: string;
  colorUrl?: string;
  coloringUrl?: string;
  prompt: string;
}

interface GenerateExampleProps {
  className?: string;
  title?: string;
  description?: string;
  type?: 'text' | 'image';
  images?: ImageSlide[];
}

const GenerateExample: React.FC<GenerateExampleProps> = ({ 
  className = "",
  title = "Text to Coloring Page Generator",
  description = "Just type what you imagine—like \"a unicorn surfing on a rainbow\"—and get a printable coloring page in seconds.",
  type = "text",
  images = [
    {
      url: "/images/generateexample/example-1.png",
      prompt: "Two children, children's theme, ocean scene"
    },
    {
      url: "/images/generateexample/example-2.png",
      prompt: "A unicorn surfing on a rainbow"
    },
    {
      url: "/images/generateexample/example-3.png", 
      prompt: "A cat playing guitar under the stars"
    },
    {
      url: "/images/generateexample/example-4.png",
      prompt: "A pirate ship sailing through the clouds"
    }
  ]
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const currentImage = images?.[currentImageIndex];

  const handleDotClick = (index: number) => {
    setCurrentImageIndex(index);
  };

  const handlePrevClick = () => {
    setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : Math.max(0, images.length - 1)));
  };

  const handleNextClick = () => {
    setCurrentImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className={`w-full bg-[#F9FAFB] ${className}`}>
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center gap-8 max-w-[1400px] mx-auto relative">
          
          {/* Top - Text content */}
          <div className="w-full text-center">
            <h2 className="text-[32px] font-bold text-[#161616] capitalize leading-tight mb-6">
              {title}
            </h2>
            <p className="text-[14px] text-[#6B7280] leading-relaxed max-w-[600px] mx-auto">
              {description}
            </p>
          </div>

          {/* Left arrow - outside image */}
          <button
            onClick={handlePrevClick}
            className="flex-shrink-0 w-12 h-12 bg-[#D7D8DB] rounded-full flex items-center justify-center hover:bg-gray-400 transition-all duration-200 z-10 absolute left-20 top-1/2 transform -translate-y-1/2"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 6L9 12L15 18" stroke="#FFFAFA" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Right arrow - outside image */}
          <button
            onClick={handleNextClick}
            className="flex-shrink-0 w-12 h-12 bg-[#D7D8DB] rounded-full flex items-center justify-center hover:bg-gray-400 transition-all duration-200 z-10 absolute right-20 top-1/2 transform -translate-y-1/2"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 6L15 12L9 18" stroke="#FFFAFA" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Bottom - Image carousel */}
          <div className="w-full flex flex-col items-center gap-6">
            
            {/* Main carousel area */}
            <div className="flex items-center justify-center">

              {/* Image container with decorative elements */}
              <div className="relative">
                
                {type === 'text' ? (
                  <>
                    {/* Text mode - Single image */}
                    {currentImage && (
                      <img 
                        src={currentImage.url}
                        alt={`Coloring page: ${currentImage.prompt}`}
                        className="block rounded-2xl border border-[#EDEEF0]"
                        style={{
                          height: '560px',
                          width: 'auto',
                          objectFit: 'cover'
                        }}
                      />
                    )}

                    {/* Left logo - AI icon (一半在图片上，一半在外面) */}
                    <img 
                      src="/images/generateexample/AI.svg"
                      alt="AI"
                      className="absolute z-10"
                      style={{
                        width: '130px',
                        height: '130px',
                        left: '-45px', // 一半在外面 (110px / 2 = 55px)
                        top: '265px', // 垂直居中位置 (360px / 2 - 55px = 125px)
                        transform: 'rotate(-10deg)',
                        transformOrigin: 'center'
                      }}
                    />

                    {/* Right logo - Text icon (一半在图片上，一半在外面) */}
                    <img 
                      src="/images/generateexample/Text.svg"
                      alt="Text"
                      className="absolute z-10"
                      style={{
                        width: '90px',
                        height: '90px',
                        right: '-35px', // 一半在外面 (100px / 2 = 50px)
                        top: '130px', // 垂直居中位置 (360px / 2 - 50px = 130px)
                        transform: 'rotate(13deg)',
                        transformOrigin: 'center'
                      }}
                    />
                  </>
                ) : (
                  <>
                    {/* Image mode - Two images side by side */}
                    {currentImage && (
                      <div className="relative" style={{ height: '400px', width: '800px', margin: '0 auto' }}>
                        {/* Left image - original, positioned to the left of center */}
                        <img 
                          src={currentImage?.colorUrl || currentImage?.coloringUrl || currentImage?.url}
                          alt="Image"
                          style={{
                            width: 'auto',
                            height: '400px',
                            borderRadius: '16px',
                            border: '0.90px #EDEEF0 solid',
                            objectFit: 'cover',
                            position: 'absolute',
                            right: '50%',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            marginRight: '15px'
                          }}
                        />
                        
                        {/* Right image - colored/coloring, positioned to the right of center */}
                        <img 
                          src={currentImage?.url}
                          alt="Image"
                          style={{
                            width: 'auto',
                            height: '400px',
                            borderRadius: '16px',
                            border: '0.90px #EDEEF0 solid',
                            objectFit: 'cover',
                            position: 'absolute',
                            left: '50%',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            marginLeft: '15px'
                          }}
                        />
                      
                      {/* Arrow icon - floating on top, centered between images */}
                      <div 
                        className="absolute"
                        style={{
                          left: '50%',
                          top: '50%',
                          transform: 'translate(-50%, -50%)',
                          zIndex: 10,
                          pointerEvents: 'none'
                        }}
                      >
                        <img 
                          src="/images/generateexample/arrow.svg"
                          alt="Arrow"
                          style={{
                            width: '56px',
                            height: '56px',
                            display: 'block'
                          }}
                        />
                      </div>
                      </div>
                    )}
                  </>
                )}

                {/* Prompt text background - only show for text mode */}
                {type === 'text' && currentImage && (
                  <div 
                    className="absolute"
                    style={{
                      width: '80%',
                      minHeight: '48px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      bottom: '40px',
                      background: 'rgba(255, 255, 255, 0.30)',
                      borderRadius: '8px',
                      border: '1px solid #FF5C07',
                      backdropFilter: 'blur(5px)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '12px 16px'
                    }}
                  >
                    <img 
                      src="/images/generateexample/star-2.svg"
                      alt="Star"
                      style={{
                        width: '16px',
                        height: '16px',
                        marginRight: '8px',
                        flexShrink: 0
                      }}
                    />
                    {/* Prompt text */}
                    <div 
                      style={{
                        color: '#FF5C07',
                        fontSize: '16px',
                        fontFamily: 'Inter',
                        fontWeight: '500',
                        lineHeight: '24px',
                        textAlign: 'center',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {currentImage.prompt}
                    </div>
                  </div>
                )}

              </div>

            </div>

            {/* Navigation dots - 在图片外部下方 */}
            <div className="flex items-center gap-1.5">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleDotClick(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                    index === currentImageIndex 
                      ? 'bg-[#FF5C07]' 
                      : 'bg-[#DADADA] hover:bg-[#FF5C07] hover:bg-opacity-50'
                  }`}
                />
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerateExample;