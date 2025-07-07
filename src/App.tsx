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
import ScrollToTop from './components/common/ScrollToTop';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { LanguageSyncProvider } from './components/common/LanguageSyncProvider';
import { AuthProvider } from './contexts/AuthContext';
// import { getSavedLanguage, detectBrowserLanguage } from './components/common/LanguageRouter';

// 移除未使用的语言重定向组件

// 应用内容组件，处理语言加载状态
function AppContent() {
  const { isLoading } = useLanguage();

  // 如果语言正在加载，显示最小化的加载状态（几乎瞬间完成）
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-pulse">
          <div className="w-8 h-8 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <LanguageSyncProvider>
        <ScrollToTop />
        <Routes>
        {/* 英文路由（默认路径，无语言前缀） */}
        <Route path="/" element={<HomePage />} />
        <Route path="/price" element={<PricingPage />} />
        <Route path="/generate" element={<GeneratePage initialTab="text" />} />
        <Route path="/text-coloring-page" element={<GeneratePage initialTab="text" />} />
        <Route path="/image-coloring-page" element={<GeneratePage initialTab="image" />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/categories/:categoryId" element={<CategoriesDetailPage />} />
        <Route path="/image/:imageId" element={<ImageDetailPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/creations" element={<CreationsPage />} />
        <Route path="/test-auth" element={<TestAuthPage />} />

        {/* 中文路由（/zh 前缀） */}
        <Route path="/zh" element={<HomePage />} />
        <Route path="/zh/price" element={<PricingPage />} />
        <Route path="/zh/generate" element={<GeneratePage initialTab="text" />} />
        <Route path="/zh/text-coloring-page" element={<GeneratePage initialTab="text" />} />
        <Route path="/zh/image-coloring-page" element={<GeneratePage initialTab="image" />} />
        <Route path="/zh/categories" element={<CategoriesPage />} />
        <Route path="/zh/categories/:categoryId" element={<CategoriesDetailPage />} />
        <Route path="/zh/image/:imageId" element={<ImageDetailPage />} />
        <Route path="/zh/register" element={<RegisterPage />} />
        <Route path="/zh/login" element={<LoginPage />} />
        <Route path="/zh/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/zh/reset-password" element={<ResetPasswordPage />} />
        <Route path="/zh/profile" element={<ProfilePage />} />
        <Route path="/zh/creations" element={<CreationsPage />} />
        <Route path="/zh/test-auth" element={<TestAuthPage />} />

        {/* 日文路由（/ja 前缀） */}
        <Route path="/ja" element={<HomePage />} />
        <Route path="/ja/price" element={<PricingPage />} />
        <Route path="/ja/generate" element={<GeneratePage initialTab="text" />} />
        <Route path="/ja/text-coloring-page" element={<GeneratePage initialTab="text" />} />
        <Route path="/ja/image-coloring-page" element={<GeneratePage initialTab="image" />} />
        <Route path="/ja/categories" element={<CategoriesPage />} />
        <Route path="/ja/categories/:categoryId" element={<CategoriesDetailPage />} />
        <Route path="/ja/image/:imageId" element={<ImageDetailPage />} />
        <Route path="/ja/register" element={<RegisterPage />} />
        <Route path="/ja/login" element={<LoginPage />} />
        <Route path="/ja/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/ja/reset-password" element={<ResetPasswordPage />} />
        <Route path="/ja/profile" element={<ProfilePage />} />
        <Route path="/ja/creations" element={<CreationsPage />} />
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
        <AppContent />
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App; 