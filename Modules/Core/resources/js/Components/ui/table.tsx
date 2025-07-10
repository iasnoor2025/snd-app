import React, { forwardRef } from "react";
import { cn } from '../../lib/utils';
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "./button";

// SHADCN Table components (copied from shadcn/ui pattern)

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto">
    <table
      ref={ref}
      className={cn("w-full caption-bottom text-sm", className)}
      {...props}
    />
  </div>
))
Table.displayName = "Table"

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn("[&_tr]:border-b", className)}
    {...props}
  />
))
TableHeader.displayName = "TableHeader"

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
))
TableBody.displayName = "TableBody"

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
      className
    )}
    {...props}
  />
))
TableRow.displayName = "TableRow"

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
      className
    )}
    {...props}
  />
))
TableHead.displayName = "TableHead"

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className)}
    {...props}
  />
))
TableCell.displayName = "TableCell"

export interface Column<T> {
  key: string;
  header: string;
  accessor: (item: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
  hideOnMobile?: boolean;
  sticky?: boolean;
  tooltip?: string;
  width?: string | number;
}

export interface TableProps<T> extends React.HTMLAttributes<HTMLDivElement> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  emptyMessage?: string;
  onSort?: (key: string, direction: "asc" | "desc") => void;
  sortKey?: string;
  sortDirection?: "asc" | "desc";
  rowClassName?: string | ((item: T) => string);
  onRowClick?: (item: T) => void;
  pageSize?: number;
  currentPage?: number;
  totalItems?: number;
  onPageChange?: (page: number) => void;
  showPagination?: boolean;
  paginationClassName?: string;
  useSpinner?: boolean;
  showRowNumbers?: boolean;
  showHeaders?: boolean;
  showBorders?: boolean;
  showHover?: boolean;
  striped?: boolean;
  compact?: boolean;
}

const TableComponent = forwardRef<HTMLDivElement, TableProps<any>>(
  (
    {
      data,
      columns,
      isLoading = false,
      emptyMessage = "No data available",
      onSort,
      sortKey,
      sortDirection,
      rowClassName,
      onRowClick,
      pageSize = 10,
      currentPage = 1,
      totalItems,
      onPageChange,
      showPagination = true,
      paginationClassName,
      className,
      useSpinner = false,
      showRowNumbers = false,
      showHeaders = true,
      showBorders = true,
      showHover = true,
      striped = false,
      compact = false,
      ...props
    },
    ref
  ) => {
    const totalPages = totalItems ? Math.ceil(totalItems / pageSize) : Math.ceil(data.length / pageSize);
    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalItems || data.length);

    const handleSort = (key: string) => {
      if (!onSort) return;
      const newDirection = sortKey === key && sortDirection === "asc" ? "desc" : "asc";
      onSort(key, newDirection);
    };

    const handlePageChange = (page: number) => {
      if (onPageChange && page >= 1 && page <= totalPages) {
        onPageChange(page);
      }
    };

    const visibleColumns = columns.filter(column => !column.hideOnMobile);

    return (
      <div ref={ref} className={cn("space-y-4", className)} {...props}>
        <div className={cn(
          "rounded-md",
          showBorders && "border"
        )}>
          <Table>
            {showHeaders && (
              <TableHeader>
                <TableRow>
                  {showRowNumbers && (
                    <TableHead className="w-12">#</TableHead>
                  )}
                  {visibleColumns.map((column) => (
                    <TableHead
                      key={column.key}
                      className={cn(
                        column.sortable && "cursor-pointer select-none",
                        column.sticky && "sticky left-0 bg-background",
                        column.className
                      )}
                      style={{ width: column.width }}
                      onClick={() => column.sortable && handleSort(column.key)}
                      title={column.tooltip}
                    >
                      <div className={cn("flex items-center gap-2", column.className)}>
                        {column.header}
                        {column.sortable && sortKey === column.key && (
                          <span className="inline-flex">
                            {sortDirection === "asc" ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </span>
                        )}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
            )}
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={visibleColumns.length + (showRowNumbers ? 1 : 0)}
                    className="h-24 text-center"
                  >
                    {useSpinner ? (
                      <div className="flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin" />
                      </div>
                    ) : (
                      "Loading..."
                    )}
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={visibleColumns.length + (showRowNumbers ? 1 : 0)}
                    className="h-24 text-center"
                  >
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item, index) => (
                  <TableRow
                    key={index}
                    className={cn(
                      onRowClick && showHover && "cursor-pointer hover:bg-muted/50",
                      striped && index % 2 === 1 && "bg-muted/50",
                      typeof rowClassName === "function"
                        ? rowClassName(item)
                        : rowClassName
                    )}
                    onClick={() => onRowClick?.(item)}
                  >
                    {showRowNumbers && (
                      <TableCell className="w-12">
                        {startItem + index}
                      </TableCell>
                    )}
                    {visibleColumns.map((column) => (
                      <TableCell
                        key={column.key}
                        className={cn(
                          column.sticky && "sticky left-0 bg-background",
                          column.className,
                          compact && "py-2"
                        )}
                      >
                        {column.accessor(item)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {showPagination && totalPages > 1 && (
          <div className={cn("flex items-center justify-between", paginationClassName)}>
            <div className="text-sm text-muted-foreground">
              Showing {startItem} to {endItem} of {totalItems || data.length} items
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={page === currentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }
);

TableComponent.displayName = "Table";

export { TableComponent, TableBody, TableCell, TableHead, TableHeader, TableRow, Table };

export const TableFooter = ({ children, ...props }: any) => (
  <tfoot {...props}>{children}</tfoot>
);






















