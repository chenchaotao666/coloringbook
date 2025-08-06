import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

const expandDefaultIcon = '/images/expand-default.svg';
const expandColorIcon = '/images/expand-color.svg';

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen?: boolean;
  onClick: () => void;
}

export interface FAQData {
  question: string;
  answer: string;
}

interface GenerateFAQProps {
  className?: string;
  faqData: FAQData[];
  title?: string;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer, isOpen = false, onClick }) => {
  return (
    <div className="w-full max-w-[970px] bg-[#F9FAFB] px-5 py-7 mb-5 rounded-2xl border border-[#F0F0F0]">
      <div 
        className="flex justify-between items-center gap-4 cursor-pointer hover:bg-[#F3F4F6] transition-colors duration-200 -mx-5 -my-7 px-5 py-7 rounded-2xl"
        onClick={onClick}
      >
        <div className={`${isOpen ? 'text-[#FF5C07]' : 'text-[#161616]'} text-xl font-medium leading-tight flex-1`}>
          {question}
        </div>
        <img 
          src={isOpen ? expandColorIcon : expandDefaultIcon} 
          alt={isOpen ? "Collapse" : "Expand"} 
          className="w-6 h-6 flex-shrink-0 transition-opacity duration-200 pointer-events-none"
        />
      </div>
      
      {isOpen && (
        <div className="text-[#6B7280] text-base leading-6 mt-8 pr-10 cursor-text select-text">
          {answer}
        </div>
      )}
    </div>
  );
};

const GenerateFAQ: React.FC<GenerateFAQProps> = ({ 
  className = "",
  faqData,
  title
}) => {
  const { t } = useLanguage();
  const [openItems, setOpenItems] = useState<number[]>([0]); // 默认打开第一个

  const handleClick = (index: number) => {
    setOpenItems(prevOpenItems => {
      if (prevOpenItems.includes(index)) {
        // 如果已经打开，则关闭
        return prevOpenItems.filter(item => item !== index);
      } else {
        // 如果未打开，则添加到打开列表
        return [...prevOpenItems, index];
      }
    });
  };

  return (
    <div className={`w-full max-w-[970px] mx-auto px-4 pb-[6rem] ${className}`}>
      {/* Header */}
      <div className="text-center mb-16">
        <h2 className="text-[46px] font-bold text-[#161616]">
          {title || t('faq.title')}
        </h2>
      </div>

      {/* FAQ List */}
      <div className="w-full flex flex-col items-center">
        {faqData.map((item, index) => (
          <FAQItem 
            key={index}
            question={item.question}
            answer={item.answer}
            isOpen={openItems.includes(index)}
            onClick={() => handleClick(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default GenerateFAQ;