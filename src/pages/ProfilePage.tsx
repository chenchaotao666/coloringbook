import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { PricingService, OrderInfo } from '../services/pricingService';
import { UserService } from '../services/userService';
import { ApiError } from '../utils/apiUtils';
import { useAsyncTranslation } from '../contexts/LanguageContext';
import { navigateWithLanguage } from '../utils/navigationUtils';
import SEOHead from '../components/common/SEOHead';
import Layout from '../components/layout/Layout';

const ProfilePage: React.FC = () => {
  const { t } = useAsyncTranslation('profile');
  const { t: tCommon } = useAsyncTranslation('common');
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user: authUser, refreshUser, logout, isLoading: authLoading } = useAuth();
  
  const [user, setUser] = useState<typeof authUser>(null);
  const [formData, setFormData] = useState({
    username: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [orderHistory, setOrderHistory] = useState<OrderInfo[]>([]);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null);
  const [isPasswordSectionOpen, setIsPasswordSectionOpen] = useState(false);

  const loadUserProfile = async () => {
    try {
      setIsLoadingUser(true);
      
      // 此时 authUser 已经确保不为 null（在 useEffect 中检查过）
      if (!authUser) {
        console.error('loadUserProfile called without authUser');
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
      setErrors({ general: t('messages.loadUserFailed', '加载用户信息失败，请刷新页面重试') });
    } finally {
      setIsLoadingUser(false);
    }
  };

  const loadOrderHistory = async () => {
    try {
      setIsLoadingOrders(true);
      
      // 获取全部订单记录，不分页
      const response = await PricingService.getOrderHistory(1, 1000);
      setOrderHistory(response || []);
    } catch (error) {
      console.error('Failed to load order history:', error);
      // 确保在出错时设置为空数组，避免 undefined
      setOrderHistory([]);
    } finally {
      setIsLoadingOrders(false);
    }
  }

  // 处理认证状态变化
  useEffect(() => {
    // 等待认证初始化完成
    if (authLoading) {
      return;
    }
    
    // 如果认证完成但用户未登录，跳转到登录页面
    if (!authUser) {
      navigateWithLanguage(navigate, '/login', { 
        state: { 
          from: { pathname: '/profile' },
          message: t('messages.loginRequired', '请先登录以访问个人资料')
        }
      });
      return;
    }
    
    // 如果用户已登录，初始化用户数据
    loadUserProfile();
  }, [authLoading]);

  // 加载订单历史
  useEffect(() => {
    if (user) {
      loadOrderHistory();
    }
  }, [user]);

  // 表单验证
  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.username.trim()) {
      newErrors.username = t('errors.username.required', '请输入用户名');
    } else if (formData.username.length < 2) {
      newErrors.username = t('errors.username.minLength', '用户名至少需要2个字符');
    } else if (formData.username.length > 20) {
      newErrors.username = t('errors.username.maxLength', '用户名不能超过20个字符');
    }

    if (formData.newPassword || formData.currentPassword || formData.confirmPassword) {
      if (!formData.currentPassword) {
        newErrors.currentPassword = t('errors.password.currentRequired', '请输入当前密码');
      }

      if (!formData.newPassword) {
        newErrors.newPassword = t('errors.password.newRequired', '请输入新密码');
      } else if (formData.newPassword.length < 6) {
        newErrors.newPassword = t('errors.password.minLength', '新密码至少需要6个字符');
      } else if (formData.newPassword.length > 50) {
        newErrors.newPassword = t('errors.password.maxLength', '新密码不能超过50个字符');
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = t('errors.password.confirmRequired', '请确认新密码');
      } else if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = t('errors.password.confirmMismatch', '两次输入的新密码不一致');
      }

      if (formData.currentPassword === formData.newPassword) {
        newErrors.newPassword = t('errors.password.samePassword', '新密码不能与当前密码相同');
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
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    if (successMessage) {
      setSuccessMessage('');
    }
  };

  // 处理头像选择
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrors({ avatar: t('errors.avatar.fileType', '请选择图片文件') });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors({ avatar: t('errors.avatar.fileSize', '图片大小不能超过5MB') });
      return;
    }

    setSelectedAvatarFile(file);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

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

  // 更换套餐
  const handleChangePlan = () => {
    navigateWithLanguage(navigate, '/price');
  };

  // 取消订阅
  const handleCancelSubscription = async () => {
    if (!confirm(t('messages.confirmCancelSubscription', '确定要取消订阅吗？'))) {
      return;
    }

    try {
      setIsLoading(true);
      await UserService.cancelSubscription();
      await refreshUser();
      setSuccessMessage(t('messages.subscriptionCancelled', '订阅已取消'));
    } catch (error) {
      console.error('Cancel subscription failed:', error);
      if (error instanceof ApiError) {
        setErrors({ general: error.message });
      } else {
        setErrors({ general: t('messages.cancelSubscriptionFailed', '取消订阅失败，请稍后重试') });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
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

      if (selectedAvatarFile) {
        await UserService.uploadAvatar(selectedAvatarFile);
      }

      await refreshUser();

      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      setSelectedAvatarFile(null);

      setSuccessMessage(t('messages.success', '个人信息更新成功！'));
    } catch (error) {
      console.error('Update profile failed:', error);
      
      if (error instanceof ApiError) {
        switch (error.errorCode) {
          case '1002':
            setErrors({ username: t('errors.username.exists', '该用户名已被使用') });
            break;
          case '1005':
            setErrors({ currentPassword: t('errors.password.currentIncorrect', '当前密码错误') });
            break;
          case '1003':
            setErrors({ general: t('errors.format', '输入信息格式不正确，请检查后重试') });
            break;
          case '3001':
            setErrors({ avatar: t('errors.avatar.uploadFailed', '头像上传失败，请重试') });
            break;
          default:
            setErrors({ general: error.message || t('errors.updateFailed', '更新失败，请稍后重试') });
        }
      } else {
        setErrors({ general: t('messages.networkError', '网络错误，请检查网络连接后重试') });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 退出登录
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // 获取订单状态显示
  const getOrderStatusDisplay = (status: string) => {
    switch (status) {
      case 'completed':
        return { text: t('orderTable.paid', '已支付'), className: 'bg-green-100 text-green-800' };
      case 'failed':
        return { text: t('orderTable.failed', '支付失败'), className: 'bg-red-100 text-red-800' };
      case 'pending':
        return { text: t('orderTable.pending', '待支付'), className: 'bg-yellow-100 text-yellow-800' };
      case 'cancelled':
        return { text: t('orderTable.cancelled', '已取消'), className: 'bg-gray-100 text-gray-800' };
      default:
        return { text: t('orderTable.unpaid', '未支付'), className: 'bg-red-100 text-red-800' };
    }
  };



  // 显示加载状态：认证初始化期间或用户数据加载期间
  if (authLoading || isLoadingUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 text-gray-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-2 text-gray-600">
            {authLoading ? t('common.loading', '加载中...') : t('messages.loadingProfile', '正在加载用户信息...')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <SEOHead 
        title={tCommon('seo.profile.title', '个人资料')} 
        description={tCommon('seo.profile.description', '管理您的账户信息和设置')} 
      />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-screen-xl px-4 pt-6 pb-10 mx-auto">
        {/* 用户信息区域 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="px-6 py-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              {/* 用户基本信息 */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  {avatarPreview || user?.avatar ? (
                    <img
                      className="w-16 h-16 rounded-full object-cover"
                      src={avatarPreview || user?.avatar || '/images/default-avatar.svg'}
                      alt={t('avatar', '头像')}
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold">
                      {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
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
                  <h3 className="text-xl font-semibold text-gray-900">{user?.username}</h3>
                  <p className="text-gray-600">{user?.email}</p>
                  <div className="flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-lg mt-2 inline-flex" style={{backgroundColor: '#F9FAFB'}}>
                    <img src="/images/credits.svg" alt={t('credits', '积分')} className="w-4 h-4" />
                    <span className="text-sm font-medium text-orange-600">{user?.credits}</span>
                  </div>
                </div>
              </div>

              {/* 套餐信息 */}
              <div className="flex items-center gap-4">
                <div className="px-4 py-2 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">
                    {t(`subscription.${user?.userType}`, user?.userType === 'free' ? '免费' : user?.userType === 'lite' ? 'Lite' : 'Pro')}
                  </span>
                </div>
                
                {/* 套餐控制按钮 */}
                <div className="flex gap-2">
                  <button
                    onClick={handleChangePlan}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {t('buttons.changePlan', '更换套餐')}
                  </button>
                  <button
                    onClick={handleCancelSubscription}
                    disabled={user?.userType === 'free' || isLoading}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t('buttons.cancelSubscription', '取消订阅')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 订单记录 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">{t('sections.orderHistory', '订单记录')}</h3>
          </div>
          <div className="px-6 py-4">
            {isLoadingOrders ? (
              <div className="flex justify-center py-8">
                <svg className="animate-spin h-6 w-6 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('orderTable.orderId', '订单ID')}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('orderTable.planInfo', '套餐信息')}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('orderTable.amount', '金额')}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('orderTable.createdAt', '创建时间')}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('orderTable.paymentStatus', '支付状态')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {orderHistory && orderHistory.length > 0 ? (
                        orderHistory.map((order) => {
                          const statusDisplay = getOrderStatusDisplay(order.status);
                          return (
                            <tr key={order.orderId}>
                              <td className="px-4 py-4 whitespace-nowrap text-gray-500">
                                <h3 className="text-sm font-medium">{order.orderId}</h3>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                <div className="flex items-center gap-2">
                                  <span>{order.planCode}</span>
                                  <span>{order.chargeType}</span>
                                  {order.creditsAdded > 0 && (
                                    <span className="text-orange-600">+{order.creditsAdded} 积分</span>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                {order.amount} {order.currency}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(order.createdAt).toLocaleString()}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusDisplay.className}`}>
                                  {statusDisplay.text}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                            {isLoadingOrders ? t('common.loading', '加载中...') : t('orderTable.noOrders', '暂无订单记录')}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>

        {/* 基本信息和密码修改 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">{t('sections.basicInfo', '基本信息')}</h3>
          </div>
          <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
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
            {/* 用户名 */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                {t('fields.username', '用户名')}
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
                  } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                  placeholder={t('placeholders.username', '请输入用户名')}
                />
                {errors.username && (
                  <p className="mt-1 text-sm text-red-600">{errors.username}</p>
                )}
              </div>
            </div>

            {/* 邮箱（只读） */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                {t('fields.email', '邮箱地址')}
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
                <p className="mt-1 text-xs text-gray-500">{t('hints.emailReadonly', '邮箱地址无法修改')}</p>
              </div>
            </div>

            {/* 密码修改 - 可折叠 */}
            <div className="border border-gray-200 rounded-lg">
              <button
                type="button"
                onClick={() => setIsPasswordSectionOpen(!isPasswordSectionOpen)}
                className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
              >
                <h4 className="text-md font-medium text-gray-900">{t('sections.changePassword', '修改密码')}</h4>
                <svg
                  className={`h-5 w-5 text-gray-500 transition-transform ${isPasswordSectionOpen ? 'rotate-180' : ''}`}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              
              {isPasswordSectionOpen && (
                <div className="px-4 pb-4 space-y-4 border-t border-gray-200">
                  
                  {/* 当前密码 */}
                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mt-4">
                      {t('fields.currentPassword', '当前密码')}
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
                        } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                        placeholder={t('placeholders.currentPassword', '请输入当前密码')}
                      />
                      {errors.currentPassword && (
                        <p className="mt-1 text-sm text-red-600">{errors.currentPassword}</p>
                      )}
                    </div>
                  </div>

                  {/* 新密码 */}
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                      {t('fields.newPassword', '新密码')}
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
                        } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                        placeholder={t('placeholders.newPassword', '请输入新密码（至少6个字符）')}
                      />
                      {errors.newPassword && (
                        <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>
                      )}
                    </div>
                  </div>

                  {/* 确认新密码 */}
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                      {t('fields.confirmPassword', '确认新密码')}
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
                        } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                        placeholder={t('placeholders.confirmPassword', '请再次输入新密码')}
                      />
                      {errors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 按钮组 */}
            <div className="flex justify-between pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {t('buttons.logout', '退出登录')}
              </button>
              
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {t('buttons.cancel', '取消')}
                </button>
                
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                  ) : (
                    t('buttons.save', '保存更改')
                  )}
                </button>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </form>
        </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage; 