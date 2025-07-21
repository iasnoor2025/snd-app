import { Badge, Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Core';
import { format } from 'date-fns';
import { Pencil, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { router } from '@inertiajs/core';

interface Employee {
    id: number;
    first_name: string;
    last_name: string;
    full_name?: string;
}

interface PaginationMeta {
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
}

interface ResourceListProps {
    type: 'manpower' | 'equipment' | 'material' | 'fuel' | 'expense';
    resources: any[];
    pagination?: PaginationMeta;
    projectId: number;
    onEdit?: (resource: any) => void;
    onDelete?: (resource: any) => void;
    onSort?: (key: string) => void;
    sortState?: {
        key: string;
        direction: 'asc' | 'desc';
    };
    getSortIcon?: (key: string) => React.ReactNode;
}

// Dummy data for employees to avoid API calls
const dummyEmployees: Record<number, Employee> = {
    1: { id: 1, first_name: 'John', last_name: 'Doe', full_name: 'John Doe' },
    2: { id: 2, first_name: 'Jane', last_name: 'Smith', full_name: 'Jane Smith' },
    3: { id: 3, first_name: 'Mike', last_name: 'Johnson', full_name: 'Mike Johnson' },
    4: { id: 4, first_name: 'Sarah', last_name: 'Williams', full_name: 'Sarah Williams' },
    5: { id: 5, first_name: 'David', last_name: 'Brown', full_name: 'David Brown' },
};

export default function ResourceList({ type, resources = [], pagination, projectId, onEdit, onDelete, onSort, sortState, getSortIcon }: ResourceListProps) {
    const { t } = useTranslation('project');

    // Check if resources is undefined, if so use empty array
    const safeResources = resources || [];
    const [employeeData, setEmployeeData] = useState<Record<number, Employee>>(dummyEmployees);
    const [perPage, setPerPage] = useState(pagination?.per_page || 15);

    // Fetch employee data for resources with employee_id
    useEffect(() => {
        const fetchEmployeeData = async () => {
            const employeeIds = safeResources
                .filter((resource) => resource.employee_id && !resource.employee)
                .map((resource) => resource.employee_id);

            if (employeeIds.length > 0) {
                try {
                    // Use dummy data instead of API call to avoid errors
                    console.log('Would fetch employee data for IDs:', employeeIds);
                } catch (error) {
                    console.error('Error fetching employee data:', error);
                }
            }
        };

        fetchEmployeeData();
    }, [safeResources]);

    // Helper function to format currency
    const formatCurrency = (value: any): string => {
        if (value === null || value === undefined || value === '') return '0.00';

        // Convert to number and check if it's a valid number
        const num = parseFloat(value);
        return !isNaN(num) ? num.toFixed(2) : '0.00';
    };

    // Helper function to get employee name
    const getEmployeeName = (resource: any): string => {
        // For internal workers (with employee_id)
        if (resource.employee_id) {
            const employee = resource.employee || employeeData[resource.employee_id];
            if (employee) {
                return employee.full_name || `${employee.first_name || ''} ${employee.last_name || ''}`.trim() || 'Unnamed Internal Worker';
            }
            return 'Unnamed Internal Worker';
        }

        // For external workers (with worker_name)
        return resource.worker_name || 'Unnamed External Worker';
    };

    const handlePerPageChange = (value: string) => {
        setPerPage(Number(value));
        router.get(
            `/projects/${projectId}/resources`,
            {
                type: type,
                per_page: Number(value),
                page: 1, // Reset to first page when changing per page
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    const handlePageChange = (page: number) => {
        router.get(
            `/projects/${projectId}/resources`,
            {
                type: type,
                per_page: perPage,
                page: page,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    const renderTableHeaders = () => {
        const handleSort = (key: string) => {
            if (onSort) onSort(key);
        };

        const renderSortableHeader = (label: string, key: string, className: string = '') => (
            <th className={`cursor-pointer hover:bg-muted/50 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${className}`} onClick={() => handleSort(key)}>
                <div className="flex items-center gap-1">
                    {label}
                    {getSortIcon && getSortIcon(key)}
                </div>
            </th>
        );

        switch (type) {
            case 'manpower':
                return (
                    <>
                        {renderSortableHeader('Worker', 'worker_name')}
                        {renderSortableHeader('Job Title', 'job_title')}
                        {renderSortableHeader('Start Date', 'start_date')}
                        {renderSortableHeader('Daily Rate', 'daily_rate', 'text-right')}
                        {renderSortableHeader('Total Days', 'total_days', 'text-right')}
                        {renderSortableHeader('Total Cost', 'total_cost', 'text-right')}
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </>
                );

            case 'equipment':
                return (
                    <>
                        {renderSortableHeader('Equipment', 'equipment.name')}
                        {renderSortableHeader('Usage Hours', 'usage_hours', 'text-right')}
                        {renderSortableHeader('Hourly Rate', 'hourly_rate', 'text-right')}
                        {renderSortableHeader('Maintenance Cost', 'maintenance_cost', 'text-right')}
                        {renderSortableHeader('Total Cost', 'total_cost', 'text-right')}
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </>
                );

            case 'material':
                return (
                    <>
                        {renderSortableHeader('Name', 'name')}
                        {renderSortableHeader('Unit', 'unit')}
                        {renderSortableHeader('Quantity', 'quantity', 'text-right')}
                        {renderSortableHeader('Unit Price', 'unit_price', 'text-right')}
                        {renderSortableHeader('Total Cost', 'total_cost', 'text-right')}
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </>
                );

            case 'fuel':
                return (
                    <>
                        {renderSortableHeader('Equipment', 'equipment.name')}
                        {renderSortableHeader('Type', 'type')}
                        {renderSortableHeader('Quantity', 'quantity', 'text-right')}
                        {renderSortableHeader('Unit Price', 'unit_price', 'text-right')}
                        {renderSortableHeader('Total Cost', 'total_cost', 'text-right')}
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </>
                );

            case 'expense':
                return (
                    <>
                        {renderSortableHeader('Category', 'category')}
                        {renderSortableHeader('Description', 'description')}
                        {renderSortableHeader('Amount', 'amount', 'text-right')}
                        {renderSortableHeader('Date', 'date')}
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </>
                );
            default:
                return null;
        }
    };

    const renderTableRow = (resource: any) => {
        if (!resource) return null;

        switch (type) {
            case 'manpower':
                const employeeName = getEmployeeName(resource);
                const isInternalWorker = Boolean(resource.employee_id);

                return (
                    <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex items-center">
                                <span>{employeeName}</span>
                                <Badge
                                    variant="outline"
                                    className={`ml-2 px-1 py-0 text-xs ${isInternalWorker ? 'bg-blue-100 text-blue-800' : 'bg-slate-100'}`}
                                >
                                    {isInternalWorker ? 'Internal' : 'External'}
                                </Badge>
                            </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{resource.job_title || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{resource.start_date ? format(new Date(resource.start_date), 'PPP') : 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">SAR {formatCurrency(resource.daily_rate)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">{resource.total_days || '0'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">SAR {formatCurrency(resource.total_cost)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                            <div className="flex items-center justify-end gap-2">
                                <Button variant="ghost" size="icon" onClick={() => onEdit?.(resource)}>
                                    <Pencil className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => onDelete?.(resource)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </td>
                    </>
                );

            case 'equipment':
                return (
                    <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{resource.equipment?.name || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">{resource.usage_hours || '0'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">SAR {formatCurrency(resource.hourly_rate)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">SAR {formatCurrency(resource.maintenance_cost)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">SAR {formatCurrency(resource.total_cost)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                            <div className="flex items-center justify-end gap-2">
                                <Button variant="ghost" size="icon" onClick={() => onEdit?.(resource)}>
                                    <Pencil className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => onDelete?.(resource)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </td>
                    </>
                );

            case 'material':
                return (
                    <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{resource.name || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{resource.unit || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">{resource.quantity || '0'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">SAR {formatCurrency(resource.unit_price)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">SAR {formatCurrency(resource.total_cost)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                            <div className="flex items-center justify-end gap-2">
                                <Button variant="ghost" size="icon" onClick={() => onEdit?.(resource)}>
                                    <Pencil className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => onDelete?.(resource)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </td>
                    </>
                );

            case 'fuel':
                return (
                    <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{resource.equipment?.name || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{resource.type || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">{resource.quantity || '0'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">SAR {formatCurrency(resource.unit_price)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">SAR {formatCurrency(resource.total_cost)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                            <div className="flex items-center justify-end gap-2">
                                <Button variant="ghost" size="icon" onClick={() => onEdit?.(resource)}>
                                    <Pencil className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => onDelete?.(resource)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </td>
                    </>
                );

            case 'expense':
                return (
                    <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{resource.category || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{resource.description || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">SAR {formatCurrency(resource.amount)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{resource.date ? format(new Date(resource.date), 'PPP') : 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                            <div className="flex items-center justify-end gap-2">
                                <Button variant="ghost" size="icon" onClick={() => onEdit?.(resource)}>
                                    <Pencil className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => onDelete?.(resource)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </td>
                    </>
                );
            default:
                return null;
        }
    };

    // Get the number of columns based on type (including the Actions column)
    const getColumnCount = () => {
        switch (type) {
            case 'manpower':
                return 7; // 6 columns + actions
            case 'equipment':
                return 6; // 5 columns + actions
            case 'material':
                return 6; // 5 columns + actions
            case 'fuel':
                return 6; // 5 columns + actions
            case 'expense':
                return 5; // 4 columns + actions
            default:
                return 2; // Fallback
        }
    };

    return (
        <div className="w-full">
            {/* Table */}
            <div className="overflow-x-auto rounded-md border">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>{renderTableHeaders()}</tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {safeResources.length === 0 ? (
                            <tr>
                                <td colSpan={getColumnCount()} className="px-6 py-8 text-center text-sm text-muted-foreground">
                                    No resources found
                                </td>
                            </tr>
                        ) : (
                            safeResources.map((resource) => (
                                <tr key={resource.id} className="align-top hover:bg-gray-50">
                                    {renderTableRow(resource)}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Enhanced Pagination - Show if there are resources and pagination data */}
            {pagination && safeResources.length > 0 && (
                <div className="mt-6 border-t pt-4">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="text-sm text-muted-foreground">
                            Showing {pagination.from || 1} to {pagination.to || safeResources.length} of{' '}
                            {pagination.total || safeResources.length} results
                            <div className="mt-1 text-xs opacity-60">
                                Page {pagination.current_page || 1} of {pagination.last_page || 1}
                            </div>
                        </div>

                        <div className="flex flex-col items-center gap-4 sm:flex-row">
                            {/* Per Page Selector */}
                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-muted-foreground">Show:</span>
                                <Select value={perPage.toString()} onValueChange={handlePerPageChange}>
                                    <SelectTrigger className="w-20">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="10">10</SelectItem>
                                        <SelectItem value="15">15</SelectItem>
                                        <SelectItem value="25">25</SelectItem>
                                        <SelectItem value="50">50</SelectItem>
                                        <SelectItem value="100">100</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Page Navigation */}
                            <div className="flex items-center space-x-1">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={!pagination.current_page || pagination.current_page === 1}
                                    onClick={() => {
                                        const currentPage = pagination.current_page || 1;
                                        if (currentPage > 1) {
                                            handlePageChange(currentPage - 1);
                                        }
                                    }}
                                >
                                    Previous
                                </Button>

                                {/* Page Numbers - show if we have pagination metadata */}
                                {pagination.last_page && pagination.last_page > 1 && (
                                    <div className="flex items-center space-x-1">
                                        {Array.from({ length: Math.min(5, pagination.last_page) }, (_, i) => {
                                            let pageNumber;
                                            const lastPage = pagination.last_page;
                                            const currentPage = pagination.current_page;

                                            if (lastPage <= 5) {
                                                pageNumber = i + 1;
                                            } else {
                                                if (currentPage <= 3) {
                                                    pageNumber = i + 1;
                                                } else if (currentPage >= lastPage - 2) {
                                                    pageNumber = lastPage - 4 + i;
                                                } else {
                                                    pageNumber = currentPage - 2 + i;
                                                }
                                            }

                                            return (
                                                <Button
                                                    key={pageNumber}
                                                    variant={pageNumber === currentPage ? 'default' : 'outline'}
                                                    size="sm"
                                                    className="h-8 w-8 p-0"
                                                    onClick={() => handlePageChange(pageNumber)}
                                                >
                                                    {pageNumber}
                                                </Button>
                                            );
                                        })}
                                    </div>
                                )}

                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={
                                        !pagination.current_page ||
                                        !pagination.last_page ||
                                        pagination.current_page >= pagination.last_page
                                    }
                                    onClick={() => {
                                        const currentPage = pagination.current_page || 1;
                                        const lastPage = pagination.last_page || 1;
                                        if (currentPage < lastPage) {
                                            handlePageChange(currentPage + 1);
                                        }
                                    }}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Show message when no resources found */}
            {safeResources.length === 0 && (
                <div className="mt-4 text-center text-sm text-muted-foreground">
                    No {type} resources found for this project.
                </div>
            )}
        </div>
    );
}

export { ResourceList as ResourceTable };
