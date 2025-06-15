import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { TokenRefreshDebug } from '../components/TokenRefreshDebug';

// 导入图标
const creditsIcon = '/images/credits.svg';

const TestAuthPage: React.FC = () => {
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      alert('退出登录成功');
    } catch (error) {
      console.error('Logout failed:', error);
      alert('退出登录失败');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">认证系统测试页面</h1>
        
        {/* 认证状态调试信息 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">认证状态调试</h2>
          <div className="space-y-2 text-sm">
            <p><strong>isLoading:</strong> {isLoading ? '是' : '否'}</p>
            <p><strong>isAuthenticated:</strong> {isAuthenticated ? '是' : '否'}</p>
            <p><strong>user 对象:</strong> {user ? '存在' : '不存在'}</p>
            {user && (
              <div className="mt-4 p-4 bg-gray-50 rounded">
                <h3 className="font-medium mb-2">用户数据:</h3>
                <pre className="text-xs overflow-auto">{JSON.stringify(user, null, 2)}</pre>
              </div>
            )}
          </div>
        </div>

        {/* 当前状态显示 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">当前状态</h2>
          
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">加载中...</p>
            </div>
          ) : isAuthenticated && user ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg">
                <img
                  className="h-12 w-12 rounded-full object-cover border-2 border-green-200"
                  src={user.avatar || '/images/default-avatar.svg'}
                  alt="头像"
                />
                <div>
                  <h3 className="text-lg font-medium text-green-900">欢迎回来，{user.username}！</h3>
                  <p className="text-green-700">邮箱: {user.email}</p>
                  <div className="flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-lg mt-1 inline-flex" style={{backgroundColor: '#F9FAFB'}}>
                    <img src={creditsIcon} alt="积分" className="w-4 h-4" />
                    <span className="text-sm font-medium text-orange-600">{user.credits}</span>
                  </div>
                  <p className="text-green-700 mt-1">用户类型: {user.userType}</p>
                </div>
              </div>
              
              <div className="mt-6 space-y-4">
                <button
                  onClick={handleLogout}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  退出登录
                </button>
                
                <button
                  onClick={() => window.location.href = '/generate'}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  测试生成功能
                </button>
                
                <button
                  onClick={() => window.location.href = '/price'}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  充值页面
                </button>
                
                <button
                  onClick={() => window.location.href = '/price'}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  测试充值功能
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-4">
                <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">未登录</h3>
              <p className="text-gray-600 mb-4">请登录以查看用户信息</p>
              
              <div className="flex justify-center space-x-4">
                <Link
                  to="/login"
                  className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                >
                  登录
                </Link>
                <Link
                  to="/register"
                  className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
                >
                  注册
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* 快速导航 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">快速导航</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/" className="text-center p-4 border rounded hover:bg-gray-50">
              <div className="text-2xl mb-2">🏠</div>
              <div className="text-sm">首页</div>
            </Link>
            <Link to="/login" className="text-center p-4 border rounded hover:bg-gray-50">
              <div className="text-2xl mb-2">🔑</div>
              <div className="text-sm">登录</div>
            </Link>
            <Link to="/register" className="text-center p-4 border rounded hover:bg-gray-50">
              <div className="text-2xl mb-2">📝</div>
              <div className="text-sm">注册</div>
            </Link>
            <Link to="/profile" className="text-center p-4 border rounded hover:bg-gray-50">
              <div className="text-2xl mb-2">👤</div>
              <div className="text-sm">个人资料</div>
            </Link>
          </div>
        </div>

        {/* Token自动刷新调试 */}
        <TokenRefreshDebug className="mt-6" />

        {/* 本地存储调试 */}
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">本地存储调试</h2>
          <div className="space-y-2 text-sm">
            <p><strong>Access Token:</strong> {localStorage.getItem('accessToken') ? '存在' : '不存在'}</p>
            <p><strong>Refresh Token:</strong> {localStorage.getItem('refreshToken') ? '存在' : '不存在'}</p>
            {localStorage.getItem('accessToken') && (
              <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                <p><strong>Token:</strong> {localStorage.getItem('accessToken')?.substring(0, 50)}...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestAuthPage; 