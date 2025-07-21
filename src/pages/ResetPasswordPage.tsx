import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { UserService } from '../services/userService';
import { useAsyncTranslation } from '../contexts/LanguageContext';
import { ApiError } from '../utils/apiUtils';
import SEOHead from '../components/common/SEOHead';
import PasswordInput from '../components/ui/PasswordInput';

const ResetPasswordPage: React.FC = () => {
  const { t: tForms } = useAsyncTranslation('forms');
  const { t: tErrors } = useAsyncTranslation('errors');
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

  // 处理输入变化
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
            setErrors({ general: tErrors('auth.tokenExpired', '重置链接已过期') });
            break;
          case '1020':
            setErrors({ general: tErrors('auth.tokenInvalid', '重置链接无效') });
            break;
          default:
            setErrors({ general: error.message || tErrors('auth.resetFailed', '重置密码失败') });
        }
      } else {
        setErrors({ general: tErrors('network.connectionFailed', '网络连接失败') });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Token无效页面
  if (isTokenValid === false) {
    return (
      <>
        <SEOHead
          title={`${tForms('auth.linkInvalid', 'Link Invalid')} - AI Coloring Page Generator`}
          description="Password reset link is invalid or expired."
          keywords="password reset, invalid link"
          noIndex={true}
        />
        <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-8 mx-auto lg:py-0">
          {/* Logo */}
          <Link to="/" className="flex items-center mb-6 text-3xl font-semibold text-gray-900 mr-[20px] ">
            <img src="/images/logo.svg" alt="Logo" className="h-15 w-auto mr-2" style={{height: '60px', width: '50px'}} />
            <span className="text-2xl font-bold text-gray-900">ColorPage</span>
          </Link>
          
          {/* Error Card */}
          <div className="w-full bg-white border border-gray-200 rounded-lg shadow sm:max-w-[31rem] xl:p-0">
            <div className="p-12">
              <div className="text-center">
                <h1 className="mb-4 text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
                  {tForms('auth.linkInvalid', '链接无效')}
                </h1>
                <p className="mb-8 text-sm text-gray-600">
                  {tForms('auth.linkInvalidDesc', '此重置链接已过期或无效，请重新申请')}
                </p>
              </div>

              <div className="mb-6">
                <Link
                  to="/forgot-password"
                  className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center block"
                >
                  {tForms('auth.requestNewReset', '重新申请重置')}
                </Link>
              </div>
              
              <p className="text-sm font-light text-center text-gray-500">
                {tForms('auth.rememberPassword', '记住密码？')}{' '}
                <Link to="/login" className="font-medium text-blue-600 hover:underline">
                  {tForms('auth.backToLogin', '返回登录')}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  // 重置成功页面
  if (isResetSuccess) {
    return (
      <>
        <SEOHead
          title={`${tForms('auth.resetSuccess', 'Reset Successful')} - AI Coloring Page Generator`}
          description="Password has been successfully reset."
          keywords="password reset, success"
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h1 className="mb-4 text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
                  {tForms('auth.resetSuccess', '重置成功')}
                </h1>
                <p className="mb-8 text-sm text-gray-600">
                  {tForms('auth.resetSuccessDesc', '您的密码已成功重置，现在可以使用新密码登录')}
                </p>
              </div>

              <div className="mb-6">
                <Link
                  to="/login"
                  className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center block"
                >
                  {tForms('auth.goToLogin', '前往登录')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // 加载中
  if (isTokenValid === null) {
    return (
      <>
        <SEOHead
          title={`${tForms('auth.resetPasswordTitle', 'Reset Password')} - AI Coloring Page Generator`}
          description="Reset your password to regain access to your account."
          keywords="password reset, account recovery"
          noIndex={true}
        />
        <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-8 mx-auto lg:py-0">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        </div>
      </>
    );
  }

  // 重置密码表单
  return (
    <>
      <SEOHead
        title={`${tForms('auth.resetPasswordTitle', 'Reset Password')} - AI Coloring Page Generator`}
        description="Reset your password to regain access to your account."
        keywords="password reset, account recovery"
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
            <h1 className="mb-4 text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
              {tForms('auth.resetPasswordTitle', '重置密码')}
            </h1>
            <p className="mb-8 text-sm text-gray-600">
              {tForms('auth.resetPasswordDesc', '请输入您的新密码')}
            </p>

            <form onSubmit={handleSubmit}>
              {errors.general && (
                <div className="rounded-md bg-red-50 p-4 mb-6">
                  <div className="text-sm text-red-700">{errors.general}</div>
                </div>
              )}

              {/* 新密码输入 */}
              <div className="mb-6">
                <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900">
                  <span className="text-red-500 mr-1">*</span>{tForms('auth.newPassword', '新密码')}
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

              {/* 确认密码输入 */}
              <div className="mb-6">
                <label htmlFor="confirmPassword" className="block mb-2 text-sm font-medium text-gray-900">
                  <span className="text-red-500 mr-1">*</span>{tForms('auth.confirmNewPassword', '确认新密码')}
                </label>
                <PasswordInput
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder={tForms('placeholders.confirmPassword', '请再次输入密码')}
                  required
                  error={errors.confirmPassword}
                />
                <div className="h-4 mt-1">
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-600">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>

              {/* 重置按钮 */}
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
                    tForms('auth.resetPassword', '重置密码')
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

export default ResetPasswordPage; 