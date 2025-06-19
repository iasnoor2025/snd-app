import React, { forwardRef } from "react";
import {
  Table as ShadcnTable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { cn } from "../../lib/utils";
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "./Button";

/**
 * Column configuration for Table component
 */
export interface Column<T> {
  /** Unique key for the column */
  key: string;
  /** Header text for the column */
  header: string;
  /** Function to render cell content */
  accessor: (item: T) => React.ReactNode;
  /** Whether the column is sortable */
  sortable?: boolean;
  /** Custom class name for the column */
  className?: string;
  /** Whether the column should be hidden on mobile */
  hideOnMobile?: boolean;
  /** Whether the column should be sticky */
  sticky?: boolean;
  /** Tooltip text for the column header */
  tooltip?: string;
  /** Width of the column */
  width?: string | number;
}

/**
 * Table component that extends shadcn/ui's table with additional features.
 * Supports sorting, pagination, loading states, and row actions.
 *
 * @example
 * ```tsx
 * const columns = [
 *   {
 *     key: "name",
 *     header: "Name",
 *     accessor: (item) => item.name,
 *     sortable: true,
 *   },
 *   {
 *     key: "email",
 *     header: "Email",
 *     accessor: (item) => item.email,
 *   },
 * ];
 *
 * const data = [
 *   { name: "John Doe", email: "john@example.com" },
 *   { name: "Jane Smith", email: "jane@example.com" },
 * ];
 *
 * // Basic usage
 * <Table columns={columns} data={data} />
 *
 * // With sorting
 * <Table
 *   columns={columns}
 *   data={data}
 *   onSort={(key, direction) => console.log(key, direction)}
 * />
 *
 * // With pagination
 * <Table
 *   columns={columns}
 *   data={data}
 *   pageSize={10}
 *   currentPage={1}
 *   totalItems={100}
 *   onPageChange={(page) => console.log(page)}
 * />
 * ```
 */
export interface TableProps<T> extends React.HTMLAttributes<HTMLDivElement> {
  /** Array of data items to display */
  data: T[];
  /** Column configurations */
  columns: Column<T>[];
  /** Whether the table is in a loading state */
  isLoading?: boolean;
  /** Message to display when there is no data */
  emptyMessage?: string;
  /** Callback when a column is sorted */
  onSort?: (key: string, direction: "asc" | "desc") => void;
  /** Currently sorted column key */
  sortKey?: string;
  /** Current sort direction */
  sortDirection?: "asc" | "desc";
  /** Custom class name for rows */
  rowClassName?: string | ((item: T) => string);
  /** Callback when a row is clicked */
  onRowClick?: (item: T) => void;
  /** Number of items per page */
  pageSize?: number;
  /** Current page number */
  currentPage?: number;
  /** Total number of items */
  totalItems?: number;
  /** Callback when page changes */
  onPageChange?: (page: number) => void;
  /** Whether to show pagination */
  showPagination?: boolean;
  /** Custom class name for pagination */
  paginationClassName?: string;
  /** Whether to show loading spinner instead of text */
  useSpinner?: boolean;
  /** Whether to show row numbers */
  showRowNumbers?: boolean;
  /** Whether to show column headers */
  showHeaders?: boolean;
  /** Whether to show borders */
  showBorders?: boolean;
  /** Whether to show hover effect on rows */
  showHover?: boolean;
  /** Whether to show striped rows */
  striped?: boolean;
  /** Whether to show compact view */
  compact?: boolean;
}

const Table = forwardRef<HTMLDivElement, TableProps<any>>(;
  (;
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
          <ShadcnTable>
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
                      <div className="flex items-center gap-2">
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
          </ShadcnTable>
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

Table.displayName = "Table";

export { Table };



</Table>






















