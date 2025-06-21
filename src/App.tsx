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
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';

// This is just a placeholder until we copy over our components
function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Router>
          <ScrollToTop />
          <Routes>
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
            {/* Add more routes as needed */}
          </Routes>
        </Router>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App; 