import React, { useState, useEffect } from 'react';

interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const ApiTestPage: React.FC = () => {
  const [imagesData, setImagesData] = useState<ApiResponse | null>(null);
  const [categoriesData, setCategoriesData] = useState<ApiResponse | null>(null);
  const [generateData, setGenerateData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState('一只可爱的小猫');

  // 测试获取图片列表
  const testImagesApi = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/images?page=1&limit=5');
      const data = await response.json();
      setImagesData(data);
    } catch (error) {
      console.error('Error fetching images:', error);
      setImagesData({ success: false, error: 'Failed to fetch images' });
    }
    setLoading(false);
  };

  // 测试获取分类列表
  const testCategoriesApi = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      setCategoriesData(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategoriesData({ success: false, error: 'Failed to fetch categories' });
    }
    setLoading(false);
  };

  // 测试生成图片
  const testGenerateApi = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt,
          userId: 'test_user_123',
          style: 'cartoon'
        }),
      });
      const data = await response.json();
      setGenerateData(data);
    } catch (error) {
      console.error('Error generating image:', error);
      setGenerateData({ success: false, error: 'Failed to generate image' });
    }
    setLoading(false);
  };

  // 页面加载时自动测试图片和分类API
  useEffect(() => {
    testImagesApi();
    testCategoriesApi();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">API 测试页面</h1>
        
        {/* 图片API测试 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">图片列表 API</h2>
            <button
              onClick={testImagesApi}
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? '加载中...' : '重新测试'}
            </button>
          </div>
          <div className="bg-gray-100 p-4 rounded">
            <p className="text-sm text-gray-600 mb-2">GET /api/images</p>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(imagesData, null, 2)}
            </pre>
          </div>
        </div>

        {/* 分类API测试 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">分类列表 API</h2>
            <button
              onClick={testCategoriesApi}
              disabled={loading}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
            >
              {loading ? '加载中...' : '重新测试'}
            </button>
          </div>
          <div className="bg-gray-100 p-4 rounded">
            <p className="text-sm text-gray-600 mb-2">GET /api/categories</p>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(categoriesData, null, 2)}
            </pre>
          </div>
        </div>

        {/* 生成图片API测试 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">生成图片 API</h2>
            <button
              onClick={testGenerateApi}
              disabled={loading}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
            >
              {loading ? '生成中...' : '测试生成'}
            </button>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              输入提示词：
            </label>
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="输入你想生成的图片描述..."
            />
          </div>
          <div className="bg-gray-100 p-4 rounded">
            <p className="text-sm text-gray-600 mb-2">POST /api/generate</p>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(generateData, null, 2)}
            </pre>
          </div>
        </div>

        {/* API 使用说明 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">API 使用说明</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-800">1. 获取图片列表</h3>
              <p className="text-sm text-gray-600">
                GET /api/images?page=1&limit=10&category=animals&difficulty=easy&search=猫
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-800">2. 获取分类列表</h3>
              <p className="text-sm text-gray-600">
                GET /api/categories
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-800">3. 获取单个分类</h3>
              <p className="text-sm text-gray-600">
                GET /api/categories?id=animals
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-800">4. 生成图片</h3>
              <p className="text-sm text-gray-600">
                POST /api/generate<br/>
                Body: {"{ prompt: '描述', userId: 'user_id', style: 'cartoon' }"}
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-800">5. 获取图片详情</h3>
              <p className="text-sm text-gray-600">
                GET /api/images/cat
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiTestPage; 