import { Button } from '../ui/button';
import { Link } from 'react-router-dom';
import { useAsyncTranslation } from '../../contexts/LanguageContext';
const arrowRightIcon = '/images/arrow-right-outline-default.svg';
const heroImage = '/images/color-cat.png';

interface HeroProps {
  imageCount: number;
}

const Hero: React.FC<HeroProps> = ({ imageCount }) => {
  const { t } = useAsyncTranslation('home');
  
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
      <div className="relative z-10 container mx-auto px-4 sm:px-6 flex items-center justify-center min-h-[500px] sm:min-h-[600px]">
        <div className="flex flex-col lg:flex-row items-center max-w-[1400px]">
          {/* 左侧内容区域 */}
          <div className="w-full lg:w-auto flex flex-col items-center lg:items-start gap-6 sm:gap-9 min-w-[800px]">
            <div className="flex flex-col gap-4 sm:gap-6 text-center lg:text-left">
              <h1 className="mt-6 sm:mt-0 text-3xl sm:text-4xl md:text-5xl text-[56px] font-bold capitalize leading-tight">
                <span className="text-[#161616]">{t('hero.aiTitle')} </span>
                <span className="text-[#6200E2]">{t('hero.coloringPages')}</span>
                <span className="text-[#FF9C01]"> </span><br />
                <span className="text-[#161616] block mt-5 sm:mt-5">{t('hero.subtitle')}</span>
              </h1>
              <p className="max-w-[750px] text-[#6B7280] text-base sm:text-lg leading-relaxed px-4 sm:px-0">
                {t('hero.description')}
              </p>
            </div>
            
            {/* 统计数据卡片 */}
            <div className="p-6 sm:p-6 pl-12 sm:pl-12 pr-12 sm:pr-12 bg-[#F9FAFB] rounded-lg max-w-[300px] lg:max-w-[400px]">
              <div className="flex items-center justify-center sm:justify-start gap-8 sm:gap-10">
                <div className="flex flex-col gap-1 items-center sm:items-start">
                  <div className="text-[#161616] text-xl sm:text-2xl font-bold">{imageCount > 0 ? imageCount.toLocaleString() : '\u00A0'}</div>
                  <div className="text-[#6B7280] text-xs sm:text-sm text-center sm:text-left">{t('hero.freePages')}</div>
                </div>
                <div className="flex flex-col gap-1 items-center sm:items-start">
                  <div className="text-[#161616] text-xl sm:text-2xl font-bold">{t('hero.free')}</div>
                  <div className="text-[#6B7280] text-xs sm:text-sm text-center sm:text-left">{t('hero.coloringGenerate')}</div>
                </div>
              </div>
            </div>
            
            {/* 按钮组 */}
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full max-w-[500px] px-4 sm:px-0">
              <Link to="/text-coloring-page" className="w-auto">
                <Button 
                  variant="gradient"
                  className="w-[280px] sm:w-[220px] md:w-[240px] h-[55px] sm:h-[65px] px-4 sm:px-6 py-3 sm:py-4 rounded-lg text-base sm:text-lg font-semibold"
                >
                  {t('hero.generateButton')}
                </Button>
              </Link>
              <Link to="/categories" className="w-auto">
                <Button variant="outline" className="w-[280px] sm:w-[220px] md:w-[240px] h-[55px] sm:h-[65px] px-4 sm:px-6 py-3 sm:py-4 bg-white border border-[#E5E7EB] rounded-lg text-base sm:text-lg text-[#111928] flex items-center justify-center gap-1">
                  <span className="text-[#111928]">{t('hero.freeButton')}</span>
                  <img src={arrowRightIcon} alt="Arrow right" className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
          
          {/* 右侧图片区域 */}
          <div className="flex-shrink-0 w-full lg:w-auto flex justify-center mt-2 lg:mt-0">
            <div className="relative w-full max-w-[400px] sm:max-w-[450px] md:max-w-[500px] lg:max-w-[550px]">
              <div className="w-full aspect-square overflow-hidden rounded-[24px] sm:rounded-[32px] lg:rounded-[46px]">
                <img 
                  src={heroImage}
                  alt={t('hero.imageAlt')}
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