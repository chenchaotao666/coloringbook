import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const creditsIcon = '/images/credits.svg';
const defaultAvatar = '/images/default-avatar.svg';

const AuthNav: React.FC = () => {
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // 加载状态 - 显示占位符，避免闪烁
  if (isLoading) {
    return (
      <div className="flex items-center space-x-4">
        <div className="w-20 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className="flex items-center space-x-4">
        {/* 积分显示 */}
        <div className="flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-lg" style={{backgroundColor: '#F9FAFB'}}>
          <img src={creditsIcon} alt="积分" className="w-4 h-4" />
          <span className="text-sm font-medium text-orange-600">{user.credits}</span>
        </div>

        {/* 用户头像和下拉菜单 */}
        <div className="relative group">
          <button className="flex items-center space-x-2 text-gray-700 hover:opacity-60 focus:outline-none transition-opacity duration-200">
            <img
              className="h-8 w-8 rounded-full object-cover border-2 border-orange-200"
              src={user.avatar || defaultAvatar}
              alt="头像"
            />
            <svg className="h-3 w-3 transition-transform duration-200 group-hover:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* 下拉菜单 */}
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 border border-[#E5E7EB]">
            <div className="px-4 py-2 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900">{user.username}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
            
            <Link
              to="/profile"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>个人资料</span>
            </Link>
            
            <Link
              to="/text-coloring-page"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
              </svg>
              <span>生成图片</span>
            </Link>
            
            <div className="border-t border-gray-100 mt-1">
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>退出登录</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      <Link
        to="/login"
        className="inline-flex items-center px-4 py-2 border border-black text-sm font-medium rounded-md text-black hover:bg-gray-50 transition-colors duration-200"
      >
        登录
      </Link>
    </div>
  );
};

export default AuthNav; 