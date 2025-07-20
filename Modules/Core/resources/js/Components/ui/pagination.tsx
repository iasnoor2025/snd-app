import * as React from 'react';
import { Button } from './button';
import { cn } from '@/Core/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  showTotal?: boolean;
  totalItems?: number;
  pageSize?: number;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className,
  showTotal = false,
  totalItems,
  pageSize,
}) => {
  // Don't return null, show pagination even for single page

  const getPages = () => {
    const pages = [];
    const max = Math.min(5, totalPages);

    if (totalPages <= max) {
      // If total pages is less than or equal to max, show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show a window of pages around the current page
      let start = Math.max(1, currentPage - Math.floor(max / 2));
      let end = Math.min(totalPages, start + max - 1);

      // Adjust start if we're near the end
      if (end - start < max - 1) {
        start = Math.max(1, end - max + 1);
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }

    return pages;
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center gap-1"
      >
        <ChevronLeft className="h-4 w-4" />
        Previous
      </Button>
      {getPages().map((page) => (
        <Button
          key={page}
          variant={page === currentPage ? 'default' : 'outline'}
          size="sm"
          onClick={() => onPageChange(page)}
          className="min-w-[2rem]"
        >
          {page}
        </Button>
      ))}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center gap-1"
      >
        Next
        <ChevronRight className="h-4 w-4" />
      </Button>
      {showTotal && totalItems !== undefined && pageSize !== undefined && (
        <span className="ml-4 text-sm text-muted-foreground">
          Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems}
        </span>
      )}
    </div>
  );
};
