import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAsyncTranslation } from '../contexts/LanguageContext';
import { ApiError } from '../utils/apiUtils';
import GoogleLoginButton from '../components/common/GoogleLoginButton';
import SEOHead from '../components/common/SEOHead';
import PasswordInput from '../components/ui/PasswordInput';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { t: tForms } = useAsyncTranslation('forms');
  const { t: tErrors } = useAsyncTranslation('errors');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // 从注册页面传来的状态
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      if (location.state.email) {
        setFormData(prev => ({ ...prev, email: location.state.email }));
      }
    }
    
    // 检查是否有保存的登录信息
    const savedEmail = localStorage.getItem('savedEmail');
    if (savedEmail) {
      setFormData(prev => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
    }
  }, [location.state]);

  // 表单验证
  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    // 邮箱验证
    if (!formData.email.trim()) {
      newErrors.email = tForms('validation.required', '此字段为必填项');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = tForms('validation.emailInvalid', '请输入有效的邮箱地址');
    }

    // 密码验证
    if (!formData.password.trim()) {
      newErrors.password = tForms('validation.required', '此字段为必填项');
    } else if (formData.password.length < 6) {
      newErrors.password = tForms('validation.passwordTooShort', '密码至少需要6位').replace('{min}', '6');
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
    
    // 清除对应字段的错误
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
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
      await login(formData.email, formData.password);
      
      // 根据"记住我"状态保存或清除邮箱
      if (rememberMe) {
        localStorage.setItem('savedEmail', formData.email);
      } else {
        localStorage.removeItem('savedEmail');
      }
      
      // 登录成功后重定向
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
      
    } catch (error) {
      console.error('Login error:', error);
      
      if (error instanceof ApiError) {
        switch (error.errorCode) {
          case '1001':
            setErrors({ general: tErrors('auth.invalidCredentials', '邮箱或密码错误') });
            break;
          case '1002':
            setErrors({ general: tErrors('auth.accountNotFound', '账户不存在') });
            break;
          case '1003':
            setErrors({ general: tErrors('validation.invalidFormat', '格式不正确') });
            break;
          default:
            setErrors({ general: error.message || tErrors('auth.invalidCredentials', '邮箱或密码错误') });
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
        title={`${tForms('auth.loginTitle', 'Login')} - AI Coloring Page Generator`}
        description={tForms('auth.loginTitle', 'Login') + " to your account to access premium AI coloring page generation features."}
        keywords="login, AI coloring pages, account access"
        ogTitle={`${tForms('auth.loginTitle', 'Login')} - AI Coloring Page Generator`}
        ogDescription={tForms('auth.loginTitle', 'Login') + " to your account to access premium AI coloring page generation features."}
        noIndex={true}
      />
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-8 mx-auto lg:py-0">
        {/* Logo */}
        <Link to="/" className="flex items-center mb-6 text-3xl font-semibold text-gray-900 mr-[20px]">
          <img src="/images/logo.svg" alt="Logo" className="h-15 w-auto mr-2" style={{height: '60px', width: '50px'}} />
          <span className="text-2xl font-bold text-gray-900">ColorPage</span>
        </Link>
        
        {/* Login Card */}
        <div className="w-full bg-white border border-gray-200 rounded-lg shadow sm:max-w-[31rem] xl:p-0">
          <div className="p-12">
            <h1 className="mb-8 text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
              {tForms('auth.loginToYourAccount', '登录您的账号')}
            </h1>

            {/* Google 登录按钮 */}
            <GoogleLoginButton 
              rememberMe={rememberMe}
              onError={(error) => {
                setErrors({ general: error.message || tErrors('auth.googleLoginFailed', 'Google登录失败') });
              }}
            />
            
            {/* 分割线 */}
            <div className="flex items-center py-3 my-2 text-sm text-gray-800 before:flex-1 before:border-t before:border-gray-200 before:me-6 after:flex-1 after:border-t after:border-gray-200 after:ms-6">
              {tForms('auth.orDivider', '或使用')}
            </div>

            <form onSubmit={handleSubmit}>
              {successMessage && (
                <div className="rounded-md bg-green-50 p-4 mb-6">
                  <div className="text-sm text-green-700">{successMessage}</div>
                </div>
              )}

              {errors.general && (
                <div className="rounded-md bg-red-50 p-4 mb-6">
                  <div className="text-sm text-red-700">{errors.general}</div>
                </div>
              )}

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
                  required
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
                <PasswordInput
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder={tForms('placeholders.password', '请输入密码')}
                  required
                  error={errors.password}
                />
                <div className="h-4 mt-1">
                  {errors.password && (
                    <p className="text-sm text-red-600">{errors.password}</p>
                  )}
                </div>
              </div>

              {/* 记住密码和忘记密码 */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-start">
                  <label className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <span className="ml-2 text-sm text-gray-900">{tForms('auth.rememberMe', '记住密码')}</span>
                  </label>
                </div>
                <Link to="/forgot-password" className="text-sm font-medium text-blue-600 hover:underline">
                  {tForms('auth.forgotPassword', '忘记密码？')}
                </Link>
              </div>

              {/* 登录按钮 */}
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
                    tForms('auth.loginButton', '登录')
                  )}
                </button>
              </div>

              {/* 注册链接 */}
              <p className="text-sm font-light text-center text-gray-500">
                {tForms('auth.noAccount', '还没有账户？')}{' '}
                <Link to="/register" className="font-medium text-blue-600 hover:underline">
                  {tForms('auth.registerButton', '注册')}
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage; 