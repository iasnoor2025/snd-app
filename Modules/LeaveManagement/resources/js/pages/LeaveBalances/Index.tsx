import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Button } from "@/Core";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/Core";
import { Input } from "@/Core";
import { Badge } from "@/Core";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Core";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/Core";
import {
  Progress,
} from "@/Core";
import {
  Eye as EyeIcon,
  Calendar as CalendarIcon,
  Users as UsersIcon,
  Clock as ClockIcon,
  TrendingUp as TrendingUpIcon,
  Filter as FilterIcon,
  Download as DownloadIcon,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/Core";
import { AppLayout } from '@/Core';

interface Employee {
  id: number;
  first_name: string;
  last_name: string;
}

interface LeaveType {
  id: number;
  name: string;
  default_days: number;
}

interface BalanceData {
  type: string;
  allocated: number;
  used: number;
  remaining: number;
  percentage: number;
}

interface EmployeeBalance {
  employee: Employee;
  balances: BalanceData[];
  total_allocated: number;
  total_used: number;
  total_remaining: number;
}

interface PageProps {
  balances: EmployeeBalance[];
  employees: Employee[];
  leaveTypes: LeaveType[];
  filters: {
    employee_id?: string;
  };
}

const LeaveBalancesIndex: React.FC = () => {
  const { balances, employees, leaveTypes, filters } = usePage<PageProps>().props;
  const [selectedEmployee, setSelectedEmployee] = useState(filters.employee_id || '');
  const [searchTerm, setSearchTerm] = useState('');

  const handleFilter = () => {
  const { t } = useTranslation('leave');

    router.get(route('leaves.balances.index'), {
      employee_id: selectedEmployee || undefined,
    }, {
      preserveState: true,
      replace: true,
    });
  };

  const handleReset = () => {
    setSelectedEmployee('');
    router.get(route('leaves.balances.index'));
  };

  const getStatusColor = (percentage: number) => {
    if (percentage >= 80) return 'text-red-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-red-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const filteredBalances = balances.filter(balance => {
    if (!searchTerm) return true;
    const fullName = `${balance.employee.first_name} ${balance.employee.last_name}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  const totalStats = {
    totalEmployees: balances.length,
    totalAllocated: balances.reduce((sum, b) => sum + b.total_allocated, 0),
    totalUsed: balances.reduce((sum, b) => sum + b.total_used, 0),
    totalRemaining: balances.reduce((sum, b) => sum + b.total_remaining, 0),
  };

  const overallUsagePercentage = totalStats.totalAllocated > 0
    ? (totalStats.totalUsed / totalStats.totalAllocated) * 100
    : 0;

  return (
    <AppLayout>
      <Head title={t('leave_balances')} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('leave_balances')}</h1>
            <p className="text-muted-foreground">
              Monitor employee leave allocations and usage
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <DownloadIcon className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('ttl_total_employees')}</CardTitle>
              <UsersIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStats.totalEmployees}</div>
              <p className="text-xs text-muted-foreground">
                Active employees tracked
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('ttl_total_allocated')}</CardTitle>
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStats.totalAllocated}</div>
              <p className="text-xs text-muted-foreground">
                Days allocated this year
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('ttl_total_used')}</CardTitle>
              <ClockIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStats.totalUsed}</div>
              <p className="text-xs text-muted-foreground">
                Days used so far
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('ttl_usage_rate')}</CardTitle>
              <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overallUsagePercentage.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                Overall leave utilization
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FilterIcon className="h-5 w-5 mr-2" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder={t('ph_search_employees')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
              <div className="flex-1">
                <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                  <SelectTrigger className="max-w-sm">
                    <SelectValue placeholder={t('ph_select_employee')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">{t('opt_all_employees')}</SelectItem>
                    {employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id.toString()}>
                        {employee.first_name} {employee.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleFilter} variant="default">
                  Apply Filters
                </Button>
                <Button onClick={handleReset} variant="outline">
                  Reset
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Balances Table */}
        <Card>
          <CardHeader>
            <CardTitle>{t('ttl_employee_leave_balances')}</CardTitle>
            <CardDescription>
              Current year leave allocation and usage for all employees
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    {leaveTypes.map((type) => (
                      <TableHead key={type.id} className="text-center">
                        {type.name}
                      </TableHead>
                    ))}
                    <TableHead className="text-center">{t('th_total_usage')}</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBalances.map((balance) => (
                    <TableRow key={balance.employee.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div className="font-semibold">
                            {balance.employee.first_name} {balance.employee.last_name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            ID: {balance.employee.id}
                          </div>
                        </div>
                      </TableCell>
                      {leaveTypes.map((type) => {
                        const typeBalance = balance.balances.find(b => b.type === type.name);
                        return (
                          <TableCell key={type.id} className="text-center">
                            {typeBalance ? (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <div className="space-y-1">
                                      <div className="text-sm">
                                        <span className={getStatusColor(typeBalance.percentage)}>
                                          {typeBalance.used}
                                        </span>
                                        <span className="text-muted-foreground">/{typeBalance.allocated}</span>
                                      </div>
                                      <Progress
                                        value={typeBalance.percentage}
                                        className="h-2 w-16 mx-auto"
                                      />
                                      <div className="text-xs text-muted-foreground">
                                        {typeBalance.percentage.toFixed(0)}%
                                      </div>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <div className="text-sm">
                                      <div>Used: {typeBalance.used} days</div>
                                      <div>Remaining: {typeBalance.remaining} days</div>
                                      <div>Allocated: {typeBalance.allocated} days</div>
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                        );
                      })}
                      <TableCell className="text-center">
                        <div className="space-y-1">
                          <div className="text-sm font-medium">
                            {balance.total_used}/{balance.total_allocated}
                          </div>
                          <Badge
                            variant={balance.total_used > balance.total_allocated * 0.8 ? 'destructive' : 'secondary'}
                            className="text-xs"
                          >
                            {balance.total_allocated > 0
                              ? ((balance.total_used / balance.total_allocated) * 100).toFixed(0)
                              : 0}% used
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                asChild
                              >
                                <Link href={route('leaves.balances.show', balance.employee.id)}>
                                  <EyeIcon className="h-4 w-4" />
                                </Link>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{t('view_detailed_balance')}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredBalances.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No employee balances found.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default LeaveBalancesIndex;














