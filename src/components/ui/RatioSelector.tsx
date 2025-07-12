import React, { useState, useRef, useEffect } from 'react';

const ratioIcon = '/images/ratio.svg';

type AspectRatio = '21:9' | '16:9' | '4:3' | '1:1' | '3:4' | '9:16' | '16:21';

interface RatioSelectorProps {
  value: AspectRatio;
  onChange: (ratio: AspectRatio) => void;
  className?: string;
}

const RatioSelector: React.FC<RatioSelectorProps> = ({ value, onChange, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const ratios = [
    { value: '21:9' as const, label: '21:9', width: 28, height: 12 },
    { value: '16:9' as const, label: '16:9', width: 24, height: 14 },
    { value: '4:3' as const, label: '4:3', width: 20, height: 15 },
    { value: '1:1' as const, label: '1:1', width: 16, height: 16 },
    { value: '3:4' as const, label: '3:4', width: 15, height: 20 },
    { value: '9:16' as const, label: '9:16', width: 14, height: 24 },
    { value: '16:21' as const, label: '16:21', width: 12, height: 18 }
  ];

  const selectedRatio = ratios.find(ratio => ratio.value === value);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (ratio: AspectRatio) => {
    onChange(ratio);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* 下拉框触发按钮 */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white border border-[#E5E7EB] rounded-lg px-4 py-2 flex items-center justify-between hover:border-[#D1D5DB] transition-all duration-200"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {/* 当前选中的比例形状 */}
            <div 
              className="border-2 border-[#272F3E]"
              style={{
                width: `${selectedRatio?.width}px`,
                height: `${selectedRatio?.height}px`
              }}
            />
            {/* 当前选中的比例文字 */}
            <span className="text-[#161616] font-medium">{selectedRatio?.label}</span>
          </div>
        </div>
        
        {/* 下拉箭头 */}
        <svg 
          className={`w-5 h-5 text-[#6B7280] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* 下拉菜单 */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#E5E7EB] rounded-lg shadow-lg py-2 z-50">
          {ratios.map((ratio) => (
            <button
              key={ratio.value}
              type="button"
              onClick={() => handleSelect(ratio.value)}
              className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-[#F9FAFB] transition-colors duration-200 ${
                value === ratio.value ? 'bg-[#FFF4F1] text-[#FF5C07]' : 'text-[#161616]'
              }`}
            >
              {/* 比例形状 */}
              <div 
                className={`border-2 ${
                  value === ratio.value ? 'border-[#FF5C07]' : 'border-[#272F3E]'
                }`}
                style={{
                  width: `${ratio.width}px`,
                  height: `${ratio.height}px`
                }}
              />
              {/* 比例文字 */}
              <span className="font-medium">{ratio.label}</span>
              
              {/* 选中状态指示器 */}
              {value === ratio.value && (
                <div className="ml-auto">
                  <svg className="w-4 h-4 text-[#FF5C07]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export { type AspectRatio };
export default RatioSelector; 