<?php
namespace Modules\Core\Http\Controllers;

use Modules\RentalManagement\Domain\Models\Customer;
use Modules\EquipmentManagement\Domain\Models\Equipment;
use Modules\RentalManagement\Domain\Models\Invoice;
use Modules\RentalManagement\Domain\Models\Payment;
use Modules\RentalManagement\Domain\Models\Rental;
use Modules\EquipmentManagement\Domain\Models\MaintenanceRecord;
use Modules\EmployeeManagement\Domain\Models\Employee;
use Modules\Core\Domain\Models\User;
use Modules\Core\Domain\Models\Role;
use Modules\LeaveManagement\Domain\Models\LeaveRequest;
use Modules\TimesheetManagement\Domain\Models\Timesheet;
use Modules\Core\Domain\Models\Location;
use Modules\ProjectManagement\Domain\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Display the dashboard.
     */
    public function index()
    {
        $user = auth()->user();
        $isAdmin = $user->hasRole('admin');
        $isAccountant = $user->hasRole('accountant');
        $isManager = $user->hasRole('manager');

        // Common data for all roles
        $commonData = [
            'stats' => $this->getCommonStats(),
            'recentLeaveRequests' => $this->getRecentLeaveRequests(),
            'recentTimesheets' => $this->getRecentTimesheets(),
        ];

        // Role-specific data
        $adminData = $isAdmin ? [
            'stats' => $this->getAdminStats(),
            'recentRentals' => $this->getRecentRentals(),
            'recentInvoices' => $this->getRecentInvoices(),
            'recentPayments' => $this->getRecentPayments(),
            'monthlyRevenue' => $this->getMonthlyRevenue(),
            'equipmentStatus' => $this->getEquipmentStatus(),
        ] : null;

        $accountantData = $isAccountant ? [
            'stats' => $this->getAccountantStats(),
            'recentInvoices' => $this->getRecentInvoices(),
            'recentPayments' => $this->getRecentPayments(),
            'monthlyRevenue' => $this->getMonthlyRevenue(),
        ] : null;

        $managerData = $isManager ? [
            'stats' => $this->getManagerStats(),
            'recentRentals' => $this->getRecentRentals(),
            'recentInvoices' => $this->getRecentInvoices(),
            'equipmentStatus' => $this->getEquipmentStatus(),
        ] : null;

        $employeeData = [
            'stats' => $this->getEmployeeStats($user->id),
            'recentLeaveRequests' => $this->getEmployeeLeaveRequests($user->id),
            'recentTimesheets' => $this->getEmployeeTimesheets($user->id),
        ];

        return Inertia::render('Dashboard', [
            'adminData' => $adminData,
            'accountantData' => $accountantData,
            'managerData' => $managerData,
            'employeeData' => $employeeData,
        ]);
    }

    private function getCommonStats()
    {
        return [
            'employees' => Employee::count(),
            'users' => User::count(),
            'leaveRequests' => LeaveRequest::count(),
            'timesheets' => Timesheet::count(),
        ];
    }

    private function getAdminStats()
    {
        return [
            'clients' => Customer::count(),
            'equipment' => Equipment::count(),
            'rentals' => Rental::count(),
            'invoices' => Invoice::count(),
            'payments' => Payment::count(),
            'maintenance' => MaintenanceRecord::count(),
            'locations' => Location::count(),
            'roles' => Role::count(),
            'projects' => Project::count(),
        ];
    }

    private function getAccountantStats()
    {
        return [
            'invoices' => Invoice::count(),
            'payments' => Payment::count(),
            'totalRevenue' => Payment::sum('amount'),
            'pendingInvoices' => Invoice::whereIn('status', ['sent', 'overdue'])->count(),
            'pendingAmount' => Invoice::whereIn('status', ['sent', 'overdue'])->sum('total_amount')
        ];
    }

    private function getManagerStats()
    {
        return [
            'clients' => Customer::count(),
            'equipment' => Equipment::count(),
            'rentals' => Rental::count(),
            'maintenance' => MaintenanceRecord::count(),
            'projects' => Project::count(),
        ];
    }

    private function getEmployeeStats($employeeId)
    {
        return [
            'leaveRequests' => LeaveRequest::where('employee_id', $employeeId)->count(),
            'timesheets' => Timesheet::where('employee_id', $employeeId)->count(),
            'pendingLeaveRequests' => LeaveRequest::where('employee_id', $employeeId)
                ->where('status', 'pending')
                ->count(),
            'approvedLeaveRequests' => LeaveRequest::where('employee_id', $employeeId)
                ->where('status', 'approved')
                ->count(),
        ];
    }

    private function getRecentRentals()
    {
        return Rental::with('client')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($rental) {
                return [
                    'id' => $rental->id,
                    'rental_number' => $rental->rental_number,
                    'client_name' => $rental->client ? $rental->customer->company_name : 'Unknown Client',
                    'start_date' => $rental->start_date,
                    'status' => $rental->status,
                    'total_amount' => $rental->total_amount,
                ];
            });
    }

    private function getRecentInvoices()
    {
        return Invoice::with('client')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($invoice) {
                return [
                    'id' => $invoice->id,
                    'invoice_number' => $invoice->invoice_number,
                    'client_name' => $invoice->client ? $invoice->customer->company_name : 'Unknown Client',
                    'invoice_date' => $invoice->issue_date ?? $invoice->invoice_date,
                    'status' => $invoice->status,
                    'total_amount' => $invoice->total_amount,
                ];
            });
    }

    private function getRecentPayments()
    {
        return Payment::with(['client', 'invoice'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($payment) {
                return [
                    'id' => $payment->id,
                    'payment_number' => $payment->payment_number,
                    'client_name' => $payment->client ? $payment->customer->company_name : 'Unknown Client',
                    'invoice_number' => $payment->invoice ? $payment->invoice->invoice_number : 'Unknown Invoice',
                    'payment_date' => $payment->payment_date,
                    'amount' => $payment->amount,
                ];
            });
    }

    private function getRecentLeaveRequests()
    {
        return LeaveRequest::with('employee')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($leave) {
                return [
                    'id' => $leave->id,
                    'employee_name' => $leave->employee ? $leave->employee->first_name . ' ' . $leave->employee->last_name : 'Unknown Employee',
                    'start_date' => $leave->start_date,
                    'end_date' => $leave->end_date,
                    'status' => $leave->status,
                    'type' => $leave->leave_type,
                ];
            });
    }

    private function getEmployeeLeaveRequests($employeeId)
    {
        return LeaveRequest::where('employee_id', $employeeId)
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($leave) {
                return [
                    'id' => $leave->id,
                    'start_date' => $leave->start_date,
                    'end_date' => $leave->end_date,
                    'status' => $leave->status,
                    'type' => $leave->leave_type,
                ];
            });
    }

    private function getRecentTimesheets()
    {
        return Timesheet::with('employee')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($timesheet) {
                return [
                    'id' => $timesheet->id,
                    'employee_name' => $timesheet->employee ? $timesheet->employee->first_name . ' ' . $timesheet->employee->last_name : 'Unknown Employee',
                    'date' => $timesheet->date,
                    'hours' => $timesheet->hours_worked + $timesheet->overtime_hours,
                    'status' => $timesheet->status ?? 'Submitted',
                ];
            });
    }

    private function getEmployeeTimesheets($employeeId)
    {
        return Timesheet::where('employee_id', $employeeId)
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($timesheet) {
                return [
                    'id' => $timesheet->id,
                    'date' => $timesheet->date,
                    'hours' => $timesheet->hours_worked + $timesheet->overtime_hours,
                    'status' => $timesheet->status ?? 'Submitted',
                ];
            });
    }

    private function getMonthlyRevenue()
    {
        return Payment::selectRaw('EXTRACT(MONTH FROM payment_date) as month, EXTRACT(YEAR FROM payment_date) as year, SUM(amount) as total')
            ->whereRaw('payment_date >= CURRENT_DATE - INTERVAL \'12 months\'')
            ->groupBy('year', 'month')
            ->orderBy('year')
            ->orderBy('month')
            ->get()
            ->map(function ($item) {
                return [
                    'month' => date('M Y', mktime(0, 0, 0, (int)$item->month, 1, (int)$item->year)),
                    'total' => $item->total,
                ];
            });
    }

    private function getEquipmentStatus()
    {
        return Equipment::selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->get()
            ->map(function ($item) {
                return [
                    'status' => $item->status,
                    'count' => $item->count,
                ];
            });
    }

    /**
     * Get dashboard statistics.
     */
    public function stats()
    {
        try {
            // Get counts
            $clientCount = Customer::count();
            $equipmentCount = Equipment::count();
            $rentalCount = Rental::count();
            $invoiceCount = Invoice::count();
            $paymentCount = Payment::count();
            $maintenanceCount = MaintenanceRecord::count();
            $employeeCount = Employee::count();

            // Get total revenue
            $totalRevenue = Payment::sum('amount');

            // Get pending invoices amount
            $pendingInvoicesAmount = Invoice::whereIn('status', ['sent', 'overdue'])
                ->sum('total_amount');

            // Get equipment status counts
            $equipmentStatus = Equipment::selectRaw('status, COUNT(*) as count')
                ->groupBy('status')
                ->get()
                ->pluck('count', 'status')
                ->toArray();

            // Get rental status counts
            $rentalStatus = Rental::selectRaw('status, COUNT(*) as count')
                ->groupBy('status')
                ->get()
                ->pluck('count', 'status')
                ->toArray();

            // Get monthly revenue for the last 12 months
            $monthlyRevenue = Payment::selectRaw('EXTRACT(MONTH FROM payment_date) as month, EXTRACT(YEAR FROM payment_date) as year, SUM(amount) as total')
                ->whereRaw('payment_date >= CURRENT_DATE - INTERVAL \'12 months\'')
                ->groupBy('year', 'month')
                ->orderBy('year')
                ->orderBy('month')
                ->get()
                ->map(function ($item) {
                    return [
                        'month' => date('M Y', mktime(0, 0, 0, (int)$item->month, 1, (int)$item->year)),
                        'total' => $item->total,
                    ];
                });
        } catch (\Exception $e) {
            // If there's an error, provide default values
            $clientCount = 0;
            $equipmentCount = 0;
            $rentalCount = 0;
            $invoiceCount = 0;
            $paymentCount = 0;
            $maintenanceCount = 0;
            $employeeCount = 0;
            $totalRevenue = 0;
            $pendingInvoicesAmount = 0;
            $equipmentStatus = [];
            $rentalStatus = [];
            $monthlyRevenue = [];
        }

        return response()->json([
            'counts' => [
                'clients' => $clientCount,
                'equipment' => $equipmentCount,
                'rentals' => $rentalCount,
                'invoices' => $invoiceCount,
                'payments' => $paymentCount,
                'maintenance' => $maintenanceCount,
                'employees' => $employeeCount,
            ],
            'financial' => [
                'total_revenue' => $totalRevenue,
                'pending_invoices' => $pendingInvoicesAmount,
            ],
            'equipment_status' => $equipmentStatus,
            'rental_status' => $rentalStatus,
            'monthly_revenue' => $monthlyRevenue,
        ]);
    }

    private function getLeaveRequests()
    {
        return LeaveRequest::with('employee:id,first_name,last_name')
            ->where('status', 'approved')
            ->where('start_date', '<=', now())
            ->where('end_date', '>=', now())
            ->get();
    }

    private function getTimesheets()
    {
        return Timesheet::with('employee:id,first_name,last_name')
            ->where('date', now()->format('Y-m-d'))
            ->get();
    }
}


