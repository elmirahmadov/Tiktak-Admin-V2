import { FC, HTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

interface TableSkeletonProps extends HTMLAttributes<HTMLDivElement> {
  columns?: number;
  rows?: number;
}

export const TableSkeleton: FC<TableSkeletonProps> = ({ columns = 5, rows = 5, className, ...props }) => {
  return (
    <div className={cn("w-full animate-pulse", className)} {...props}>
      <div className="flex flex-col space-y-3">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex space-x-4 p-4 border-b border-gray-100 items-center">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div 
                key={colIndex} 
                className={cn(
                  "h-4 bg-gray-200 rounded", 
                  colIndex === 0 ? "w-1/6" : colIndex === columns - 1 ? "w-1/12 ml-auto" : "flex-1"
                )}
              ></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
