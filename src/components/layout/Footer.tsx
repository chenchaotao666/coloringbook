import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../../images/logo.svg';
import socialIcon1 from '../../images/Link → SVG-1.svg';
import socialIcon2 from '../../images/Link → SVG-2.svg';
import socialIcon3 from '../../images/Link → SVG-3.svg';
import socialIcon4 from '../../images/Link → SVG-4.svg';
import socialIcon5 from '../../images/Link → SVG-5.svg';

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
    <div className="w-[200px] flex flex-col gap-6">
      <div className="text-[#161616] text-sm font-semibold">
        {title}
      </div>
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
  );
};

const Footer = () => {
  const sections = [
    {
      title: 'Tools',
      links: [
        { label: 'Text to coloring page', url: '/text-coloring-page' },
        { label: 'Image to coloring page', url: '/image-coloring-page' },
        { label: 'Coloring Pages Free', url: '/categories' },
      ],
    },
    {
      title: 'Disney',
      links: [
        { label: 'Mickey Mouse', url: '/category/mickey-mouse' },
        { label: 'Minnie Mouse', url: '/category/minnie-mouse' },
        { label: 'Donald Duck', url: '/category/donald-duck' },
        { label: 'Daisy Duck', url: '/category/daisy-duck' },
        { label: 'Goofy', url: '/category/goofy' },
        { label: 'Snow White', url: '/category/snow-white' },
        { label: 'Cinderella', url: '/category/cinderella' },
      ],
    },
    {
      title: 'Star',
      links: [
        { label: 'Taylor Swift', url: '/category/taylor-swift' },
        { label: 'Billie Eilish', url: '/category/billie-eilish' },
        { label: 'Scarlett Johansson', url: '/category/scarlett-johansson' },
        { label: 'Gal Gadot', url: '/category/gal-gadot' },
        { label: 'Brad Pitt', url: '/category/brad-pitt' },
        { label: 'Zendaya', url: '/category/zendaya' },
        { label: 'Timothée Chalamet', url: '/category/timothee-chalamet' },
      ],
    },
    {
      title: 'Animal',
      links: [
        { label: 'Dog', url: '/category/dog' },
        { label: 'Cat', url: '/category/cat' },
        { label: 'Tiger', url: '/category/tiger' },
        { label: 'Butterfly', url: '/category/butterfly' },
        { label: 'Bird', url: '/category/bird' },
        { label: 'Giraffe', url: '/category/giraffe' },
        { label: 'Horse', url: '/category/horse' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'Privacy Policy', url: '/privacy-policy' },
        { label: 'Terms of Service', url: '/terms' },
        { label: 'Refund Policy', url: '/refund-policy' },
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
    <div className="w-full bg-white py-[60px]">
      <div className="max-w-[1440px] mx-auto px-[60px]">
        <div className="flex">
          <div className="w-[250px] flex flex-col gap-[22px]">
            <div className="flex items-center gap-1 hover:opacity-80 transition-opacity duration-200 cursor-pointer">
              <img src={logo} alt="Logo" className="w-10 h-10" />
              <div className="text-[#161616] text-2xl font-medium">Coloring</div>
            </div>
            <div>
              <span className="text-[#6B7280] text-sm leading-6">
                Please contact us for use questions：<br />
              </span>
              <a 
                href="mailto:congcong@mail.xinsulv.com" 
                className="text-[#006FFF] text-sm underline leading-6 hover:text-[#FF5C07] transition-colors duration-200"
              >
                congcong@mail.xinsulv.com
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

        <div className="w-full h-[0px] my-9 border-t border-[#F0F0F0]"></div>
        <div className="text-[#6B7280] text-sm">
          © 2021 - Present Flowrift. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default Footer; 