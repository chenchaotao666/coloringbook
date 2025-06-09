import React from 'react';

interface CircularProgressProps {
  progress: number; // 0-100
  size?: 'small' | 'large';
  showPercentage?: boolean;
  className?: string;
}

const CircularProgress: React.FC<CircularProgressProps> = ({ 
  progress, 
  size = 'large', 
  showPercentage = false,
  className = '' 
}) => {
  const isSmall = size === 'small';
  const circleSize = isSmall ? 22 : 48;
  const strokeWidth = isSmall ? 3 : 6;
  const radius = (circleSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div 
      className={`relative ${className}`}
      style={{
        width: `${circleSize}px`,
        height: `${circleSize}px`,
      }}
    >
      {/* 背景圆圈 */}
      <div 
        className="rounded-full border-[#D9DDE5]"
        style={{
          width: `${circleSize}px`,
          height: `${circleSize}px`,
          borderWidth: `${strokeWidth}px`,
        }}
      />
      
      {/* 进度圆圈 */}
      <div 
        className="absolute top-0 left-0 rounded-full border-[#FF9601] transition-all duration-300"
        style={{
          width: `${circleSize}px`,
          height: `${circleSize}px`,
          borderWidth: `${strokeWidth}px`,
          clipPath: `polygon(50% 0%, 100% 0%, 100% 100%, 50% 100%)`,
          transform: `rotate(${(progress / 100) * 360}deg)`,
          transformOrigin: 'center',
        }}
      />
      
      {/* 使用 SVG 实现更精确的圆形进度 */}
      <svg
        className="absolute top-0 left-0 transform -rotate-90"
        width={circleSize}
        height={circleSize}
      >
        {/* 背景圆圈 */}
        <circle
          cx={circleSize / 2}
          cy={circleSize / 2}
          r={radius}
          stroke="#D9DDE5"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        
        {/* 进度圆圈 */}
        <circle
          cx={circleSize / 2}
          cy={circleSize / 2}
          r={radius}
          stroke="#FF9601"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-300 ease-out"
        />
      </svg>
      
      {/* 百分比文字 (仅大尺寸显示) */}
      {showPercentage && !isSmall && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[#161616] text-sm font-semibold">
            {Math.round(progress)}%
          </span>
        </div>
      )}
    </div>
  );
};

export default CircularProgress; 