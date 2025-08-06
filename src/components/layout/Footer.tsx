import React from 'react';
import { Link } from 'react-router-dom';
import { useAsyncTranslation, useLanguage } from '../../contexts/LanguageContext';
import { getLocalizedText } from '../../utils/textUtils';
import { Category } from '../../services/categoriesService';

const logo = '/images/logo.svg';
const socialIcon1 = '/images/Link → SVG-1.svg';
const socialIcon2 = '/images/Link → SVG-2.svg';
const socialIcon3 = '/images/Link → SVG-3.svg';
const socialIcon4 = '/images/Link → SVG-4.svg';
const socialIcon5 = '/images/Link → SVG-5.svg';

// Interface for footer links section
interface FooterSectionProps {
  title: string;
  links: Array<{
    label: string;
    url: string;
  }>;
}

const FooterSection: React.FC<FooterSectionProps> = ({ title, links }) => {
  return (
    <div className="w-full lg:w-[200px] flex flex-col gap-3 lg:gap-6">
      <div className="text-[#161616] text-sm lg:text-sm font-semibold">
        {title || '\u00A0'}
      </div>
      <div className="flex flex-col gap-2 lg:gap-6">
        {links.map((link, index) => (
          <Link 
            key={index} 
            to={link.url} 
            className="text-[#6B7280] text-sm hover:text-[#FF5C07] transition-colors duration-200"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
};

interface FooterProps {
  categories: Category[];
  categoriesLoading: boolean;
}

const Footer: React.FC<FooterProps> = ({ categories, categoriesLoading }) => {
  const { t } = useAsyncTranslation('navigation');
  const { language } = useLanguage();


  const sections = [
    {
      title: t('footer.sections.tools'),
      links: [
        { label: t('footer.links.textToColoringPage'), url: '/text-coloring-page' },
        { label: t('footer.links.imageToColoringPage'), url: '/image-coloring-page' },
        { label: t('footer.links.coloringPagesFree'), url: '/categories' },
      ],
    },
    // 使用前21个分类，分成3组，每组7个，与Header保持一致
    ...(!categoriesLoading && categories.length > 0 ? [
      {
        title: t('categories.popularColoringPages'),
        links: categories.slice(0, 7).map(category => ({
          label: getLocalizedText(category.displayName, language) || category.name,
          url: `/categories/${category.categoryId}`
        }))
      },
      {
        title: '',
        links: categories.slice(7, 14).map(category => ({
          label: getLocalizedText(category.displayName, language) || category.name,
          url: `/categories/${category.categoryId}`
        }))
      },
      {
        title: '',
        links: categories.slice(14, 21).map(category => ({
          label: getLocalizedText(category.displayName, language) || category.name,
          url: `/categories/${category.categoryId}`
        }))
      }
    ] : [
      // 加载中时显示空组，避免布局跳动
      { title: t('categories.popularColoringPages'), links: [] },
      { title: '', links: [] },
      { title: '', links: [] }
    ]),
    {
      title: t('footer.sections.company'),
      links: [
        { label: t('footer.links.privacyPolicy'), url: '/privacy-policy' },
        { label: t('footer.links.termsOfService'), url: '/terms' },
        { label: t('footer.links.refundPolicy'), url: '/refund-policy' },
      ],
    },
  ];

  const socialIcons = [
    socialIcon1,
    socialIcon2, 
    socialIcon3,
    socialIcon4,
    socialIcon5
  ];

  return (
    <div className="w-full bg-white py-8 lg:py-[60px]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-[60px]">
        {/* 移动端布局 */}
        <div className="lg:hidden">
          {/* Logo和联系信息 */}
          <div className="flex flex-col gap-6 mb-8">
            <div className="flex items-center gap-1 hover:opacity-80 transition-opacity duration-200 cursor-pointer">
              <img src={logo} alt="Logo" className="w-8 h-8 sm:w-10 sm:h-10" />
              <div className="text-[#161616] text-xl sm:text-2xl font-medium">Coloring</div>
            </div>
            <div>
              <span className="text-[#6B7280] text-sm leading-6">
                {t('footer.contact.title')}<br />
              </span>
              <a 
                href="mailto:congcong@mail.xinsulv.com" 
                className="text-[#006FFF] text-sm underline leading-6 hover:text-[#FF5C07] transition-colors duration-200"
              >
                {t('footer.contact.email')}
              </a>
            </div>
            <div className="flex items-center gap-4">
              {socialIcons.map((icon, index) => (
                <img 
                  key={index} 
                  src={icon} 
                  alt={`Social icon ${index + 1}`} 
                  className="w-5 h-5 sm:w-6 sm:h-6 hover:opacity-80 transition-opacity duration-200 cursor-pointer"
                />
              ))}
            </div>
          </div>
          
          {/* 链接部分 - 网格布局 */}
          <div className="grid grid-cols-2 gap-6 sm:gap-8">
            {sections.map((section, index) => (
              <FooterSection 
                key={index}
                title={section.title}
                links={section.links}
              />
            ))}
          </div>
        </div>

        {/* 桌面端布局 */}
        <div className="hidden lg:flex">
          <div className="w-[250px] flex flex-col gap-[22px]">
            <div className="flex items-center gap-1 hover:opacity-80 transition-opacity duration-200 cursor-pointer">
              <img src={logo} alt="Logo" className="w-10 h-10" />
              <div className="text-[#161616] text-2xl font-medium">Coloring</div>
            </div>
            <div>
              <span className="text-[#6B7280] text-sm leading-6">
                {t('footer.contact.title')}<br />
              </span>
              <a 
                href="mailto:congcong@mail.xinsulv.com" 
                className="text-[#006FFF] text-sm underline leading-6 hover:text-[#FF5C07] transition-colors duration-200"
              >
                {t('footer.contact.email')}
              </a>
            </div>
            <div className="flex items-center gap-5">
              {socialIcons.map((icon, index) => (
                <img 
                  key={index} 
                  src={icon} 
                  alt={`Social icon ${index + 1}`} 
                  className="w-6 h-6 hover:opacity-80 transition-opacity duration-200 cursor-pointer"
                />
              ))}
            </div>
          </div>

          <div className="flex ml-[130px]">
            {sections.map((section, index) => (
              <FooterSection 
                key={index}
                title={section.title}
                links={section.links}
              />
            ))}
          </div>
        </div>

        <div className="w-full h-[0px] my-6 lg:my-9 border-t border-[#F0F0F0]"></div>
        <div className="text-[#6B7280] text-sm text-center lg:text-left">
          {t('footer.copyright')}
        </div>
      </div>
    </div>
  );
};

export default Footer; 