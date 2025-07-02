import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserService } from '../services/userService';
import { ApiError } from '../utils/apiUtils';

// 导入图标
const creditsIcon = '/images/credits.svg';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user: authUser, refreshUser, logout } = useAuth();
  
  const [user, setUser] = useState<typeof authUser>(null);
  const [formData, setFormData] = useState({
    username: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null);

  // 加载用户信息
  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setIsLoadingUser(true);
      
      if (!authUser) {
        // 用户未登录，跳转到登录页面
        navigate('/login', { 
          state: { 
            from: { pathname: '/profile' },
            message: '请先登录以访问个人资料'
          }
        });
        return;
      }

      setUser(authUser);
      setFormData(prev => ({
        ...prev,
        username: authUser.username
      }));
      setAvatarPreview(authUser.avatar || '');
    } catch (error) {
      console.error('Failed to load user profile:', error);
      setErrors({ general: '加载用户信息失败，请刷新页面重试' });
    } finally {
      setIsLoadingUser(false);
    }
  };

  // 表单验证
  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    // 用户名验证
    if (!formData.username.trim()) {
      newErrors.username = '请输入用户名';
    } else if (formData.username.length < 2) {
      newErrors.username = '用户名至少需要2个字符';
    } else if (formData.username.length > 20) {
      newErrors.username = '用户名不能超过20个字符';
    }

    // 如果要修改密码，验证密码字段
    if (formData.newPassword || formData.currentPassword || formData.confirmPassword) {
      if (!formData.currentPassword) {
        newErrors.currentPassword = '请输入当前密码';
      }

      if (!formData.newPassword) {
        newErrors.newPassword = '请输入新密码';
      } else if (formData.newPassword.length < 6) {
        newErrors.newPassword = '新密码至少需要6个字符';
      } else if (formData.newPassword.length > 50) {
        newErrors.newPassword = '新密码不能超过50个字符';
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = '请确认新密码';
      } else if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = '两次输入的新密码不一致';
      }

      if (formData.currentPassword === formData.newPassword) {
        newErrors.newPassword = '新密码不能与当前密码相同';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // 清除对应字段的错误
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // 清除成功消息
    if (successMessage) {
      setSuccessMessage('');
    }
  };

  // 处理头像选择
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      setErrors({ avatar: '请选择图片文件' });
      return;
    }

    // 验证文件大小（5MB）
    if (file.size > 5 * 1024 * 1024) {
      setErrors({ avatar: '图片大小不能超过5MB' });
      return;
    }

    setSelectedAvatarFile(file);
    
    // 创建预览
    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // 清除头像错误
    if (errors.avatar) {
      setErrors(prev => ({
        ...prev,
        avatar: ''
      }));
    }
  };

  // 触发文件选择
  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      // 更新用户名和密码
      const updateData: any = {};
      if (formData.username !== user?.username) {
        updateData.username = formData.username.trim();
      }
      if (formData.newPassword) {
        updateData.password = formData.newPassword;
      }
      
      if (Object.keys(updateData).length > 0) {
        await UserService.updateUser(updateData);
      }

      // 上传头像
      if (selectedAvatarFile) {
        await UserService.uploadAvatar(selectedAvatarFile);
      }

      // 重新加载用户信息
      await refreshUser();

      // 清除密码字段
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      setSelectedAvatarFile(null);

      setSuccessMessage('个人信息更新成功！');
    } catch (error) {
      console.error('Update profile failed:', error);
      
      if (error instanceof ApiError) {
        // 处理特定的API错误
        switch (error.errorCode) {
          case '1002':
            setErrors({ username: '该用户名已被使用' });
            break;
          case '1005':
            setErrors({ currentPassword: '当前密码错误' });
            break;
          case '1003':
            setErrors({ general: '输入信息格式不正确，请检查后重试' });
            break;
          case '3001':
            setErrors({ avatar: '头像上传失败，请重试' });
            break;
          default:
            setErrors({ general: error.message || '更新失败，请稍后重试' });
        }
      } else {
        setErrors({ general: '网络错误，请检查网络连接后重试' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 退出登录
  const handleLogout = async () => {
    try {
      await logout(); // 这里会自动跳转到首页
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (isLoadingUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 text-gray-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-2 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">个人资料</h1>
          <p className="mt-2 text-gray-600">管理您的账户信息和设置</p>
        </div>

        <div className="bg-white shadow rounded-lg">
          {/* 用户信息概览 */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <img
                  className="h-16 w-16 rounded-full object-cover"
                  src={avatarPreview || user?.avatar || '/images/default-avatar.svg'}
                  alt="头像"
                />
                <button
                  type="button"
                  onClick={triggerFileSelect}
                  className="absolute inset-0 w-full h-full rounded-full bg-black bg-opacity-50 flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{user?.username}</h2>
                <p className="text-gray-600">{user?.email}</p>
                <div className="flex items-center space-x-4 mt-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {user?.userType === 'free' ? '免费用户' : user?.userType === 'lite' ? 'Lite用户' : 'Pro用户'}
                  </span>
                  <div className="flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-lg mt-1 inline-flex" style={{backgroundColor: '#F9FAFB'}}>
                    <img src={creditsIcon} alt="积分" className="w-4 h-4" />
                    <span className="text-sm font-medium text-orange-600">{user?.credits}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 表单 */}
          <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />

            {successMessage && (
              <div className="rounded-md bg-green-50 p-4">
                <div className="text-sm text-green-700">{successMessage}</div>
              </div>
            )}

            {errors.general && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{errors.general}</div>
              </div>
            )}

            {errors.avatar && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{errors.avatar}</div>
              </div>
            )}

            {/* 基本信息 */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">基本信息</h3>
              
              {/* 用户名 */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  用户名
                </label>
                <div className="mt-1">
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={formData.username}
                    onChange={handleInputChange}
                    className={`block w-full px-3 py-2 border ${
                      errors.username ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    placeholder="请输入用户名"
                  />
                  {errors.username && (
                    <p className="mt-1 text-sm text-red-600">{errors.username}</p>
                  )}
                </div>
              </div>

              {/* 邮箱（只读） */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  邮箱地址
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 sm:text-sm"
                  />
                  <p className="mt-1 text-xs text-gray-500">邮箱地址无法修改</p>
                </div>
              </div>
            </div>

            {/* 密码修改 */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">修改密码</h3>
              <p className="text-sm text-gray-600">如果不需要修改密码，请留空以下字段</p>
              
              {/* 当前密码 */}
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                  当前密码
                </label>
                <div className="mt-1">
                  <input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    className={`block w-full px-3 py-2 border ${
                      errors.currentPassword ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    placeholder="请输入当前密码"
                  />
                  {errors.currentPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.currentPassword}</p>
                  )}
                </div>
              </div>

              {/* 新密码 */}
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                  新密码
                </label>
                <div className="mt-1">
                  <input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    className={`block w-full px-3 py-2 border ${
                      errors.newPassword ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    placeholder="请输入新密码（至少6个字符）"
                  />
                  {errors.newPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>
                  )}
                </div>
              </div>

              {/* 确认新密码 */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  确认新密码
                </label>
                <div className="mt-1">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`block w-full px-3 py-2 border ${
                      errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    placeholder="请再次输入新密码"
                  />
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>
            </div>

            {/* 按钮组 */}
            <div className="flex justify-between pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                退出登录
              </button>
              
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  取消
                </button>
                
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      保存中...
                    </div>
                  ) : (
                    '保存更改'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 