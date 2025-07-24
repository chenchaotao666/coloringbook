import React from 'react';

export interface FeatureItem {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export interface WhyChooseData {
  title: string;
  subtitle: string;
  features: FeatureItem[];
}

interface WhyChooseProps {
  className?: string;
  data: WhyChooseData;
}

const WhyChoose: React.FC<WhyChooseProps> = ({ 
  className = "",
  data
}) => {

  return (
    <div className={`w-full max-w-[1170px] mx-auto px-4 ${className}`}>
      <div className="text-center mb-16">
        {/* Title */}
        <h2 className="text-[46px] font-bold text-[#161616] capitalize mb-6">
          {data.title}
        </h2>
        
        {/* Subtitle */}
        <p className="text-lg text-[#6B7280] max-w-[900px] mx-auto">
          {data.subtitle}
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.features.map((feature) => (
          <div
            key={feature.id}
            className="bg-[#F9FAFB] rounded-2xl p-9 h-[336px] flex flex-col"
          >
            {/* Icon */}
            <div className="w-12 h-12 mb-6 rounded-lg overflow-hidden flex-shrink-0">
              <img 
                src={feature.icon} 
                alt={feature.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Title */}
            <h3 className="text-xl font-medium text-[#161616] leading-7 mb-4 flex-shrink-0">
              {feature.title}
            </h3>

            {/* Description */}
            <p className="text-base text-[#6B7280] leading-6 flex-1">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WhyChoose;