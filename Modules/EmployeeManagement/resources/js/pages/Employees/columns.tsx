import React from 'react';
import { useTranslation } from 'react-i18next';
import { ColumnDef } from '@tanstack/react-table';
import { Employee } from '@/Modules/EmployeeManagement/Resources/js/types';
import { Badge } from '@/Modules/Core/resources/js/components/ui/badge';
import { Button } from '@/Modules/Core/resources/js/components/ui/button';
import { MoreHorizontal, Pencil, Trash } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/Modules/Core/resources/js/components/ui/dropdown-menu';
import { Link } from '@inertiajs/react';

export const columns: ColumnDef<Employee>[] = [
    {
        accessorKey: 'file_number',
        header: 'File Number',
    },
    {
        accessorKey: 'first_name',
        header: 'First Name',
    },
    {
        accessorKey: 'last_name',
        header: 'Last Name',
    },
    {
        accessorKey: 'email',
        header: 'Email',
    },
    {
        accessorKey: 'position',
        header: 'Position',
        cell: ({ row }) => {
            const position = row.original.position;
            return typeof position === 'string' ? position : position?.name || 'Unknown';
        },
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
            const status = row.original.status;
            return (
                <Badge
                    variant="outline"
                    className={
                        status === 'active'
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : status === 'inactive'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : status === 'on_leave'
                            ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                            : 'bg-gray-50 text-gray-700 border-gray-200'
                    }
                >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                </Badge>
            );
        },
    },
    {
        accessorKey: 'phone',
        header: 'Phone',
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const employee = row.original;

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">{t('open_menu')}</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href={route('employees.show', employee.id)}>
                                {t('ttl_view_details')}
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href={route('employees.edit', employee.id)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => {
                                if (confirm('Are you sure you want to delete this employee?')) {
                                    // Handle delete
                                }
                            }}
                        >
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];

export default columns;
















