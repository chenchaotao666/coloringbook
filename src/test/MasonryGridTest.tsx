import React from 'react';
import MasonryGrid from '../components/layout/MasonryGrid';
import { HomeImage } from '../services/imageService';

// 测试数据
const testImages: HomeImage[] = [
  {
    id: 'test1',
    name: 'Test Image 1',
    defaultUrl: 'https://via.placeholder.com/300x400/FF5C07/FFFFFF?text=Image+1',
    colorUrl: 'https://via.placeholder.com/300x400/FF5C07/FFFFFF?text=Image+1',
    title: 'Test Image 1',
    description: 'First test image',
    tags: ['test', 'sample'],
    dimensions: { width: 300, height: 400 },
    additionalInfo: {
      features: [],
      suitableFor: [],
      coloringSuggestions: [],
      creativeUses: []
    }
  },
  {
    id: 'test2',
    name: 'Test Image 2',
    defaultUrl: 'https://via.placeholder.com/300x350/007BFF/FFFFFF?text=Image+2',
    colorUrl: 'https://via.placeholder.com/300x350/007BFF/FFFFFF?text=Image+2',
    title: 'Test Image 2',
    description: 'Second test image',
    tags: ['test', 'sample'],
    dimensions: { width: 300, height: 350 },
    additionalInfo: {
      features: [],
      suitableFor: [],
      coloringSuggestions: [],
      creativeUses: []
    }
  },
  {
    id: 'test3',
    name: 'Test Image 3',
    defaultUrl: 'https://via.placeholder.com/300x380/28A745/FFFFFF?text=Image+3',
    colorUrl: 'https://via.placeholder.com/300x380/28A745/FFFFFF?text=Image+3',
    title: 'Test Image 3',
    description: 'Third test image',
    tags: ['test', 'sample'],
    dimensions: { width: 300, height: 380 },
    additionalInfo: {
      features: [],
      suitableFor: [],
      coloringSuggestions: [],
      creativeUses: []
    }
  },
  {
    id: 'test4',
    name: 'Test Image 4',
    defaultUrl: 'https://via.placeholder.com/300x420/DC3545/FFFFFF?text=Image+4',
    colorUrl: 'https://via.placeholder.com/300x420/DC3545/FFFFFF?text=Image+4',
    title: 'Test Image 4',
    description: 'Fourth test image',
    tags: ['test', 'sample'],
    dimensions: { width: 300, height: 420 },
    additionalInfo: {
      features: [],
      suitableFor: [],
      coloringSuggestions: [],
      creativeUses: []
    }
  }
];

const MasonryGridTest: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">MasonryGrid 对齐测试</h1>
        
        <div className="space-y-12">
          {/* 测试1：只有1个图片 */}
          <div>
            <h2 className="text-xl font-semibold mb-4">测试1：1个图片（左对齐）</h2>
            <div className="border border-gray-300 p-4 rounded-lg">
              <MasonryGrid images={testImages.slice(0, 1)} />
            </div>
          </div>

          {/* 测试2：只有2个图片 */}
          <div>
            <h2 className="text-xl font-semibold mb-4">测试2：2个图片（左对齐）</h2>
            <div className="border border-gray-300 p-4 rounded-lg">
              <MasonryGrid images={testImages.slice(0, 2)} />
            </div>
          </div>

          {/* 测试3：3个图片 */}
          <div>
            <h2 className="text-xl font-semibold mb-4">测试3：3个图片（左对齐）</h2>
            <div className="border border-gray-300 p-4 rounded-lg">
              <MasonryGrid images={testImages.slice(0, 3)} />
            </div>
          </div>

          {/* 测试4：4个图片 */}
          <div>
            <h2 className="text-xl font-semibold mb-4">测试4：4个图片（居中对齐）</h2>
            <div className="border border-gray-300 p-4 rounded-lg">
              <MasonryGrid images={testImages.slice(0, 4)} />
            </div>
          </div>
        </div>

        <div className="mt-12 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">修复说明：</h3>
          <ul className="text-blue-700 space-y-1">
            <li>• 修复前：使用 flex-1 导致列宽平均分配，2个图片时每个占50%宽度</li>
            <li>• 修复后：使用固定列宽，确保所有图片按相同比例显示</li>
            <li>• 桌面端：273px，平板端：240px，移动端：160px</li>
            <li>• 对齐方式：少于4个图片时左对齐，4个及以上时居中对齐</li>
          </ul>
        </div>

        <div className="mt-8 p-4 bg-green-50 rounded-lg">
          <h3 className="font-semibold text-green-800 mb-2">对齐逻辑：</h3>
          <ul className="text-green-700 space-y-1">
            <li>• <strong>1-3个图片</strong>：使用 justify-start 左对齐</li>
            <li>• <strong>4个及以上图片</strong>：使用 justify-center 居中对齐</li>
            <li>• 所有情况下都保持固定的图片尺寸比例</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MasonryGridTest; 