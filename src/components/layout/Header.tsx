import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage, Language, useAsyncTranslation } from '../../contexts/LanguageContext';
import { generateLanguagePath } from '../common/LanguageRouter';
import { Category } from '../../services/categoriesService';
import { getLocalizedText } from '../../utils/textUtils';
import { handleCategoryClick } from '../../utils/categoryUtils';

// 导入图标 - 使用正确的 public 路径
const logo = '/images/logo.svg';
const intlIcon = '/images/intl.svg';
const expandIcon = '/images/expand.svg';
const creditsIcon = '/images/credits.svg';
const defaultAvatar = '/images/default-avatar.svg';
const googleDefaultAvatar = '/images/default-avatar-g.png';
const colorPaletteIcon = '/images/color-palette.png';

interface HeaderProps {
  backgroundColor?: 'transparent' | 'white';
  categories: Category[];
  categoriesLoading: boolean;
}

const Header: React.FC<HeaderProps> = ({ backgroundColor = 'transparent', categories, categoriesLoading }) => {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { t: navT } = useAsyncTranslation('navigation');
  const navigate = useNavigate();
  // const location = useLocation(); // 暂时不需要

  // 获取用户头像，如果是谷歌邮箱用户且没有自定义头像，使用谷歌默认头像
  const getUserAvatar = () => {
    if (user?.avatar) {
      return user.avatar;
    }
    
    // 如果没有邮箱信息，不显示头像
    if (!user?.email) {
      return null;
    }
    
    if (user.email.toLowerCase().endsWith('@gmail.com')) {
      return googleDefaultAvatar;
    }
    
    return defaultAvatar;
  };

  // 生成带语言前缀的链接
  const createLocalizedLink = (path: string) => {
    return generateLanguagePath(language, path);
  };

  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isUserDropdownVisible, setIsUserDropdownVisible] = useState(false);
  const [isUserDropdownAnimating, setIsUserDropdownAnimating] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileMenuVisible, setIsMobileMenuVisible] = useState(false);
  const [isMobileMenuAnimating, setIsMobileMenuAnimating] = useState(false);
  const [isDesktopLanguageDropdownOpen, setIsDesktopLanguageDropdownOpen] = useState(false);
  const [isDesktopLanguageVisible, setIsDesktopLanguageVisible] = useState(false);
  const [isDesktopLanguageAnimating, setIsDesktopLanguageAnimating] = useState(false);
  const [isMobileLanguageDropdownOpen, setIsMobileLanguageDropdownOpen] = useState(false);
  const [isMobileLanguageVisible, setIsMobileLanguageVisible] = useState(false);
  const [isMobileLanguageAnimating, setIsMobileLanguageAnimating] = useState(false);
  const [isCategoriesDropdownOpen, setIsCategoriesDropdownOpen] = useState(false);
  const [isCategoriesDropdownVisible, setIsCategoriesDropdownVisible] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const hamburgerButtonRef = useRef<HTMLButtonElement>(null);
  const categoriesDropdownRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // 桌面端语言选择下拉菜单
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDesktopLanguageDropdownOpen(false);
      }
      // 用户下拉菜单
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
      // 分类下拉菜单
      if (categoriesDropdownRef.current && !categoriesDropdownRef.current.contains(event.target as Node)) {
        setIsCategoriesDropdownOpen(false);
      }
      // 移动端菜单 - 排除汉堡菜单按钮的点击
      if (mobileMenuRef.current && 
          !mobileMenuRef.current.contains(event.target as Node) &&
          hamburgerButtonRef.current &&
          !hamburgerButtonRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
        setIsMobileLanguageDropdownOpen(false); // 关闭移动端菜单时也关闭语言下拉框
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen, isUserDropdownOpen, isDesktopLanguageDropdownOpen, isMobileLanguageDropdownOpen, isCategoriesDropdownOpen]);

  // 控制移动端菜单的显示动画
  useEffect(() => {
    if (isMobileMenuOpen) {
      // 1. 立即显示DOM
      setIsMobileMenuVisible(true);
      document.body.classList.add('mobile-menu-open');
      
      // 2. 下一帧开始渐入动画
      const timer = setTimeout(() => {
        setIsMobileMenuAnimating(true);
      }, 10);
      
      return () => clearTimeout(timer);
    } else {
      // 1. 立即开始渐出动画
      setIsMobileMenuAnimating(false);
      document.body.classList.remove('mobile-menu-open');
      
      // 2. 延迟隐藏DOM，让退出动画完成
      const timer = setTimeout(() => {
        setIsMobileMenuVisible(false);
      }, 200); // 匹配CSS transition duration
      
      return () => clearTimeout(timer);
    }
  }, [isMobileMenuOpen]);

  // 控制移动端语言下拉框的显示动画
  useEffect(() => {
    if (isMobileLanguageDropdownOpen) {
      setIsMobileLanguageVisible(true);
      const timer = setTimeout(() => {
        setIsMobileLanguageAnimating(true);
      }, 10);
      return () => clearTimeout(timer);
    } else {
      setIsMobileLanguageAnimating(false);
      const timer = setTimeout(() => {
        setIsMobileLanguageVisible(false);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isMobileLanguageDropdownOpen]);

  // 控制桌面端语言下拉框的显示动画
  useEffect(() => {
    if (isDesktopLanguageDropdownOpen) {
      setIsDesktopLanguageVisible(true);
      const timer = setTimeout(() => {
        setIsDesktopLanguageAnimating(true);
      }, 10);
      return () => clearTimeout(timer);
    } else {
      setIsDesktopLanguageAnimating(false);
      const timer = setTimeout(() => {
        setIsDesktopLanguageVisible(false);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isDesktopLanguageDropdownOpen]);

  // 控制用户下拉框的显示动画
  useEffect(() => {
    if (isUserDropdownOpen) {
      setIsUserDropdownVisible(true);
      const timer = setTimeout(() => {
        setIsUserDropdownAnimating(true);
      }, 10);
      return () => clearTimeout(timer);
    } else {
      setIsUserDropdownAnimating(false);
      const timer = setTimeout(() => {
        setIsUserDropdownVisible(false);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isUserDropdownOpen]);

  // 控制分类下拉框的显示（无动画）
  useEffect(() => {
    setIsCategoriesDropdownVisible(isCategoriesDropdownOpen);
  }, [isCategoriesDropdownOpen]);

  const handleLanguageSelect = (lang: Language) => {
    setLanguage(lang);
    setIsDesktopLanguageDropdownOpen(false);
  };

  const handleLogout = async () => {
    try {
      setIsUserDropdownOpen(false);
      setIsMobileMenuOpen(false);
      await logout(); // 这里会自动跳转到首页
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleMobileLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  // 将API数据转换为菜单显示格式
  const getCategoriesMenuData = () => {
    if (categoriesLoading || !categories || categories.length === 0) {
      return { title: '', categories: [] };
    }

    // 取前21个分类（3列 × 7个）
    const displayCategories = categories.slice(0, 21);
    
    return {
      title: navT('categories.popularColoringPages', 'Popular Coloring Pages'),
      categories: displayCategories.map((category: Category) => ({
        label: getLocalizedText(category.displayName, language) || category.name,
        category: category // 传递完整的分类对象
      }))
    };
  };

  const categoriesMenuData = getCategoriesMenuData();

  const bgClass = backgroundColor === 'white' ? 'bg-white' : 'bg-transparent';

  // 汉堡菜单图标组件
  const HamburgerIcon = () => (
    <div className="w-6 h-6 flex justify-center items-center">
      {isMobileMenuOpen ? (
        // 三个竖杆
        <div className="flex justify-center items-center gap-1">
          <div className="w-0.5 h-5 bg-[#161616] transition-all duration-300"></div>
          <div className="w-0.5 h-5 bg-[#161616] transition-all duration-300"></div>
          <div className="w-0.5 h-5 bg-[#161616] transition-all duration-300"></div>
        </div>
      ) : (
        // 三个横杆
        <div className="flex flex-col justify-center items-center gap-1">
          <div className="w-5 h-0.5 bg-[#161616] transition-all duration-300"></div>
          <div className="w-5 h-0.5 bg-[#161616] transition-all duration-300"></div>
          <div className="w-5 h-0.5 bg-[#161616] transition-all duration-300"></div>
        </div>
      )}
    </div>
  );

  return (
    <>
      <div className={`fixed top-0 left-0 right-0 w-full h-[70px] py-[15px] ${bgClass} bg-opacity-98 backdrop-blur-md flex justify-between items-center z-50`}>
        {/* Logo */}
        <Link to={createLocalizedLink("/")} className="relative z-10 pl-4 sm:pl-5 flex justify-start items-center gap-1 hover:opacity-90 transition-opacity duration-200">
          <img src={logo} alt="Logo" className="w-8 h-8 sm:w-10 sm:h-10" />
          <div className="text-[#161616] text-xl sm:text-2xl font-medium">Coloring</div>
        </Link>

        {/* 桌面端导航菜单 */}
        <div className="hidden lg:flex relative z-10 max-h-6 justify-start items-start gap-10 flex-wrap">
          <Link to={createLocalizedLink("/")} className="px-4 py-4 -mx-4 -my-4 text-[#161616] text-base font-medium leading-6 hover:text-[#FF5C07] transition-colors duration-200 block">
            {navT('menu.home', 'Home')}
          </Link>
          
          {/* 免费涂色页 - 带下拉菜单 */}
          <div 
            className="relative" 
            ref={categoriesDropdownRef}
            onMouseEnter={() => setIsCategoriesDropdownOpen(true)}
            onMouseLeave={() => setIsCategoriesDropdownOpen(false)}
          >
            <Link 
              to={createLocalizedLink("/categories")} 
              className="px-4 py-4 -mx-4 -my-4 text-[#161616] text-base font-medium leading-6 hover:text-[#FF5C07] transition-colors duration-200 flex items-center gap-1 group"
            >
              {navT('menu.coloringPagesFree', 'Coloring Pages Free')}
              <svg 
                className="w-5 h-5 transition-colors duration-200 group-hover:text-[#FF5C07]" 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>

            {/* 分类下拉菜单 */}
            {isCategoriesDropdownVisible && (
              <div className="absolute top-full mt-2 left-0 bg-white rounded-lg border border-[#E5E7EB] w-[600px] z-50"
              style={{boxShadow: '0px 0px 20px 0px rgba(0, 0, 0, 0.10)'}}
              >
                <div className="p-5">
                  <p className="mb-4 text-base font-semibold text-black">
                    {categoriesMenuData.title}
                  </p>
                  <div className="grid grid-cols-3 gap-6">
                    {(() => {
                      // 将分类分成3列
                      const categoryItems = categoriesMenuData.categories;
                      const itemsPerColumn = Math.ceil(categoryItems.length / 3);
                      const columns = [];
                      
                      for (let i = 0; i < 3; i++) {
                        const columnCategories = categoryItems.slice(i * itemsPerColumn, (i + 1) * itemsPerColumn);
                        columns.push(
                          <div key={i}>
                            <ul className="space-y-2">
                              {columnCategories.map((categoryItem, categoryIndex) => (
                                <li key={categoryIndex}>
                                  <button 
                                    onClick={() => {
                                      handleCategoryClick(categoryItem.category, navigate);
                                      setIsCategoriesDropdownOpen(false);
                                    }}
                                    className="block w-full text-left py-2 px-3 -mx-3 text-gray-500 hover:text-orange-600 hover:bg-gray-50 transition-colors duration-200 text-sm rounded-md"
                                  >
                                    {categoryItem.label}
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        );
                      }
                      
                      return columns;
                    })()}
                  </div>
                </div>
              </div>
            )}
          </div>

          <Link to={createLocalizedLink("/text-coloring-page")} className="px-4 py-4 -mx-4 -my-4 text-[#161616] text-base font-medium leading-6 hover:text-[#FF5C07] transition-colors duration-200 block">
            {navT('menu.textColoringPage', 'Text Coloring Page')}
          </Link>
          <Link to={createLocalizedLink("/image-coloring-page")} className="px-4 py-4 -mx-4 -my-4 text-[#161616] text-base font-medium leading-6 hover:text-[#FF5C07] transition-colors duration-200 block">
            {navT('menu.imageColoringPage', 'Image Coloring Page')}
          </Link>
          <Link to={createLocalizedLink("/price")} className="px-4 py-4 -mx-4 -my-4 text-[#161616] text-base font-medium leading-6 hover:text-[#FF5C07] transition-colors duration-200 block">
            {navT('menu.pricing', 'Pricing')}
          </Link>
          <Link to={createLocalizedLink("/blog")} className="px-4 py-4 -mx-4 -my-4 text-[#161616] text-base font-medium leading-6 hover:text-[#FF5C07] transition-colors duration-200 block">
            {navT('menu.blog', 'Blog')}
          </Link>
        </div>

        {/* 桌面端右侧菜单 */}
        <div className="hidden lg:flex relative z-10 min-w-[300px] pr-5 justify-end items-center gap-[20px]">
          {/* 语言选择下拉菜单 */}
          <div className="relative flex-shrink-0" ref={dropdownRef}>
            <div 
              className="px-3 py-1.5 rounded-lg flex justify-start items-center gap-1.5 hover:opacity-85 transition-opacity duration-200 cursor-pointer min-w-fit"
              onClick={() => setIsDesktopLanguageDropdownOpen(!isDesktopLanguageDropdownOpen)}
            >
              <img src={intlIcon} alt="Language" className="w-5 h-5 flex-shrink-0" />
              <span className="text-[#161616] text-base font-medium leading-6 whitespace-nowrap flex-shrink-0">
                {language === 'zh' ? navT('language.chinese', '简体中文') : 
                 language === 'ja' ? navT('language.japanese', '日本語') : 
                 navT('language.english', 'English')}
              </span>
              <svg 
                className={`w-5 h-5 flex-shrink-0 transition-all duration-200 ${isDesktopLanguageDropdownOpen ? 'rotate-180' : ''}`} 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>

            {/* 语言下拉菜单 */}
            {isDesktopLanguageVisible && (
              <div className={`absolute top-full mt-[2px] right-0 bg-white border border-[#E5E7EB] rounded-lg shadow-lg py-2 min-w-[120px] z-50 transition-all duration-150 ease-out ${
                isDesktopLanguageAnimating 
                  ? 'opacity-100 translate-y-0 scale-100' 
                  : 'opacity-0 -translate-y-1 scale-95'
              }`}>
                <div
                  className="px-4 py-1.5 text-[#161616] text-base font-medium hover:bg-gray-100 cursor-pointer transition-colors duration-200 whitespace-nowrap"
                  onClick={() => handleLanguageSelect('en')}
                >
                  {navT('language.english', 'English')}
                </div>
                <div
                  className="px-4 py-1.5 text-[#161616] text-base font-medium hover:bg-gray-100 cursor-pointer transition-colors duration-200 whitespace-nowrap"
                  onClick={() => handleLanguageSelect('zh')}
                >
                  {navT('language.chinese', '简体中文')}
                </div>
                {/* <div
                  className="px-4 py-1.5 text-[#161616] text-base font-medium hover:bg-gray-100 cursor-pointer transition-colors duration-200 whitespace-nowrap"
                  onClick={() => handleLanguageSelect('ja')}
                >
                  {navT('language.japanese', '日本語')}
                </div> */}
              </div>
            )}
          </div>
          
          {/* 用户认证区域 */}
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              {/* 积分显示 */}
              <Link 
                to={createLocalizedLink("/price")}
                className="flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-lg hover:opacity-90 transition-opacity duration-200 cursor-pointer flex-shrink-0 min-w-[80px]" 
                style={{backgroundColor: '#F9FAFB'}}
              >
                <img src={creditsIcon} alt="积分" className="w-4 h-4" />
                <span className="text-sm font-medium text-orange-600 tabular-nums">
                  {user ? user.credits : ''}
                </span>
              </Link>

              {/* 用户头像和下拉菜单 */}
              <div className="relative flex-shrink-0 w-[50px]" ref={userDropdownRef}>
                <div 
                  className="flex items-center gap-2 hover:opacity-85 transition-opacity duration-200 cursor-pointer"
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                >
                  {getUserAvatar() ? (
                    <img
                      className="w-6 h-6 rounded-full object-cover"
                      src={getUserAvatar()!}
                      alt="头像"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-transparent"></div>
                  )}
                  <img 
                    src={expandIcon} 
                    alt="Expand" 
                    className={`w-3 h-3 transition-transform duration-200 ${isUserDropdownOpen ? 'rotate-180' : ''}`} 
                  />
                </div>

                {/* 用户下拉菜单 */}
                {isUserDropdownVisible && (
                  <div className={`absolute top-full mt-2 right-0 bg-white border border-[#E5E7EB] rounded-lg shadow-lg py-2 min-w-[180px] z-50 transition-all duration-150 ease-out ${
                    isUserDropdownAnimating 
                      ? 'opacity-100 translate-y-0 scale-100' 
                      : 'opacity-0 -translate-y-1 scale-95'
                  }`}>
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{user?.username || '...'}</p>
                      <p className="text-xs text-gray-500">{user?.email || '...'}</p>
                    </div>
                    
                    <Link
                      to={createLocalizedLink("/profile")}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                      onClick={() => setIsUserDropdownOpen(false)}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>{navT('menu.profile', 'Profile')}</span>
                    </Link>
                    
                    <Link
                      to={createLocalizedLink("/creations")}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                      onClick={() => setIsUserDropdownOpen(false)}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{navT('menu.myCreations', 'My Creations')}</span>
                    </Link>
                    
                    {/* <Link
                      to="/text-coloring-page"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                      onClick={() => setIsUserDropdownOpen(false)}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                      </svg>
                      <span>{t('buttons.generate')}</span>
                    </Link> */}
                    
                    <div className="border-t border-gray-100 mt-1">
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>{navT('menu.logout', 'Logout')}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : !isLoading ? (
            /* 未登录状态 - 显示登录按钮 */
            <Link
              to={createLocalizedLink("/login")}
              className="inline-flex items-center px-4 py-1 border border-black text-sm font-medium rounded-md text-black hover:bg-gray-50 transition-colors duration-200"
            >
              {navT('menu.login', 'Login')}
            </Link>
          ) : (
            /* 加载状态 - 只在有token但正在验证时显示 */
            <div className="flex items-center gap-4">
              <div className="w-20 h-8 rounded-lg bg-gray-200 animate-pulse"></div>
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
            </div>
          )}
        </div>

        {/* 移动端右侧区域 */}
        <div className="lg:hidden flex items-center">
          {/* 移动端积分显示（仅在已登录时显示） */}
          {isAuthenticated && (
            <div className="pr-3">
              <Link 
                to={createLocalizedLink("/price")}
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity duration-200 cursor-pointer min-w-[72px]" 
                style={{backgroundColor: '#FAFBFC'}}
              >
                <img src={creditsIcon} alt="积分" className="w-4 h-4" />
                <span className="text-sm font-medium text-orange-600 tabular-nums">
                  {user ? user.credits : ''}
                </span>
              </Link>
            </div>
          )}

          {/* 调色板图标 */}
          <div className="pr-3">
            <Link 
              to={createLocalizedLink("/image-coloring-page")}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 flex items-center justify-center"
            >
              <img src={colorPaletteIcon} alt="Image Coloring Page" className="w-6 h-6" />
            </Link>
          </div>

          {/* 汉堡菜单按钮 */}
          <div className="pr-4">
            <button
              ref={hamburgerButtonRef}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 flex items-center justify-center"
              aria-label={t('common.buttons.openMenu')}
            >
              <HamburgerIcon />
            </button>
          </div>
        </div>
      </div>

      {/* 移动端下拉菜单 */}
      {isMobileMenuVisible && (
        <div 
          ref={mobileMenuRef}
          className={`lg:hidden fixed top-[70px] right-4 w-60 z-50 transition-all duration-200 ease-out ${
            isMobileMenuAnimating 
              ? 'opacity-100 translate-y-0 scale-100' 
              : 'opacity-0 -translate-y-2 scale-95'
          }`}
        >
          <div className="bg-white shadow-lg rounded-lg p-1 space-y-0.5 border border-gray-200">
            {/* 用户信息区域 */}
            {isAuthenticated ? (
              <div className="py-2 border-b border-gray-200">
                <div className="px-3 pt-2">
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-10 h-10">
                      {getUserAvatar() ? (
                        <img
                          className="w-full h-full rounded-full object-cover"
                          src={getUserAvatar()!}
                          alt="头像"
                        />
                      ) : (
                        <div className="w-full h-full rounded-full bg-transparent"></div>
                      )}
                    </div>
                    <div className="ml-3">
                      {user?.username && (
                        <p className="text-base font-semibold leading-normal text-gray-900">{user.username}</p>
                      )}
                      <p className="text-sm text-gray-600">{user?.email || '...'}</p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <Link 
                      to={createLocalizedLink("/price")}
                      className="flex items-center gap-2 hover:opacity-90 transition-opacity duration-200 cursor-pointer inline-flex min-w-[60px]"
                      onClick={handleMobileLinkClick}
                    >
                      <img src={creditsIcon} alt="积分" className="w-4 h-4" />
                      <span className="text-sm font-medium text-orange-600 tabular-nums">
                        {user ? user.credits : ''}
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            ) : null}
            
            {/* 语言选择 - 下拉方式 */}
            <div className="py-1 border-b border-gray-200">
              <div className="px-3 relative">
                <button 
                  className="flex items-center justify-between w-full py-2 text-sm font-normal text-gray-700 transition-colors duration-200"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsMobileLanguageDropdownOpen(!isMobileLanguageDropdownOpen);
                  }}
                >
                  <span className="whitespace-nowrap">
                    {language === 'zh' ? navT('language.chinese', '简体中文') : 
                     language === 'ja' ? navT('language.japanese', '日本語') : 
                     navT('language.english', 'English')}
                  </span>
                  <svg 
                    className={`w-5 h-5 transition-all duration-200 ${isMobileLanguageDropdownOpen ? 'rotate-180' : ''}`} 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {/* 下拉菜单 - 浮动样式 */}
                {isMobileLanguageVisible && (
                  <div className={`absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50 transition-all duration-150 ease-out ${
                    isMobileLanguageAnimating 
                      ? 'opacity-100 translate-y-0 scale-100' 
                      : 'opacity-0 -translate-y-1 scale-95'
                  }`}>
                    <button
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setLanguage('zh');
                        setIsMobileLanguageDropdownOpen(false);
                      }}
                      className="block w-full px-3 py-2 text-sm text-left text-gray-700 hover:bg-gray-50 transition-colors duration-200 whitespace-nowrap"
                    >
                      {navT('language.chinese', '简体中文')} {language === 'zh' ? '✓' : ''}
                    </button>
                    <button
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setLanguage('en');
                        setIsMobileLanguageDropdownOpen(false);
                      }}
                      className="block w-full px-3 py-2 text-sm text-left text-gray-700 hover:bg-gray-50 transition-colors duration-200 whitespace-nowrap"
                    >
                      {navT('language.english', 'English')} {language === 'en' ? '✓' : ''}
                    </button>
                    <button
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setLanguage('ja');
                        setIsMobileLanguageDropdownOpen(false);
                      }}
                      className="block w-full px-3 py-2 text-sm text-left text-gray-700 hover:bg-gray-50 transition-colors duration-200 whitespace-nowrap"
                    >
                      {navT('language.japanese', '日本語')} {language === 'ja' ? '✓' : ''}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* 导航链接 */}
            <div className="border-b border-gray-200">
              <Link 
                to={createLocalizedLink("/")} 
                className="block px-3 py-3 text-sm font-normal text-gray-700 hover:text-[#FF5C07] hover:bg-gray-50 transition-colors duration-200"
                onClick={handleMobileLinkClick}
              >
                {navT('menu.home', 'Home')}
              </Link>
            </div>
            <div className="border-b border-gray-200">
              <Link 
                to={createLocalizedLink("/categories")} 
                className="block px-3 py-3 text-sm font-normal text-gray-700 hover:text-[#FF5C07] hover:bg-gray-50 transition-colors duration-200"
                onClick={handleMobileLinkClick}
              >
                {navT('menu.coloringPagesFree', 'Coloring Pages Free')}
              </Link>
            </div>
            <div className="border-b border-gray-200">
              <Link 
                to={createLocalizedLink("/image-coloring-page")} 
                className="block px-3 py-3 text-sm font-normal text-gray-700 hover:text-[#FF5C07] hover:bg-gray-50 transition-colors duration-200"
                onClick={handleMobileLinkClick}
              >
                {navT('menu.imageColoringPage', 'Image Coloring Page')}
              </Link>
            </div>
            <div className="border-b border-gray-200">
              <Link 
                to={createLocalizedLink("/text-coloring-page")} 
                className="block px-3 py-3 text-sm font-normal text-gray-700 hover:text-[#FF5C07] hover:bg-gray-50 transition-colors duration-200"
                onClick={handleMobileLinkClick}
              >
                {navT('menu.textColoringPage', 'Text Coloring Page')}
              </Link>
            </div>
            <div className="border-b border-gray-200">
              <Link 
                to={createLocalizedLink("/price")} 
                className="block px-3 py-3 text-sm font-normal text-gray-700 hover:text-[#FF5C07] hover:bg-gray-50 transition-colors duration-200"
                onClick={handleMobileLinkClick}
              >
                {navT('menu.pricing', 'Pricing')}
              </Link>
            </div>
            <div className="border-b border-gray-200">
              <Link 
                to={createLocalizedLink("/blog")} 
                className="block px-3 py-3 text-sm font-normal text-gray-700 hover:text-[#FF5C07] hover:bg-gray-50 transition-colors duration-200"
                onClick={handleMobileLinkClick}
              >
                {navT('menu.blog', 'Blog')}
              </Link>
            </div>

            {/* 用户菜单 */}
            {isAuthenticated && user ? (
              <>
                <div className="border-b border-gray-200">
                  <Link
                    to={createLocalizedLink("/profile")}
                    className="block px-3 py-3 text-sm font-normal text-gray-700 hover:text-[#FF5C07] hover:bg-gray-50 transition-colors duration-200"
                    onClick={handleMobileLinkClick}
                  >
                    {navT('menu.profile', 'Profile')}
                  </Link>
                </div>
                <div className="border-b border-gray-200">
                  <Link
                    to={createLocalizedLink("/creations")}
                    className="block px-3 py-3 text-sm font-normal text-gray-700 hover:text-[#FF5C07] hover:bg-gray-50 transition-colors duration-200"
                    onClick={handleMobileLinkClick}
                  >
                    {navT('menu.myCreations', 'My Creations')}
                  </Link>
                </div>
                <div>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-3 text-sm text-gray-800 hover:bg-gray-100 transition-colors duration-200"
                  >
                    {navT('menu.logout', 'Logout')}
                  </button>
                </div>
              </>
            ) : (
              <div>
                <Link
                  to={createLocalizedLink("/login")}
                  className="block px-3 py-3 text-sm text-gray-800 hover:bg-gray-100 transition-colors duration-200"
                  onClick={handleMobileLinkClick}
                >
                  {navT('menu.login', 'Login')}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Header;