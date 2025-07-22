import React from 'react';

interface HowToCreateProps {
  className?: string;
}

interface StepItem {
  id: string;
  number: string;
  title: string;
  description: string;
}

const HowToCreate: React.FC<HowToCreateProps> = ({ 
  className = "" 
}) => {
  const steps: StepItem[] = [
    {
      id: 'enter-idea',
      number: '01',
      title: 'Enter Your Idea',
      description: 'Type any scene you can imagine. Be descriptive! For example: "a happy cat napping in a sunbeam" and so on.'
    },
    {
      id: 'click-generate',
      number: '02', 
      title: 'Click "Generate"',
      description: 'Our AI will instantly turn your text into a unique black-and-white illustration.'
    },
    {
      id: 'download-color',
      number: '03',
      title: 'Download & Color',
      description: 'Your new coloring page is ready! Download to print or color digitally. Perfect for relaxing, classroom activities, or a unique gift.'
    }
  ];

  return (
    <div className={`w-full max-w-[1170px] mx-auto px-4 py-16 ${className}`}>
      {/* Header Section */}
      <div className="text-center mb-16">
        <h2 className="text-[46px] font-bold text-[#161616] capitalize leading-tight mb-8 max-w-[1000px] mx-auto">
          How to create your coloring page with our Text to Coloring Page Generator?
        </h2>
        
        <p className="text-lg text-[#6B7280] max-w-[900px] mx-auto">
          Simply follow these 3 steps to create your coloring page.
        </p>
      </div>

      {/* Content Section */}
      <div className="flex flex-col lg:flex-row gap-12 items-center">
        {/* Left Side - Image */}
        <div className="w-full lg:w-[500px] flex-shrink-0">
          <img 
            src="/images/howtocreate/image-1.png"
            alt="Coloring page creation process"
            className="w-full h-[400px] lg:h-[600px] object-cover rounded-2xl border border-[#EDEEF0]"
          />
        </div>

        {/* Right Side - Steps */}
        <div className="flex-1 space-y-12">
          {steps.map((step) => (
            <div key={step.id} className="flex items-start gap-4">
              {/* Step Number Background */}
              <div className="relative flex-shrink-0">
                <div className="w-[60px] h-[60px] bg-[#FF5C07] opacity-20 rounded-lg"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[#FF5C07] text-[28px] font-bold tracking-[3px] font-mono">
                    {step.number}
                  </span>
                </div>
              </div>

              {/* Step Content */}
              <div className="flex-1 pt-2">
                <h3 className="text-xl font-medium text-[#161616] mb-4">
                  {step.title}
                </h3>
                <p className="text-base text-[#6B7280] leading-6 max-w-[514px]">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HowToCreate;