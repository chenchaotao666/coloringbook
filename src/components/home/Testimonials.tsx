import React from 'react';
import { useAsyncTranslation } from '../../contexts/LanguageContext';

const avatars = [
  '/images/avatar/avatar1.png',
  '/images/avatar/avatar2.png',
  '/images/avatar/avatar3.png',
  '/images/avatar/avatar4.png',
  '/images/avatar/avatar5.png',
  '/images/avatar/avatar6.png',
  '/images/avatar/avatar7.png',
  '/images/avatar/avatar8.png',
];

interface TestimonialItemProps {
  content: string;
  name: string;
  position: string;
  avatarIndex: number;
}

const TestimonialItem: React.FC<TestimonialItemProps> = ({ content, name, position, avatarIndex }) => {
  return (
    <div className="w-full max-w-[585px] flex flex-col justify-start items-center gap-4 sm:gap-6 px-4 sm:px-6 sm:py-6">
      <div className="w-full max-w-[500px] text-center text-[#6B7280] text-sm sm:text-base leading-5 sm:leading-6">
        {content}
      </div>
      <div className="w-full flex justify-start items-center gap-2 ml-[380px]">
        <div className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0">
          <img 
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full" 
            src={avatars[avatarIndex]} 
            alt={name} 
          />
        </div>
        <div className="flex flex-col justify-start items-start gap-1">
          <div className="text-[#161616] text-sm sm:text-base font-medium">{name}</div>
          <div className="text-[#6B7280] text-xs sm:text-sm leading-[18px]">{position}</div>
        </div>
      </div>
    </div>
  );
};

const Testimonials = () => {
  const { t } = useAsyncTranslation('home');
  
  return (
    <div className="w-full px-4 sm:px-6 my-12 sm:my-20 lg:my-24">
      <div className="container mx-auto flex flex-col justify-center items-center gap-6 sm:gap-8">
        <h2 className="w-full text-center text-[#161616] text-2xl sm:text-3xl md:text-4xl lg:text-[46px] font-bold capitalize px-4 sm:px-0">
          {t('testimonials.title')}
        </h2>
        
        <div className="w-full max-w-[1200px] grid grid-cols-1 lg:grid-cols-2">
          <div className="w-full flex justify-start border-b lg:border-b-0 border-[#F0F0F0] pb-6 lg:pb-0 lg:pr-4">
            <TestimonialItem 
              content={t('testimonials.user1.content')}
              name={t('testimonials.user1.name')}
              position={t('testimonials.user1.position')}
              avatarIndex={0}
            />
          </div>
          
          <div className="w-full flex justify-start border-b lg:border-b-0 lg:border-l border-[#F0F0F0] pb-6 lg:pb-0 lg:pl-4">
            <TestimonialItem 
              content={t('testimonials.user2.content')}
              name={t('testimonials.user2.name')}
              position={t('testimonials.user2.position')}
              avatarIndex={1}
            />
          </div>
          
          <div className="w-full flex justify-start lg:border-t border-[#F0F0F0] pb-6 lg:pb-0 lg:pt-6 lg:pr-4">
            <TestimonialItem 
              content={t('testimonials.user3.content')}
              name={t('testimonials.user3.name')}
              position={t('testimonials.user3.position')}
              avatarIndex={2}
            />
          </div>
          
          <div className="w-full flex justify-start lg:border-t lg:border-l border-[#F0F0F0] pb-6 lg:pb-0 lg:pt-6 lg:pl-4">
            <TestimonialItem 
              content={t('testimonials.user4.content')}
              name={t('testimonials.user4.name')}
              position={t('testimonials.user4.position')}
              avatarIndex={3}
            />
          </div>
          
          <div className="w-full flex justify-start lg:border-t border-[#F0F0F0] lg:pt-6 lg:pr-4">
            <TestimonialItem 
              content={t('testimonials.user5.content')}
              name={t('testimonials.user5.name')}
              position={t('testimonials.user5.position')}
              avatarIndex={4}
            />
          </div>
          
          <div className="w-full flex justify-start lg:border-t lg:border-l border-[#F0F0F0] lg:pt-6 lg:pl-4">
            <TestimonialItem 
              content={t('testimonials.user6.content')}
              name={t('testimonials.user6.name')}
              position={t('testimonials.user6.position')}
              avatarIndex={5}
            />
          </div>
          
          <div className="w-full flex justify-start lg:border-t border-[#F0F0F0] lg:pt-6 lg:pr-4">
            <TestimonialItem 
              content={t('testimonials.user7.content')}
              name={t('testimonials.user7.name')}
              position={t('testimonials.user7.position')}
              avatarIndex={6}
            />
          </div>
          
          <div className="w-full flex justify-start lg:border-t lg:border-l border-[#F0F0F0] lg:pt-6 lg:pl-4">
            <TestimonialItem 
              content={t('testimonials.user8.content')}
              name={t('testimonials.user8.name')}
              position={t('testimonials.user8.position')}
              avatarIndex={7}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Testimonials; 