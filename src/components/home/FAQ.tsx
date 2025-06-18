import React, { useState } from 'react';
const openIcon = '/images/open.svg';
const closeIcon = '/images/close.svg';

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
          src={isOpen ? closeIcon : openIcon} 
          alt={isOpen ? "Close" : "Open"} 
          className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0"
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
  const [openItems, setOpenItems] = useState<number[]>([0]); // 默认打开第一个
  
  const faqItems = [
    {
      question: "How long does it take to clear image?",
      answer: "Upscale.Pro is a fast and efficient Al-powered tool that can process your uploaded images in a matter of seconds. You don't have to worry about long wait times, so you can confidently rely on it to help you clear photos in bulk without any delays."
    },
    {
      question: "Is this undetectable AI writer free to use?",
      answer: "Yes, we offer a free tier with basic features. However, for advanced features and higher usage limits, we have premium plans available."
    },
    {
      question: "Will using a humanizer compromise the quality of the original text?",
      answer: "No, our AI is designed to maintain the quality and meaning of the original text while making it more natural."
    },
    {
      question: "Can I really bypass AI detectors with this AI humanizer?",
      answer: "Our AI coloring page generator creates unique, high-quality images that are designed to be original and creative."
    },
    {
      question: "Will the rewritten text by this AI humanizer lose its SEO value?",
      answer: "No, our AI is designed to maintain the SEO value while making the content more engaging and natural."
    },
    {
      question: "How many languages does our undetectable AI tool support?",
      answer: "Currently, we support English, but we're working on adding more languages in the future."
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
    <div className="container mx-auto px-4 sm:px-6 my-16 sm:my-20 flex flex-col items-center">
      {/* 标题 */}
      <h2 className="text-center text-[#161616] text-2xl sm:text-3xl md:text-4xl lg:text-[46px] font-bold mb-8 sm:mb-10 lg:mb-12 px-4 sm:px-0">
        Frequently Asked Questions
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