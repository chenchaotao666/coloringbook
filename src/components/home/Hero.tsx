
import { Button } from '../ui/button';
import { Link } from 'react-router-dom';
const arrowRightIcon = '/images/arrow-right-outline-default.svg';
const heroImage = '/images/color-cat.svg';

const Hero = () => {
  return (
    <div className="relative bg-white">
      {/* 渐变背景 - 覆盖菜单和Hero区域，从上到下浅黄渐变 */}
      <div className="absolute left-0 w-full h-[100px] -top-[70px] pointer-events-none">
        {/* 主渐变背景 - 浅黄色到白色，更浅的颜色 */}
        <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-[rgba(255,248,245,0.3)] to-[rgba(255,255,255,0.1)]"></div>
        
        {/* 橙色模糊光晕效果 */}
        <div 
          className="absolute top-0 w-full h-[110px] bg-gradient-to-r from-[rgba(255,153,1,0.4)] to-[rgba(255,91,7,0.4)]"
          style={{
            filter: 'blur(200px)',
          }}
        ></div>
      </div>
      
      {/* Hero内容区域 - 白色背景 */}
      <div className="relative z-10 container mx-auto px-4 flex items-center justify-center min-h-[600px]">
        <div className="flex flex-col lg:flex-row items-center max-w-[1400px]">
          <div className="w-full lg:w-auto flex flex-col items-center lg:items-start gap-9">
            <div className="flex flex-col gap-6 text-center lg:text-left">
              <h1 className="text-[64px] lg:text-[56px] font-bold capitalize leading-tight">
                <span className="text-[#161616]">AI </span>
                <span className="text-[#6200E2]">Coloring Pages</span>
                <span className="text-[#FF9C01]"> </span><br />
                <span className="text-[#161616]">Free Your Colorful World</span>
              </h1>
              <p className="max-w-[750px] text-[#6B7280] text-lg leading-relaxed">
                One-click generate coloring pages—print and play! Parent-child storytelling through color, screen-free bonding experience.
              </p>
            </div>
            
            <div className="p-6 bg-[#F9FAFB] rounded-lg w-full max-w-[350px]">
              <div className="flex items-center justify-start gap-10">
                <div className="flex flex-col gap-1 items-start">
                  <div className="text-[#161616] text-2xl font-bold">1,281</div>
                  <div className="text-[#6B7280] text-sm">Coloring Pages Free</div>
                </div>
                <div className="flex flex-col gap-1 items-start">
                  <div className="text-[#161616] text-2xl font-bold">Free</div>
                  <div className="text-[#6B7280] text-sm">Coloring Generate</div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-4 w-full max-w-[500px]">
              <Link to="/text-coloring-page" className="w-full md:w-auto">
                <Button 
                  variant="gradient"
                  className="w-full md:w-[240px] h-[65px] px-6 py-4 rounded-lg text-lg font-semibold"
                >
                  Coloring Pages Generate
                </Button>
              </Link>
              <Link to="/categories" className="w-full md:w-auto">
                <Button variant="outline" className="w-full md:w-[240px] h-[65px] px-6 py-4 bg-white border border-[#E5E7EB] rounded-lg text-lg font-semibold flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors">
                  <span className="text-[#111928]">Coloring Pages Free</span>
                  <img src={arrowRightIcon} alt="Arrow right" className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="flex-shrink-0">
            <div className="relative w-[550px] h-[550px]">
              <div className="w-[550px] h-[550px] overflow-hidden rounded-[46px]">
                <img 
                  src={heroImage}
                  alt="AI生成涂色页示例"
                  className="w-full h-full object-cover cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero; 