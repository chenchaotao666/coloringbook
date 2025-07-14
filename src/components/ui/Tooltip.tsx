import React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  sideOffset?: number;
  align?: 'start' | 'center' | 'end';
  className?: string;
}

const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  side = 'top',
  sideOffset = 4,
  align = 'center',
  className = '',
}) => {
  return (
    <TooltipPrimitive.Provider delayDuration={200}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild className={className}>
          {children}
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side={side}
            sideOffset={sideOffset}
            align={align}
            className={`
              z-50 overflow-hidden rounded-md bg-gray-900 px-3 py-1.5 text-xs text-white shadow-md 
              animate-in fade-in-0 zoom-in-95 
              data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 
              data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 
              data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2
              max-w-xs whitespace-normal break-words leading-relaxed
            `}
          >
            {content}
            <TooltipPrimitive.Arrow className="fill-gray-900" />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
};

export default Tooltip; 