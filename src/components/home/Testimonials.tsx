import React from 'react';
const avatar = '/images/Avatar.png'; // 使用home-icon作为临时头像

interface TestimonialItemProps {
  content: string;
  name: string;
  position: string;
}

const TestimonialItem: React.FC<TestimonialItemProps> = ({ content, name, position }) => {
  return (
    <div className="w-full max-w-[585px] flex flex-col justify-start items-center gap-4 sm:gap-6 p-4 sm:p-6">
      <div className="w-full max-w-[500px] text-center text-[#6B7280] text-sm sm:text-base leading-5 sm:leading-6">
        {content}
      </div>
      <div className="flex justify-center items-center gap-2">
        <img 
          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex-shrink-0" 
          src={avatar} 
          alt={name} 
        />
        <div className="flex flex-col justify-start items-start gap-1">
          <div className="text-[#161616] text-sm sm:text-base font-medium">{name}</div>
          <div className="text-[#6B7280] text-xs sm:text-sm leading-[18px]">{position}</div>
        </div>
      </div>
    </div>
  );
};

const Testimonials = () => {
  return (
    <div className="w-full px-4 sm:px-6 my-16 sm:my-20">
      <div className="container mx-auto flex flex-col justify-center items-center gap-6 sm:gap-8">
        <h2 className="w-full text-center text-[#161616] text-2xl sm:text-3xl md:text-4xl lg:text-[46px] font-bold capitalize px-4 sm:px-0">
          What Our Users Say
        </h2>
        
        <div className="w-full max-w-[1200px] flex flex-col lg:grid lg:grid-cols-2 gap-6 lg:gap-8">
          <div className="w-full flex justify-center border-b lg:border-b-0 lg:border-r border-[#F0F0F0] pb-6 lg:pb-0">
            <TestimonialItem 
              content="FlowBite provides a robust set of design tokens and components based on the popular Tailwind CSS framework. From the most used UI components like forms and navigation bars to the whole app screens designed both for desktop and mobile, this UI kit provides a solid foundation for any project."
              name="Neil Sims"
              position="CEO, Flowbite"
            />
          </div>
          
          <div className="w-full flex justify-center border-b lg:border-b-0 border-[#F0F0F0] pb-6 lg:pb-0">
            <TestimonialItem 
              content="FlowBite provides a robust set of design tokens and components based on the popular Tailwind CSS framework. From the most used UI components like forms and navigation bars to the whole app screens designed both for desktop and mobile, this UI kit provides a solid foundation for any project."
              name="Neil Sims"
              position="CEO, Flowbite"
            />
          </div>
          
          <div className="w-full flex justify-center border-b lg:border-t lg:border-r border-[#F0F0F0] pb-6 lg:pb-0 lg:pt-6">
            <TestimonialItem 
              content="FlowBite provides a robust set of design tokens and components based on the popular Tailwind CSS framework. From the most used UI components like forms and navigation bars to the whole app screens designed both for desktop and mobile, this UI kit provides a solid foundation for any project."
              name="Neil Sims"
              position="CEO, Flowbite"
            />
          </div>
          
          <div className="w-full flex justify-center lg:border-t border-[#F0F0F0] lg:pt-6">
            <TestimonialItem 
              content="FlowBite provides a robust set of design tokens and components based on the popular Tailwind CSS framework. From the most used UI components like forms and navigation bars to the whole app screens designed both for desktop and mobile, this UI kit provides a solid foundation for any project."
              name="Neil Sims"
              position="CEO, Flowbite"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Testimonials; 