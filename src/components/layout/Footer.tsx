import React from 'react';
import { Link } from 'react-router-dom';
import { useAsyncTranslation } from '../../contexts/LanguageContext';

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
        {title}
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

const Footer = () => {
  const { t } = useAsyncTranslation('navigation');

  const sections = [
    {
      title: t('footer.sections.tools', 'Tools'),
      links: [
        { label: t('footer.links.textToColoringPage', 'Text to coloring page'), url: '/text-coloring-page' },
        { label: t('footer.links.imageToColoringPage', 'Image to coloring page'), url: '/image-coloring-page' },
        { label: t('footer.links.coloringPagesFree', 'Coloring Pages Free'), url: '/categories' },
      ],
    },
    {
      title: t('footer.sections.disney', 'Disney'),
      links: [
        { label: t('footer.links.mickeyMouse', 'Mickey Mouse'), url: '/category/mickey-mouse' },
        { label: t('footer.links.minnieMouse', 'Minnie Mouse'), url: '/category/minnie-mouse' },
        { label: t('footer.links.donaldDuck', 'Donald Duck'), url: '/category/donald-duck' },
        { label: t('footer.links.daisyDuck', 'Daisy Duck'), url: '/category/daisy-duck' },
        { label: t('footer.links.goofy', 'Goofy'), url: '/category/goofy' },
        { label: t('footer.links.snowWhite', 'Snow White'), url: '/category/snow-white' },
        { label: t('footer.links.cinderella', 'Cinderella'), url: '/category/cinderella' },
      ],
    },
    {
      title: t('footer.sections.star', 'Star'),
      links: [
        { label: t('footer.links.taylorSwift', 'Taylor Swift'), url: '/category/taylor-swift' },
        { label: t('footer.links.billieEilish', 'Billie Eilish'), url: '/category/billie-eilish' },
        { label: t('footer.links.scarlettJohansson', 'Scarlett Johansson'), url: '/category/scarlett-johansson' },
        { label: t('footer.links.galGadot', 'Gal Gadot'), url: '/category/gal-gadot' },
        { label: t('footer.links.bradPitt', 'Brad Pitt'), url: '/category/brad-pitt' },
        { label: t('footer.links.zendaya', 'Zendaya'), url: '/category/zendaya' },
        { label: t('footer.links.timotheeChalamet', 'Timothée Chalamet'), url: '/category/timothee-chalamet' },
      ],
    },
    {
      title: t('footer.sections.animal', 'Animal'),
      links: [
        { label: t('footer.links.dog', 'Dog'), url: '/category/dog' },
        { label: t('footer.links.cat', 'Cat'), url: '/category/cat' },
        { label: t('footer.links.tiger', 'Tiger'), url: '/category/tiger' },
        { label: t('footer.links.butterfly', 'Butterfly'), url: '/category/butterfly' },
        { label: t('footer.links.bird', 'Bird'), url: '/category/bird' },
        { label: t('footer.links.giraffe', 'Giraffe'), url: '/category/giraffe' },
        { label: t('footer.links.horse', 'Horse'), url: '/category/horse' },
      ],
    },
    {
      title: t('footer.sections.company', 'Company'),
      links: [
        { label: t('footer.links.privacyPolicy', 'Privacy Policy'), url: '/privacy-policy' },
        { label: t('footer.links.termsOfService', 'Terms of Service'), url: '/terms' },
        { label: t('footer.links.refundPolicy', 'Refund Policy'), url: '/refund-policy' },
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
                {t('footer.contact.title', 'Please contact us for use questions：')}<br />
              </span>
              <a 
                href="mailto:congcong@mail.xinsulv.com" 
                className="text-[#006FFF] text-sm underline leading-6 hover:text-[#FF5C07] transition-colors duration-200"
              >
                {t('footer.contact.email', 'congcong@mail.xinsulv.com')}
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
                {t('footer.contact.title', 'Please contact us for use questions：')}<br />
              </span>
              <a 
                href="mailto:congcong@mail.xinsulv.com" 
                className="text-[#006FFF] text-sm underline leading-6 hover:text-[#FF5C07] transition-colors duration-200"
              >
                {t('footer.contact.email', 'congcong@mail.xinsulv.com')}
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
          {t('footer.copyright', '© 2021 - Present Flowrift. All rights reserved.')}
        </div>
      </div>
    </div>
  );
};

export default Footer; 