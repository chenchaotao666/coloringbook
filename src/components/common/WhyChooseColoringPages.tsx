import React from 'react';

interface FeatureItem {
  id: string;
  title: string;
  description: string;
  image: string;
  buttonText: string;
  buttonLink: string;
}

interface WhyChooseColoringPagesData {
  title: string;
  subtitle: string;
  features: FeatureItem[];
}

interface WhyChooseColoringPagesProps {
  className?: string;
  data: WhyChooseColoringPagesData;
}

const WhyChooseColoringPages: React.FC<WhyChooseColoringPagesProps> = ({ 
  className = "",
  data
}) => {
  return (
    <div className={`w-full max-w-[1170px] mx-auto px-4 ${className}`}>
      <div style={{
        width: '1170px',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
        gap: '60px',
        display: 'inline-flex'
      }}>
        {/* Title */}
        <div style={{
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
        
        {/* Subtitle */}
        <div style={{
          width: '900px',
          textAlign: 'center',
          color: '#6B7280',
          fontSize: '18px',
          fontFamily: 'Inter',
          fontWeight: 400,
          wordWrap: 'break-word'
        }}>
          {data.subtitle}
        </div>
        
        {/* Features */}
        <div style={{
          alignSelf: 'stretch',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
          gap: '120px',
          display: 'flex'
        }}>
          {data.features.map((feature, index) => (
            <div key={feature.id} style={{
              alignSelf: 'stretch',
              height: '376px',
              justifyContent: 'flex-start',
              alignItems: 'center',
              gap: '80px',
              display: 'inline-flex'
            }}>
              {/* Alternate layout: odd index = text left, even index = text right */}
              {index % 2 === 0 ? (
                <>
                  {/* Text Content - Left */}
                  <div style={{
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                    alignItems: 'flex-start',
                    gap: '40px',
                    display: 'inline-flex'
                  }}>
                    <div style={{
                      alignSelf: 'stretch',
                      flexDirection: 'column',
                      justifyContent: 'flex-start',
                      alignItems: 'flex-start',
                      gap: '16px',
                      display: 'flex'
                    }}>
                      <div style={{
                        width: '420px',
                        color: 'var(--white-800, #161616)',
                        fontSize: '32px',
                        fontFamily: 'Inter',
                        fontWeight: 700,
                        textTransform: 'capitalize',
                        wordWrap: 'break-word'
                      }}>
                        {feature.title}
                      </div>
                      <div style={{
                        width: '420px',
                        color: '#6B7280',
                        fontSize: '16px',
                        fontFamily: 'Inter',
                        fontWeight: 400,
                        lineHeight: '24px',
                        wordWrap: 'break-word'
                      }}>
                        {feature.description}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (feature.buttonLink.startsWith('#')) {
                          const element = document.querySelector(feature.buttonLink);
                          if (element) {
                            element.scrollIntoView({ behavior: 'smooth' });
                          }
                        } else {
                          window.location.href = feature.buttonLink;
                        }
                      }}
                      style={{
                        height: '60px',
                        paddingLeft: '36px',
                        paddingRight: '36px',
                        paddingTop: '18px',
                        paddingBottom: '18px',
                        background: 'linear-gradient(90deg, #FF9D00 0%, #FF5907 100%)',
                        borderRadius: '8px',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '10px',
                        display: 'inline-flex',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{
                        color: 'var(--white-100, white)',
                        fontSize: '20px',
                        fontFamily: 'Inter',
                        fontWeight: 700,
                        lineHeight: '30px',
                        wordWrap: 'break-word'
                      }}>
                        {feature.buttonText}
                      </div>
                    </button>
                  </div>
                  
                  {/* Image - Right */}
                  <div style={{
                    width: '670px',
                    height: '376px',
                    position: 'relative',
                    background: '#F9FAFB',
                    overflow: 'hidden',
                    borderRadius: '16px',
                    outline: '1px #EDEEF0 solid',
                    outlineOffset: '-1px'
                  }}>
                    <img 
                      src={feature.image}
                      alt={feature.title}
                      style={{
                        width: '696px',
                        height: '376px',
                        top: '0px',
                        position: 'absolute',
                        objectFit: 'cover'
                      }}
                    />
                  </div>
                </>
              ) : (
                <>
                  {/* Image - Left */}
                  <div style={{
                    width: '670px',
                    height: '376px',
                    position: 'relative',
                    background: '#F9FAFB',
                    overflow: 'hidden',
                    borderRadius: '16px',
                    outline: '1px #EDEEF0 solid',
                    outlineOffset: '-1px'
                  }}>
                    <img 
                      src={feature.image}
                      alt={feature.title}
                      style={{
                        width: '699.70px',
                        height: '378px',
                        top: '-1px',
                        position: 'absolute',
                        objectFit: 'cover'
                      }}
                    />
                  </div>
                  
                  {/* Text Content - Right */}
                  <div style={{
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                    alignItems: 'flex-start',
                    gap: '40px',
                    display: 'inline-flex'
                  }}>
                    <div style={{
                      alignSelf: 'stretch',
                      flexDirection: 'column',
                      justifyContent: 'flex-start',
                      alignItems: 'flex-start',
                      gap: '16px',
                      display: 'flex'
                    }}>
                      <div style={{
                        width: '420px',
                        color: 'var(--white-800, #161616)',
                        fontSize: '32px',
                        fontFamily: 'Inter',
                        fontWeight: 700,
                        textTransform: 'capitalize',
                        wordWrap: 'break-word'
                      }}>
                        {feature.title}
                      </div>
                      <div style={{
                        width: '420px',
                        color: '#6B7280',
                        fontSize: '16px',
                        fontFamily: 'Inter',
                        fontWeight: 400,
                        lineHeight: '24px',
                        wordWrap: 'break-word'
                      }}>
                        {feature.description}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (feature.buttonLink.startsWith('#')) {
                          const element = document.querySelector(feature.buttonLink);
                          if (element) {
                            element.scrollIntoView({ behavior: 'smooth' });
                          }
                        } else {
                          window.location.href = feature.buttonLink;
                        }
                      }}
                      style={{
                        height: '60px',
                        paddingLeft: '36px',
                        paddingRight: '36px',
                        paddingTop: '18px',
                        paddingBottom: '18px',
                        background: 'linear-gradient(90deg, #FF9D00 0%, #FF5907 100%)',
                        borderRadius: '8px',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '10px',
                        display: 'inline-flex',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{
                        color: 'var(--white-100, white)',
                        fontSize: '20px',
                        fontFamily: 'Inter',
                        fontWeight: 700,
                        lineHeight: '30px',
                        wordWrap: 'break-word'
                      }}>
                        {feature.buttonText}
                      </div>
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WhyChooseColoringPages;