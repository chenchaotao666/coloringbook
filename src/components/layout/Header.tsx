import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
const logo = '/images/logo.svg';
const intlIcon = '/images/intl.svg';
const expandIcon = '/images/expand.svg';
import { useLanguage, Language } from '../../contexts/LanguageContext';

interface HeaderProps {
  backgroundColor?: 'transparent' | 'white';
}

const Header: React.FC<HeaderProps> = ({ backgroundColor = 'transparent' }) => {
  const { language, setLanguage, t } = useLanguage();
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsLanguageDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLanguageSelect = (lang: Language) => {
    setLanguage(lang);
    setIsLanguageDropdownOpen(false);
  };

  const bgClass = backgroundColor === 'white' ? 'bg-white' : 'bg-transparent';

  return (
    <div className={`relative w-full h-[70px] py-[15px] ${bgClass} flex justify-between items-center z-20`}>
      <Link to="/" className="relative z-10 w-[300px] pl-5 flex justify-start items-center gap-1 hover:opacity-80 transition-opacity duration-200">
        <img src={logo} alt="Logo" className="w-10 h-10" />
        <div className="text-[#161616] text-2xl font-medium">Coloring</div>
      </Link>
      <div className="relative z-10 max-h-6 flex justify-start items-start gap-10 flex-wrap">
        <Link to="/categories" className="text-[#161616] text-base font-medium leading-6 hover:text-[#FF5C07] transition-colors duration-200">
          {t('nav.coloringPagesFree')}
        </Link>
        <Link to="/text-coloring-page" className="text-[#161616] text-base font-medium leading-6 hover:text-[#FF5C07] transition-colors duration-200">
          {t('nav.textColoringPage')}
        </Link>
        <Link to="/image-coloring-page" className="text-[#161616] text-base font-medium leading-6 hover:text-[#FF5C07] transition-colors duration-200">
          {t('nav.imageColoringPage')}
        </Link>
        <Link to="/price" className="text-[#161616] text-base font-medium leading-6 hover:text-[#FF5C07] transition-colors duration-200">
          {t('nav.pricing')}
        </Link>
      </div>
      <div className="relative z-10 w-[300px] pr-5 flex justify-end items-center gap-[30px]">
        <div className="relative" ref={dropdownRef}>
          <div 
            className="px-3 py-1.5 rounded-lg flex justify-start items-center gap-1.5 hover:bg-gray-100 transition-all duration-200 cursor-pointer"
            onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
          >
            <img src={intlIcon} alt="Language" className="w-5 h-5" />
            <span className="text-[#161616] text-base font-medium leading-6">{t(`language.${language === 'zh' ? 'chinese' : 'english'}`)}</span>
            <img 
              src={expandIcon} 
              alt="Expand" 
              className={`w-4 h-4 transition-transform duration-200 ${isLanguageDropdownOpen ? 'rotate-180' : ''}`} 
            />
          </div>
          
          {/* 下拉菜单 */}
          {isLanguageDropdownOpen && (
            <div className="absolute top-full mt-2 right-0 bg-white border border-[#E5E7EB] rounded-lg shadow-lg py-2 min-w-[120px] z-50">
              <div
                className="px-4 py-2 text-[#161616] text-base font-medium hover:bg-gray-100 cursor-pointer transition-colors duration-200"
                onClick={() => handleLanguageSelect('zh')}
              >
                {t('language.chinese')}
              </div>
              <div
                className="px-4 py-2 text-[#161616] text-base font-medium hover:bg-gray-100 cursor-pointer transition-colors duration-200"
                onClick={() => handleLanguageSelect('en')}
              >
                {t('language.english')}
              </div>
            </div>
          )}
        </div>
        <Link to="/login" className="w-[83px] h-9 px-5 py-1.5 rounded-lg border border-[#161616] flex justify-center items-center hover:bg-gray-100 transition-all duration-200">
          <span className="text-[#161616] text-base font-medium leading-6">{t('nav.login')}</span>
        </Link>
      </div>
    </div>
  );
};

export default Header;