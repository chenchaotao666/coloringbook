import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  loadTranslationModule, 
  preloadCoreTranslations, 
  getNestedTranslation,
  interpolateTranslation,
  getCachedTranslationModule,
  isTranslationModuleCached
} from '../utils/translationLoader';
import { 
  saveLanguagePreference,
  getSavedLanguage,
  detectBrowserLanguage 
} from '../components/common/LanguageRouter';

export type Language = 'zh' | 'en' | 'ja';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, fallback?: string, params?: { [key: string]: string | number }) => string;
  isLoading: boolean;
  __internal_setState?: (language: Language) => void;
  __internal_setNavigate?: (navigate: any) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// 基础翻译资源（后向兼容，逐步迁移到文件中）
const baseTranslations: Record<Language, Record<string, string>> = {
  zh: {
    // 导航 - 保持后向兼容
    'nav.coloringPagesFree': '免费涂色页',
    'nav.textColoringPage': '文字涂色页',
    'nav.imageColoringPage': '图片涂色页',
    'nav.pricing': '价格',
    'nav.login': '登录',
    'nav.register': '注册',
    'nav.profile': '个人中心',
    'nav.logout': '退出登录',
    'nav.myCreations': '我的作品',
    
    // 新的导航翻译键
    'navigation.menu.home': '首页',
    'navigation.menu.coloringPagesFree': '免费涂色页',
    'navigation.menu.textColoringPage': '文字涂色页',
    'navigation.menu.imageColoringPage': '图片涂色页',
    'navigation.menu.pricing': '价格',
    'navigation.menu.login': '登录',
    'navigation.menu.register': '注册',
    'navigation.menu.profile': '个人中心',
    'navigation.menu.logout': '退出登录',
    'navigation.menu.myCreations': '我的作品',
    'navigation.menu.categories': '分类',
    'navigation.menu.gallery': '图库',
    
    // 语言选择
    'language.chinese': '简体中文',
    'language.english': 'English',
    'language.japanese': '日本語',
    'language.current': '简体中文',
    'navigation.language.chinese': '简体中文',
    'navigation.language.english': 'English',
    'navigation.language.japanese': '日本語',
    'navigation.language.selectLanguage': '选择语言',
    
    // 通用按钮和操作
    'common.confirm': '确认',
    'common.cancel': '取消',
    'common.save': '保存',
    'common.delete': '删除',
    'common.edit': '编辑',
    'common.download': '下载',
    'common.upload': '上传',
    'common.search': '搜索',
    'common.loading': '加载中...',
    'common.error': '错误',
    'common.success': '成功',
    'common.retry': '重试',
    'common.close': '关闭',
    'common.back': '返回',
    'common.next': '下一步',
    'common.previous': '上一步',
    'common.submit': '提交',
    'common.reset': '重置',
    'common.status.loading': '加载中',
    
    // 表单相关
    'form.email': '邮箱',
    'form.password': '密码',
    'form.confirmPassword': '确认密码',
    'form.username': '用户名',
    'form.required': '必填项',
    'form.invalid': '格式不正确',
    'form.emailInvalid': '请输入有效的邮箱地址',
    'form.passwordTooShort': '密码至少需要6位',
    'form.passwordMismatch': '两次输入的密码不一致',
    'form.usernameRequired': '请输入用户名',
    'form.emailRequired': '请输入邮箱地址',
    'form.passwordRequired': '请输入密码',
    
    // 新的表单翻译键（LoginPage使用）
    'forms.auth.loginTitle': '登录',
    'forms.auth.noAccount': '还没有账户？',
    'forms.auth.createAccount': '创建账户',
    'forms.auth.rememberMe': '记住我',
    'forms.auth.forgotPassword': '忘记密码？',
    'forms.auth.googleLogin': '使用 Google 登录',
    'forms.auth.orDivider': '或',
    
    // RegisterPage翻译键
    'forms.auth.registerTitle': '创建新账户',
    'forms.auth.hasAccount': '已有账户？',
    'forms.auth.loginNow': '立即登录',
    'forms.auth.registerSuccess': '注册成功！请登录您的账户。',
    'forms.auth.registering': '注册中...',
    'forms.auth.agreeTerms': '点击"创建账户"即表示您同意我们的',
    'forms.auth.termsOfService': '服务条款',
    'forms.auth.and': '和',
    'forms.auth.privacyPolicy': '隐私政策',
    
    // ForgotPasswordPage翻译键
    'forms.auth.forgotPasswordTitle': '忘记密码',
    'forms.auth.forgotPasswordDesc': '输入您的邮箱地址，我们将发送密码重置链接给您',
    'forms.auth.sendResetEmail': '发送重置邮件',
    'forms.auth.sending': '发送中...',
    'forms.auth.backToLogin': '返回登录',
    'forms.auth.emailSentTitle': '邮件已发送',
    'forms.auth.emailSentDesc': '我们已向以下邮箱发送了密码重置邮件：',
    'forms.auth.emailSentInstructions': '请检查您的邮箱并点击邮件中的链接来重置密码',
    'forms.auth.emailNotReceivedTip': '如果您没有收到邮件，请检查垃圾邮件文件夹，或者等待几分钟后重试',
    'forms.auth.resendEmail': '重新发送邮件',
    
    // ResetPasswordPage翻译键
    'forms.auth.resetPasswordTitle': '重置密码',
    'forms.auth.newPassword': '新密码',
    'forms.auth.confirmNewPassword': '确认新密码',
    'forms.auth.resetPassword': '重置密码',
    'forms.auth.resetting': '重置中...',
    'forms.auth.resetSuccess': '密码重置成功！',
    'forms.auth.resetSuccessDesc': '您的密码已成功重置，请使用新密码登录。',
    'forms.auth.goToLogin': '前往登录',
    'forms.auth.tokenValidating': '验证重置链接...',
    'forms.auth.resetPasswordDesc': '请输入您的新密码',
    'forms.auth.linkInvalid': '链接无效',
    'forms.auth.linkInvalidDesc': '重置密码链接无效或已过期',
    'forms.auth.requestNewReset': '重新申请重置密码',
    'forms.fields.email': '邮箱',
    'forms.fields.password': '密码',
    'forms.fields.username': '用户名',
    'forms.fields.confirmPassword': '确认密码',
    'forms.fields.emailAddress': '邮箱地址',
    'forms.placeholders.email': '请输入邮箱地址',
    'forms.placeholders.password': '请输入密码',
    'forms.placeholders.username': '请输入用户名',
    'forms.placeholders.confirmPassword': '请再次输入密码',
    'forms.placeholders.passwordHint': '请输入密码（至少6个字符）',
    'forms.validation.required': '必填项',
    'forms.validation.invalid': '格式不正确',
    'forms.validation.emailRequired': '请输入邮箱地址',
    'forms.validation.emailInvalid': '请输入有效的邮箱地址',
    'forms.validation.passwordRequired': '请输入密码',
    'forms.validation.passwordTooShort': '密码至少需要{min}位',
    'forms.validation.minLength': '至少需要{min}个字符',
    'forms.validation.maxLength': '最多{max}个字符',
    'forms.validation.usernameRequired': '请输入用户名',
    'forms.validation.usernameMinLength': '用户名至少需要{min}个字符',
    'forms.validation.usernameMaxLength': '用户名不能超过{max}个字符',
    'forms.validation.passwordMaxLength': '密码不能超过{max}个字符',
    'forms.validation.confirmPasswordRequired': '请确认密码',
    'forms.validation.passwordMismatch': '两次输入的密码不一致',
    'forms.validation.newPasswordRequired': '请输入新密码',
    'forms.validation.confirmNewPasswordRequired': '请确认新密码',
    'forms.validation.newPasswordMismatch': '两次输入的新密码不一致',
    
    // 错误消息
    'error.network': '网络连接失败，请检查网络后重试',
    'error.server': '服务器错误，请稍后重试',
    'error.unauthorized': '登录已过期，请重新登录',
    'error.forbidden': '没有权限执行此操作',
    'error.notFound': '请求的资源不存在',
    'error.unknown': '未知错误，请稍后重试',
    
    // 新的错误翻译键（LoginPage使用）
    'errors.auth.emailNotRegistered': '该邮箱尚未注册',
    'errors.auth.passwordIncorrect': '密码错误',
    'errors.auth.accountDisabled': '账户已被禁用',
    'errors.auth.invalidCredentials': '邮箱或密码错误',
    'errors.auth.googleLoginFailed': 'Google登录失败，请重试',
    'errors.auth.googleTokenInvalid': 'Google登录令牌无效',
    'errors.auth.googleLoginUnavailable': 'Google登录暂不可用，请使用邮箱密码登录',
    'errors.validation.invalidFormat': '格式不正确',
    'errors.network.connectionFailed': '网络连接失败，请检查网络后重试',
    'errors.network.serverError': '服务器错误，请稍后重试',
    'errors.network.unauthorized': '登录已过期，请重新登录',
    'errors.network.notFound': '请求的资源不存在',
    'errors.general.unknownError': '未知错误，请稍后重试',
    
    // RegisterPage错误消息
    'errors.auth.emailAlreadyRegistered': '该邮箱已被注册',
    'errors.auth.usernameAlreadyTaken': '该用户名已被使用',
    'errors.auth.invalidInputFormat': '输入信息格式不正确，请检查后重试',
    'errors.auth.registrationFailed': '注册失败，请稍后重试',
    
    // ForgotPasswordPage错误消息
    'errors.auth.emailNotRegistered2': '该邮箱未注册',
    'errors.auth.sendEmailFailed': '发送邮件失败，请稍后重试',
    'errors.auth.resetEmailFailed': '发送重置邮件失败，请稍后重试',
    
    // ResetPasswordPage错误消息
    'errors.auth.tokenExpired': '重置链接已过期，请重新申请',
    'errors.auth.tokenInvalid': '重置链接无效',
    'errors.auth.resetFailed': '密码重置失败，请稍后重试',
    
    // 认证相关
    'auth.loginTitle': '登录',
    'auth.registerTitle': '注册',
    'auth.rememberMe': '记住我',
    'auth.forgotPassword': '忘记密码？',
    'auth.noAccount': '还没有账户？',
    'auth.hasAccount': '已有账户？',
    'auth.loginSuccess': '登录成功',
    'auth.registerSuccess': '注册成功',
    'auth.logoutSuccess': '退出成功',
    
    // 难度标签
    'difficulty.easy': '容易',
    'difficulty.medium': '中等难度',
    'difficulty.advanced': '进阶',
  },
  en: {
    // Navigation - maintain backward compatibility
    'nav.coloringPagesFree': 'Coloring Pages Free',
    'nav.textColoringPage': 'Text Coloring Page',
    'nav.imageColoringPage': 'Image Coloring Page',
    'nav.pricing': 'Pricing',
    'nav.login': 'Login',
    'nav.register': 'Register',
    'nav.profile': 'Profile',
    'nav.logout': 'Logout',
    'nav.myCreations': 'My Creations',
    
    // 新的导航翻译键
    'navigation.menu.home': 'Home',
    'navigation.menu.coloringPagesFree': 'Coloring Pages Free',
    'navigation.menu.textColoringPage': 'Text Coloring Page',
    'navigation.menu.imageColoringPage': 'Image Coloring Page',
    'navigation.menu.pricing': 'Pricing',
    'navigation.menu.login': 'Login',
    'navigation.menu.register': 'Register',
    'navigation.menu.profile': 'Profile',
    'navigation.menu.logout': 'Logout',
    'navigation.menu.myCreations': 'My Creations',
    'navigation.menu.categories': 'Categories',
    'navigation.menu.gallery': 'Gallery',
    
    // Language selection
    'language.chinese': '简体中文',
    'language.english': 'English',
    'language.japanese': '日本語',
    'language.current': 'English',
    'navigation.language.chinese': '简体中文',
    'navigation.language.english': 'English',
    'navigation.language.japanese': '日本語',
    'navigation.language.selectLanguage': 'Select Language',
    
    // Common buttons and actions
    'common.confirm': 'Confirm',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.download': 'Download',
    'common.upload': 'Upload',
    'common.search': 'Search',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.retry': 'Retry',
    'common.close': 'Close',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.previous': 'Previous',
    'common.submit': 'Submit',
    'common.reset': 'Reset',
    'common.status.loading': 'Loading',
    
    // Form related
    'form.email': 'Email',
    'form.password': 'Password',
    'form.confirmPassword': 'Confirm Password',
    'form.username': 'Username',
    'form.required': 'Required',
    'form.invalid': 'Invalid format',
    'form.emailInvalid': 'Please enter a valid email address',
    'form.passwordTooShort': 'Password must be at least 6 characters',
    'form.passwordMismatch': 'Passwords do not match',
    'form.usernameRequired': 'Please enter username',
    'form.emailRequired': 'Please enter email address',
    'form.passwordRequired': 'Please enter password',
    
    // 新的表单翻译键（LoginPage使用）
    'forms.auth.loginTitle': 'Login',
    'forms.auth.noAccount': 'Don\'t have an account?',
    'forms.auth.createAccount': 'Create Account',
    'forms.auth.rememberMe': 'Remember me',
    'forms.auth.forgotPassword': 'Forgot password?',
    'forms.auth.googleLogin': 'Login with Google',
    'forms.auth.orDivider': 'OR',
    
    // RegisterPage翻译键
    'forms.auth.registerTitle': 'Create New Account',
    'forms.auth.hasAccount': 'Already have an account?',
    'forms.auth.loginNow': 'Sign in now',
    'forms.auth.registerSuccess': 'Registration successful! Please log in to your account.',
    'forms.auth.registering': 'Registering...',
    'forms.auth.agreeTerms': 'By clicking "Create Account" you agree to our',
    'forms.auth.termsOfService': 'Terms of Service',
    'forms.auth.and': 'and',
    'forms.auth.privacyPolicy': 'Privacy Policy',
    
    // ForgotPasswordPage翻译键
    'forms.auth.forgotPasswordTitle': 'Forgot Password',
    'forms.auth.forgotPasswordDesc': 'Enter your email address and we will send you a password reset link',
    'forms.auth.sendResetEmail': 'Send Reset Email',
    'forms.auth.sending': 'Sending...',
    'forms.auth.backToLogin': 'Back to Login',
    'forms.auth.emailSentTitle': 'Email Sent',
    'forms.auth.emailSentDesc': 'We have sent a password reset email to:',
    'forms.auth.emailSentInstructions': 'Please check your email and click the link to reset your password',
    'forms.auth.emailNotReceivedTip': 'If you don\'t receive the email, please check your spam folder or wait a few minutes and try again',
    'forms.auth.resendEmail': 'Resend Email',
    
    // ResetPasswordPage翻译键
    'forms.auth.resetPasswordTitle': 'Reset Password',
    'forms.auth.newPassword': 'New Password',
    'forms.auth.confirmNewPassword': 'Confirm New Password',
    'forms.auth.resetPassword': 'Reset Password',
    'forms.auth.resetting': 'Resetting...',
    'forms.auth.resetSuccess': 'Password Reset Successful!',
    'forms.auth.resetSuccessDesc': 'Your password has been successfully reset. Please log in with your new password.',
    'forms.auth.goToLogin': 'Go to Login',
    'forms.auth.tokenValidating': 'Validating reset link...',
    'forms.auth.resetPasswordDesc': 'Please enter your new password',
    'forms.auth.linkInvalid': 'Invalid Link',
    'forms.auth.linkInvalidDesc': 'The password reset link is invalid or has expired',
    'forms.auth.requestNewReset': 'Request New Password Reset',
    'forms.fields.email': 'Email',
    'forms.fields.password': 'Password',
    'forms.fields.username': 'Username',
    'forms.fields.confirmPassword': 'Confirm Password',
    'forms.fields.emailAddress': 'Email Address',
    'forms.placeholders.email': 'Enter your email',
    'forms.placeholders.password': 'Enter your password',
    'forms.placeholders.username': 'Enter your username',
    'forms.placeholders.confirmPassword': 'Enter password again',
    'forms.placeholders.passwordHint': 'Enter password (at least 6 characters)',
    'forms.validation.required': 'Required',
    'forms.validation.invalid': 'Invalid format',
    'forms.validation.emailRequired': 'Please enter email address',
    'forms.validation.emailInvalid': 'Please enter a valid email address',
    'forms.validation.passwordRequired': 'Please enter password',
    'forms.validation.passwordTooShort': 'Password must be at least {min} characters',
    'forms.validation.minLength': 'Must be at least {min} characters',
    'forms.validation.maxLength': 'Must be at most {max} characters',
    'forms.validation.usernameRequired': 'Please enter username',
    'forms.validation.usernameMinLength': 'Username must be at least {min} characters',
    'forms.validation.usernameMaxLength': 'Username cannot exceed {max} characters',
    'forms.validation.passwordMaxLength': 'Password cannot exceed {max} characters',
    'forms.validation.confirmPasswordRequired': 'Please confirm password',
    'forms.validation.passwordMismatch': 'Passwords do not match',
    'forms.validation.newPasswordRequired': 'Please enter new password',
    'forms.validation.confirmNewPasswordRequired': 'Please confirm new password',
    'forms.validation.newPasswordMismatch': 'New passwords do not match',
    
    // Error messages
    'error.network': 'Network connection failed, please check your connection and try again',
    'error.server': 'Server error, please try again later',
    'error.unauthorized': 'Session expired, please login again',
    'error.forbidden': 'You do not have permission to perform this action',
    'error.notFound': 'The requested resource was not found',
    'error.unknown': 'Unknown error, please try again later',
    
    // 新的错误翻译键（LoginPage使用）
    'errors.auth.emailNotRegistered': 'Email not registered',
    'errors.auth.passwordIncorrect': 'Incorrect password',
    'errors.auth.accountDisabled': 'Account has been disabled',
    'errors.auth.invalidCredentials': 'Invalid email or password',
    'errors.auth.googleLoginFailed': 'Google login failed, please try again',
    'errors.auth.googleTokenInvalid': 'Google login token is invalid',
    'errors.auth.googleLoginUnavailable': 'Google login is unavailable, please use email and password',
    'errors.validation.invalidFormat': 'Invalid format',
    'errors.network.connectionFailed': 'Network connection failed, please check your connection and try again',
    'errors.network.serverError': 'Server error, please try again later',
    'errors.network.unauthorized': 'Session expired, please login again',
    'errors.network.notFound': 'The requested resource was not found',
    'errors.general.unknownError': 'Unknown error, please try again later',
    
    // RegisterPage错误消息
    'errors.auth.emailAlreadyRegistered': 'Email already registered',
    'errors.auth.usernameAlreadyTaken': 'Username already taken',
    'errors.auth.invalidInputFormat': 'Invalid input format, please check and try again',
    'errors.auth.registrationFailed': 'Registration failed, please try again later',
    
    // ForgotPasswordPage错误消息
    'errors.auth.emailNotRegistered2': 'Email not registered',
    'errors.auth.sendEmailFailed': 'Failed to send email, please try again later',
    'errors.auth.resetEmailFailed': 'Failed to send reset email, please try again later',
    
    // ResetPasswordPage错误消息
    'errors.auth.tokenExpired': 'Reset link has expired, please request a new one',
    'errors.auth.tokenInvalid': 'Invalid reset link',
    'errors.auth.resetFailed': 'Password reset failed, please try again later',
    
    // Authentication related
    'auth.loginTitle': 'Login',
    'auth.registerTitle': 'Register',
    'auth.rememberMe': 'Remember me',
    'auth.forgotPassword': 'Forgot password?',
    'auth.noAccount': 'Don\'t have an account?',
    'auth.hasAccount': 'Already have an account?',
    'auth.loginSuccess': 'Login successful',
    'auth.registerSuccess': 'Registration successful',
    'auth.logoutSuccess': 'Logout successful',
    
    // 难度标签
    'difficulty.easy': 'Easy',
    'difficulty.medium': 'Medium',
    'difficulty.advanced': 'Advanced',
  },
  ja: {
    // 暂时复制英文翻译作为占位符，后续可以补充日语翻译
    'nav.coloringPagesFree': '無料塗り絵',
    'nav.textColoringPage': 'テキストから塗り絵ページへ',
    'nav.imageColoringPage': '写真から塗り絵ページへ',
    'nav.pricing': '価格',
    'nav.login': 'ログイン',
    'nav.register': '登録',
    'nav.profile': 'プロフィール',
    'nav.logout': 'ログアウト',
    'nav.myCreations': '私の作品',
    
    'navigation.menu.home': 'ホーム',
    'navigation.menu.coloringPagesFree': '無料塗り絵',
    'navigation.menu.textColoringPage': 'テキストから塗り絵ページへ',
    'navigation.menu.imageColoringPage': '写真から塗り絵ページへ',
    'navigation.menu.pricing': '価格',
    'navigation.menu.login': 'ログイン',
    'navigation.menu.register': '登録',
    'navigation.menu.profile': 'プロフィール',
    'navigation.menu.logout': 'ログアウト',
    'navigation.menu.myCreations': '私の作品',
    'navigation.menu.categories': 'カテゴリー',
    'navigation.menu.gallery': 'ギャラリー',
    
         'language.chinese': '简体中文',
     'language.english': 'English',
     'language.japanese': '日本語',
     'language.current': '日本語',
     'navigation.language.chinese': '简体中文',
     'navigation.language.english': 'English',
     'navigation.language.japanese': '日本語',
     'navigation.language.selectLanguage': '言語を選択',
    
    'common.confirm': '確認',
    'common.cancel': 'キャンセル',
    'common.save': '保存',
    'common.delete': '削除',
    'common.edit': '編集',
    'common.download': 'ダウンロード',
    'common.upload': 'アップロード',
    'common.search': '検索',
    'common.loading': '読み込み中...',
    'common.error': 'エラー',
    'common.success': '成功',
    'common.retry': '再試行',
    'common.close': '閉じる',
    'common.back': '戻る',
    'common.next': '次へ',
    'common.previous': '前へ',
    'common.submit': '送信',
    'common.reset': 'リセット',
    'common.status.loading': '読み込み中',
    
    'form.email': 'メール',
    'form.password': 'パスワード',
    'form.confirmPassword': 'パスワード確認',
    'form.username': 'ユーザー名',
    'form.required': '必須項目',
    'form.invalid': '形式が正しくありません',
    'form.emailInvalid': '有効なメールアドレスを入力してください',
    'form.passwordTooShort': 'パスワードは最低6文字必要です',
    'form.passwordMismatch': '入力されたパスワードが一致しません',
    'form.usernameRequired': 'ユーザー名を入力してください',
    'form.emailRequired': 'メールアドレスを入力してください',
    'form.passwordRequired': 'パスワードを入力してください',
    
    'forms.auth.loginTitle': 'ログイン',
    'forms.auth.noAccount': 'アカウントをお持ちでない方',
    'forms.auth.createAccount': 'アカウント作成',
    'forms.auth.rememberMe': 'ログイン状態を保持',
    'forms.auth.forgotPassword': 'パスワードを忘れた方',
    'forms.auth.googleLogin': 'Googleでログイン',
    'forms.auth.orDivider': 'または',
    
    'auth.loginTitle': 'ログイン',
    'auth.registerTitle': '登録',
    'auth.rememberMe': 'ログイン状態を保持',
    'auth.forgotPassword': 'パスワードを忘れた方',
    'auth.noAccount': 'アカウントをお持ちでない方',
    'auth.hasAccount': '既にアカウントをお持ちの方',
    'auth.loginSuccess': 'ログイン成功',
    'auth.registerSuccess': '登録成功',
    'auth.logoutSuccess': 'ログアウト成功',
    
    // 難度ラベル
    'difficulty.easy': '簡単',
    'difficulty.medium': '中級',
    'difficulty.advanced': '上級',
  },
};

interface LanguageProviderProps {
  children: ReactNode;
}

// 同步获取初始语言，避免闪烁
const getInitialLanguage = (): Language => {
  // 1. 优先从URL路径检测语言
  const currentPath = window.location.pathname;
  if (currentPath.startsWith('/zh')) {
    return 'zh';
  } else if (currentPath.startsWith('/ja')) {
    return 'ja';
  }
  
  // 2. 其次使用保存的语言偏好
  const savedLanguage = getSavedLanguage();
  if (savedLanguage) {
    return savedLanguage;
  }
  
  // 3. 最后检测浏览器语言
  const detectedLanguage = detectBrowserLanguage();
  saveLanguagePreference(detectedLanguage); // 保存检测到的语言
  return detectedLanguage;
};

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  // 获取初始语言（从localStorage或浏览器检测）
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);
  const [isLoading, setIsLoading] = useState(true);
  const [navigate, setNavigate] = useState<any>(null);

  // 初始化语言设置 - 只处理异步翻译预加载
  useEffect(() => {
    const initializeTranslations = async () => {
      // 预加载当前语言的核心翻译资源
      try {
        await preloadCoreTranslations(language);
      } catch (error) {
        console.warn('Failed to preload translations:', error);
      }
      
      setIsLoading(false);
    };

    initializeTranslations();
  }, [language]); // 依赖language，当语言变化时重新加载

  const setLanguage = async (lang: Language) => {
    console.log('🌐 Setting language to:', lang);
    
    if (lang === language) return;
    
    setIsLoading(true);
    saveLanguagePreference(lang);
    
    // 生成新的语言路径
    const currentPath = window.location.pathname;
    let pathWithoutLanguage = currentPath;
    
    // 移除当前语言前缀
    if (currentPath.startsWith('/zh')) {
      pathWithoutLanguage = currentPath.substring(3) || '/';
    } else if (currentPath.startsWith('/ja')) {
      pathWithoutLanguage = currentPath.substring(3) || '/';
    }
    
    // 生成新的语言路径
    let newPath: string;
    if (lang === 'zh') {
      newPath = '/zh' + (pathWithoutLanguage === '/' ? '' : pathWithoutLanguage);
    } else if (lang === 'ja') {
      newPath = '/ja' + (pathWithoutLanguage === '/' ? '' : pathWithoutLanguage);
    } else {
      newPath = pathWithoutLanguage;
    }
    
    // 预加载新语言的核心翻译资源
    try {
      await preloadCoreTranslations(lang);
    } catch (error) {
      console.warn('Failed to preload translations for new language:', error);
    }
    
    // 使用React Router导航（无刷新）或者fallback到页面重载
    if (navigate) {
      console.log('🚀 Using React Router navigation to:', newPath);
      navigate(newPath, { replace: true });
      setLanguageState(lang);
      setIsLoading(false);
    } else {
      console.log('⚠️ Fallback to page reload for:', newPath);
      // Fallback到页面重载
      window.location.href = newPath;
    }
  };

  const t = (
    key: string, 
    fallback?: string, 
    params?: { [key: string]: string | number }
  ): string => {
    // 优先从基础翻译资源中获取（包含导航等核心翻译）
    let translation = baseTranslations[language]?.[key];
    
    if (!translation && language !== 'en') {
      // 如果当前语言没有翻译，尝试英文
      translation = baseTranslations['en']?.[key];
    }
    
    if (translation) {
      return interpolateTranslation(translation, params);
    }
    
    // 返回fallback或key本身
    const finalResult = fallback || key;
    return interpolateTranslation(finalResult, params);
  };

  // 内部setState，用于URL路径同步，不触发页面跳转
  const __internal_setState = (lang: Language) => {
    if (lang !== language) {
      console.log('🔄 LanguageProvider: __internal_setState from', language, 'to', lang);
      setLanguageState(lang);
      saveLanguagePreference(lang);
    }
  };

  // 内部setNavigate，用于注入navigate函数
  const __internal_setNavigate = (navigateFunc: any) => {
    setNavigate(() => navigateFunc);
  };

  return (
    <LanguageContext.Provider value={{ 
      language, 
      setLanguage, 
      t, 
      isLoading, 
      __internal_setState,
      __internal_setNavigate
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// 导出专门用于异步翻译的hook（优化版，减少闪烁）
export const useAsyncTranslation = (module: string) => {
  const { language } = useLanguage();
  
  // 首先尝试同步获取缓存的翻译
  const cachedTranslations = getCachedTranslationModule(language, module);
  const [translations, setTranslations] = useState<any>(cachedTranslations || {});
  const [loading, setLoading] = useState(!cachedTranslations);

  useEffect(() => {
    // 检查是否已经缓存，如果已缓存则无需重新加载
    if (isTranslationModuleCached(language, module)) {
      const cached = getCachedTranslationModule(language, module);
      if (cached) {
        setTranslations(cached);
        setLoading(false);
        return;
      }
    }

    const loadTranslations = async () => {
      setLoading(true);
      try {
        const moduleTranslations = await loadTranslationModule(language, module);
        setTranslations(moduleTranslations);
      } catch (error) {
        console.error(`Failed to load translations for module ${module}:`, error);
        setTranslations({});
      } finally {
        setLoading(false);
      }
    };

    loadTranslations();
  }, [language, module]);

  const t = (path: string, fallback?: string, params?: { [key: string]: string | number }) => {
    const result = getNestedTranslation(translations, path, fallback);
    return interpolateTranslation(result, params);
  };

  return { t, loading, translations };
}; 