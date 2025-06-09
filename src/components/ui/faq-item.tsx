import React from 'react';
import openIcon from '../../images/open.svg';
import closeIcon from '../../images/close.svg';

interface FaqItemProps {
  question: string;
  answer?: string;
  isOpen: boolean;
  onToggle: () => void;
}

const FaqItem: React.FC<FaqItemProps> = ({ question, answer, isOpen, onToggle }) => {
  return (
    <div 
      className="w-[970px] bg-[#F9FAFB] p-5 py-7 mb-5 rounded-2xl border border-[#F0F0F0] cursor-pointer"
      onClick={onToggle}
    >
      <div className="w-full flex justify-between items-center">
        <div className={`${isOpen ? 'text-[#FF5C07]' : 'text-[#161616]'} text-xl font-medium`}>
          {question}
        </div>
        <img 
          src={isOpen ? closeIcon : openIcon} 
          alt={isOpen ? "Close" : "Open"} 
          className="w-6 h-6"
        />
      </div>
      {isOpen && answer && (
        <div className="text-[#6B7280] text-base leading-6 mt-4">
          {answer}
        </div>
      )}
    </div>
  );
};

export default FaqItem; 