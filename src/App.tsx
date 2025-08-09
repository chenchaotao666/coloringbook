import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import PricingPage from './pages/PricingPage';
import GeneratePage from './pages/GeneratePage';
import CategoriesPage from './pages/CategoriesPage';
import CategoriesDetailPage from './pages/CategoriesDetailPage';
import ImageDetailPage from './pages/ImageDetailPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ProfilePage from './pages/ProfilePage';
import CreationsPage from './pages/CreationsPage';
import TestAuthPage from './pages/TestAuthPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsPage from './pages/TermsPage';
import RefundPolicyPage from './pages/RefundPolicyPage';
import BlogPage from './pages/BlogPage';
import BlogDetailPage from './pages/BlogDetailPage';
import ScrollToTop from './components/common/ScrollToTop';
import TopLoadingBar from './components/ui/TopLoadingBar';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { LanguageSyncProvider } from './components/common/LanguageSyncProvider';
import { AuthProvider } from './contexts/AuthContext';
import { UploadImageProvider } from './contexts/UploadImageContext';
import { CategoriesProvider } from './contexts/CategoriesContext';

// 应用内容组件，处理语言加载状态
function AppContent() {
  const { language } = useLanguage();

  // 动态更新HTML lang属性，帮助Google按钮自动选择正确语言
  React.useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <Router>
      <TopLoadingBar />
      <LanguageSyncProvider>
        <ScrollToTop />
        <Routes>
        {/* 英文路由（默认路径，无语言前缀） */}
        <Route path="/" element={<HomePage />} />
        <Route path="/price" element={<PricingPage />} />
        <Route path="/text-coloring-page" element={<GeneratePage initialTab="text" />} />
        <Route path="/image-coloring-page" element={<GeneratePage initialTab="image" />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/categories/:categoryId" element={<CategoriesDetailPage />} />
        <Route path="/categories/:categoryId/:imageId" element={<ImageDetailPage />} />
        <Route path="/image/:imageId" element={<ImageDetailPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/creations" element={<CreationsPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/refund-policy" element={<RefundPolicyPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:slug" element={<BlogDetailPage />} />
        <Route path="/test-auth" element={<TestAuthPage />} />

        {/* 中文路由（/zh 前缀） */}
        <Route path="/zh" element={<HomePage />} />
        <Route path="/zh/price" element={<PricingPage />} />
        <Route path="/zh/text-coloring-page" element={<GeneratePage initialTab="text" />} />
        <Route path="/zh/image-coloring-page" element={<GeneratePage initialTab="image" />} />
        <Route path="/zh/categories" element={<CategoriesPage />} />
        <Route path="/zh/categories/:categoryId" element={<CategoriesDetailPage />} />
        <Route path="/zh/categories/:categoryId/:imageId" element={<ImageDetailPage />} />
        <Route path="/zh/image/:imageId" element={<ImageDetailPage />} />
        <Route path="/zh/register" element={<RegisterPage />} />
        <Route path="/zh/login" element={<LoginPage />} />
        <Route path="/zh/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/zh/reset-password" element={<ResetPasswordPage />} />
        <Route path="/zh/profile" element={<ProfilePage />} />
        <Route path="/zh/creations" element={<CreationsPage />} />
        <Route path="/zh/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/zh/terms" element={<TermsPage />} />
        <Route path="/zh/refund-policy" element={<RefundPolicyPage />} />
        <Route path="/zh/blog" element={<BlogPage />} />
        <Route path="/zh/blog/:slug" element={<BlogDetailPage />} />
        <Route path="/zh/test-auth" element={<TestAuthPage />} />

        {/* 日文路由（/ja 前缀） */}
        <Route path="/ja" element={<HomePage />} />
        <Route path="/ja/price" element={<PricingPage />} />
        <Route path="/ja/text-coloring-page" element={<GeneratePage initialTab="text" />} />
        <Route path="/ja/image-coloring-page" element={<GeneratePage initialTab="image" />} />
        <Route path="/ja/categories" element={<CategoriesPage />} />
        <Route path="/ja/categories/:categoryId" element={<CategoriesDetailPage />} />
        <Route path="/ja/categories/:categoryId/:imageId" element={<ImageDetailPage />} />
        <Route path="/ja/image/:imageId" element={<ImageDetailPage />} />
        <Route path="/ja/register" element={<RegisterPage />} />
        <Route path="/ja/login" element={<LoginPage />} />
        <Route path="/ja/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/ja/reset-password" element={<ResetPasswordPage />} />
        <Route path="/ja/profile" element={<ProfilePage />} />
        <Route path="/ja/creations" element={<CreationsPage />} />
        <Route path="/ja/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/ja/terms" element={<TermsPage />} />
        <Route path="/ja/refund-policy" element={<RefundPolicyPage />} />
        <Route path="/ja/blog" element={<BlogPage />} />
        <Route path="/ja/blog/:slug" element={<BlogDetailPage />} />
        <Route path="/ja/test-auth" element={<TestAuthPage />} />
      </Routes>
      </LanguageSyncProvider>
    </Router>
  );
}

// 主App组件
function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <UploadImageProvider>
          <CategoriesProvider>
            <AppContent />
          </CategoriesProvider>
        </UploadImageProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App; 