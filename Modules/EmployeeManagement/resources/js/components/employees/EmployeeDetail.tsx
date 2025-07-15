import { Link } from '@inertiajs/react';
import axios from 'axios';
import { ArrowLeft, BarChart, ClipboardList, Clock, CreditCard, Edit, FileText } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Employee } from '../../types/employee';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import FinalSettlementTab from './FinalSettlementTab';
import PerformanceReviewList from './PerformanceReviewList';

interface EmployeeDetailProps {
    employeeId: number;
    initialEmployee?: Employee;
}

export const EmployeeDetail: React.FC<EmployeeDetailProps> = ({ employeeId, initialEmployee }) => {
    const [employee, setEmployee] = useState<Employee | null>(initialEmployee || null);
    const [loading, setLoading] = useState(!initialEmployee);
    const [activeTab, setActiveTab] = useState('personal');
    const { t } = useTranslation('employee');

    useEffect(() => {
        if (!initialEmployee) {
            fetchEmployeeData();
        }
    }, [employeeId, initialEmployee]);

    const fetchEmployeeData = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/employees/${employeeId}`);
            setEmployee(response.data.data);
        } catch (error) {
            console.error('Error fetching employee data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadgeColor = (status: string) => {
        const { t } = useTranslation('employees');

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

    if (loading) {
        return (
            <Card className="w-full shadow-sm">
                <CardContent className="flex h-64 items-center justify-center pt-6">
                    <div className="text-center">
                        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
                        <p>Loading employee information...</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!employee) {
        return (
            <Card className="w-full shadow-sm">
                <CardContent className="p-10 pt-6 text-center">
                    <h3 className="mb-2 text-lg font-semibold">{t('employee_not_found')}</h3>
                    <p className="mb-4 text-gray-500">The requested employee could not be found.</p>
                    <Link href="/employees">
                        <Button>{t('btn_back_to_employees')}</Button>
                    </Link>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/employees">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">
                            {employee.first_name} {employee.last_name}
                        </h1>
                        <p className="text-gray-500">Employee #{employee.file_number}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Link href={`/employees/${employee.id}/edit`}>
                        <Button variant="outline" className="flex items-center gap-1">
                            <Edit className="h-4 w-4" />
                            Edit
                        </Button>
                    </Link>
                </div>
            </div>

            <Card className="shadow-sm">
                <CardHeader className="pb-0">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                            <CardTitle>{t('employee_information')}</CardTitle>
                            <div className="mt-2">
                                <Badge variant="outline" className={getStatusBadgeColor(employee.status)}>
                                    {employee.status.replace('_', ' ')}
                                </Badge>
                            </div>
                        </div>

                        {employee.current_assignment && (
                            <div className="rounded-lg bg-gray-100 p-3">
                                <p className="text-sm font-medium">{t('current_assignment')}</p>
                                <p className="text-sm">{employee.current_assignment.name}</p>
                                <p className="text-xs text-gray-500">{employee.current_assignment.type}</p>
                            </div>
                        )}
                    </div>
                </CardHeader>

                <CardContent className="pt-6">
                    <Tabs defaultValue="personal" value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="mb-4">
                            <TabsTrigger value="personal" className="flex items-center gap-1">
                                <FileText className="h-4 w-4" />
                                {t('personal_info')}
                            </TabsTrigger>
                            <TabsTrigger value="employment" className="flex items-center gap-1">
                                <ClipboardList className="h-4 w-4" />
                                {t('employment_details')}
                            </TabsTrigger>
                            <TabsTrigger value="documents" className="flex items-center gap-1">
                                <FileText className="h-4 w-4" />
                                {t('documents')}
                            </TabsTrigger>
                            <TabsTrigger value="timesheets" className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {t('timesheets')}
                            </TabsTrigger>
                            <TabsTrigger value="salary" className="flex items-center gap-1">
                                <CreditCard className="h-4 w-4" />
                                {t('salary')}
                            </TabsTrigger>
                            <TabsTrigger value="performance" className="flex items-center gap-1">
                                <BarChart className="h-4 w-4" />
                                {t('performance')}
                            </TabsTrigger>
                            <TabsTrigger value="settlement" className="flex items-center gap-1">
                                <CreditCard className="h-4 w-4" />
                                {t('settlement')}
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="personal" className="space-y-4">
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">{t('full_name')}</h3>
                                        <p>
                                            {employee.first_name} {employee.last_name}
                                        </p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">{t('email')}</h3>
                                        <p>{employee.email}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">{t('phone')}</h3>
                                        <p>{employee.phone || '-'}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">{t('date_of_birth')}</h3>
                                        <p>{employee.date_of_birth || '-'}</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">{t('nationality')}</h3>
                                        <p>{employee.nationality || '-'}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">{t('emergency_contact')}</h3>
                                        <p>{employee.emergency_contact_name || '-'}</p>
                                        <p className="text-sm text-gray-500">{employee.emergency_contact_phone || '-'}</p>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="employment" className="space-y-4">
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">{t('position')}</h3>
                                        <p>{employee.position?.name || '-'}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">{t('department')}</h3>
                                        <p>{employee.department?.name || '-'}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">{t('hire_date')}</h3>
                                        <p>{employee.hire_date || '-'}</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Status</h3>
                                        <Badge variant="outline" className={getStatusBadgeColor(employee.status)}>
                                            {employee.status.replace('_', ' ')}
                                        </Badge>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">{t('user_account')}</h3>
                                        {employee.user && (
                                            <div className="mt-1 flex gap-1">
                                                <Badge variant="secondary" className="text-xs">
                                                    {employee.user.email}
                                                </Badge>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="documents" className="space-y-4">
                            <Link href={`/employees/${employee.id}/documents`}>
                                <Button>{t('btn_manage_documents')}</Button>
                            </Link>

                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <h3 className="mb-2 text-sm font-medium text-gray-500">{t('identification_documents')}</h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between border-b pb-2">
                                            <div>
                                                <p className="font-medium">Passport</p>
                                                <p className="text-sm text-gray-500">{employee.passport_number || 'Not provided'}</p>
                                            </div>
                                        </div>
                                        <div className="flex justify-between border-b pb-2">
                                            <div>
                                                <p className="font-medium">Iqama</p>
                                                <p className="text-sm text-gray-500">{employee.iqama_number || 'Not provided'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="mb-2 text-sm font-medium text-gray-500">Licenses & Certifications</h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between border-b pb-2">
                                            <div>
                                                <p className="font-medium">{t('driving_license')}</p>
                                                <p className="text-sm text-gray-500">{employee.driving_license_number || 'Not provided'}</p>
                                            </div>
                                        </div>
                                        <div className="flex justify-between border-b pb-2">
                                            <div>
                                                <p className="font-medium">{t('lbl_operator_license')}</p>
                                                <p className="text-sm text-gray-500">{employee.operator_license_number || 'Not provided'}</p>
                                            </div>
                                        </div>
                                        <div className="flex justify-between border-b pb-2">
                                            <div>
                                                <p className="font-medium">TUV Certification</p>
                                                <p className="text-sm text-gray-500">{employee.tuv_certification_number || 'Not provided'}</p>
                                            </div>
                                        </div>
                                        <div className="flex justify-between border-b pb-2">
                                            <div>
                                                <p className="font-medium">SPSP License</p>
                                                <p className="text-sm text-gray-500">{employee.spsp_license_number || 'Not provided'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="timesheets" className="space-y-4">
                            <Link href={`/employees/${employee.id}/timesheets`}>
                                <Button>{t('btn_view_timesheets')}</Button>
                            </Link>
                            <p className="text-sm text-gray-500">View and manage employee timesheets.</p>
                        </TabsContent>

                        <TabsContent value="salary" className="space-y-4">
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">{t('basic_salary')}</h3>
                                        <p className="text-lg font-medium">
                                            {employee.basic_salary ? `SAR ${employee.basic_salary.toFixed(2)}` : '-'}
                                        </p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">{t('hourly_rate')}</h3>
                                        <p>{employee.hourly_rate ? `SAR ${employee.hourly_rate.toFixed(2)}` : '-'}</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Allowances</h3>
                                        <div className="mt-1 space-y-1">
                                            <div className="flex justify-between">
                                                <span className="text-sm">Housing</span>
                                                <span className="text-sm">
                                                    {employee.housing_allowance ? `SAR ${employee.housing_allowance.toFixed(2)}` : '-'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm">Transport</span>
                                                <span className="text-sm">
                                                    {employee.transport_allowance ? `SAR ${employee.transport_allowance.toFixed(2)}` : '-'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm">Food</span>
                                                <span className="text-sm">
                                                    {employee.food_allowance ? `SAR ${employee.food_allowance.toFixed(2)}` : '-'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="border-t pt-2">
                                        <div className="flex justify-between font-medium">
                                            <span>{t('total_compensation')}</span>
                                            <span>{calculateTotalCompensation(employee)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6">
                                <h3 className="mb-2 text-sm font-medium text-gray-500">{t('banking_information')}</h3>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <p className="text-sm font-medium">{t('bank_name')}</p>
                                        <p className="text-sm">{employee.bank_name || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">{t('account_number')}</p>
                                        <p className="text-sm">{employee.bank_account_number || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">IBAN</p>
                                        <p className="text-sm">{employee.bank_iban || '-'}</p>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="performance" className="space-y-4">
                            <div className="mb-4">
                                <Link href={`/employees/${employee.id}/performance`}>
                                    <Button>{t('btn_manage_performance_reviews')}</Button>
                                </Link>
                            </div>
                            <PerformanceReviewList
                                employeeId={employee.id}
                                onCreateNew={() => (window.location.href = `/employees/${employee.id}/performance/new`)}
                                onEdit={(review) => (window.location.href = `/employees/${employee.id}/performance/${review.id}/edit`)}
                            />
                        </TabsContent>

                        <TabsContent value="settlement">
                            <FinalSettlementTab employee={employee} settlements={[]} />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
};

// Helper function to calculate total compensation
const calculateTotalCompensation = (employee: Employee): string => {
    const basic = employee.basic_salary || 0;
    const housing = employee.housing_allowance || 0;
    const transport = employee.transport_allowance || 0;
    const food = employee.food_allowance || 0;

    const total = basic + housing + transport + food;
    return `SAR ${total.toFixed(2)}`;
};

export default EmployeeDetail;
