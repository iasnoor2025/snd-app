import { ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';

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
    onSort?: (key: string, direction: 'asc' | 'desc') => void;
    sortKey?: string;
    sortDirection?: 'asc' | 'desc';
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

const Table = forwardRef<HTMLDivElement, TableProps<any>>(
    (
        {
            data,
            columns,
            isLoading = false,
            emptyMessage = 'No data available',
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
        ref,
    ) => {
        // Defensive: always use arrays
        const safeData = Array.isArray(data) ? data : [];
        const safeColumns = Array.isArray(columns) ? columns : [];
        const totalPages = totalItems ? Math.ceil(totalItems / pageSize) : Math.ceil(safeData.length / pageSize);
        const startItem = (currentPage - 1) * pageSize + 1;
        const endItem = Math.min(currentPage * pageSize, totalItems || safeData.length);

        const handleSort = (key: string) => {
            if (!onSort) return;
            const newDirection = sortKey === key && sortDirection === 'asc' ? 'desc' : 'asc';
            onSort(key, newDirection);
        };

        const handlePageChange = (page: number) => {
            if (onPageChange && page >= 1 && page <= totalPages) {
                onPageChange(page);
            }
        };

        const visibleColumns = safeColumns.filter((column) => !column.hideOnMobile);

        return (
            <div ref={ref} className={cn('space-y-4', className)} {...props}>
                <div className={cn('rounded-md', showBorders && 'border')}>
                    <table>
                        {showHeaders && (
                            <thead>
                                <tr>
                                    {showRowNumbers && <th className="w-12">#</th>}
                                    {visibleColumns.map((column) => (
                                        <th
                                            key={column.key}
                                            className={cn(
                                                column.sortable && 'cursor-pointer select-none',
                                                column.sticky && 'sticky left-0 bg-background',
                                                column.className,
                                            )}
                                            style={{ width: column.width }}
                                            onClick={() => column.sortable && handleSort(column.key)}
                                            title={column.tooltip}
                                        >
                                            <div className="flex items-center gap-2">
                                                {column.header}
                                                {column.sortable && sortKey === column.key && (
                                                    <span className="inline-flex">
                                                        {sortDirection === 'asc' ? (
                                                            <ChevronUp className="h-4 w-4" />
                                                        ) : (
                                                            <ChevronDown className="h-4 w-4" />
                                                        )}
                                                    </span>
                                                )}
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                        )}
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={visibleColumns.length + (showRowNumbers ? 1 : 0)} className="h-24 text-center">
                                        {useSpinner ? (
                                            <div className="flex items-center justify-center">
                                                <Loader2 className="h-6 w-6 animate-spin" />
                                            </div>
                                        ) : (
                                            'Loading...'
                                        )}
                                    </td>
                                </tr>
                            ) : safeData.length === 0 ? (
                                <tr>
                                    <td colSpan={visibleColumns.length + (showRowNumbers ? 1 : 0)} className="h-24 text-center">
                                        {emptyMessage}
                                    </td>
                                </tr>
                            ) : (
                                safeData.map((item, index) => (
                                    <tr
                                        key={index}
                                        className={cn(
                                            typeof rowClassName === 'function' ? rowClassName(item) : rowClassName,
                                            showHover && 'cursor-pointer hover:bg-accent/30',
                                            striped && index % 2 === 1 && 'bg-muted/50',
                                            compact && 'py-1 text-xs',
                                        )}
                                        onClick={() => onRowClick && onRowClick(item)}
                                    >
                                        {showRowNumbers && <td>{startItem + index}</td>}
                                        {visibleColumns.map((column) => (
                                            <td key={column.key} className={column.className}>
                                                {column.accessor(item)}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {/* Pagination logic omitted for brevity */}
            </div>
        );
    },
);

Table.displayName = 'Table';

// Define basic table subcomponents
const TableBody = ({ children, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => <tbody {...props}>{children}</tbody>;

const TableCell = ({ children, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) => <td {...props}>{children}</td>;

const TableHead = ({ children, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) => <th {...props}>{children}</th>;

const TableHeader = ({ children, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => <thead {...props}>{children}</thead>;

const TableRow = ({ children, ...props }: React.HTMLAttributes<HTMLTableRowElement>) => <tr {...props}>{children}</tr>;

export { Table, TableBody, TableCell, TableHead, TableHeader, TableRow };
export const TableComponent = Table;
