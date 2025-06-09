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
      className={`w-[970px] bg-[#F9FAFB] p-5 py-7 mb-5 rounded-2xl border border-[#F0F0F0]`}
    >
      <div 
        className="flex justify-between items-center cursor-pointer"
        onClick={onClick}
      >
        <div className={`${isOpen ? 'text-[#FF5C07]' : 'text-[#161616]'} text-xl font-medium`}>
          {question}
        </div>
        <img 
          src={isOpen ? closeIcon : openIcon} 
          alt={isOpen ? "Close" : "Open"} 
          className="w-6 h-6"
        />
      </div>
      
      {isOpen && (
        <div className="text-[#6B7280] text-base leading-6 mt-4">
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
    <div className="container mx-auto px-4 my-20 flex flex-col items-center">
      <h2 className="text-center text-[#161616] text-[46px] font-bold mb-12">
        Frequently Asked Questions
      </h2>
      
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