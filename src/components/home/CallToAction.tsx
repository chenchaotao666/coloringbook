import React from 'react';
import { Link } from 'react-router-dom';
import arrowRightIcon from '../../images/arrow-right-outline.svg';
import { Button } from '@/components/ui/button';

const CallToAction = () => {
  return (
    <div className="w-full py-24 bg-[#F9FAFB] border-y border-[#F3F4F6]">
      <div className="w-full flex justify-center items-center">
        <div className="w-[800px] flex flex-col justify-start items-center gap-6">
          <h2 className="text-center text-[#111928] text-[46px] font-bold leading-[57.5px]">
            Get Your Coloring Pages
          </h2>
          
          <p className="w-full text-center text-[#6B7280] text-base leading-6">
            One-click generate coloring pages—print and play! Parent-child storytelling through color, screen-free bonding experience.
          </p>
          
          <Link to="/text-coloring-page">
            <Button 
              variant="gradient"
              className="w-[200px] h-14 px-5 py-2.5 rounded-lg flex justify-center items-center gap-2 text-xl font-bold"
            >
              Try Now
              <img src={arrowRightIcon} alt="Arrow right" className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CallToAction; 