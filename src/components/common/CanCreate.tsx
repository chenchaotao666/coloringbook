import React from 'react';

interface CanCreateProps {
  className?: string;
  categories: CategoryItem[];
}

export interface CategoryItem {
  id: string;
  title: string;
  description: string;
  image: string;
}

const CanCreate: React.FC<CanCreateProps> = ({ 
  className = "",
  categories
}) => {

  return (
    <div className={`w-full max-w-[1170px] mx-auto px-4 ${className}`}>
      <div className="text-center mb-16">
        {/* Title */}
        <h2 className="text-[46px] font-bold text-[#161616] capitalize mb-6">
          What Can You Create?
        </h2>
        
        {/* Subtitle */}
        <p className="text-lg text-[#6B7280] max-w-[900px] mx-auto">
          Turn your wildest ideas into unique coloring pages.
        </p>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[21px]">
        {categories.map((category) => (
          <div key={category.id} className="flex flex-col">
            {/* Image */}
            <div className="w-full aspect-square rounded-2xl border border-[#EDEEF0] overflow-hidden mb-6">
              <img 
                src={category.image}
                alt={category.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Title */}
            <h3 className="text-xl font-medium text-[#161616] capitalize mb-3">
              {category.title}
            </h3>

            {/* Description */}
            <p className="text-sm text-[#6B7280] capitalize leading-[21px]">
              {category.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CanCreate;