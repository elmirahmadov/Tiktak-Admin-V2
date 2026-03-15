import { FC } from 'react';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi2';
import { usePagination, DOTS } from '../../hooks/usePagination';
import { cn } from '../../utils/cn';

export interface PaginationProps {
  onPageChange: (page: number) => void;
  totalCount: number;
  siblingCount?: number;
  currentPage: number;
  pageSize: number;
  className?: string;
}

export const Pagination: FC<PaginationProps> = ({
  onPageChange,
  totalCount,
  siblingCount = 1,
  currentPage,
  pageSize,
  className
}) => {
  const paginationRange = usePagination({
    currentPage,
    totalCount,
    siblingCount,
    pageSize
  });

  if (currentPage === 0 || paginationRange.length < 2) {
    return null;
  }

  const onNext = () => {
    onPageChange(currentPage + 1);
  };

  const onPrevious = () => {
    onPageChange(currentPage - 1);
  };

  let lastPage = paginationRange[paginationRange.length - 1];

  return (
    <div className={cn('flex items-center justify-center space-x-1 mt-6', className)}>
      <button
        className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 transition-colors"
        onClick={onPrevious}
        disabled={currentPage === 1}
      >
        <HiChevronLeft className="w-5 h-5 text-gray-600" />
      </button>

      {paginationRange.map((pageNumber, index) => {
        if (pageNumber === DOTS) {
          return (
            <span key={'dots-' + index} className="px-3 py-2 text-gray-500">
              &#8230;
            </span>
          );
        }

        return (
          <button
            key={pageNumber}
            className={cn(
              'px-3 py-1.5 min-w-[32px] rounded-md text-sm font-medium transition-colors',
              pageNumber === currentPage
                ? 'bg-primary text-white shadow-sm'
                : 'text-gray-700 hover:bg-gray-100'
            )}
            onClick={() => onPageChange(pageNumber as number)}
          >
            {pageNumber}
          </button>
        );
      })}

      <button
        className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 transition-colors"
        onClick={onNext}
        disabled={currentPage === lastPage}
      >
        <HiChevronRight className="w-5 h-5 text-gray-600" />
      </button>
    </div>
  );
};
