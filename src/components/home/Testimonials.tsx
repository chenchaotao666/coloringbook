import React from 'react';
const avatar = '/images/Avatar.png'; // 使用home-icon作为临时头像

interface TestimonialItemProps {
  content: string;
  name: string;
  position: string;
}

const TestimonialItem: React.FC<TestimonialItemProps> = ({ content, name, position }) => {
  return (
    <div className="w-[585px] flex flex-col justify-start items-center gap-6">
      <div className="w-[500px] text-center text-[#6B7280] text-base leading-6">
        {content}
      </div>
      <div className="flex justify-start items-center gap-2">
        <img 
          className="w-10 h-10 rounded-[100px]" 
          src={avatar} 
          alt={name} 
        />
        <div className="flex flex-col justify-start items-start gap-1">
          <div className="text-[#161616] text-base font-medium">{name}</div>
          <div className="text-[#6B7280] text-sm leading-[18px]">{position}</div>
        </div>
      </div>
    </div>
  );
};

const Testimonials = () => {
  return (
    <div className="w-full px-4 my-20">
      <div className="container mx-auto flex flex-col justify-center items-center gap-[32px]">
        <h2 className="w-full text-center text-[#161616] text-[46px] font-bold capitalize">
          What Our Users Say
        </h2>
        
        <div className="w-full relative flex flex-col justify-center items-center">
          <div className="w-full flex flex-wrap justify-center items-center gap-[1px] content-center">
            <TestimonialItem 
              content="FlowBite provides a robust set of design tokens and components based on the popular Tailwind CSS framework. From the most used UI components like forms and navigation bars to the whole app screens designed both for desktop and mobile, this UI kit provides a solid foundation for any project."
              name="Neil Sims"
              position="CEO, Flowbite"
            />
            <div className="w-[1px] h-[285px] bg-[#F0F0F0]"></div>
            <TestimonialItem 
              content="FlowBite provides a robust set of design tokens and components based on the popular Tailwind CSS framework. From the most used UI components like forms and navigation bars to the whole app screens designed both for desktop and mobile, this UI kit provides a solid foundation for any project."
              name="Neil Sims"
              position="CEO, Flowbite"
            />
          </div>
          
          <div className="w-full flex flex-wrap justify-center items-center gap-[1px] content-center">
            <TestimonialItem 
              content="FlowBite provides a robust set of design tokens and components based on the popular Tailwind CSS framework. From the most used UI components like forms and navigation bars to the whole app screens designed both for desktop and mobile, this UI kit provides a solid foundation for any project."
              name="Neil Sims"
              position="CEO, Flowbite"
            />
            <div className="w-[1px] h-[285px] bg-[#F0F0F0]"></div>
            <TestimonialItem 
              content="FlowBite provides a robust set of design tokens and components based on the popular Tailwind CSS framework. From the most used UI components like forms and navigation bars to the whole app screens designed both for desktop and mobile, this UI kit provides a solid foundation for any project."
              name="Neil Sims"
              position="CEO, Flowbite"
            />
          </div>
          
          <div className="w-full h-[1px] absolute left-0 top-[285px] bg-[#F0F0F0]"></div>
        </div>
      </div>
    </div>
  );
};

export default Testimonials; 