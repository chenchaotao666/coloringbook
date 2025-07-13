import React, { Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { navigateWithLanguage } from '../../utils/navigationUtils';

const homeIcon = '/images/home.svg';
const chevronRightIcon = '/images/chevron-right.svg';

export interface BreadcrumbItem {
  label: string;
  path?: string;
  current?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className = '' }) => {
  const navigate = useNavigate();

  const handleItemClick = (item: BreadcrumbItem) => {
    if (item.path && !item.current) {
      navigateWithLanguage(navigate, item.path);
    }
  };

  return (
    <nav className={`flex items-center gap-2 max-w-full md:overflow-x-auto md:scrollbar-hide flex-wrap md:flex-nowrap ${className}`}>
      {items.map((item, index) => (
        <Fragment key={index}>
          {index > 0 && (
            <img 
              src={chevronRightIcon} 
              alt="chevron" 
              className="w-3 h-3 flex-shrink-0" 
            />
          )}
          {index === 0 && (
            <img 
              src={homeIcon} 
              alt="Home" 
              className="w-4 h-4 flex-shrink-0" 
            />
          )}
          {item.current ? (
            <span className="text-[#6B7280] text-sm font-medium max-w-[150px] md:max-w-none truncate md:whitespace-nowrap">
              {item.label}
            </span>
          ) : (
            <button
              onClick={() => handleItemClick(item)}
              className="text-[#161616] text-sm font-medium hover:text-[#FF5C07] transition-colors flex-shrink-0 max-w-[150px] md:max-w-none truncate md:whitespace-nowrap"
            >
              {item.label}
            </button>
          )}
        </Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb; 