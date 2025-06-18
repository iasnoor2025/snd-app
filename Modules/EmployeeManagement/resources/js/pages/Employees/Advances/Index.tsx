import React from 'react';
import { useTranslation } from 'react-i18next';
import { Head, router } from '@inertiajs/react';
import { PageProps } from '@/Modules/EmployeeManagement/Resources/js/types';
import AdminLayout from '../../../layouts/AdminLayout';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Trash2, Check, X, ArrowLeft, History } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { usePermission } from '@/hooks/usePermission';
import { ToastService } from '@/components/shared/ToastManager';

interface Advance {
  id: number;
  employee?: {
    id: number;
    first_name: string;
    last_name: string;
    employee_id: string;
  };
  amount: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'partially_repaid' | 'fully_repaid';
  created_at: string;
  rejection_reason?: string;
  repayment_date?: string;
  type: 'advance' | 'advance_payment';
}

interface Props extends PageProps {
  employee?: {
    id: number;
    first_name: string;
    last_name: string;
    employee_id: string;
  };
  advances: {
    data: Advance[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  total_balance: number;
}

export default function Index({ auth, employee, advances, total_balance }: Props) {
  const { t } = useTranslation('employee');

  const { hasPermission } = usePermission();
  const [selectedAdvance, setSelectedAdvance] = React.useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [showRequestDialog, setShowRequestDialog] = React.useState(false);

  const breadcrumbs = [
    {
      title: 'Dashboard',
      href: '/dashboard',
    },
    {
      title: 'Employees',
      href: '/employees',
    },
    {
      title: employee ? `${employee.first_name} ${employee.last_name}` : 'All Advances',
      href: employee ? `/employees/${employee.id}` : '/employees/advances',
    },
    ...(employee ? [{
      title: 'Advances',
      href: `/employees/${employee.id}/advances`,
    }] : []),
  ];

  const handleDeleteAdvance = (advanceId: number) => {
    const routeParams = employee
      ? { employee: employee.id, advance: advanceId }
      : { advance: advanceId };

    router.delete(route('advances.destroy', routeParams), {
      onSuccess: () => {
        ToastService.success("Advance record deleted successfully");
        setIsDeleteDialogOpen(false);
      },
      onError: (errors) => {
        ToastService.error(errors?.message || "Failed to delete advance record");
      }
    });
  };

  // Add console log to debug permissions
  console.log('Has edit permission:', hasPermission('employees.edit'));

  return (
    <AdminLayout title={t('ttl_employee_advances')} breadcrumbs={breadcrumbs} requiredPermission="employees.view">
      <Head title={t('ttl_employee_advances')} />

      <div className="flex h-full flex-1 flex-col gap-6 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-between gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.visit(employee ? `/employees/${employee.id}` : '/employees')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to {employee ? 'Employee' : 'Employees'}
          </Button>

          {employee && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.visit(route('advances.payment-history', { employee: employee.id }))}
              className="flex items-center gap-2"
            >
              <History className="h-4 w-4" />
              View Payment History
            </Button>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {employee
                ? `Advances for ${employee.first_name} ${employee.last_name}`
                : 'All Employee Advances'}
            </CardTitle>
            <CardDescription>
              {employee
                ? 'View and manage advance requests for this employee'
                : 'View and manage all employee advance requests'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    {!employee && <TableHead>Employee</TableHead>}
                    <TableHead>Amount</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!advances?.data || advances.data.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={employee ? 6 : 7} className="text-center text-sm text-muted-foreground py-6">
                        No advance requests found
                      </TableCell>
                    </TableRow>
                  ) : (
                    advances.data.map((advance) => (
                      <TableRow key={`${advance.type}-${advance.id}`}>
                        {!employee && (
                          <TableCell className="text-sm">
                            {advance.employee?.first_name} {advance.employee?.last_name}
                            <div className="text-xs text-muted-foreground">ID: {advance.employee?.employee_id}</div>
                          </TableCell>
                        )}
                        <TableCell className="text-sm font-medium">
                          {advance.type === 'advance_payment' && advance.amount < 0 ? (
                            <span className="text-red-600">SAR {Math.abs(Number(advance.amount)).toFixed(2)}</span>
                          ) : (
                            <span>SAR {Number(advance.amount).toFixed(2)}</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">{advance.reason}</TableCell>
                        <TableCell className="text-sm">{format(new Date(advance.created_at), 'PP')}</TableCell>
                        <TableCell>
                          <Badge variant={
                            advance.status === 'approved' ? 'default' :
                            advance.status === 'rejected' ? 'destructive' :
                            advance.status === 'fully_repaid' ? 'default' :
                            advance.status === 'partially_repaid' ? 'secondary' :
                            'secondary'
                          } className={
                            advance.status === 'approved' ? 'bg-green-500 hover:bg-green-600' :
                            advance.status === 'fully_repaid' ? 'bg-green-500 hover:bg-green-600' :
                            advance.status === 'partially_repaid' ? 'bg-yellow-500 hover:bg-yellow-600' :
                            ''
                          }>
                            {advance.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm capitalize">
                          {advance.type === 'advance' ? 'Request' :
                           advance.amount < 0 ? 'Repayment' : 'Payment'}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => {
                                      setSelectedAdvance(advance.id);
                                      setIsDeleteDialogOpen(true);
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Delete</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('ttl_delete_advance_record')}</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this advance record? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => selectedAdvance && handleDeleteAdvance(selectedAdvance)}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}

