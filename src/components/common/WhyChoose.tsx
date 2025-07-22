import React from 'react';

interface WhyChooseProps {
  className?: string;
}

interface FeatureItem {
  id: string;
  icon: string;
  title: string;
  description: string;
}

const WhyChoose: React.FC<WhyChooseProps> = ({ 
  className = "" 
}) => {
  const features: FeatureItem[] = [
    {
      id: 'creative-freedom',
      icon: '/images/whochoose/logo-1.png',
      title: 'Creative Freedom',
      description: 'Unleash your imagination! Whether it\'s a wild adventure or a whimsical dream, transform any idea into a visual coloring experience that both kids and adults can enjoy. Watch your ideas come to life on paper with just a few words.'
    },
    {
      id: 'kid-friendly',
      icon: '/images/whochoose/logo-2.png',
      title: 'Kid-Friendly & Safe',
      description: 'Designed with young users in mind, our tool features simple navigation and secure filters, making it easy and safe for children to explore their creativity, whether independently or under supervision.'
    },
    {
      id: 'educational-value',
      icon: '/images/whochoose/logo-3.png',
      title: 'Educational Value',
      description: 'Combine the best of both worlds—literacy and art. Our tool encourages storytelling, language development, fine motor skills, and cognitive growth, making learning fun and interactive for all ages.'
    },
    {
      id: 'instant-hassle-free',
      icon: '/images/whochoose/logo-4.png',
      title: 'Instant & Hassle-Free',
      description: 'No need for signups or waiting! Simply type your idea, hit generate, and in seconds you\'ll have a printable coloring page ready to go. It\'s quick, easy, and stress-free.'
    },
    {
      id: 'ready-to-print',
      icon: '/images/whochoose/logo-5.png',
      title: 'Ready to Print or Share',
      description: 'Download your high-resolution coloring page instantly. It\'s perfect for printing at home, sharing with friends, or using on digital devices—flexible for any activity.'
    },
    {
      id: 'free-forever',
      icon: '/images/whochoose/logo-6.png',
      title: '100% Free, Forever',
      description: 'Enjoy unlimited creative fun without any hidden fees or trials. Generate as many pages as you want, anytime, all for free. No strings attached.'
    }
  ];

  return (
    <div className={`w-full max-w-[1170px] mx-auto px-4 ${className}`}>
      <div className="text-center mb-16">
        {/* Title */}
        <h2 className="text-[46px] font-bold text-[#161616] capitalize mb-6">
          Why Choose This Tool?
        </h2>
        
        {/* Subtitle */}
        <p className="text-lg text-[#6B7280] max-w-[900px] mx-auto">
          Here's why our Text to Coloring Page generator is the ultimate choice for creative fun:
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
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