import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, UserX } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from "@/components/ui/badge";
import axios from 'axios';
import { usePage } from '@inertiajs/react';
import { getTranslation } from '@/utils/translation';

interface Employee {
    id: number;
    first_name: string;
    last_name: string;
    full_name?: string;
}

interface ResourceListProps {
    type: 'manpower' | 'equipment' | 'material' | 'fuel' | 'expense';
    resources: any[];
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
    5: { id: 5, first_name: 'David', last_name: 'Brown', full_name: 'David Brown' }
};

export default function ResourceList({
    type,
    resources = [],
    onEdit,
    onDelete,
    onSort,
    sortState,
    getSortIcon
}: ResourceListProps) {
  const { t } = useTranslation('project');

    // Extract locale from Inertia shared props
    const { locale = 'en' } = usePage<any>().props;

    // Check if resources is undefined, if so use empty array
    const safeResources = resources || [];
    const [employeeData, setEmployeeData] = useState<Record<number, Employee>>(dummyEmployees);

    // Fetch employee data for resources with employee_id
    useEffect(() => {
        const fetchEmployeeData = async () => {
            const employeeIds = safeResources
                .filter(resource => resource.employee_id && !resource.employee)
                .map(resource => resource.employee_id);

            if (employeeIds.length === 0) return;

            // Instead of making an API call, use dummy data
            const newEmployeeData: Record<number, Employee> = {};
            employeeIds.forEach(employeeId => {
                // If we already have this employee in our dummy data, use it
                if (dummyEmployees[employeeId]) {
                    newEmployeeData[employeeId] = dummyEmployees[employeeId];
                } else {
                    // Otherwise create a dummy entry
                    newEmployeeData[employeeId] = {
                        id: employeeId,
                        first_name: 'Employee',
                        last_name: `#${employeeId}`,
                        full_name: `Employee #${employeeId}`
                    };
                }
            })

            setEmployeeData(prev => ({ ...prev, ...newEmployeeData }));
        };

        fetchEmployeeData();
    }, [safeResources]);

    // Helper function to safely format currency values
    const formatCurrency = (value: any): string => {
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
                return employee.full_name ||
                       `${employee.first_name || ''} ${employee.last_name || ''}`.trim() ||
                       'Unnamed Internal Worker';
            }
            return 'Unnamed Internal Worker';
        }

        // For external workers (with worker_name)
        return resource.worker_name || 'Unnamed External Worker';
    };

    const renderTableHeaders = () => {
        const handleSort = (key: string) => {
            if (onSort) onSort(key);
        };

        const renderSortableHeader = (label: string, key: string, className: string = "") => (
            <TableHead
                className={`cursor-pointer hover:bg-muted/50 ${className}`}
                onClick={() => handleSort(key)}
            >
                <div className="flex items-center gap-1">
                    {label}
                    {getSortIcon && getSortIcon(key)}
                </div>
            </TableHead>
        );

        switch (type) {
            case 'manpower':
                return (
                    <>
                        {renderSortableHeader('Worker', 'worker_name', 'w-[25%]')}
                        {renderSortableHeader('Job Title', 'job_title', 'w-[20%]')}
                        {renderSortableHeader('Start Date', 'start_date', 'w-[15%]')}
                        {renderSortableHeader('Daily Rate', 'daily_rate', 'w-[12%] text-right')}
                        {renderSortableHeader('Total Days', 'total_days', 'w-[12%] text-right')}
                        {renderSortableHeader('Total Cost', 'total_cost', 'w-[12%] text-right')}
                        <TableHead className="w-[100px]">Actions</TableHead>
                    </>
                );

            case 'equipment':
                return (
                    <>
                        {renderSortableHeader('Equipment', 'equipment.name', 'w-[30%]')}
                        {renderSortableHeader('Usage Hours', 'usage_hours', 'w-[15%] text-right')}
                        {renderSortableHeader('Hourly Rate', 'hourly_rate', 'w-[15%] text-right')}
                        {renderSortableHeader('Maintenance Cost', 'maintenance_cost', 'w-[15%] text-right')}
                        {renderSortableHeader('Total Cost', 'total_cost', 'w-[15%] text-right')}
                        <TableHead className="w-[100px]">Actions</TableHead>
                    </>
                );

            case 'material':
                return (
                    <>
                        {renderSortableHeader('Name', 'name', 'w-[30%]')}
                        {renderSortableHeader('Unit', 'unit', 'w-[15%]')}
                        {renderSortableHeader('Quantity', 'quantity', 'w-[15%] text-right')}
                        {renderSortableHeader('Unit Price', 'unit_price', 'w-[15%] text-right')}
                        {renderSortableHeader('Total Cost', 'total_cost', 'w-[15%] text-right')}
                        <TableHead className="w-[100px]">Actions</TableHead>
                    </>
                );

            case 'fuel':
                return (
                    <>
                        {renderSortableHeader('Equipment', 'equipment.name', 'w-[30%]')}
                        {renderSortableHeader('Type', 'type', 'w-[20%]')}
                        {renderSortableHeader('Quantity', 'quantity', 'w-[15%] text-right')}
                        {renderSortableHeader('Unit Price', 'unit_price', 'w-[15%] text-right')}
                        {renderSortableHeader('Total Cost', 'total_cost', 'w-[15%] text-right')}
                        <TableHead className="w-[100px]">Actions</TableHead>
                    </>
                );

            case 'expense':
                return (
                    <>
                        {renderSortableHeader('Category', 'category', 'w-[20%]')}
                        {renderSortableHeader('Description', 'description', 'w-[40%]')}
                        {renderSortableHeader('Amount', 'amount', 'w-[15%] text-right')}
                        {renderSortableHeader('Date', 'date', 'w-[15%]')}
                        <TableHead className="w-[100px]">Actions</TableHead>
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
                        <TableCell className="max-w-[25%] truncate">
                            <div className="flex items-center">
                                <span>{employeeName}</span>
                                <Badge
                                    variant="outline"
                                    className={`ml-2 text-xs px-1 py-0 ${
                                        isInternalWorker
                                            ? 'bg-blue-100 text-blue-800'
                                            : 'bg-slate-100'
                                    }`}
                                >
                                    {isInternalWorker ? 'Internal' : 'External'}
                                </Badge>
                            </div>
                        </TableCell>
                        <TableCell className="max-w-[20%] truncate">{resource.job_title || 'N/A'}</TableCell>
                        <TableCell className="max-w-[15%]">{resource.start_date ? format(new Date(resource.start_date), 'PPP') : 'N/A'}</TableCell>
                        <TableCell className="max-w-[12%] text-right">SAR {formatCurrency(resource.daily_rate)}</TableCell>
                        <TableCell className="max-w-[12%] text-right">{resource.total_days || '0'}</TableCell>
                        <TableCell className="max-w-[12%] text-right">SAR {formatCurrency(resource.total_cost)}</TableCell>
                    </>
                );

            case 'equipment':
                return (
                    <>
                        <TableCell className="max-w-[30%] truncate">{resource.equipment?.name || 'N/A'}</TableCell>
                        <TableCell className="max-w-[15%] text-right">{resource.usage_hours || '0'}</TableCell>
                        <TableCell className="max-w-[15%] text-right">SAR {formatCurrency(resource.hourly_rate)}</TableCell>
                        <TableCell className="max-w-[15%] text-right">SAR {formatCurrency(resource.maintenance_cost)}</TableCell>
                        <TableCell className="max-w-[15%] text-right">SAR {formatCurrency(resource.total_cost)}</TableCell>
                    </>
                );

            case 'material':
                return (
                    <>
                        <TableCell className="max-w-[30%] truncate">{resource.name || 'N/A'}</TableCell>
                        <TableCell className="max-w-[15%]">{resource.unit || 'N/A'}</TableCell>
                        <TableCell className="max-w-[15%] text-right">{resource.quantity || '0'}</TableCell>
                        <TableCell className="max-w-[15%] text-right">SAR {formatCurrency(resource.unit_price)}</TableCell>
                        <TableCell className="max-w-[15%] text-right">SAR {formatCurrency(resource.total_cost)}</TableCell>
                    </>
                );

            case 'fuel':
                return (
                    <>
                        <TableCell className="max-w-[30%] truncate">{resource.equipment?.name || 'N/A'}</TableCell>
                        <TableCell className="max-w-[20%]">{resource.type || 'N/A'}</TableCell>
                        <TableCell className="max-w-[15%] text-right">{resource.quantity || '0'}</TableCell>
                        <TableCell className="max-w-[15%] text-right">SAR {formatCurrency(resource.unit_price)}</TableCell>
                        <TableCell className="max-w-[15%] text-right">SAR {formatCurrency(resource.total_cost)}</TableCell>
                    </>
                );

            case 'expense':
                return (
                    <>
                        <TableCell className="max-w-[20%]">{resource.category || 'N/A'}</TableCell>
                        <TableCell className="max-w-[40%] truncate">{resource.description || 'N/A'}</TableCell>
                        <TableCell className="max-w-[15%] text-right">SAR {formatCurrency(resource.amount)}</TableCell>
                        <TableCell className="max-w-[15%]">{resource.date ? format(new Date(resource.date), 'PPP') : 'N/A'}</TableCell>
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
        <div className="w-full overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        {renderTableHeaders()}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {safeResources.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={getColumnCount()} className="text-center py-8 text-muted-foreground">
                                No resources found
                            </TableCell>
                        </TableRow>
                    ) : (
                        safeResources.map((resource) => (
                            <TableRow key={resource.id}>
                                {renderTableRow(resource)}
                                <TableCell className="w-[100px]">
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => onEdit?.(resource)}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => onDelete?.(resource)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
















