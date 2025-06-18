import React, { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AdminLayout from '../../../../../../resources/js/layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../../resources/js/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../../../../resources/js/components/ui/table';
import { Button } from '../../../../../../resources/js/components/ui/button';
import { Input } from '../../../../../../resources/js/components/ui/input';
import { Select } from '../../../../../../resources/js/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../../../../resources/js/components/ui/dialog';
import RevenueChart from './RevenueChart';
// import Chart from '@/components/Chart'; // TODO: Integrate chart library

interface Stats {
  clients: number;
  equipment: number;
  rentals: number;
  invoices: number;
  payments: number;
}

interface Paginated<T> {
  data: T[];
  current_page: number;
  last_page: number;
  // ... add other pagination fields as needed
}

interface RecentActivity {
  rentals: Paginated<any>;
  invoices: Paginated<any>;
  payments: Paginated<any>;
}

interface ChartData {
  monthlyRevenue: { month: string; total: number }[];
}

interface ReportsIndexProps {
  stats: Stats;
  recentActivity: RecentActivity;
  charts: ChartData;
  filters: { date_from?: string; date_to?: string };
}

const reportTypes = [
  { value: 'clients', label: 'Clients' },
  { value: 'rentals', label: 'Rentals' },
  { value: 'invoices', label: 'Invoices' },
  { value: 'payments', label: 'Payments' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'projects', label: 'Projects' },
  { value: 'employees', label: 'Employees' },
  { value: 'timesheets', label: 'Timesheets' },
  { value: 'leaves', label: 'Leaves' },
];

const ReportsIndex: React.FC<ReportsIndexProps> = ({ stats, recentActivity, charts, filters }) => {
  // State for filters
  const [dateFrom, setDateFrom] = useState(filters.date_from || '');
  const [dateTo, setDateTo] = useState(filters.date_to || '');
  const [search, setSearch] = useState('');
  // State for custom report modal
  const [showReportModal, setShowReportModal] = useState(false);
  const [customReportType, setCustomReportType] = useState('clients');
  const [customDateFrom, setCustomDateFrom] = useState('');
  const [customDateTo, setCustomDateTo] = useState('');
  const [customColumns, setCustomColumns] = useState<string[]>([]);
  const [customFormat, setCustomFormat] = useState('table');
  // TODO: Add more filter states as needed
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Pagination and sorting state
  const [rentalsPage, setRentalsPage] = useState(1);
  const [rentalsSort, setRentalsSort] = useState<'created_at' | 'client'>('created_at');
  const [rentalsDir, setRentalsDir] = useState<'asc' | 'desc'>('desc');
  const [invoicesPage, setInvoicesPage] = useState(1);
  const [invoicesSort, setInvoicesSort] = useState<'created_at' | 'client'>('created_at');
  const [invoicesDir, setInvoicesDir] = useState<'asc' | 'desc'>('desc');
  const [paymentsPage, setPaymentsPage] = useState(1);
  const [paymentsSort, setPaymentsSort] = useState<'created_at' | 'client'>('created_at');
  const [paymentsDir, setPaymentsDir] = useState<'asc' | 'desc'>('desc');

  // Advanced filter state
  const [projectStatus, setProjectStatus] = useState('');
  const [projectClient, setProjectClient] = useState('');
  const [projectManager, setProjectManager] = useState('');
  const [equipmentStatus, setEquipmentStatus] = useState('');
  const [equipmentCategory, setEquipmentCategory] = useState('');
  const [equipmentLocation, setEquipmentLocation] = useState('');
  const [employeeDepartment, setEmployeeDepartment] = useState('');
  const [employeePosition, setEmployeePosition] = useState('');
  const [employeeStatus, setEmployeeStatus] = useState('');
  const [timesheetProject, setTimesheetProject] = useState('');
  const [timesheetApproval, setTimesheetApproval] = useState('');
  const [timesheetOvertime, setTimesheetOvertime] = useState(false);
  const [leaveStatus, setLeaveStatus] = useState('');
  const [leaveType, setLeaveType] = useState('');

  // Table reload handler
  const reloadDashboard = (params: any) => {
    setLoading(true);
    router.get('/reports', {
      rentals_page: params.rentalsPage ?? rentalsPage,
      rentals_sort: params.rentalsSort ?? rentalsSort,
      rentals_dir: params.rentalsDir ?? rentalsDir,
      invoices_page: params.invoicesPage ?? invoicesPage,
      invoices_sort: params.invoicesSort ?? invoicesSort,
      invoices_dir: params.invoicesDir ?? invoicesDir,
      payments_page: params.paymentsPage ?? paymentsPage,
      payments_sort: params.paymentsSort ?? paymentsSort,
      payments_dir: params.paymentsDir ?? paymentsDir,
    }, {
      preserveState: true,
      onFinish: () => setLoading(false),
    });
  };

  // Handlers
  const handleExport = async (type: 'csv' | 'pdf') => {
    // POST to /reports/export-dashboard and trigger download
    const res = await fetch('/reports/export-dashboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
      body: JSON.stringify({
        dateFrom: dateFrom || null,
        dateTo: dateTo || null,
        search,
        format: type,
      }),
    });
    if (!res.ok) {
      setError('Export failed');
      return;
    }
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = type === 'csv' ? 'dashboard_report.csv' : 'dashboard_report.pdf';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  const handleCustomReportGenerate = () => {
    // TODO: Implement custom report preview logic
    alert('Generating custom report preview...');
  };

  const handleCustomReportExport = async (type: 'csv' | 'pdf') => {
    let endpoint = '/reports/builder/export';
    const data = {
      reportType: customReportType,
      dateFrom: customDateFrom || null,
      dateTo: customDateTo || null,
      columns: customColumns,
      // Advanced filters
      projectStatus,
      projectClient,
      projectManager,
      equipmentStatus,
      equipmentCategory,
      equipmentLocation,
      employeeDepartment,
      employeePosition,
      employeeStatus,
      timesheetProject,
      timesheetApproval,
      timesheetOvertime,
      leaveStatus,
      leaveType,
    };
    // Route to specific endpoints if needed
    if (customReportType === 'projects') endpoint = '/reports/project/export';
    if (customReportType === 'equipment') endpoint = '/reports/equipment/export';
    if (customReportType === 'employees') endpoint = '/reports/employee/export';
    if (customReportType === 'timesheets') endpoint = '/hr/timesheets/reports/export';
    if (customReportType === 'leaves') endpoint = '/leaves/reports/export';
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
      body: JSON.stringify({
        data,
        format: type,
        filename: `custom_report_${customReportType}_${Date.now()}.${type}`,
      }),
    });
    if (!res.ok) {
      setError('Export failed');
      return;
    }
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `custom_report_${customReportType}.${type}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout title="Reports Dashboard">
      <Head title="Reports" />
      <div className="flex flex-col gap-6 p-4 md:p-8">
        {/* Filters and Actions */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
          <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} placeholder="From" className="w-40" aria-label="Filter from date" />
          <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} placeholder="To" className="w-40" aria-label="Filter to date" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="w-64" aria-label="Search" />
          <Button variant="outline" onClick={() => handleExport('csv')} aria-label="Export dashboard as CSV">Export CSV</Button>
          <Button variant="outline" onClick={() => handleExport('pdf')} aria-label="Export dashboard as PDF">Export PDF</Button>
          <Button onClick={() => setShowReportModal(true)} className="ml-auto" aria-label="Create custom report">Create Custom Report</Button>
        </div>

        {/* Summary Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader><CardTitle>Clients</CardTitle></CardHeader>
            <CardContent>
              <span className="text-2xl font-bold">{stats.clients}</span>
              <div className="text-xs text-muted-foreground">Total clients</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Equipment</CardTitle></CardHeader>
            <CardContent>
              <span className="text-2xl font-bold">{stats.equipment}</span>
              <div className="text-xs text-muted-foreground">Total equipment</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Rentals</CardTitle></CardHeader>
            <CardContent>
              <span className="text-2xl font-bold">{stats.rentals}</span>
              <div className="text-xs text-muted-foreground">Total rentals</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Invoices</CardTitle></CardHeader>
            <CardContent>
              <span className="text-2xl font-bold">{stats.invoices}</span>
              <div className="text-xs text-muted-foreground">Total invoices</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Payments</CardTitle></CardHeader>
            <CardContent>
              <span className="text-2xl font-bold">{stats.payments}</span>
              <div className="text-xs text-muted-foreground">Total payments</div>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Chart */}
        <Card>
          <CardHeader><CardTitle>Monthly Revenue</CardTitle></CardHeader>
          <CardContent>
            <RevenueChart data={charts.monthlyRevenue} />
          </CardContent>
        </Card>

        {/* Recent Activity Tables */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader><CardTitle>Recent Rentals</CardTitle></CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-24">Loading...</div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead onClick={() => { setRentalsSort('client'); setRentalsDir(rentalsDir === 'asc' ? 'desc' : 'asc'); reloadDashboard({ rentalsSort: 'client', rentalsDir: rentalsDir === 'asc' ? 'desc' : 'asc', rentalsPage: 1 }); }} style={{ cursor: 'pointer' }}>Client</TableHead>
                        <TableHead onClick={() => { setRentalsSort('created_at'); setRentalsDir(rentalsDir === 'asc' ? 'desc' : 'asc'); reloadDashboard({ rentalsSort: 'created_at', rentalsDir: rentalsDir === 'asc' ? 'desc' : 'asc', rentalsPage: 1 }); }} style={{ cursor: 'pointer' }}>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentActivity.rentals.data.map((rental: any, idx: number) => (
                        <TableRow key={idx}>
                          <TableCell>{rental.client?.company_name || '-'}</TableCell>
                          <TableCell>{rental.created_at && !isNaN(new Date(rental.created_at).getTime()) ? new Date(rental.created_at).toLocaleDateString() : '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {/* Pagination Controls */}
                  <div className="flex justify-end gap-2 mt-2">
                    <Button variant="outline" size="sm" disabled={recentActivity.rentals.current_page === 1} onClick={() => { setRentalsPage(rentalsPage - 1); reloadDashboard({ rentalsPage: rentalsPage - 1 }); }}>Prev</Button>
                    <span className="px-2">Page {recentActivity.rentals.current_page} of {recentActivity.rentals.last_page}</span>
                    <Button variant="outline" size="sm" disabled={recentActivity.rentals.current_page === recentActivity.rentals.last_page} onClick={() => { setRentalsPage(rentalsPage + 1); reloadDashboard({ rentalsPage: rentalsPage + 1 }); }}>Next</Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Recent Invoices</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                    {recentActivity.invoices.data.map((invoice, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{invoice.client?.company_name || '-'}</TableCell>
                        <TableCell>{invoice.created_at && !isNaN(new Date(invoice.created_at).getTime()) ? new Date(invoice.created_at).toLocaleDateString() : '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Recent Payments</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                    {recentActivity.payments.data.map((payment, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{payment.client?.company_name || '-'}</TableCell>
                        <TableCell>{payment.created_at && !isNaN(new Date(payment.created_at).getTime()) ? new Date(payment.created_at).toLocaleDateString() : '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Custom Report Builder Modal */}
        <Dialog open={showReportModal} onOpenChange={setShowReportModal}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Custom Report</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <label>
                Report Type
                <select value={customReportType} onChange={e => setCustomReportType(e.target.value)} className="w-full border rounded px-2 py-1 mt-1">
                  {reportTypes.map(rt => (
                    <option key={rt.value} value={rt.value}>{rt.label}</option>
                  ))}
                </select>
              </label>
              <div className="flex gap-2">
                <Input type="date" value={customDateFrom} onChange={e => setCustomDateFrom(e.target.value)} placeholder="From" className="w-1/2" />
                <Input type="date" value={customDateTo} onChange={e => setCustomDateTo(e.target.value)} placeholder="To" className="w-1/2" />
              </div>
              <label>
                Columns (comma separated)
                <Input value={customColumns.join(', ')} onChange={e => setCustomColumns(e.target.value.split(',').map(s => s.trim()))} placeholder="e.g. name, email, status" />
              </label>
              <label>
                Output Format
                <select value={customFormat} onChange={e => setCustomFormat(e.target.value)} className="w-full border rounded px-2 py-1 mt-1">
                  <option value="table">Table</option>
                  <option value="chart">Chart</option>
                  <option value="csv">CSV</option>
                  <option value="pdf">PDF</option>
                </select>
              </label>
              {/* Dynamic filters based on report type */}
              {customReportType === 'projects' && (
                <>
                  <label>
                    Status
                    <select value={projectStatus} onChange={e => setProjectStatus(e.target.value)} className="w-full border rounded px-2 py-1 mt-1">
                      <option value="">All</option>
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                      <option value="on_hold">On Hold</option>
                    </select>
                  </label>
                  <label>
                    Client
                    <Input value={projectClient} onChange={e => setProjectClient(e.target.value)} placeholder="Client Name or ID" />
                  </label>
                  <label>
                    Project Manager
                    <Input value={projectManager} onChange={e => setProjectManager(e.target.value)} placeholder="Manager Name or ID" />
                  </label>
                </>
              )}
              {customReportType === 'equipment' && (
                <>
                  <label>
                    Status
                    <select value={equipmentStatus} onChange={e => setEquipmentStatus(e.target.value)} className="w-full border rounded px-2 py-1 mt-1">
                      <option value="">All</option>
                      <option value="available">Available</option>
                      <option value="rented">Rented</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="retired">Retired</option>
                    </select>
                  </label>
                  <label>
                    Category
                    <Input value={equipmentCategory} onChange={e => setEquipmentCategory(e.target.value)} placeholder="Category" />
                  </label>
                  <label>
                    Location
                    <Input value={equipmentLocation} onChange={e => setEquipmentLocation(e.target.value)} placeholder="Location" />
                  </label>
                </>
              )}
              {customReportType === 'employees' && (
                <>
                  <label>
                    Department
                    <Input value={employeeDepartment} onChange={e => setEmployeeDepartment(e.target.value)} placeholder="Department" />
                  </label>
                  <label>
                    Position
                    <Input value={employeePosition} onChange={e => setEmployeePosition(e.target.value)} placeholder="Position" />
                  </label>
                  <label>
                    Status
                    <select value={employeeStatus} onChange={e => setEmployeeStatus(e.target.value)} className="w-full border rounded px-2 py-1 mt-1">
                      <option value="">All</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </label>
                </>
              )}
              {customReportType === 'timesheets' && (
                <>
                  <label>
                    Project
                    <Input value={timesheetProject} onChange={e => setTimesheetProject(e.target.value)} placeholder="Project Name or ID" />
                  </label>
                  <label>
                    Approval Status
                    <select value={timesheetApproval} onChange={e => setTimesheetApproval(e.target.value)} className="w-full border rounded px-2 py-1 mt-1">
                      <option value="">All</option>
                      <option value="approved">Approved</option>
                      <option value="pending">Pending</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={timesheetOvertime} onChange={e => setTimesheetOvertime(e.target.checked)} />
                    Overtime Only
                  </label>
                </>
              )}
              {customReportType === 'leaves' && (
                <>
                  <label>
                    Status
                    <select value={leaveStatus} onChange={e => setLeaveStatus(e.target.value)} className="w-full border rounded px-2 py-1 mt-1">
                      <option value="">All</option>
                      <option value="approved">Approved</option>
                      <option value="pending">Pending</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </label>
                  <label>
                    Leave Type
                    <Input value={leaveType} onChange={e => setLeaveType(e.target.value)} placeholder="Annual, Sick, etc." />
                  </label>
                </>
              )}
            </div>
            <DialogFooter className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => handleCustomReportGenerate()}>Preview</Button>
              <Button variant="outline" onClick={() => handleCustomReportExport('csv')}>Export CSV</Button>
              <Button variant="outline" onClick={() => handleCustomReportExport('pdf')}>Export PDF</Button>
              <Button onClick={() => setShowReportModal(false)} variant="secondary">Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {error && <div role="alert" className="text-red-600">{error}</div>}
      </div>
    </AdminLayout>
  );
};

// Define the component type
const RecentActivityTables: React.FC<{ recentActivity: any }> = ({ recentActivity }) => {
  return (
    <>
      <TableBody>
        {recentActivity.rentals.data.length > 0 ? (
          <>
            {recentActivity.rentals.data.map((rental: any) => (
              <TableRow key={rental.id}>
                <TableCell>{rental.client_name}</TableCell>
                <TableCell>{rental.equipment_name}</TableCell>
                <TableCell>{rental.start_date && !isNaN(new Date(rental.start_date).getTime()) ? new Date(rental.start_date).toLocaleDateString() : '-'}</TableCell>
                <TableCell>{rental.end_date && !isNaN(new Date(rental.end_date).getTime()) ? new Date(rental.end_date).toLocaleDateString() : '-'}</TableCell>
                <TableCell>{rental.total_price}</TableCell>
                <TableCell>{rental.created_at && !isNaN(new Date(rental.created_at).getTime()) ? new Date(rental.created_at).toLocaleDateString() : '-'}</TableCell>
              </TableRow>
            ))}
          </>
        ) : (
          <TableRow>
            <TableCell colSpan={6} className="text-center">No recent rentals.</TableCell>
          </TableRow>
        )}
      </TableBody>

      <TableBody>
        {recentActivity.invoices.data.length > 0 ? (
          recentActivity.invoices.data.map((invoice: any) => (
            <TableRow key={invoice.id}>
              <TableCell>{invoice.client_name}</TableCell>
              <TableCell>{invoice.invoice_number}</TableCell>
              <TableCell>{invoice.amount}</TableCell>
              <TableCell>{invoice.status}</TableCell>
              <TableCell>{invoice.created_at && !isNaN(new Date(invoice.created_at).getTime()) ? new Date(invoice.created_at).toLocaleDateString() : '-'}</TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={4} className="text-center">No recent invoices.</TableCell>
          </TableRow>
        )}
      </TableBody>

      <TableBody>
        {recentActivity.payments.data.length > 0 ? (
          recentActivity.payments.data.map((payment: any) => (
            <TableRow key={payment.id}>
              <TableCell>{payment.client_name}</TableCell>
              <TableCell>{payment.amount}</TableCell>
              <TableCell>{payment.method}</TableCell>
              <TableCell>{payment.created_at && !isNaN(new Date(payment.created_at).getTime()) ? new Date(payment.created_at).toLocaleDateString() : '-'}</TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={4} className="text-center">No recent payments.</TableCell>
          </TableRow>
        )}
      </TableBody>
    </>
  );
};

// Export the component
export default ReportsIndex;
