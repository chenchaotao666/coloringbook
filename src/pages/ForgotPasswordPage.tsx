import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { UserService } from '../services/userService';
import { useAsyncTranslation } from '../contexts/LanguageContext';
import { ApiError } from '../utils/apiUtils';
import SEOHead from '../components/common/SEOHead';

const ForgotPasswordPage: React.FC = () => {
  const { t: tForms } = useAsyncTranslation('forms');
  const { t: tErrors } = useAsyncTranslation('errors');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // 邮箱验证
  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setErrors({ email: tForms('validation.required', '此字段为必填项') });
      return;
    }
    
    if (!validateEmail(email)) {
      setErrors({ email: tForms('validation.emailInvalid', '请输入有效的邮箱地址') });
      return;
    }

    setIsLoading(true);
    setErrors({});
    
    try {
      await UserService.forgotPassword(email.trim());
      setIsEmailSent(true);
    } catch (error) {
      console.error('Forgot password failed:', error);
      
      if (error instanceof ApiError) {
        switch (error.errorCode) {
          case '1004':
            setErrors({ email: tErrors('auth.emailNotRegistered', '邮箱未注册') });
            break;
          case '1018':
            setErrors({ general: tErrors('auth.sendEmailFailed', '发送邮件失败') });
            break;
          default:
            setErrors({ general: error.message || tErrors('auth.forgotPasswordFailed', '重置密码失败') });
        }
      } else {
        setErrors({ general: tErrors('network.connectionFailed', '网络连接失败') });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 处理邮箱输入变化
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (errors.email) {
      setErrors(prev => ({
        ...prev,
        email: ''
      }));
    }
  };

  // 如果邮件已发送，显示成功页面
  if (isEmailSent) {
    return (
      <>
        <SEOHead
          title={`${tForms('auth.resetPasswordTitle', 'Reset Password')} - AI Coloring Page Generator`}
          description="Password reset email sent successfully."
          keywords="reset password, forgot password, AI coloring pages"
          ogTitle={`${tForms('auth.resetPasswordTitle', 'Reset Password')} - AI Coloring Page Generator`}
          ogDescription="Password reset email sent successfully."
          noIndex={true}
        />
        <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-8 mx-auto lg:py-0">
          {/* Logo */}
          <Link to="/" className="flex items-center mb-6 text-3xl font-semibold text-gray-900 mr-[20px]">
            <img src="/images/logo.svg" alt="Logo" className="h-15 w-auto mr-2" style={{height: '60px', width: '50px'}} />
            <span className="text-2xl font-bold text-gray-900">ColorPage</span>
          </Link>
          
          {/* Success Card */}
          <div className="w-full bg-white border border-gray-200 rounded-lg shadow sm:max-w-[31rem] xl:p-0">
            <div className="p-12">
              <div className="text-center">
                <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-green-100 mb-6">
                  <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h1 className="mb-6 text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
                  邮件已发送
                </h1>
                <p className="mb-4 text-sm text-gray-600">
                  重置密码的邮件已发送到：
                </p>
                <p className="mb-6 text-sm font-medium text-blue-600">
                  {email}
                </p>
                <p className="mb-8 text-sm text-gray-600">
                  请检查您的邮箱并点击邮件中的链接来重置密码。
                </p>
                
                {/* 返回登录按钮 */}
                <div className="mb-6">
                  <Link
                    to="/login"
                    className="w-full inline-flex justify-center text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                  >
                    {tForms('auth.backToLogin', '返回登录')}
                  </Link>
                </div>
                
                {/* 重新发送 */}
                <button
                  onClick={() => {
                    setIsEmailSent(false);
                    setEmail('');
                  }}
                  className="text-sm font-medium text-blue-600 hover:underline"
                >
                  重新发送邮件
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEOHead
        title={`${tForms('auth.resetPasswordTitle', 'Reset Password')} - AI Coloring Page Generator`}
        description="Reset your password to regain access to your AI coloring page generator account."
        keywords="reset password, forgot password, AI coloring pages"
        ogTitle={`${tForms('auth.resetPasswordTitle', 'Reset Password')} - AI Coloring Page Generator`}
        ogDescription="Reset your password to regain access to your AI coloring page generator account."
        noIndex={true}
      />
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-8 mx-auto lg:py-0">
        {/* Logo */}
        <Link to="/" className="flex items-center mb-6 text-3xl font-semibold text-gray-900 mr-[20px]">
          <img src="/images/logo.svg" alt="Logo" className="h-15 w-auto mr-2" style={{height: '60px', width: '50px'}} />
          <span className="text-2xl font-bold text-gray-900">ColorPage</span>
        </Link>
        
        {/* Reset Password Card */}
        <div className="w-full bg-white border border-gray-200 rounded-lg shadow sm:max-w-[31rem] xl:p-0">
          <div className="p-12">
            <h1 className="mb-8 text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
              {tForms('auth.resetYourPassword', '重置密码')}
            </h1>

            <form onSubmit={handleSubmit}>
              {errors.general && (
                <div className="rounded-md bg-red-50 p-4 mb-6">
                  <div className="text-sm text-red-700">{errors.general}</div>
                </div>
              )}

              {/* 邮箱输入 */}
              <div className="mb-6">
                <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900">
                  <span className="text-red-500 mr-1">*</span>{tForms('fields.emailAddress', '邮件')}
                </label>
                <input
                  id="email"
                  name="email"
                  value={email}
                  onChange={handleEmailChange}
                  className={`w-full px-3 py-3 text-sm border ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  } rounded-lg focus:ring-blue-500 focus:border-blue-500 focus:outline-none`}
                  placeholder={tForms('placeholders.emailAddress', '请输入您的邮箱地址')}
                />
                <div className="h-4 mt-1">
                  {errors.email && (
                    <p className="text-sm text-red-600">{errors.email}</p>
                  )}
                </div>
              </div>

              {/* 发送重置邮件按钮 */}
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
                    tForms('auth.sendResetEmail', '发送重置邮件')
                  )}
                </button>
              </div>

              {/* 返回登录链接 */}
              <p className="text-sm font-light text-center text-gray-500">
                {tForms('auth.rememberPassword', '记住密码？')}{' '}
                <Link to="/login" className="font-medium text-blue-600 hover:underline">
                  {tForms('auth.backToLogin', '返回登录')}
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default ForgotPasswordPage; 