import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { UserService } from '../services/userService';
import { useLanguage } from '../contexts/LanguageContext';
import { ApiError } from '../utils/apiUtils';

const ResetPasswordPage: React.FC = () => {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);
  const [isResetSuccess, setIsResetSuccess] = useState(false);

  // 检查token有效性
  useEffect(() => {
    if (!token) {
      setIsTokenValid(false);
      return;
    }
    
    // 验证token
    validateToken();
  }, [token]);

  const validateToken = async () => {
    try {
      await UserService.validateResetToken(token!);
      setIsTokenValid(true);
    } catch (error) {
      console.error('Token validation failed:', error);
      setIsTokenValid(false);
    }
  };

  // 表单验证
  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    // 密码验证
    if (!formData.password) {
      newErrors.password = t('forms.validation.newPasswordRequired');
    } else if (formData.password.length < 6) {
      newErrors.password = t('forms.validation.passwordTooShort', undefined, { min: 6 });
    } else if (formData.password.length > 50) {
      newErrors.password = t('forms.validation.passwordMaxLength', undefined, { max: 50 });
    }

    // 确认密码验证
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t('forms.validation.confirmNewPasswordRequired');
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('forms.validation.newPasswordMismatch');
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
  };

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      await UserService.resetPassword(token!, formData.password);
      setIsResetSuccess(true);
    } catch (error) {
      console.error('Reset password failed:', error);
      
      if (error instanceof ApiError) {
        switch (error.errorCode) {
          case '1019':
            setErrors({ general: t('errors.auth.tokenExpired') });
            break;
          case '1020':
            setErrors({ general: t('errors.auth.tokenInvalid') });
            break;
          default:
            setErrors({ general: error.message || t('errors.auth.resetFailed') });
        }
      } else {
        setErrors({ general: t('errors.network.connectionFailed') });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Token无效页面
  if (isTokenValid === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="w-full max-w-md mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                {t('forms.auth.linkInvalid')}
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600">
                {t('forms.auth.linkInvalidDesc')}
              </p>
            </div>

            <div className="space-y-4">
              <Link
                to="/forgot-password"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {t('forms.auth.requestNewReset')}
              </Link>
              
              <Link
                to="/login"
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {t('forms.auth.backToLogin')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 重置成功页面
  if (isResetSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="w-full max-w-md mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                {t('forms.auth.resetSuccess')}
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600">
                {t('forms.auth.resetSuccessDesc')}
              </p>
            </div>

            <div>
              <Link
                to="/login"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {t('forms.auth.goToLogin')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 加载中
  if (isTokenValid === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          {/* 加载时不显示文本 */}
        </div>
      </div>
    );
  }

  // 重置密码表单
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
      <div className="w-full max-w-md mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
              <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1721 9z" />
              </svg>
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              {t('forms.auth.resetPasswordTitle')}
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              {t('forms.auth.resetPasswordDesc')}
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {errors.general && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{errors.general}</div>
              </div>
            )}

            <div className="space-y-4">
              {/* 新密码输入 */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  {t('forms.auth.newPassword')}
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`appearance-none relative block w-full px-3 py-2 border ${
                      errors.password ? 'border-red-300' : 'border-gray-300'
                    } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                    placeholder={t('forms.placeholders.password')}
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                  )}
                </div>
              </div>

              {/* 确认密码输入 */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  {t('forms.auth.confirmNewPassword')}
                </label>
                <div className="mt-1">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`appearance-none relative block w-full px-3 py-2 border ${
                      errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                    } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                    placeholder={t('forms.placeholders.confirmPassword')}
                  />
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {/* 移除loading文本，只显示加载图标 */}
                  </div>
                ) : (
                  <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                    <svg className="h-5 w-5 text-blue-500 group-hover:text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a5 5 0 0110 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                )}
                {!isLoading && t('forms.auth.resetPassword')}
              </button>
            </div>

            <div className="text-center">
              <Link
                to="/login"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                {t('forms.auth.backToLogin')}
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage; 