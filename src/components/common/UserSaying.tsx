import React from 'react';

interface UserSayingProps {
  className?: string;
  testimonials: TestimonialItem[];
}

export interface TestimonialItem {
  id: string;
  name: string;
  date: string;
  avatar: string;
  content: string;
  image: string;
}

const UserSaying: React.FC<UserSayingProps> = ({ 
  className = "",
  testimonials
}) => {
  // Split testimonials into three columns for masonry layout
  const columnCount = 3;
  const columns: TestimonialItem[][] = Array.from({ length: columnCount }, () => []);
  
  testimonials.forEach((testimonial, index) => {
    columns[index % columnCount].push(testimonial);
  });

  return (
    <div className={`w-full max-w-[1170px] mx-auto px-4 ${className}`}>
      {/* Header */}
      <div className="text-center mb-16">
        <h2 className="text-[46px] font-bold text-[#161616] capitalize">
          What Users Are Saying
        </h2>
      </div>

      {/* Three Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {columns.map((column, columnIndex) => (
          <div key={columnIndex} className="flex flex-col gap-5">
            {column.map((testimonial) => (
              <div 
                key={testimonial.id}
                className="bg-[#F9FAFB] rounded-2xl p-8"
              >
                <div className="flex flex-col gap-6">
                  {/* User Info */}
                  <div className="flex items-center gap-3">
                    <img 
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="w-14 h-14 rounded-full object-cover"
                    />
                    <div className="flex flex-col gap-1.5">
                      <div className="text-base font-medium text-[#161616]">
                        {testimonial.name}
                      </div>
                      <div className="text-sm text-[#6B7280]">
                        {testimonial.date}
                      </div>
                    </div>
                  </div>

                  {/* Testimonial Content */}
                  <div className="text-sm text-[#6B7280] leading-5">
                    {testimonial.content}
                  </div>

                  {/* Testimonial Image */}
                  <img 
                    src={testimonial.image}
                    alt="Testimonial example"
                    className="w-full h-[312px] object-cover rounded-xl border border-[#EDEEF0]"
                  />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserSaying;