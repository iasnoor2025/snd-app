import { Link } from '@inertiajs/react';
import axios from 'axios';
import { MoreHorizontal, Plus, Search } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Employee } from '../../types/employee';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Input } from '../ui/input';
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from '../ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

interface EmployeeListProps {
    initialEmployees?: Employee[];
}

export const EmployeeList: React.FC<EmployeeListProps> = ({ initialEmployees = [] }) => {
    const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
    const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>(initialEmployees);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [departmentFilter, setDepartmentFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [departments, setDepartments] = useState<string[]>([]);
    const itemsPerPage = 10;

    useEffect(() => {
        if (initialEmployees.length === 0) {
            fetchEmployees();
        } else {
            // Extract unique departments from employees
            const uniqueDepartments = Array.from(new Set(initialEmployees.map((emp) => emp.department?.name || 'Unassigned')));
            setDepartments(uniqueDepartments);
        }
    }, [initialEmployees]);

    useEffect(() => {
        applyFilters();
    }, [searchQuery, statusFilter, departmentFilter, employees]);

    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/employees');
            setEmployees(response.data.data);
            setFilteredEmployees(response.data.data);

            // Extract unique departments
            const uniqueDepartments = Array.from(new Set(response.data.data.map((emp: Employee) => emp.department?.name || 'Unassigned')));
            setDepartments(uniqueDepartments);
        } catch (error) {
            console.error('Error fetching employees:', error);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        const { t } = useTranslation('employees');

        let filtered = [...employees];

        // Apply search query
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (emp) =>
                    emp.file_number.toLowerCase().includes(query) ||
                    emp.first_name.toLowerCase().includes(query) ||
                    emp.last_name.toLowerCase().includes(query) ||
                    emp.email.toLowerCase().includes(query) ||
                    emp.position?.name.toLowerCase().includes(query),
            );
        }

        // Apply status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter((emp) => emp.status === statusFilter);
        }

        // Apply department filter
        if (departmentFilter !== 'all') {
            filtered = filtered.filter((emp) => (emp.department?.name || 'Unassigned') === departmentFilter);
        }

        setFilteredEmployees(filtered);
        setCurrentPage(1); // Reset to first page when filters change
    };

    // Get current page items
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredEmployees.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);

    const getStatusBadgeColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800 border-green-300';
            case 'inactive':
                return 'bg-gray-100 text-gray-800 border-gray-300';
            case 'on_leave':
                return 'bg-blue-100 text-blue-800 border-blue-300';
            case 'terminated':
                return 'bg-red-100 text-red-800 border-red-300';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    return (
        <Card className="w-full shadow-sm">
            <CardHeader className="pb-0">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl font-bold">Employees</CardTitle>
                    <Link href="/employees/create">
                        <Button className="flex items-center gap-1">
                            <Plus className="h-4 w-4" />
                            Add Employee
                        </Button>
                    </Link>
                </div>

                <div className="mt-4 flex flex-col gap-4 sm:flex-row">
                    <div className="relative flex-1">
                        <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-gray-500" />
                        <Input
                            type="text"
                            placeholder={t('ph_search_employees')}
                            className="w-full pl-9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-2">
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[130px]">
                                <SelectValue placeholder={t('ph_status')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t('opt_all_status')}</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                                <SelectItem value="on_leave">{t('on_leave')}</SelectItem>
                                <SelectItem value="terminated">Terminated</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                            <SelectTrigger className="w-[160px]">
                                <SelectValue placeholder={t('ph_department')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t('opt_all_departments')}</SelectItem>
                                {departments.map((dept) => (
                                    <SelectItem key={dept} value={dept}>
                                        {dept}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="pt-6">
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>File #</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Position</TableHead>
                                <TableHead>Department</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="py-10 text-center">
                                        Loading employees...
                                    </TableCell>
                                </TableRow>
                            ) : currentItems.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="py-10 text-center">
                                        No employees found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                currentItems.map((employee) => (
                                    <TableRow key={employee.id}>
                                        <TableCell className="font-medium">{employee.file_number}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{`${employee.first_name} ${employee.last_name}`}</span>
                                                <span className="text-sm text-gray-500">{employee.email}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{employee.position?.name || '-'}</TableCell>
                                        <TableCell>{employee.department?.name || '-'}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={getStatusBadgeColor(employee.status)}>
                                                {employee.status.replace('_', ' ')}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                        <span className="sr-only">{t('open_menu')}</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/employees/${employee.id}`}>{t('ttl_view_details')}</Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/employees/${employee.id}/edit`}>Edit</Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/employees/${employee.id}/documents`}>Documents</Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/employees/${employee.id}/timesheets`}>Timesheets</Link>
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {totalPages > 1 && (
                    <div className="mt-4 flex justify-end">
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            if (currentPage > 1) setCurrentPage(currentPage - 1);
                                        }}
                                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                                    />
                                </PaginationItem>
                                <PaginationItem className="flex items-center">
                                    <span className="text-sm">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                </PaginationItem>
                                <PaginationItem>
                                    <PaginationNext
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                                        }}
                                        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default EmployeeList;
