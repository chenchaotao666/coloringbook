import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { ApiError } from '../utils/apiUtils';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);

  // 表单验证
  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    // 用户名验证
    if (!formData.username.trim()) {
      newErrors.username = t('forms.validation.usernameRequired');
    } else if (formData.username.length < 2) {
      newErrors.username = t('forms.validation.usernameMinLength', undefined, { min: 2 });
    } else if (formData.username.length > 20) {
      newErrors.username = t('forms.validation.usernameMaxLength', undefined, { max: 20 });
    }

    // 邮箱验证
    if (!formData.email.trim()) {
      newErrors.email = t('forms.validation.emailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('forms.validation.emailInvalid');
    }

    // 密码验证
    if (!formData.password) {
      newErrors.password = t('forms.validation.passwordRequired');
    } else if (formData.password.length < 6) {
      newErrors.password = t('forms.validation.passwordTooShort', undefined, { min: 6 });
    } else if (formData.password.length > 50) {
      newErrors.password = t('forms.validation.passwordMaxLength', undefined, { max: 50 });
    }

    // 确认密码验证
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t('forms.validation.confirmPasswordRequired');
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('forms.validation.passwordMismatch');
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
      await register(
        formData.username.trim(),
        formData.email.trim(),
        formData.password
      );

      // 注册成功，跳转到登录页面
      navigate('/login', { 
        state: { 
          message: t('forms.auth.registerSuccess'),
          email: formData.email.trim()
        }
      });
    } catch (error) {
      console.error('Registration failed:', error);
      
      if (error instanceof ApiError) {
        // 处理特定的API错误
        switch (error.errorCode) {
          case '1001':
            setErrors({ email: t('errors.auth.emailAlreadyRegistered') });
            break;
          case '1002':
            setErrors({ username: t('errors.auth.usernameAlreadyTaken') });
            break;
          case '1003':
            setErrors({ general: t('errors.auth.invalidInputFormat') });
            break;
          default:
            setErrors({ general: error.message || t('errors.auth.registrationFailed') });
        }
      } else {
        setErrors({ general: t('errors.network.connectionFailed') });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-purple-100">
            <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {t('forms.auth.registerTitle')}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {t('forms.auth.hasAccount')}{' '}
            <Link to="/login" className="font-medium text-purple-600 hover:text-purple-500">
              {t('forms.auth.loginNow')}
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {errors.general && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{errors.general}</div>
            </div>
          )}

          <div className="space-y-4">
            {/* 用户名输入 */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                {t('forms.fields.username')}
              </label>
              <div className="mt-1">
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={formData.username}
                  onChange={handleInputChange}
                  className={`appearance-none relative block w-full px-3 py-2 border ${
                    errors.username ? 'border-red-300' : 'border-gray-300'
                  } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm`}
                  placeholder={t('forms.placeholders.username')}
                />
                {errors.username && (
                  <p className="mt-1 text-sm text-red-600">{errors.username}</p>
                )}
              </div>
            </div>

            {/* 邮箱输入 */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                {t('forms.fields.emailAddress')}
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`appearance-none relative block w-full px-3 py-2 border ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm`}
                  placeholder={t('forms.placeholders.email')}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>
            </div>

            {/* 密码输入 */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                {t('forms.fields.password')}
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
                  } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm`}
                  placeholder={t('forms.placeholders.passwordHint')}
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>
            </div>

            {/* 确认密码输入 */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                {t('forms.fields.confirmPassword')}
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
                  } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm`}
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
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
                t('forms.auth.createAccount')
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              {t('forms.auth.agreeTerms')}{' '}
              <a href="#" className="text-purple-600 hover:text-purple-500">{t('forms.auth.termsOfService')}</a>
              {' '}{t('forms.auth.and')}{' '}
              <a href="#" className="text-purple-600 hover:text-purple-500">{t('forms.auth.privacyPolicy')}</a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage; 