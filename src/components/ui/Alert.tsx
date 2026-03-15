import { FC, HTMLAttributes, ReactNode } from 'react';
import { HiOutlineInformationCircle, HiOutlineExclamationTriangle, HiOutlineCheckCircle, HiOutlineXCircle } from 'react-icons/hi2';
import { cn } from '../../utils/cn';

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: ReactNode;
  icon?: boolean | ReactNode;
}

export const Alert: FC<AlertProps> = ({ 
  variant = 'info', 
  title, 
  children, 
  icon = true, 
  className, 
  ...props 
}) => {
  const variantStyles = {
    info: 'bg-blue-50 text-blue-800 border-blue-200',
    success: 'bg-green-50 text-green-800 border-green-200',
    warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    error: 'bg-red-50 text-red-800 border-red-200',
  };

  const IconComponent = () => {
    if (typeof icon !== 'boolean') return <span className="mr-3 flex-shrink-0 text-xl">{icon}</span>;
    if (!icon) return null;

    const iconClass = "mr-3 flex-shrink-0 text-xl";
    switch (variant) {
      case 'info': return <HiOutlineInformationCircle className={cn(iconClass, 'text-blue-500')} />;
      case 'success': return <HiOutlineCheckCircle className={cn(iconClass, 'text-green-500')} />;
      case 'warning': return <HiOutlineExclamationTriangle className={cn(iconClass, 'text-yellow-500')} />;
      case 'error': return <HiOutlineXCircle className={cn(iconClass, 'text-red-500')} />;
    }
  };

  return (
    <div 
      className={cn(
        'rounded-lg border p-4 flex items-start',
        variantStyles[variant],
        className
      )}
      role="alert"
      {...props}
    >
      <IconComponent />
      <div>
        {title && <h3 className="text-sm font-medium mb-1">{title}</h3>}
        <div className="text-sm opacity-90">{children}</div>
      </div>
    </div>
  );
};
