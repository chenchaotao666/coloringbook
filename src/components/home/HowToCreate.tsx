import React from 'react';
import { useAsyncTranslation } from '../../contexts/LanguageContext';

interface StepProps {
  step: string;
  title: string;
  description: string;
}

const Step: React.FC<StepProps> = ({ step, title, description }) => {
  return (
    <div className="w-full sm:max-w-[376px] min-h-[180px] sm:min-h-[219px] p-6 sm:p-9 bg-[#F9FAFB] rounded-xl sm:rounded-2xl flex flex-col justify-start items-start">
      <div className="w-full flex flex-col justify-start items-start gap-4 sm:gap-6">
        <div className="w-full flex flex-col justify-start items-start gap-2">
          <div className="text-[#6B7280] text-sm sm:text-base">{step}</div>
          <div className="text-[#161616] text-lg sm:text-xl font-bold capitalize leading-tight">{title}</div>
        </div>
        <div className="text-[#6B7280] text-sm sm:text-base leading-5 sm:leading-6">{description}</div>
      </div>
    </div>
  );
};

const HowToCreate = () => {
  const { t } = useAsyncTranslation('home');
  
  return (
    <div className="w-full container mx-auto px-4 sm:px-6">
      <h2 className="text-center text-[#161616] text-2xl sm:text-3xl md:text-4xl lg:text-[46px] font-bold capitalize mb-8 sm:mb-10 lg:mb-12 px-4 sm:px-0">
        {t('howItWorks.title', 'How to make coloring pages')}
      </h2>
      
      <div className="w-full flex flex-col sm:flex-row flex-wrap justify-center items-stretch gap-4 sm:gap-6 lg:gap-[21px]">
        <div className="w-full sm:w-auto sm:flex-1 sm:max-w-[376px]">
          <Step 
            step={t('howItWorks.step1.number', 'Step 1')}
            title={t('howItWorks.step1.title', 'Type your prompts')}
            description={t('howItWorks.step1.description', 'Simply input simple prompts such as \'Pikachu\', \'Dinosaur\', and so on.')}
          />
        </div>
        
        <div className="w-full sm:w-auto sm:flex-1 sm:max-w-[376px]">
          <Step 
            step={t('howItWorks.step2.number', 'Step 2')}
            title={t('howItWorks.step2.title', 'Click \'generate\' button')}
            description={t('howItWorks.step2.description', 'Click our generate button and wait a few seconds.')}
          />
        </div>
        
        <div className="w-full sm:w-auto sm:flex-1 sm:max-w-[376px]">
          <Step 
            step={t('howItWorks.step3.number', 'Step 3')}
            title={t('howItWorks.step3.title', 'Wait for generation')}
            description={t('howItWorks.step3.description', 'Our AI will transform your text into amazing coloring pages in just a few seconds.')}
          />
        </div>
      </div>
    </div>
  );
};

export default HowToCreate; 