import { Link } from 'react-router-dom';
const arrowRightIcon = '/images/arrow-right-outline.svg';
import { Button } from '../ui/button';

const   CallToAction = () => {
  return (
    <div className="w-full py-12 lg:py-16 sm:py-20 lg:py-24 bg-[#F9FAFB] border-y border-[#F3F4F6]">
      <div className="w-full flex justify-center items-center px-4 sm:px-6">
        <div className="w-full max-w-[800px] flex flex-col justify-start items-center gap-4 sm:gap-6">
          <h2 className="text-center text-[#111928] text-2xl sm:text-3xl md:text-4xl lg:text-[46px] font-bold leading-tight sm:leading-[1.25] lg:leading-[57.5px] px-4 sm:px-0">
            Get Your Coloring Pages
          </h2>
          
          <p className="w-full text-center text-[#6B7280] text-sm sm:text-base leading-5 sm:leading-6 px-4 sm:px-0">
            One-click generate coloring pages—print and play! Parent-child storytelling through color, screen-free bonding experience.
          </p>
          
          <Link to="/text-coloring-page" className="w-auto">
            <Button 
              variant="gradient"
              className="w-[200px] sm:w-[200px] h-12 sm:h-14 px-4 sm:px-5 py-2.5 rounded-lg flex justify-center items-center gap-2 text-lg sm:text-xl font-bold"
            >
              Try Now
              <img src={arrowRightIcon} alt="Arrow right" className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CallToAction; 