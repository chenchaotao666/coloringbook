import React from 'react';

type AspectRatio = '21:9' | '16:9' | '4:3' | '1:1' | '3:4' | '9:16' | '16:21';

interface RatioSelectorProps {
  value: AspectRatio;
  onChange: (ratio: AspectRatio) => void;
  className?: string;
}

const RatioSelector: React.FC<RatioSelectorProps> = ({ value, onChange, className = '' }) => {
  const ratios = [
    { value: '21:9' as const, label: '21:9', width: 28, height: 12 },
    { value: '16:9' as const, label: '16:9', width: 24, height: 14 },
    { value: '4:3' as const, label: '4:3', width: 20, height: 15 },
    { value: '1:1' as const, label: '1:1', width: 16, height: 16 },
    { value: '3:4' as const, label: '3:4', width: 15, height: 20 },
    { value: '9:16' as const, label: '9:16', width: 14, height: 24 },
    { value: '16:21' as const, label: '16:21', width: 12, height: 18 }
  ];

  const selectedIndex = ratios.findIndex(ratio => ratio.value === value);

  // 计算滑动指示器位置
  const getIndicatorPosition = () => {
    const itemsPerRow = 4;
    
    if (selectedIndex < itemsPerRow) {
      // 第一行
      return `calc(${(selectedIndex / itemsPerRow) * 100}% + 2px)`;
    } else {
      // 第二行，按3个项目计算位置
      const secondRowIndex = selectedIndex - itemsPerRow;
      return `calc(${(secondRowIndex / 3) * 100}% + 2px)`;
    }
  };

  const getIndicatorWidth = () => {
    if (selectedIndex < 4) {
      return 'calc(25% - 4px)'; // 第一行项目宽度
    } else {
      return 'calc(33.333% - 4px)'; // 第二行项目宽度
    }
  };

  const getIndicatorTop = () => {
    return selectedIndex < 4 ? '2px' : 'calc(50% + 1px)';
  };

  return (
    <div className={`relative ${className}`}>
      {/* 容器背景 - 一个统一的灰色块 */}
      <div className="bg-[#F5F5F5] rounded-lg p-1 relative">
        {/* 滑动指示器 */}
        <div
          className="absolute bg-white rounded-md shadow-sm transition-all duration-200 ease-in-out z-10"
          style={{
            left: getIndicatorPosition(),
            top: getIndicatorTop(),
            width: getIndicatorWidth(),
            height: 'calc(50% - 3px)'
          }}
        />
        
        {/* 第一行：4个项目 */}
        <div className="grid grid-cols-4 gap-0 relative z-20">
          {ratios.slice(0, 4).map((ratio) => (
            <button
              key={ratio.value}
              type="button"
              onClick={() => onChange(ratio.value)}
              className={`
                relative h-16 flex flex-col items-center justify-center rounded-md transition-all duration-200
                ${value === ratio.value ? 'text-[#FF5C07]' : 'text-[#6B7280] hover:text-[#161616]'}
              `}
            >
              {/* 比例形状 */}
              <div 
                className={`border-2 mb-1 ${
                  value === ratio.value ? 'border-[#FF5C07]' : 'border-[#272F3E]'
                }`}
                style={{
                  width: `${ratio.width}px`,
                  height: `${ratio.height}px`
                }}
              />
              {/* 比例文字 */}
              <span className="text-xs font-medium leading-none">
                {ratio.label}
              </span>
            </button>
          ))}
        </div>
        
        {/* 第二行：3个项目 */}
        <div className="grid grid-cols-3 gap-0 relative z-20">
          {ratios.slice(4).map((ratio) => (
            <button
              key={ratio.value}
              type="button"
              onClick={() => onChange(ratio.value)}
              className={`
                relative h-16 flex flex-col items-center justify-center rounded-md transition-all duration-200
                ${value === ratio.value ? 'text-[#FF5C07]' : 'text-[#6B7280] hover:text-[#161616]'}
              `}
            >
              {/* 比例形状 */}
              <div 
                className={`border-2 mb-1 ${
                  value === ratio.value ? 'border-[#FF5C07]' : 'border-[#272F3E]'
                }`}
                style={{
                  width: `${ratio.width}px`,
                  height: `${ratio.height}px`
                }}
              />
              {/* 比例文字 */}
              <span className="text-xs font-medium leading-none">
                {ratio.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export { type AspectRatio };
export default RatioSelector; 