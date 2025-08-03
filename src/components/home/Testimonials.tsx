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
          {t('testimonials.title', 'What Our Users Say')}
        </h2>
        
        <div className="w-full max-w-[1200px] grid grid-cols-1 lg:grid-cols-2">
          <div className="w-full flex justify-start border-b lg:border-b-0 border-[#F0F0F0] pb-6 lg:pb-0 lg:pr-4">
            <TestimonialItem 
              content={t('testimonials.user1.content', 'This tool is like magic for my 6-year-old. She just types in \'unicorn on a skateboard\' and it turns into a printable coloring page instantly. We\'ve made a whole binder full of her ideas!')}
              name={t('testimonials.user1.name', 'Emily')}
              position={t('testimonials.user1.position', 'Parent')}
              avatarIndex={0}
            />
          </div>
          
          <div className="w-full flex justify-start border-b lg:border-b-0 lg:border-l border-[#F0F0F0] pb-6 lg:pb-0 lg:pl-4">
            <TestimonialItem 
              content={t('testimonials.user2.content', 'I use it every week in my elementary art class. The kids love seeing their wild ideas turned into something they can color. It saves me hours of prep time!')}
              name={t('testimonials.user2.name', 'Brian')}
              position={t('testimonials.user2.position', 'Art Teacher')}
              avatarIndex={1}
            />
          </div>
          
          <div className="w-full flex justify-start lg:border-t border-[#F0F0F0] pb-6 lg:pb-0 lg:pt-6 lg:pr-4">
            <TestimonialItem 
              content={t('testimonials.user3.content', 'As a therapist, I often incorporate creative tools into sessions. This has been a wonderful, low-pressure way for kids to express themselves visually.')}
              name={t('testimonials.user3.name', 'Lauren')}
              position={t('testimonials.user3.position', 'Child Therapist')}
              avatarIndex={2}
            />
          </div>
          
          <div className="w-full flex justify-start lg:border-t lg:border-l border-[#F0F0F0] pb-6 lg:pb-0 lg:pt-6 lg:pl-4">
            <TestimonialItem 
              content={t('testimonials.user4.content', 'I uploaded an old photo of my dog and turned it into a coloring page — then I colored it with my daughter. It\'s now hanging on our fridge!')}
              name={t('testimonials.user4.name', 'Marcus')}
              position={t('testimonials.user4.position', 'Dad & Pet Owner')}
              avatarIndex={3}
            />
          </div>
          
          <div className="w-full flex justify-start lg:border-t border-[#F0F0F0] lg:pt-6 lg:pr-4">
            <TestimonialItem 
              content={t('testimonials.user5.content', 'I\'m a digital artist and I actually use this to generate quick outline inspiration when I\'m sketching new characters. It\'s surprisingly clean and usable.')}
              name={t('testimonials.user5.name', 'Tara')}
              position={t('testimonials.user5.position', 'Freelance Illustrator')}
              avatarIndex={4}
            />
          </div>
          
          <div className="w-full flex justify-start lg:border-t lg:border-l border-[#F0F0F0] lg:pt-6 lg:pl-4">
            <TestimonialItem 
              content={t('testimonials.user6.content', 'I run a summer camp and we used this to create custom coloring books for each camper — with their names and favorite animals. Huge hit!')}
              name={t('testimonials.user6.name', 'Kelly')}
              position={t('testimonials.user6.position', 'Camp Director')}
              avatarIndex={5}
            />
          </div>
          
          <div className="w-full flex justify-start lg:border-t border-[#F0F0F0] lg:pt-6 lg:pr-4">
            <TestimonialItem 
              content={t('testimonials.user7.content', 'I never thought I\'d enjoy coloring as an adult, but this tool makes it feel personal. I typed in \'peaceful forest with a cat\' and spent the evening relaxing while coloring it in.')}
              name={t('testimonials.user7.name', 'David')}
              position={t('testimonials.user7.position', 'Adult Colorer')}
              avatarIndex={6}
            />
          </div>
          
          <div className="w-full flex justify-start lg:border-t lg:border-l border-[#F0F0F0] lg:pt-6 lg:pl-4">
            <TestimonialItem 
              content={t('testimonials.user8.content', 'What I love most is that I don\'t need to install anything. I used it on my tablet, created a coloring page of my son\'s drawing, and printed it in two minutes. So convenient!')}
              name={t('testimonials.user8.name', 'Jenny')}
              position={t('testimonials.user8.position', 'Mom & Homeschooler')}
              avatarIndex={7}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Testimonials; 