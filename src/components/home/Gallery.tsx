import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { HomeImageService, HomeImage } from '../../services/imageService';
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
        const images = await HomeImageService.fetchAllHomeImages();
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
          <div className="w-full bg-[#F9FAFB] pb-16 md:pb-[120px] pt-16 md:pt-[120px]">
      <div className="container mx-auto px-4 max-w-[1200px]">
        <h2 className="text-center text-[#161616] text-3xl lg:text-[46px] font-bold capitalize mb-10 md:mb-[48x] leading-relaxed lg:leading-[1.6]">
          {title}
        </h2>
        
        <MasonryGrid 
          images={displayImages}
          isLoading={isLoading}
        />
        
        <div className="flex justify-center mt-20">
          <Link to="/categories">
            <Button 
              variant="gradient"
              className="h-[60px] px-5 py-3 rounded-lg overflow-hidden text-xl font-bold capitalize"
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