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

const FAQItem: React.FC<FAQItemProps> = ({ question, answer, isOpen = false, onClick }) => {
  return (
    <div 
      className="w-full max-w-[970px] bg-[#F9FAFB] p-4 sm:p-5 py-5 sm:py-7 mb-4 sm:mb-5 rounded-xl sm:rounded-2xl border border-[#F0F0F0]"
    >
      <div 
        className="flex justify-between items-center cursor-pointer gap-4"
        onClick={onClick}
      >
        <div className={`${isOpen ? 'text-[#FF5C07]' : 'text-[#161616]'} text-base sm:text-lg lg:text-xl font-medium leading-tight`}>
          {question}
        </div>
        <img 
          src={isOpen ? expandColorIcon : expandDefaultIcon} 
          alt={isOpen ? "Collapse" : "Expand"} 
          className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 transition-opacity duration-200"
        />
      </div>
      
      {isOpen && (
        <div className="text-[#6B7280] text-sm sm:text-base leading-5 sm:leading-6 mt-3 sm:mt-4 pr-8 sm:pr-10">
          {answer}
        </div>
      )}
    </div>
  );
};

const FAQ = () => {
  const { t } = useLanguage();
  const [openItems, setOpenItems] = useState<number[]>([0]); // 默认打开第一个
  
  const faqItems = [
    {
      question: t('faq.question1.q'),
      answer: t('faq.question1.a')
    },
    {
      question: t('faq.question2.q'),
      answer: t('faq.question2.a')
    },
    {
      question: t('faq.question3.q'),
      answer: t('faq.question3.a')
    },
    {
      question: t('faq.question4.q'),
      answer: t('faq.question4.a')
    },
    {
      question: t('faq.question5.q'),
      answer: t('faq.question5.a')
    },
    {
      question: t('faq.question6.q'),
      answer: t('faq.question6.a')
    }
  ];

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
    <div className="container mx-auto px-4 sm:px-6 mt-12 lg:mt-16 sm:mt-20 mb-8 lg:mb-16 sm:mb-20 flex flex-col items-center">
      {/* 标题 */}
      <h2 className="text-center text-[#161616] text-2xl sm:text-3xl md:text-4xl lg:text-[46px] font-bold mb-8 sm:mb-10 lg:mb-12 px-4 sm:px-0">
        {t('faq.title')}
      </h2>
      
      {/* FAQ列表 */}
      <div className="w-full flex flex-col items-center">
        {faqItems.map((item, index) => (
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

export default FAQ; 