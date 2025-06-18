import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { DatePicker } from '../ui/date-picker';
import { Checkbox } from '../ui/checkbox';
import { Separator } from '../ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Loader2, Save, FileDown, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

interface Employee {
  id: number;
  name: string;
  position: string;
  department: string;
  hire_date: string;
  salary: number;
  has_advances: boolean;
}

interface CalculationResult {
  basic_salary: number;
  outstanding_salary: number;
  leave_encashment: number;
  gratuity_amount: number;
  notice_period_compensation: number;
  deductions: {
    id: number;
    name: string;
    amount: number;
  }[];
  advance_repayments: {
    id: number;
    reference: string;
    original_amount: number;
    outstanding: number;
  }[];
  bonus_payments: number;
  total_payable: number;
  years_of_service: number;
  service_days: number;
}

export const FinalSettlementCalculator: React.FC = () => {
  const { t } = useTranslation(['employees', 'common']);
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [lastWorkingDate, setLastWorkingDate] = useState<Date | undefined>(new Date());
  const [noticeProvided, setNoticeProvided] = useState(true);
  const [noticePeriodDays, setNoticePeriodDays] = useState<string>('30');
  const [noticeDaysServed, setNoticeDaysServed] = useState<string>('0');
  const [remarks, setRemarks] = useState('');
  const [calculationResult, setCalculationResult] = useState<CalculationResult | null>(null);
  const [customDeductions, setCustomDeductions] = useState<Array<{ name: string; amount: string; }>>([
    { name: '', amount: '' }
  ]);
  const [bonusPayment, setBonusPayment] = useState<string>('0');

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/employees');
      setEmployees(response.data.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error(t('employees:error_loading_employees'));
    } finally {
      setLoading(false);
    }
  };

  const handleEmployeeChange = (value: string) => {
    setSelectedEmployeeId(value);
    setCalculationResult(null);
  };

  const addCustomDeduction = () => {
    setCustomDeductions([...customDeductions, { name: '', amount: '' }]);
  };

  const removeCustomDeduction = (index: number) => {
    const updatedDeductions = [...customDeductions];
    updatedDeductions.splice(index, 1);
    setCustomDeductions(updatedDeductions);
  };

  const updateCustomDeduction = (index: number, field: 'name' | 'amount', value: string) => {
    const updatedDeductions = [...customDeductions];
    updatedDeductions[index][field] = value;
    setCustomDeductions(updatedDeductions);
  };

  const calculateSettlement = async () => {
    if (!selectedEmployeeId || !lastWorkingDate) {
      toast.error(t('employees:select_employee_and_date'));
      return;
    }

    setCalculating(true);
    try {
      // Prepare custom deductions - filter out empty ones
      const validDeductions = customDeductions.filter(d =>
        d.name.trim() !== '' && d.amount.trim() !== '' && parseFloat(d.amount) > 0;
      );

      const response = await axios.post('/api/employees/final-settlement/calculate', {
        employee_id: parseInt(selectedEmployeeId),
        last_working_date: lastWorkingDate.toISOString().split('T')[0],
        notice_provided: noticeProvided,
        notice_period_days: parseInt(noticePeriodDays),
        notice_days_served: parseInt(noticeDaysServed),
        custom_deductions: validDeductions.map(d => ({
          name: d.name,
          amount: parseFloat(d.amount)
        })),
        bonus_payment: parseFloat(bonusPayment) || 0,
        remarks: remarks
      })

      setCalculationResult(response.data.data);
      toast.success(t('employees:settlement_calculated_success'));
    } catch (error: any) {
      console.error('Error calculating settlement:', error);

      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error(t('employees:error_calculating_settlement'));
      }
    } finally {
      setCalculating(false);
    }
  };

  const generateSettlementDocument = async () => {
    if (!calculationResult || !selectedEmployeeId || !lastWorkingDate) {
      toast.error(t('employees:calculate_settlement_first'));
      return;
    }

    setGenerating(true);
    try {
      const response = await axios.post('/api/employees/final-settlement/generate', {
        employee_id: parseInt(selectedEmployeeId),
        last_working_date: lastWorkingDate.toISOString().split('T')[0],
        notice_provided: noticeProvided,
        notice_period_days: parseInt(noticePeriodDays),
        notice_days_served: parseInt(noticeDaysServed),
        custom_deductions: customDeductions
          .filter(d => d.name.trim() !== '' && d.amount.trim() !== '' && parseFloat(d.amount) > 0)
          .map(d => ({
            name: d.name,
            amount: parseFloat(d.amount)
          })),
        bonus_payment: parseFloat(bonusPayment) || 0,
        remarks: remarks
      }, {
        responseType: 'blob'
      })

      // Create a download link and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;

      const selectedEmployee = employees.find(e => e.id === parseInt(selectedEmployeeId));
      const employeeName = selectedEmployee?.name || 'employee';
      const formattedDate = new Date().toISOString().split('T')[0];

      link.setAttribute('download', `Final_Settlement_${employeeName.replace(/\s+/g, '_')}_${formattedDate}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(t('employees:settlement_document_generated_success'));
    } catch (error) {
      console.error('Error generating settlement document:', error);
      toast.error(t('employees:error_generating_settlement'));
    } finally {
      setGenerating(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  };

  const selectedEmployee = employees.find(e => e.id === parseInt(selectedEmployeeId));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('ttl_final_settlement_calculator')}</CardTitle>
          <CardDescription>
            Calculate the final settlement for departing employees
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="employee">{t('lbl_select_employee')}</Label>
                  <Select
                    value={selectedEmployeeId}
                    onValueChange={handleEmployeeChange}
                    disabled={calculating}
                    <SelectTrigger id="employee">
                      <SelectValue placeholder={t('ph_select_an_employee')} />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id.toString()}>
                          {employee.name} - {employee.position}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t('lbl_last_working_date')}</Label>
                  <DatePicker
                    date={lastWorkingDate}
                    setDate={setLastWorkingDate}
                    disabled={calculating}
                  />
                </div>
              </div>

              {selectedEmployee && (
                <div className="bg-muted p-4 rounded-md">
                  <h3 className="font-medium mb-2">{t('employee_information')}</h3>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Department</p>
                      <p className="font-medium">{selectedEmployee.department}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Position</p>
                      <p className="font-medium">{selectedEmployee.position}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{t('hire_date')}</p>
                      <p className="font-medium">{formatDate(selectedEmployee.hire_date)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{t('monthly_salary')}</p>
                      <p className="font-medium">{formatCurrency(selectedEmployee.salary)}</p>
                    </div>
                    {selectedEmployee.has_advances && (
                      <div className="md:col-span-2">
                        <Alert variant="warning" className="mt-2">
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>{t('ttl_outstanding_advances')}</AlertTitle>
                          <AlertDescription>
                            This employee has outstanding salary advances that will be deducted from the final settlement.
                          </AlertDescription>
                        </Alert>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <h3 className="font-medium">{t('notice_period_details')}</h3>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="noticeProvided"
                    checked={noticeProvided}
                    onCheckedChange={(checked) => setNoticeProvided(checked as boolean)}
                    disabled={calculating}
                  />
                  <Label htmlFor="noticeProvided">
                    Notice period provided by employee
                  </Label>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="noticePeriodDays">Notice Period (days)</Label>
                    <Input
                      id="noticePeriodDays"
                      type="number"
                      value={noticePeriodDays}
                      onChange={(e) => setNoticePeriodDays(e.target.value)}
                      disabled={calculating}
                      min="0"
                      max="90"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="noticeDaysServed">{t('lbl_days_served_in_notice_period')}</Label>
                    <Input
                      id="noticeDaysServed"
                      type="number"
                      value={noticeDaysServed}
                      onChange={(e) => setNoticeDaysServed(e.target.value)}
                      disabled={calculating || !noticeProvided}
                      min="0"
                      max={noticePeriodDays}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{t('additional_deductions')}</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addCustomDeduction}
                    disabled={calculating}
                    Add Deduction
                  </Button>
                </div>

                {customDeductions.map((deduction, index) => (
                  <div key={index} className="grid gap-4 md:grid-cols-3 items-end">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor={`deduction-name-${index}`}>Deduction Description</Label>
                      <Input
                        id={`deduction-name-${index}`}
                        value={deduction.name}
                        onChange={(e) => updateCustomDeduction(index, 'name', e.target.value)}
                        placeholder={t('ph_eg_company_property_damage')}
                        disabled={calculating}
                      />
                    </div>

                    <div className="space-y-2 flex items-end gap-2">
                      <div className="flex-1">
                        <Label htmlFor={`deduction-amount-${index}`}>Amount</Label>
                        <Input
                          id={`deduction-amount-${index}`}
                          value={deduction.amount}
                          onChange={(e) => updateCustomDeduction(index, 'amount', e.target.value)}
                          placeholder="0.00"
                          type="number"
                          min="0"
                          step="0.01"
                          disabled={calculating}
                        />
                      </div>

                      {index > 0 && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={() => removeCustomDeduction(index)}
                          disabled={calculating}
                          className="mb-0.5"
                          &times;
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bonusPayment">{t('additional_bonus_payment')}</Label>
                <Input
                  id="bonusPayment"
                  type="number"
                  value={bonusPayment}
                  onChange={(e) => setBonusPayment(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  disabled={calculating}
                />
                <p className="text-sm text-muted-foreground">
                  Any additional bonus or ex-gratia payment to be included in the final settlement.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="remarks">Remarks</Label>
                <Textarea
                  id="remarks"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder={t('ph_add_any_additional_notes_regarding_this_settlem')}
                  rows={3}
                  disabled={calculating}
                />
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={calculateSettlement}
                  disabled={calculating || !selectedEmployeeId || !lastWorkingDate}
                  {calculating ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Calculating...
                    </>
                  ) : (
                    'Calculate Settlement'
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {calculationResult && (
        <Card>
          <CardHeader>
            <CardTitle>{t('ttl_settlement_calculation_results')}</CardTitle>
            <CardDescription>
              Final settlement calculation for {selectedEmployee?.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h3 className="font-medium mb-3">{t('service_information')}</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Years of Service:</span>
                      <span className="font-medium">{calculationResult.years_of_service.toFixed(2)} years</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Days of Service:</span>
                      <span className="font-medium">{calculationResult.service_days} days</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-3">{t('salary_information')}</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Basic Monthly Salary:</span>
                      <span className="font-medium">{formatCurrency(calculationResult.basic_salary)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-medium mb-3">{t('settlement_components')}</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50%]">Component</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>{t('outstanding_salary')}</TableCell>
                      <TableCell className="text-right">{formatCurrency(calculationResult.outstanding_salary)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>{t('leave_encashment')}</TableCell>
                      <TableCell className="text-right">{formatCurrency(calculationResult.leave_encashment)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Gratuity</TableCell>
                      <TableCell className="text-right">{formatCurrency(calculationResult.gratuity_amount)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>{t('notice_period_compensation')}</TableCell>
                      <TableCell className="text-right">{formatCurrency(calculationResult.notice_period_compensation)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>{t('additional_bonus_payment')}</TableCell>
                      <TableCell className="text-right">{formatCurrency(calculationResult.bonus_payments)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              {(calculationResult.deductions.length > 0 || calculationResult.advance_repayments.length > 0) && (
                  <Separator />

                  <div>
                    <h3 className="font-medium mb-3">Deductions</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[50%]">Deduction</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {calculationResult.advance_repayments.map((advance) => (
                          <TableRow key={`advance-${advance.id}`}>
                            <TableCell>
                              Outstanding Advance: {advance.reference}
                              <span className="block text-xs text-muted-foreground">
                                Original Amount: {formatCurrency(advance.original_amount)}
                              </span>
                            </TableCell>
                            <TableCell className="text-right text-destructive font-medium">
                              -{formatCurrency(advance.outstanding)}
                            </TableCell>
                          </TableRow>
                        ))}

                        {calculationResult.deductions.map((deduction) => (
                          <TableRow key={`deduction-${deduction.id}`}>
                            <TableCell>{deduction.name}</TableCell>
                            <TableCell className="text-right text-destructive font-medium">
                              -{formatCurrency(deduction.amount)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </>
              )}

              <Separator />

              <div className="flex justify-between items-center px-2 py-4 bg-muted rounded-md">
                <h3 className="font-medium text-lg">{t('total_payable_amount')}</h3>
                <span className="font-bold text-xl">
                  {formatCurrency(calculationResult.total_payable)}
                </span>
              </div>

              <div className="flex justify-end gap-4">
                <Button
                  variant="outline"
                  onClick={calculateSettlement}
                  disabled={calculating}
                  Recalculate
                </Button>
                <Button
                  variant="default"
                  onClick={generateSettlementDocument}
                  disabled={generating}
                  className="flex items-center gap-2"
                  {generating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                      <FileDown className="h-4 w-4" />
                      Generate PDF
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-muted/50 text-xs text-muted-foreground">
            <p>
              This settlement calculation is based on company policies and applicable labor laws.
              The final amount may be subject to tax deductions as per the local tax regulations.
            </p>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default FinalSettlementCalculator;


