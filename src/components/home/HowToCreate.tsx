import React from 'react';

interface StepProps {
  step: string;
  title: string;
  description: string;
}

const Step: React.FC<StepProps> = ({ step, title, description }) => {
  return (
    <div className="w-[376px] h-[219px] p-9 bg-[#F9FAFB] rounded-2xl flex flex-col justify-start items-start">
      <div className="w-full flex flex-col justify-start items-start gap-6">
        <div className="w-[243px] flex flex-col justify-start items-start gap-2">
          <div className="text-[#6B7280] text-base">{step}</div>
          <div className="text-[#161616] text-xl font-bold capitalize">{title}</div>
        </div>
        <div className="text-[#6B7280] text-base leading-6">{description}</div>
      </div>
    </div>
  );
};

const HowToCreate = () => {
  return (
    <div className="">
      <h2 className="text-center text-[#161616] text-[46px] font-bold capitalize mb-12">
        How to make coloring pages
      </h2>
      
      <div className="w-full flex flex-wrap justify-center items-center gap-[21px]">
        <Step 
          step="Step 1"
          title="Type your prompts"
          description="Simply input simple prompts such as 'Pikachu', 'Dinosaur', and so on."
        />
        
        <Step 
          step="Step 2"
          title="Click 'generate' button"
          description="Click our generate button and wait a few seconds."
        />
        
        <Step 
          step="Step 3"
          title="Wait for generation"
          description="Our AI will transform your text into amazing coloring pages in just a few seconds."
        />
      </div>
    </div>
  );
};

export default HowToCreate; 