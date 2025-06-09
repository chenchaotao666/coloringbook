import React from 'react';
import { Link } from 'react-router-dom';
import homeFeatureAlt from '../../images/home-feature-alt.png';
import homeFeature from '../../images/home-feature.png';
import coloringPrincess from '../../images/long-color.svg';
import coloringmMickeyMouse from '../../images/xxx.svg';
import { Button } from '@/components/ui/button';

interface FeatureItemProps {
  title: string;
  description: string;
  images: string[];
  linkTo?: string;
  isReversed?: boolean;
}

const FeatureItem: React.FC<FeatureItemProps> = ({ title, description, images, linkTo, isReversed = false }) => {
  const TryNowButton = () => (
    <Link to={linkTo || '/text-coloring-page'}>
      <Button 
        variant="gradient"
        className="w-[170px] h-[60px] px-11 py-[18px] rounded-lg text-xl font-bold"
      >
        Try Now
      </Button>
    </Link>
  );
  
  return (
    <div className={`flex flex-col ${isReversed ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center justify-center gap-12 lg:gap-20 max-w-[1400px] mx-auto`}>
      <div className="flex flex-col gap-6 lg:gap-8 w-full lg:w-[500px]">
        <div className="flex flex-col gap-4 text-center lg:text-left">
          <h3 className="text-[#161616] text-2xl lg:text-4xl font-bold capitalize leading-tight">
            {title}
          </h3>
          <p className="text-[#6B7280] text-lg lg:text-xl leading-relaxed">
            {description}
          </p>
        </div>
        <div className="flex justify-center lg:justify-start">
          <TryNowButton />
        </div>
      </div>
      
      <div className="w-full lg:w-[700px] flex justify-center">
        <div className="w-full max-w-[700px] h-[350px] md:h-[420px] relative bg-[#F9FAFB] overflow-hidden rounded-2xl">
          {images.map((src, index) => (
            <img
              key={index}
              className={`absolute ${index === 0 ? 'left-5 top-[33px]' : 'right-5 top-[33px]'}`}
              style={{ 
                maxWidth: '45%',
                width: '309px', 
                height: 'auto',
                maxHeight: '354px' 
              }}
              src={src}
              alt={`Feature ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const Features = () => {
  return (
    <div className="bg-white w-full">
      <div className="bg-white container mx-auto px-6 py-[100px] lg:py-[120px] flex flex-col items-center gap-20 lg:gap-20">
        <div className="text-center max-w-[1200px]">
          <h2 className="text-[#161616] text-4xl lg:text-[52px] font-bold capitalize leading-tight">
            Discover our tools' amazing feats!
          </h2>
        </div>
        
        <div className="w-full flex flex-col gap-24 lg:gap-[120px]">
          <FeatureItem 
            title="Generate high-quality coloring pages from text"
            description="Enter words like 'Dinosaur', 'Mickey', or 'SpongeBob', and the AI will instantly turn them into art."
            images={[homeFeatureAlt, homeFeature]}
            linkTo="/text-coloring-page"
          />
          
          <FeatureItem 
            title="Convert images to coloring pages"
            description="Easily convert low-resolution images to HD with AI-enhanced details for sharper photos."
            images={[coloringPrincess, coloringmMickeyMouse]}
            linkTo="/image-coloring-page"
            isReversed
          />
        </div>
      </div>
    </div>
  );
};

export default Features; 