import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { ImageService, HomeImage } from '../../services/imageService';
import MasonryGrid from '../layout/MasonryGrid';

interface GalleryProps {
  title: string;
}

const Gallery: React.FC<GalleryProps> = ({ title }) => {
  const [homeImages, setHomeImages] = useState<HomeImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadImages = async () => {
      try {
        setIsLoading(true);
        const images = await ImageService.fetchAllHomeImages();
        setHomeImages(images);
      } catch (error) {
        console.error('Failed to load home images:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadImages();
  }, []);

  const displayImages = homeImages.slice(0, 16);

  return (
    <div className="w-full bg-[#F9FAFB] pb-12 sm:pb-16 md:pb-20 lg:pb-[120px] pt-12 sm:pt-16 md:pt-20 lg:pt-[120px]">
      <div className="container mx-auto px-4 sm:px-6 max-w-[1200px]">
        <h2 className="text-center text-[#161616] text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-[46px] font-bold capitalize mb-8 sm:mb-10 md:mb-12 lg:mb-[48px] leading-relaxed lg:leading-[1.6] px-4 sm:px-0">
          {title}
        </h2>
        
        <MasonryGrid 
          images={displayImages}
          isLoading={isLoading}
        />
        
        <div className="flex justify-center mt-12 sm:mt-16 md:mt-20 px-4 sm:px-0">
          <Link to="/categories">
            <Button 
              variant="gradient"
              className="h-[50px] sm:h-[60px] px-4 sm:px-5 py-3 rounded-lg overflow-hidden text-lg sm:text-xl font-bold capitalize w-full sm:w-auto min-w-[280px] sm:min-w-0"
            >
              View more free coloring pages
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Gallery; 