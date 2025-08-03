import React from 'react';

interface TargetAudience {
  id: string;
  title: string;
  description: string;
  image: string;
}

interface ColoringPagesForData {
  title: string;
  audiences: TargetAudience[];
}

interface ColoringPagesForProps {
  className?: string;
  data: ColoringPagesForData;
}

const ColoringPagesFor: React.FC<ColoringPagesForProps> = ({ 
  className = "",
  data
}) => {
  return (
    <div className={`w-full max-w-[1170px] mx-auto px-4 ${className}`}>
      <div style={{
        width: '1170px',
        height: '695px',
        position: 'relative',
        borderRadius: '16px'
      }}>
        {/* Title */}
        <div style={{
          left: '0px',
          right: '0px',
          top: '0px',
          position: 'absolute',
          textAlign: 'center',
          color: '#161616',
          fontSize: '46px',
          fontFamily: 'Inter',
          fontWeight: 700,
          textTransform: 'capitalize',
          wordWrap: 'break-word'
        }}>
          {data.title}
        </div>

        {/* Images */}
        {data.audiences.map((audience, index) => (
          <img 
            key={audience.id}
            src={audience.image}
            alt={audience.title}
            style={{
              width: '376px',
              height: '376px',
              left: `${index * 397 + 1}px`,
              top: '116px',
              position: 'absolute',
              borderRadius: '16px',
              border: '1px #EDEEF0 solid',
              objectFit: 'cover'
            }}
          />
        ))}

        {/* Titles */}
        {data.audiences.map((audience, index) => (
          <div 
            key={`title-${audience.id}`}
            style={{
              left: `${index * 398}px`,
              top: '512px',
              position: 'absolute',
              color: 'var(--white-800, #161616)',
              fontSize: '20px',
              fontFamily: 'Inter',
              fontWeight: 500,
              textTransform: 'capitalize',
              wordWrap: 'break-word'
            }}
          >
            {audience.title}
          </div>
        ))}

        {/* Descriptions */}
        {data.audiences.map((audience, index) => (
          <div 
            key={`desc-${audience.id}`}
            style={{
              width: '376px',
              left: `${index * 398}px`,
              top: '548px',
              position: 'absolute',
              color: '#6B7280',
              fontSize: '14px',
              fontFamily: 'Inter',
              fontWeight: 400,
              textTransform: 'capitalize',
              lineHeight: '21px',
              wordWrap: 'break-word'
            }}
          >
            {audience.description}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ColoringPagesFor;