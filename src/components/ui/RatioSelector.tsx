import React, { useState } from 'react';
import ratioIcon from '../../images/ratio.svg';

interface RatioSelectorProps {
  value: '3:4' | '4:3' | '1:1';
  onChange: (ratio: '3:4' | '4:3' | '1:1') => void;
  className?: string;
}

const RatioSelector: React.FC<RatioSelectorProps> = ({ value, onChange, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);

  const ratios = [
    { value: '3:4' as const, label: '3:4' },
    { value: '4:3' as const, label: '4:3' },
    { value: '1:1' as const, label: '1:1' }
  ];

  const selectedRatio = ratios.find(ratio => ratio.value === value);

  const handleSelect = (ratio: '3:4' | '4:3' | '1:1') => {
    onChange(ratio);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      {/* 选择器按钮 */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#EDEEF0] rounded-lg hover:border-[#FF5C07] hover:bg-[#FFF8F5] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#FF5C07] focus:ring-opacity-20 min-w-[80px]"
      >
        <img src={ratioIcon} alt="Ratio" className="w-4 h-4 flex-shrink-0" />
        <span className="text-[#161616] text-sm font-medium flex-1 text-left">{selectedRatio?.label}</span>
        <svg
          className={`w-4 h-4 text-[#6B7280] transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* 下拉选项 */}
      {isOpen && (
        <>
          {/* 背景遮罩 */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* 选项列表 */}
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#EDEEF0] rounded-lg shadow-lg z-20 overflow-hidden">
            {ratios.map((ratio) => (
              <button
                key={ratio.value}
                type="button"
                onClick={() => handleSelect(ratio.value)}
                className={`w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[#F9FAFB] transition-colors duration-150 ${
                  value === ratio.value ? 'bg-[#FFE4D6] text-[#FF5C07]' : 'text-[#161616]'
                }`}
              >
                <span className="text-sm font-medium">{ratio.label}</span>
                {value === ratio.value && (
                  <svg className="w-4 h-4 ml-auto text-[#FF5C07]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default RatioSelector; 