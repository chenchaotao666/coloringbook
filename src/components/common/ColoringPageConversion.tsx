import React from 'react';

export interface ConversionCategory {
  id: string;
  title: string;
  description: string;
  upImage: string;
  downImage: string;
}

export interface ColoringPageConversionData {
  title: string;
  subtitle: string;
  categories: ConversionCategory[];
}

interface ColoringPageConversionProps {
  className?: string;
  data: ColoringPageConversionData;
}

const ColoringPageConversion: React.FC<ColoringPageConversionProps> = ({ 
  className = "",
  data
}) => {
  return (
    <div className={`w-full max-w-[1170px] mx-auto px-4 ${className}`}>
      {/* Header */}
      <div className="text-center mb-16">
        <h2 className="text-[46px] font-bold text-[#161616] capitalize leading-tight mb-8 max-w-[1200px] mx-auto">
          {data.title}
        </h2>
        <p className="text-lg text-[#6B7280] max-w-[900px] mx-auto">
          {data.subtitle}
        </p>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
        {data.categories.map((category) => (
          <div key={category.id} className="w-[376px] flex flex-col gap-5">
            {/* Image container with no gap between images */}
            <div className="w-[376px] overflow-hidden rounded-2xl border border-[#EDEEF0]">
              {/* Upper image */}
              <img 
                src={category.upImage} 
                alt={`${category.title} original`}
                className="w-full h-[211px] object-cover"
              />
              
              {/* Lower image */}
              <img 
                src={category.downImage} 
                alt={`${category.title} coloring page`}
                className="w-full h-[211px] object-cover"
              />
            </div>
            
            {/* Title and Description */}
            <div className="flex flex-col gap-3">
              <h3 className="text-xl font-medium text-[#161616] capitalize">
                {category.title}
              </h3>
              <p className="text-sm text-[#6B7280] capitalize leading-[21px]">
                {category.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ColoringPageConversion;