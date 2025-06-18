import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Employee, Department, Position } from '../../types/employee';
import useLoadingState from '../../hooks/useLoadingState';
import { getTranslation } from '@/utils/translation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { format } from 'date-fns';
import { DatePicker } from '../ui/date-picker';
import { AlertCircle, Loader2, Save, Plus, Trash } from 'lucide-react';
import DocumentManager from '../DocumentManager';

interface EmployeeFormProps {
  employee?: Employee;
  onSave?: (employee: Employee) => void;
  onCancel?: () => void;
}

// Define Zod schema for form validation
const employeeSchema = z.object({
  employee_id: z.string().optional(),
  file_number: z.string().min(1, 'File number is required'),
  first_name: z.string().min(1, 'First name is required'),
  middle_name: z.string().optional(),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  nationality: z.string().optional(),
  position_id: z.coerce.number().optional(),
  department_id: z.coerce.number().optional(),
  supervisor: z.string().optional(),
  hire_date: z.date().optional(),
  status: z.enum(['active', 'inactive', 'on_leave', 'terminated']),
  current_location: z.string().optional(),
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: z.string().optional(),
  notes: z.string().optional(),

  // ID documents
  iqama_number: z.string().optional(),
  iqama_expiry: z.date().optional(),
  passport_number: z.string().optional(),
  passport_expiry: z.date().optional(),
  date_of_birth: z.date().optional(),

  // Banking information
  bank_name: z.string().optional(),
  bank_account_number: z.string().optional(),
  bank_iban: z.string().optional(),

  // Salary and compensation
  basic_salary: z.coerce.number().min(0).optional(),
  food_allowance: z.coerce.number().min(0).optional(),
  housing_allowance: z.coerce.number().min(0).optional(),
  transport_allowance: z.coerce.number().min(0).optional(),
  hourly_rate: z.coerce.number().min(0).optional(),
  absent_deduction_rate: z.coerce.number().min(0).optional(),
  overtime_rate_multiplier: z.coerce.number().min(0).optional(),
  overtime_fixed_rate: z.coerce.number().min(0).optional(),
  contract_hours_per_day: z.coerce.number().min(0).optional(),
  contract_days_per_month: z.coerce.number().min(0).optional(),

  // Licenses
  driving_license_number: z.string().optional(),
  driving_license_expiry: z.date().optional(),
  operator_license_number: z.string().optional(),
  operator_license_expiry: z.date().optional(),
})

type EmployeeFormValues = z.infer<typeof employeeSchema>

const EmployeeForm: React.FC<EmployeeFormProps> = ({ employee, onSave, onCancel }) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const { isLoading, error, withLoading } = useLoadingState('employeeForm');
  const { t } = useTranslation('employees');

  // Initialize form with React Hook Form and Zod validation
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
    watch,
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: employee ? mapEmployeeToFormValues(employee) : {
      status: 'active',
      overtime_rate_multiplier: 1.5,
      contract_hours_per_day: 8,
      contract_days_per_month: 22
    }
  })

  // Helper function to map Employee to form values
  function mapEmployeeToFormValues(employee: Employee): EmployeeFormValues {
    return {
      ...employee,
      hire_date: employee.hire_date ? new Date(employee.hire_date) : undefined,
      date_of_birth: employee.date_of_birth ? new Date(employee.date_of_birth) : undefined,
      iqama_expiry: employee.iqama_expiry ? new Date(employee.iqama_expiry) : undefined,
      passport_expiry: employee.passport_expiry ? new Date(employee.passport_expiry) : undefined,
      driving_license_expiry: employee.driving_license_expiry ? new Date(employee.driving_license_expiry) : undefined,
      operator_license_expiry: employee.operator_license_expiry ? new Date(employee.operator_license_expiry) : undefined,
      position_id: employee.position_id || undefined,
      department_id: employee.department_id || undefined,
    };
  }

  // Fetch departments and positions on component mount
  useEffect(() => {
    const fetchData = async () => {
      await withLoading(async () => {
        const [departmentsResponse, positionsResponse] = await Promise.all([
          axios.get('/api/departments?is_active=true'),
          axios.get('/api/positions?is_active=true')
        ]);

        setDepartments(departmentsResponse.data.data);
        setPositions(positionsResponse.data.data);
      })
    };

    fetchData();
  }, []);

  // Handle form submission
  const onSubmit = async (data: EmployeeFormValues) => {
    await withLoading(async () => {
      try {
        // Format dates for API
        const formattedData = {
          ...data,
          hire_date: data.hire_date ? format(data.hire_date, 'yyyy-MM-dd') : null,
          date_of_birth: data.date_of_birth ? format(data.date_of_birth, 'yyyy-MM-dd') : null,
          iqama_expiry: data.iqama_expiry ? format(data.iqama_expiry, 'yyyy-MM-dd') : null,
          passport_expiry: data.passport_expiry ? format(data.passport_expiry, 'yyyy-MM-dd') : null,
          driving_license_expiry: data.driving_license_expiry ? format(data.driving_license_expiry, 'yyyy-MM-dd') : null,
          operator_license_expiry: data.operator_license_expiry ? format(data.operator_license_expiry, 'yyyy-MM-dd') : null,
        };

        let response;
        if (employee?.id) {
          // Update existing employee
          response = await axios.put(`/api/employees/${employee.id}`, formattedData);
        } else {
          // Create new employee
          response = await axios.post('/api/employees', formattedData);
        }

        if (onSave) {
          onSave(response.data.data);
        }
      } catch (error) {
        console.error('Error saving employee:', error);
        throw error;
      }
    })
  };

  // Handle date change
  const handleDateChange = (field: keyof EmployeeFormValues, date: Date | undefined) => {
    setValue(field, date);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{employee ? 'Edit Employee' : 'Create New Employee'}</CardTitle>
        <CardDescription>
          {employee ? 'Update employee information' : 'Add a new employee to the system'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <Tabs defaultValue="basic">
            <TabsList className="grid grid-cols-5 mb-6">
              <TabsTrigger value="basic">{t('basic_info')}</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
              <TabsTrigger value="employment">Employment</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="salary">Salary & Compensation</TabsTrigger>
            </TabsList>

            {/* Basic Information Tab */}
            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="file_number">{t('file_number')} <span className="text-red-500">*</span></Label>
                  <Input
                    id="file_number"
                    {...register('file_number')}
                    error={errors.file_number?.message}
                  />
                  {errors.file_number && (
                    <p className="text-sm text-red-500">{errors.file_number.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employee_id">{t('employee_id')}</Label>
                  <Input
                    id="employee_id"
                    {...register('employee_id')}
                    error={errors.employee_id?.message}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status <span className="text-red-500">*</span></Label>
                  <Select
                    value={watch('status')}
                    onValueChange={(value) => setValue('status', value as any)}
                    <SelectTrigger id="status">
                      <SelectValue placeholder={t('ph_select_status')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="on_leave">{t('on_leave')}</SelectItem>
                      <SelectItem value="terminated">Terminated</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.status && (
                    <p className="text-sm text-red-500">{errors.status.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">{t('lbl_first_name')} <span className="text-red-500">*</span></Label>
                  <Input
                    id="first_name"
                    {...register('first_name')}
                    error={errors.first_name?.message}
                  />
                  {errors.first_name && (
                    <p className="text-sm text-red-500">{errors.first_name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="middle_name">{t('lbl_middle_name')}</Label>
                  <Input
                    id="middle_name"
                    {...register('middle_name')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="last_name">{t('lbl_last_name')} <span className="text-red-500">*</span></Label>
                  <Input
                    id="last_name"
                    {...register('last_name')}
                    error={errors.last_name?.message}
                  />
                  {errors.last_name && (
                    <p className="text-sm text-red-500">{errors.last_name.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date_of_birth">{t('date_of_birth')}</Label>
                  <DatePicker
                    value={watch('date_of_birth')}
                    onChange={(date) => handleDateChange('date_of_birth', date)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nationality">Nationality</Label>
                  <Input
                    id="nationality"
                    {...register('nationality')}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    {...register('notes')}
                    rows={3}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Contact Information Tab */}
            <TabsContent value="contact" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                  <Input
                    id="email"
                    type="email"
                    {...register('email')}
                    error={errors.email?.message}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    {...register('phone')}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    {...register('address')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    {...register('city')}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emergency_contact_name">{t('lbl_emergency_contact_name')}</Label>
                  <Input
                    id="emergency_contact_name"
                    {...register('emergency_contact_name')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergency_contact_phone">{t('lbl_emergency_contact_phone')}</Label>
                  <Input
                    id="emergency_contact_phone"
                    {...register('emergency_contact_phone')}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Employment Information Tab */}
            <TabsContent value="employment" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="position_id">Position</Label>
                  <Select
                    value={watch('position_id')?.toString() || ''}
                    onValueChange={(value) => setValue('position_id', parseInt(value))}
                    <SelectTrigger id="position_id">
                      <SelectValue placeholder={t('ph_select_position')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {positions.map((position) => (
                        <SelectItem key={position.id} value={position.id.toString()}>
                          {getTranslation(position.name)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department_id">Department</Label>
                  <Select
                    value={watch('department_id')?.toString() || ''}
                    onValueChange={(value) => setValue('department_id', parseInt(value))}
                    <SelectTrigger id="department_id">
                      <SelectValue placeholder={t('ph_select_department')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {departments.map((department) => (
                        <SelectItem key={department.id} value={department.id.toString()}>
                          {getTranslation(department.name)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="supervisor">Supervisor</Label>
                  <Input
                    id="supervisor"
                    {...register('supervisor')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hire_date">{t('hire_date')}</Label>
                  <DatePicker
                    value={watch('hire_date')}
                    onChange={(date) => handleDateChange('hire_date', date)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="current_location">{t('lbl_current_location')}</Label>
                  <Input
                    id="current_location"
                    {...register('current_location')}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Documents Tab */}
            <TabsContent value="documents" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="iqama_number">{t('iqama_number')}</Label>
                  <Input
                    id="iqama_number"
                    {...register('iqama_number')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="iqama_expiry">{t('iqama_expiry')}</Label>
                  <DatePicker
                    value={watch('iqama_expiry')}
                    onChange={(date) => handleDateChange('iqama_expiry', date)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="passport_number">{t('lbl_passport_number')}</Label>
                  <Input
                    id="passport_number"
                    {...register('passport_number')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="passport_expiry">{t('lbl_passport_expiry')}</Label>
                  <DatePicker
                    value={watch('passport_expiry')}
                    onChange={(date) => handleDateChange('passport_expiry', date)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="driving_license_number">{t('driving_license')}</Label>
                  <Input
                    id="driving_license_number"
                    {...register('driving_license_number')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="driving_license_expiry">{t('lbl_driving_license_expiry')}</Label>
                  <DatePicker
                    value={watch('driving_license_expiry')}
                    onChange={(date) => handleDateChange('driving_license_expiry', date)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="operator_license_number">{t('lbl_operator_license')}</Label>
                  <Input
                    id="operator_license_number"
                    {...register('operator_license_number')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="operator_license_expiry">{t('lbl_operator_license_expiry')}</Label>
                  <DatePicker
                    value={watch('operator_license_expiry')}
                    onChange={(date) => handleDateChange('operator_license_expiry', date)}
                  />
                </div>
              </div>

              {employee?.id && (
                <div className="mt-6 border-t pt-6">
                  <h3 className="text-lg font-medium mb-4">{t('document_management')}</h3>
                  <DocumentManager
                    modelType="employee"
                    modelId={employee.id}
                    collections={['documents', 'certificates', 'photos']}
                  />
                </div>
              )}
            </TabsContent>

            {/* Salary & Compensation Tab */}
            <TabsContent value="salary" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="basic_salary">{t('basic_salary')}</Label>
                  <Input
                    id="basic_salary"
                    type="number"
                    step="0.01"
                    {...register('basic_salary')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hourly_rate">{t('hourly_rate')}</Label>
                  <Input
                    id="hourly_rate"
                    type="number"
                    step="0.01"
                    {...register('hourly_rate')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="overtime_rate_multiplier">{t('lbl_overtime_rate_multiplier')}</Label>
                  <Input
                    id="overtime_rate_multiplier"
                    type="number"
                    step="0.1"
                    {...register('overtime_rate_multiplier')}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="food_allowance">{t('food_allowance')}</Label>
                  <Input
                    id="food_allowance"
                    type="number"
                    step="0.01"
                    {...register('food_allowance')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="housing_allowance">{t('housing_allowance')}</Label>
                  <Input
                    id="housing_allowance"
                    type="number"
                    step="0.01"
                    {...register('housing_allowance')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="transport_allowance">{t('lbl_transport_allowance')}</Label>
                  <Input
                    id="transport_allowance"
                    type="number"
                    step="0.01"
                    {...register('transport_allowance')}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="absent_deduction_rate">{t('absent_deduction_rate')}</Label>
                  <Input
                    id="absent_deduction_rate"
                    type="number"
                    step="0.01"
                    {...register('absent_deduction_rate')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contract_hours_per_day">{t('lbl_contract_hours_per_day')}</Label>
                  <Input
                    id="contract_hours_per_day"
                    type="number"
                    {...register('contract_hours_per_day')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contract_days_per_month">{t('lbl_contract_days_per_month')}</Label>
                  <Input
                    id="contract_days_per_month"
                    type="number"
                    {...register('contract_days_per_month')}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bank_name">{t('bank_name')}</Label>
                  <Input
                    id="bank_name"
                    {...register('bank_name')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bank_account_number">{t('lbl_bank_account_number')}</Label>
                  <Input
                    id="bank_account_number"
                    {...register('bank_account_number')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bank_iban">{t('lbl_bank_iban')}</Label>
                  <Input
                    id="bank_iban"
                    {...register('bank_iban')}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-6 flex justify-end space-x-2">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                Cancel
              </Button>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                  <Save className="mr-2 h-4 w-4" />
                  {employee ? 'Update Employee' : 'Create Employee'}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default EmployeeForm;
