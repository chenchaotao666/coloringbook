import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
const logo = '/images/logo.svg';
const intlIcon = '/images/intl.svg';
const expandIcon = '/images/expand.svg';
const creditsIcon = '/images/credits.svg';
const defaultAvatar = '/images/default-avatar.svg';
import { useLanguage, Language } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';

interface HeaderProps {
  backgroundColor?: 'transparent' | 'white';
}

const Header: React.FC<HeaderProps> = ({ backgroundColor = 'transparent' }) => {
  const { language, setLanguage, t } = useLanguage();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsLanguageDropdownOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
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

  const handleLogout = async () => {
    try {
      await logout();
      setIsUserDropdownOpen(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
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
        {/* 语言选择下拉菜单 */}
        <div className="relative" ref={dropdownRef}>
          <div 
            className="px-3 py-1.5 rounded-lg flex justify-start items-center gap-1.5 hover:opacity-60 transition-opacity duration-200 cursor-pointer"
            onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
          >
            <img src={intlIcon} alt="Language" className="w-5 h-5" />
            <span className="text-[#161616] text-base font-medium leading-6">{t(`language.${language === 'zh' ? 'chinese' : 'english'}`)}</span>
            <img 
              src={expandIcon} 
              alt="Expand" 
              className={`w-3 h-3 transition-transform duration-200 ${isLanguageDropdownOpen ? 'rotate-180' : ''}`} 
            />
          </div>

          {/* 语言下拉菜单 */}
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
        
        {/* 用户认证区域 */}
        {isLoading ? (
          /* 加载状态 - 显示占位符，避免闪烁 */
          <div className="flex items-center gap-4">
            <div className="w-20 h-8 rounded-lg animate-pulse"></div>
            <div className="w-8 h-8 rounded-full animate-pulse"></div>
          </div>
        ) : isAuthenticated && user ? (
          <div className="flex items-center gap-4">
            {/* 积分显示 */}
            <div className="flex items-center justify-center gap-1.5 px-5 py-1.5 rounded-lg" style={{backgroundColor: '#F9FAFB'}}>
              <img src={creditsIcon} alt="积分" className="w-4 h-4" />
              <span className="text-sm font-medium text-orange-600">{user.credits}</span>
            </div>

            {/* 用户头像和下拉菜单 */}
            <div className="relative" ref={userDropdownRef}>
              <div 
                className="flex items-center gap-2 hover:opacity-60 transition-opacity duration-200 cursor-pointer"
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
              >
                <img
                  className="w-8 h-8 rounded-full object-cover"
                  src={user.avatar || defaultAvatar}
                  alt="头像"
                />
                <img 
                  src={expandIcon} 
                  alt="Expand" 
                  className={`w-3 h-3 transition-transform duration-200 ${isUserDropdownOpen ? 'rotate-180' : ''}`} 
                />
              </div>

              {/* 用户下拉菜单 */}
              {isUserDropdownOpen && (
                <div className="absolute top-full mt-2 right-0 bg-white border border-[#E5E7EB] rounded-lg shadow-lg py-2 min-w-[180px] z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{user.username}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    onClick={() => setIsUserDropdownOpen(false)}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>个人资料</span>
                  </Link>
                  
                  <Link
                    to="/generate"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    onClick={() => setIsUserDropdownOpen(false)}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                    </svg>
                    <span>生成图片</span>
                  </Link>
                  
                  <div className="border-t border-gray-100 mt-1">
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>退出登录</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* 未登录状态 - 显示登录按钮 */
          <Link
            to="/login"
            className="inline-flex items-center px-4 py-1 border border-black text-sm font-medium rounded-md text-black hover:bg-gray-50 transition-colors duration-200"
          >
            登录
          </Link>
        )}
      </div>
    </div>
  );
};

export default Header;