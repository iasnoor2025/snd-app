import React from 'react';
import { useTranslation } from 'react-i18next';
import { Head, Link, router } from '@inertiajs/react';
import { AppLayout } from '@/Core';
import { formatDate } from "@/utils/format";
const usePermission = () => ({ hasPermission: () => true });
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Eye } from 'lucide-react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "@/components/ui/breadcrumb";
// Placeholder type
type PageProps = any;

interface Props extends PageProps {
  overdueRequests: {
    data: Array<{
      id: number;
      employee: {
        id: number;
        first_name: string;
        last_name: string;
      };
      leave_type: string;
      start_date: string;
      end_date: string;
      status: string;
    }>;
    current_page: number;
    per_page: number;
    last_page: number;
    total: number;
  };
}

export default function OverdueLeaveReturns({ overdueRequests }: Props) {
  const { t } = useTranslation('leave');
  const { hasPermission } = usePermission();

  const getLeaveTypeName = (type: string) => {
    const leaveTypes = {
      annual: 'Annual Leave',
      sick: 'Sick Leave',
      personal: 'Personal Leave',
      unpaid: 'Unpaid Leave',
      maternity: 'Maternity Leave',
      paternity: 'Paternity Leave',
      bereavement: 'Bereavement Leave',
      other: 'Other',
    };
    return leaveTypes[type as keyof typeof leaveTypes] || type;
  };

  return (
    <AdminLayout>
      <Head title={t('overdue_leave_returns')} />
      <div className="container mx-auto py-6">
        <Breadcrumb className="mb-6">
          <BreadcrumbItem>
            <BreadcrumbLink href={route('dashboard')}>Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink href={route('leaves.requests.index')}>{t('ttl_leave_requests')}</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink>{t('overdue_returns')}</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>

        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold">{t('overdue_leave_returns')}</h1>
          </div>
          <Link href={route('leaves.requests.index')}>
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Leave Requests
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('overdue_leave_returns')}</CardTitle>
            <CardDescription>
              Employees who are overdue to return from leave
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>{t('lbl_leave_type')}</TableHead>
                    <TableHead>{t('lbl_start_date')}</TableHead>
                    <TableHead>{t('end_date')}</TableHead>
                    <TableHead>{t('th_days_overdue')}</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {overdueRequests.data.length > 0 ? (
                    overdueRequests.data.map((request) => {
                      const endDate = new Date(request.end_date);
                      const daysOverdue = Math.floor((new Date().getTime() - endDate.getTime()) / (1000 * 60 * 60 * 24));

                      return (
                        <TableRow key={request.id}>
                          <TableCell className="font-medium">
                            {request.employee.first_name} {request.employee.last_name}
                          </TableCell>
                          <TableCell>{getLeaveTypeName(request.leave_type)}</TableCell>
                          <TableCell>{formatDate(request.start_date)}</TableCell>
                          <TableCell>{formatDate(request.end_date)}</TableCell>
                          <TableCell>
                            <Badge variant="destructive">{daysOverdue} days</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {hasPermission() && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => router.get(route('leaves.requests.show', request.id))}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">
                        No overdue leave returns found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}














