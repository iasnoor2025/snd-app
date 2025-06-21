import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, usePage } from '@inertiajs/react';
import axios from 'axios';
import { Employee } from '../../types/employee';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { ArrowLeft, Edit, FileText, ClipboardList, Clock, CreditCard, BarChart } from 'lucide-react';
import { getTranslation } from "@/Core";
import { FinalSettlementTab } from './FinalSettlementTab';
import PerformanceReviewList from './PerformanceReviewList';

interface EmployeeDetailProps {
  employeeId: number;
  initialEmployee?: Employee;
}

export const EmployeeDetail: React.FC<EmployeeDetailProps> = ({
  employeeId,
  initialEmployee
}) => {
  const [employee, setEmployee] = useState<Employee | null>(initialEmployee || null);
  const [loading, setLoading] = useState(!initialEmployee);
  const [activeTab, setActiveTab] = useState('personal');

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
        <CardContent className="pt-6 flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading employee information...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!employee) {
    return (
      <Card className="w-full shadow-sm">
        <CardContent className="pt-6 text-center p-10">
          <h3 className="text-lg font-semibold mb-2">{t('employee_not_found')}</h3>
          <p className="text-gray-500 mb-4">The requested employee could not be found.</p>
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
            <h1 className="text-2xl font-bold">{employee.first_name} {employee.last_name}</h1>
            <p className="text-gray-500">Employee #{employee.file_number}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/employees/${employee.id}/edit`}>
            <Button variant="outline" className="flex gap-1 items-center">
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          </Link>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-0">
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              <CardTitle>{t('employee_information')}</CardTitle>
              <div className="mt-2">
                <Badge variant="outline" className={getStatusBadgeColor(employee.status)}>
                  {employee.status.replace('_', ' ')}
                </Badge>
              </div>
            </div>

            {employee.current_assignment && (
              <div className="bg-gray-100 p-3 rounded-lg">
                <p className="text-sm font-medium">{t('current_assignment')}</p>
                <p className="text-sm">{employee.current_assignment.name}</p>
                <p className="text-xs text-gray-500">{employee.current_assignment.type}</p>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <Tabs
            defaultValue="personal"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
            <TabsList className="mb-4">
              <TabsTrigger value="personal" className="flex gap-1 items-center">
                <FileText className="h-4 w-4" />
                {t('personal_info')}
              </TabsTrigger>
              <TabsTrigger value="employment" className="flex gap-1 items-center">
                <ClipboardList className="h-4 w-4" />
                Employment
              </TabsTrigger>
              <TabsTrigger value="documents" className="flex gap-1 items-center">
                <FileText className="h-4 w-4" />
                Documents
              </TabsTrigger>
              <TabsTrigger value="timesheets" className="flex gap-1 items-center">
                <Clock className="h-4 w-4" />
                Timesheets
              </TabsTrigger>
              <TabsTrigger value="salary" className="flex gap-1 items-center">
                <CreditCard className="h-4 w-4" />
                Salary
              </TabsTrigger>
              <TabsTrigger value="performance" className="flex gap-1 items-center">
                <BarChart className="h-4 w-4" />
                Performance
              </TabsTrigger>
              <TabsTrigger value="settlement" className="flex gap-1 items-center">
                <CreditCard className="h-4 w-4" />
                Settlement
              </TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">{t('full_name')}</h3>
                    <p>{employee.first_name} {employee.last_name}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Email</h3>
                    <p>{employee.email}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Phone</h3>
                    <p>{employee.phone || '-'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">{t('date_of_birth')}</h3>
                    <p>{employee.date_of_birth || '-'}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Nationality</h3>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Position</h3>
                    <p>{employee.position || '-'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Department</h3>
                    <p>{employee.department || '-'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">{t('join_date')}</h3>
                    <p>{employee.join_date || '-'}</p>
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
                    <p>{employee.user ? employee.user.email : 'No user account'}</p>
                    {employee.user && employee.user.roles && (
                      <div className="mt-1 flex gap-1">
                        {employee.user.roles.map(role => (
                          <Badge key={role.id} variant="secondary" className="text-xs">
                            {role.display_name || role.name}
                          </Badge>
                        ))}
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
                  <h3 className="text-sm font-medium text-gray-500 mb-2">{t('identification_documents')}</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between border-b pb-2">
                      <div>
                        <p className="font-medium">Passport</p>
                        <p className="text-sm text-gray-500">{employee.passport || 'Not provided'}</p>
                      </div>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <div>
                        <p className="font-medium">Iqama</p>
                        <p className="text-sm text-gray-500">{employee.iqama || 'Not provided'}</p>
                      </div>
                      {employee.iqama_cost && (
                        <p className="text-sm">Cost: SAR {employee.iqama_cost}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Licenses & Certifications</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between border-b pb-2">
                      <div>
                        <p className="font-medium">{t('driving_license')}</p>
                        <p className="text-sm text-gray-500">{employee.driving_license || 'Not provided'}</p>
                      </div>
                      {employee.driving_license_cost && (
                        <p className="text-sm">Cost: SAR {employee.driving_license_cost}</p>
                      )}
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <div>
                        <p className="font-medium">{t('lbl_operator_license')}</p>
                        <p className="text-sm text-gray-500">{employee.operator_license || 'Not provided'}</p>
                      </div>
                      {employee.operator_license_cost && (
                        <p className="text-sm">Cost: SAR {employee.operator_license_cost}</p>
                      )}
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <div>
                        <p className="font-medium">TUV Certification</p>
                        <p className="text-sm text-gray-500">{employee.tuv_certification || 'Not provided'}</p>
                      </div>
                      {employee.tuv_certification_cost && (
                        <p className="text-sm">Cost: SAR {employee.tuv_certification_cost}</p>
                      )}
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <div>
                        <p className="font-medium">SPSP License</p>
                        <p className="text-sm text-gray-500">{employee.spsp_license || 'Not provided'}</p>
                      </div>
                      {employee.spsp_license_cost && (
                        <p className="text-sm">Cost: SAR {employee.spsp_license_cost}</p>
                      )}
                    </div>
                  </div>
                </div>

                {employee.custom_certifications && employee.custom_certifications.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">{t('custom_certifications')}</h3>
                    <div className="space-y-3">
                      {employee.custom_certifications.map((cert, index) => (
                        <div key={index} className="flex justify-between border-b pb-2">
                          <div>
                            <p className="font-medium">{cert.name}</p>
                            <p className="text-sm text-gray-500">Number: {cert.number}</p>
                            <p className="text-sm text-gray-500">Expires: {cert.expiry_date}</p>
                          </div>
                          {cert.cost && (
                            <p className="text-sm">Cost: SAR {cert.cost}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="timesheets" className="space-y-4">
              <Link href={`/employees/${employee.id}/timesheets`}>
                <Button>{t('btn_view_timesheets')}</Button>
              </Link>
              <p className="text-sm text-gray-500">View and manage employee timesheets.</p>
            </TabsContent>

            <TabsContent value="salary" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">{t('basic_salary')}</h3>
                    <p className="text-lg font-medium">
                      {employee.basic_salary ? `SAR ${employee.basic_salary.toFixed(2)}` : '-'}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">{t('hourly_rate')}</h3>
                    <p>
                      {employee.hourly_rate ? `SAR ${employee.hourly_rate.toFixed(2)}` : '-'}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Allowances</h3>
                    <div className="space-y-1 mt-1">
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
                  <div className="pt-2 border-t">
                    <div className="flex justify-between font-medium">
                      <span>{t('total_compensation')}</span>
                      <span>
                        {calculateTotalCompensation(employee)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">{t('banking_information')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                onCreateNew={() => window.location.href = `/employees/${employee.id}/performance/new`}
                onEdit={(review) => window.location.href = `/employees/${employee.id}/performance/${review.id}/edit`}
              />
            </TabsContent>

            <TabsContent value="settlement">
              <FinalSettlementTab employeeId={employee.id} />
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
















