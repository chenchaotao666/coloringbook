import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAsyncTranslation } from '../contexts/LanguageContext';
import { ApiError } from '../utils/apiUtils';
import GoogleLoginButton from '../components/common/GoogleLoginButton';
import SEOHead from '../components/common/SEOHead';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { t: tForms } = useAsyncTranslation('forms');
  const { t: tErrors } = useAsyncTranslation('errors');
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
      newErrors.username = tForms('validation.required', '此字段为必填项');
    } else if (formData.username.length < 2) {
      newErrors.username = tForms('validation.minLength', '至少需要{min}个字符').replace('{min}', '2');
    } else if (formData.username.length > 20) {
      newErrors.username = tForms('validation.maxLength', '不能超过{max}个字符').replace('{max}', '20');
    }

    // 邮箱验证
    if (!formData.email.trim()) {
      newErrors.email = tForms('validation.required', '此字段为必填项');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = tForms('validation.emailInvalid', '请输入有效的邮箱地址');
    }

    // 密码验证
    if (!formData.password) {
      newErrors.password = tForms('validation.required', '此字段为必填项');
    } else if (formData.password.length < 6) {
      newErrors.password = tForms('validation.passwordTooShort', '密码至少需要{min}位').replace('{min}', '6');
    } else if (formData.password.length > 50) {
      newErrors.password = tForms('validation.maxLength', '不能超过{max}个字符').replace('{max}', '50');
    }

    // 确认密码验证
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = tForms('validation.required', '此字段为必填项');
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = tForms('validation.passwordMismatch', '两次输入的密码不一致');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // 实时密码校验
    if (name === 'password') {
      const newErrors: {[key: string]: string} = {};
      
      if (value && value.length < 6) {
        newErrors.password = tForms('validation.passwordTooShort', '密码至少需要{min}位').replace('{min}', '6');
      } else if (value && value.length > 50) {
        newErrors.password = tForms('validation.maxLength', '不能超过{max}个字符').replace('{max}', '50');
      }
      
      // 如果确认密码已经输入，检查是否匹配
      if (formData.confirmPassword && value !== formData.confirmPassword) {
        newErrors.confirmPassword = tForms('validation.passwordMismatch', '两次输入的密码不一致');
      } else if (formData.confirmPassword && value === formData.confirmPassword) {
        // 密码匹配时清除确认密码错误
        setErrors(prev => ({
          ...prev,
          confirmPassword: ''
        }));
      }
      
      setErrors(prev => ({
        ...prev,
        password: newErrors.password || '',
        ...(newErrors.confirmPassword !== undefined && { confirmPassword: newErrors.confirmPassword })
      }));
    } else if (name === 'confirmPassword') {
      // 确认密码实时校验
      const newErrors: {[key: string]: string} = {};
      
      if (value && formData.password !== value) {
        newErrors.confirmPassword = tForms('validation.passwordMismatch', '两次输入的密码不一致');
      }
      
      setErrors(prev => ({
        ...prev,
        confirmPassword: newErrors.confirmPassword || ''
      }));
    } else {
      // 其他字段清除错误
      if (errors[name]) {
        setErrors(prev => ({
          ...prev,
          [name]: ''
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      await register(formData.username, formData.email, formData.password);
      
      // 注册成功后跳转到登录页面，并传递成功消息
      navigate('/login', {
        state: {
          message: tForms('auth.registerSuccess', '注册成功！请登录您的账户。'),
          email: formData.email
        }
      });
      
    } catch (error) {
      console.error('Register error:', error);
      
      if (error instanceof ApiError) {
        switch (error.errorCode) {
          case '2001':
            setErrors({ email: tErrors('auth.emailAlreadyExists', '邮箱已被注册') });
            break;
          case '2002':
            setErrors({ username: tErrors('auth.usernameAlreadyExists', '用户名已被使用') });
            break;
          case '1003':
            setErrors({ general: tErrors('validation.invalidFormat', '格式不正确') });
            break;
          default:
            setErrors({ general: error.message || tErrors('auth.registrationFailed', '注册失败') });
        }
      } else {
        setErrors({ general: tErrors('network.connectionFailed', '网络连接失败') });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <SEOHead
        title={`${tForms('auth.registerTitle', 'Register')} - AI Coloring Page Generator`}
        description={tForms('auth.registerTitle', 'Register') + " to create your account and start generating unlimited AI coloring pages."}
        keywords="register, sign up, AI coloring pages, account creation"
        ogTitle={`${tForms('auth.registerTitle', 'Register')} - AI Coloring Page Generator`}
        ogDescription={tForms('auth.registerTitle', 'Register') + " to create your account and start generating unlimited AI coloring pages."}
        noIndex={true}
      />
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-8 mx-auto lg:py-0">
        {/* Logo */}
        <Link to="/" className="flex items-center mb-6 text-3xl font-semibold text-gray-900 mr-[20px]">
          <img src="/images/logo.svg" alt="Logo" className="h-15 w-auto mr-2" style={{height: '60px', width: '50px'}} />
          <span className="text-2xl font-bold text-gray-900">ColorPage</span>
        </Link>
        
        {/* Register Card */}
        <div className="w-full bg-white border border-gray-200 rounded-lg shadow sm:max-w-[31rem] xl:p-0">
          <div className="p-12">
            <h1 className="mb-8 text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
              {tForms('auth.registerYourAccount', '注册您的账号')}
            </h1>

            {/* Google 登录按钮 */}
            <GoogleLoginButton 
              rememberMe={false}
              onError={(error) => {
                setErrors({ general: error.message || tErrors('auth.googleLoginFailed', 'Google登录失败') });
              }}
            />
            
            {/* 分割线 */}
            <div className="flex items-center py-3 my-2 text-sm text-gray-800 before:flex-1 before:border-t before:border-gray-200 before:me-6 after:flex-1 after:border-t after:border-gray-200 after:ms-6">
              {tForms('auth.orDivider', '或使用')}
            </div>

            <form onSubmit={handleSubmit}>
              {errors.general && (
                <div className="rounded-md bg-red-50 p-4 mb-6">
                  <div className="text-sm text-red-700">{errors.general}</div>
                </div>
              )}

              {/* 用户名输入 */}
              <div className="mb-2">
                <label htmlFor="username" className="block mb-2 text-sm font-medium text-gray-900">
                  <span className="text-red-500 mr-1">*</span>{tForms('fields.username', '用户名')}
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-3 text-sm border ${
                    errors.username ? 'border-red-300' : 'border-gray-300'
                  } rounded-lg focus:ring-blue-500 focus:border-blue-500 focus:outline-none`}
                  placeholder={tForms('placeholders.username', '请输入用户名')}
                />
                <div className="h-4 mt-1">
                  {errors.username && (
                    <p className="text-sm text-red-600">{errors.username}</p>
                  )}
                </div>
              </div>

              {/* 邮箱输入 */}
              <div className="mb-2">
                <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900">
                  <span className="text-red-500 mr-1">*</span>{tForms('fields.email', '邮箱')}
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-3 text-sm border ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  } rounded-lg focus:ring-blue-500 focus:border-blue-500 focus:outline-none`}
                  placeholder={tForms('placeholders.email', '请输入邮箱')}
                />
                <div className="h-4 mt-1">
                  {errors.email && (
                    <p className="text-sm text-red-600">{errors.email}</p>
                  )}
                </div>
              </div>

              {/* 密码输入 */}
              <div className="mb-2">
                <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900">
                  <span className="text-red-500 mr-1">*</span>{tForms('fields.password', '密码')}
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-3 text-sm border ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  } rounded-lg focus:ring-blue-500 focus:border-blue-500 focus:outline-none`}
                  placeholder={tForms('placeholders.password', '请输入密码')}
                />
                <div className="h-4 mt-1">
                  {errors.password && (
                    <p className="text-sm text-red-600">{errors.password}</p>
                  )}
                </div>
              </div>

              {/* 确认密码输入 */}
              <div className="mb-2">
                <label htmlFor="confirmPassword" className="block mb-2 text-sm font-medium text-gray-900">
                  <span className="text-red-500 mr-1">*</span>{tForms('fields.confirmPassword', '确认密码')}
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-3 text-sm border ${
                    errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                  } rounded-lg focus:ring-blue-500 focus:border-blue-500 focus:outline-none`}
                  placeholder={tForms('placeholders.confirmPassword', '请再次输入密码')}
                />
                <div className="h-4 mt-1">
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-600">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>

              {/* 注册按钮 */}
              <div className="mb-6">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                  ) : (
                    tForms('auth.registerButton', '注册')
                  )}
                </button>
              </div>

              {/* 登录链接 */}
              <p className="text-sm font-light text-center text-gray-500">
                {tForms('auth.hasAccount', '已经有账户？')}{' '}
                <Link to="/login" className="font-medium text-blue-600 hover:underline">
                  {tForms('auth.loginHere', '点击这里登录')}
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default RegisterPage; 