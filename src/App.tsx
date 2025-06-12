import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import PricingPage from './pages/PricingPage';
import GeneratePage from './pages/GeneratePage';
import CategoriesPage from './pages/CategoriesPage';
import CategoriesDetailPage from './pages/CategoriesDetailPage';
import ImageDetailPage from './pages/ImageDetailPage';
import ScrollToTop from './components/common/ScrollToTop';
import { LanguageProvider } from './contexts/LanguageContext';

// This is just a placeholder until we copy over our components
function App() {
  return (
    <LanguageProvider>
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
          {/* Add more routes as needed */}
        </Routes>
      </Router>
    </LanguageProvider>
  );
}

export default App; 