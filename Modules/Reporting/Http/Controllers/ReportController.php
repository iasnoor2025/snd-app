<?php

namespace Modules\Reporting\Http\Controllers;

use Modules\CustomerManagement\Domain\Models\Customer;
use Modules\EquipmentManagement\Domain\Models\Equipment;
use Modules\RentalManagement\Domain\Models\Invoice;
use Modules\RentalManagement\Domain\Models\Payment;
use Modules\RentalManagement\Domain\Models\Rental;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use App\Http\Controllers\Controller;
use Carbon\Carbon;
use Modules\LeaveManagement\Domain\Models\Leave;

class ReportController extends Controller
{
    /**
     * Display the reports dashboard.
     */
    public function index(Request $request)
    {
        // Get rental statistics
        $rentalStats = [
            'total' => Rental::count(),
            'active' => Rental::where('status', 'active')->count(),
            'completed' => Rental::where('status', 'completed')->count(),
            'total_amount' => DB::table('rental_items')->sum('total_amount'),
        ];

        // Get leave statistics
        $leaveStats = [
            'total' => Leave::count(),
            'approved' => Leave::where('status', 'approved')->count(),
            'pending' => Leave::where('status', 'pending')->count(),
            'rejected' => Leave::where('status', 'rejected')->count(),
        ];

        // Get equipment statistics
        $equipmentStats = [
            'total' => Equipment::count(),
            'available' => Equipment::where('status', 'available')->count(),
            'rented' => Equipment::where('status', 'rented')->count(),
            'maintenance' => Equipment::where('status', 'maintenance')->count(),
        ];

        // Get revenue statistics
        $revenueStats = [
            'total' => DB::table('payments')->sum('amount'),
            'monthly' => DB::table('payments')
                ->whereMonth('created_at', Carbon::now()->month)
                ->whereYear('created_at', Carbon::now()->year)
                ->sum('amount'),
            'yearly' => DB::table('payments')
                ->whereYear('created_at', Carbon::now()->year)
                ->sum('amount'),
        ];

        // Get monthly revenue data for chart
        $monthlyRevenue = DB::table('payments')
            ->selectRaw('TO_CHAR(created_at, \'YYYY-MM\') as month, SUM(amount) as total')
            ->groupBy('month')
            ->orderBy('month', 'asc')
            ->limit(12)
            ->get();

        // Get leave distribution data for chart - Fixed to use proper join
        $leaveDistribution = DB::table('leaves')
            ->join('leave_types', 'leaves.leave_type_id', '=', 'leave_types.id')
            ->select('leave_types.name as type', DB::raw('COUNT(*) as count'))
            ->groupBy('leave_types.id', 'leave_types.name')
            ->get();

        // Get equipment status distribution for chart
        $equipmentStatus = DB::table('equipment')
            ->select('status', DB::raw('COUNT(*) as count'))
            ->groupBy('status')
            ->get();

        // Get rentals with filters
        $rentalsQuery = Rental::with(['customer', 'rentalItems'])
            ->select(
                'rentals.*',
                DB::raw('(SELECT COUNT(*) FROM rental_items WHERE rental_items.rental_id = rentals.id) as items_count'),
                DB::raw('(SELECT SUM(total_amount) FROM rental_items WHERE rental_items.rental_id = rentals.id) as total_amount')
            );

        if ($request->has('search')) {
            $search = $request->input('search');
            $rentalsQuery->where(function ($q) use ($search) {
                $q->where('rental_number', 'like', "%{$search}%")
                    ->orWhereHas('customer', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%");
                    });
            });
        }

        if ($request->has('status')) {
            $rentalsQuery->where('status', $request->input('status'));
        }

        if ($request->has('date_from')) {
            $rentalsQuery->whereDate('start_date', '>=', $request->input('date_from'));
        }

        if ($request->has('date_to')) {
            $rentalsQuery->whereDate('end_date', '<=', $request->input('date_to'));
        }

        $rentals = $rentalsQuery
            ->orderBy($request->input('sort_field', 'created_at'), $request->input('sort_direction', 'desc'))
            ->paginate(15);

        // Get leaves with filters - Updated to include leave type relationship
        $leavesQuery = Leave::with(['employee', 'employee.department', 'leaveType'])
            ->select('leaves.*');

        if ($request->has('search')) {
            $search = $request->input('search');
            $leavesQuery->whereHas('employee', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            });
        }

        if ($request->has('department')) {
            $leavesQuery->whereHas('employee.department', function ($q) use ($request) {
                $q->where('name', $request->input('department'));
            });
        }

        if ($request->has('status')) {
            $leavesQuery->where('status', $request->input('status'));
        }

        $leaves = $leavesQuery
            ->orderBy($request->input('sort_field', 'created_at'), $request->input('sort_direction', 'desc'))
            ->paginate(15);

        return Inertia::render('Reports/Index', [
            'stats' => [
                'rentals' => $rentalStats,
                'leaves' => $leaveStats,
                'equipment' => $equipmentStats,
                'revenue' => $revenueStats,
            ],
            'rentals' => $rentals,
            'leaves' => $leaves,
            'charts' => [
                'monthlyRevenue' => $monthlyRevenue,
                'leaveDistribution' => $leaveDistribution,
                'equipmentStatus' => $equipmentStatus,
            ],
            'filters' => $request->only([
                'report_type',
                'search',
                'status',
                'date_from',
                'date_to',
                'department',
                'sort_field',
                'sort_direction',
            ]),
        ]);
    }

    public function dashboard()
    {
        // Get counts from various modules
        $clientCount = DB::table('customers')->count();
        $equipmentCount = DB::table('equipment')->count();
        $rentalCount = DB::table('rentals')->count();
        $invoiceCount = DB::table('invoices')->count();
        $paymentCount = DB::table('payments')->count();
        $employeeCount = DB::table('employees')->count();
        $projectCount = DB::table('projects')->count();
        $timesheetCount = DB::table('timesheets')->count();
        $leaveRequestCount = DB::table('leaves')->count();

        // Get recent activity
        $recentRentals = DB::table('rentals')
            ->join('customers', 'rentals.customer_id', '=', 'customers.id')
            ->select('rentals.*', 'customers.name as customer_name')
            ->orderBy('rentals.created_at', 'desc')
            ->limit(5)
            ->get();

        $recentInvoices = DB::table('invoices')
            ->join('customers', 'invoices.customer_id', '=', 'customers.id')
            ->select('invoices.*', 'customers.name as customer_name')
            ->orderBy('invoices.created_at', 'desc')
            ->limit(5)
            ->get();

        $recentPayments = DB::table('payments')
            ->join('customers', 'payments.customer_id', '=', 'customers.id')
            ->select('payments.*', 'customers.name as customer_name')
            ->orderBy('payments.created_at', 'desc')
            ->limit(5)
            ->get();

        // Get monthly revenue data for chart
        $monthlyRevenue = DB::table('payments')
            ->select(DB::raw('DATE_FORMAT(created_at, "%Y-%m") as month'), DB::raw('SUM(amount) as total'))
            ->groupBy('month')
            ->orderBy('month', 'asc')
            ->limit(12)
            ->get();

        return Inertia::render('Reporting::Reports/Dashboard', [
            'stats' => [
                'clients' => $clientCount,
                'equipment' => $equipmentCount,
                'rentals' => $rentalCount,
                'invoices' => $invoiceCount,
                'payments' => $paymentCount,
                'employees' => $employeeCount,
                'projects' => $projectCount,
                'timesheets' => $timesheetCount,
                'leaves' => $leaveRequestCount,
            ],
            'recentActivity' => [
                'rentals' => [
                    'data' => $recentRentals,
                    'current_page' => 1,
                    'last_page' => 1,
                ],
                'invoices' => [
                    'data' => $recentInvoices,
                    'current_page' => 1,
                    'last_page' => 1,
                ],
                'payments' => [
                    'data' => $recentPayments,
                    'current_page' => 1,
                    'last_page' => 1,
                ],
            ],
            'charts' => [
                'monthlyRevenue' => $monthlyRevenue->map(function ($item) {
                    return [
                        'month' => $item->month,
                        'total' => (float) $item->total,
                    ];
                }),
            ],
            'filters' => request()->only(['date_from', 'date_to']),
        ]);
    }

    /**
     * Generate client reports.
     */
    public function clients(Request $request)
    {
        $query = Customer::query();

        // Apply filters
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('contact_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->has('status') && $request->input('status')) {
            $query->where('is_active', $request->input('status') === 'active');
        }

        // Get clients with rental and invoice counts
        $clients = $query->withCount(['rentals', 'invoices'])
            ->withSum('invoices', 'total_amount')
            ->withSum('payments', 'amount')
            ->orderBy($request->input('sort_field', 'name'), $request->input('sort_direction', 'asc'))
            ->paginate(15)
            ->withQueryString();

        // Get summary data
        $summary = [
            'total_clients' => Customer::count(),
            'active_clients' => Customer::where('is_active', true)->count(),
            'inactive_clients' => Customer::where('is_active', false)->count(),
            'total_revenue' => Invoice::sum('total_amount'),
            'total_paid' => Payment::sum('amount'),
        ];

        return Inertia::render('Reports/Clients', [
            'clients' => $clients,
            'summary' => $summary,
            'filters' => $request->only(['search', 'status', 'sort_field', 'sort_direction'])
        ]);
    }

    /**
     * Generate rental reports.
     */
    public function rentals(Request $request)
    {
        $query = Rental::with(['customer', 'rentalItems'])
            ->select(
                'rentals.*',
                DB::raw('(SELECT COUNT(*) FROM rental_items WHERE rental_items.rental_id = rentals.id) as items_count'),
                DB::raw('(SELECT SUM(total_amount) FROM rental_items WHERE rental_items.rental_id = rentals.id) as total_amount')
            );

        // Apply filters
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('rental_number', 'like', "%{$search}%")
                    ->orWhereHas('customer', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%");
                    });
            });
        }

        if ($request->has('status') && $request->input('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->has('start_date')) {
            $query->whereDate('start_date', '>=', $request->input('start_date'));
        }

        if ($request->has('end_date')) {
            $query->whereDate('end_date', '<=', $request->input('end_date'));
        }

        // Get rentals with pagination
        $rentals = $query->orderBy($request->input('sort_field', 'created_at'), $request->input('sort_direction', 'desc'))
            ->paginate(15)
            ->withQueryString();

        // Get summary data
        $summary = [
            'total_rentals' => Rental::count(),
            'active_rentals' => Rental::where('status', 'active')->count(),
            'completed_rentals' => Rental::where('status', 'completed')->count(),
            'total_amount' => DB::table('rental_items')->sum('total_amount'),
        ];

        return Inertia::render('Reports/Rentals', [
            'rentals' => $rentals,
            'summary' => $summary,
            'filters' => $request->only(['search', 'status', 'start_date', 'end_date', 'sort_field', 'sort_direction'])
        ]);
    }

    /**
     * Generate invoice reports.
     */
    public function invoices(Request $request)
    {
        $query = Invoice::with('client');

        // Apply filters
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where('invoice_number', 'like', "%{$search}%")
                ->orWhereHas('client', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%");
                });
        }

        if ($request->has('status') && $request->input('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->has('start_date')) {
            $query->whereDate('invoice_date', '>=', $request->input('start_date'));
        }

        if ($request->has('end_date')) {
            $query->whereDate('due_date', '<=', $request->input('end_date'));
        }

        // Get invoices
        $invoices = $query->orderBy($request->input('sort_field', 'invoice_date'), $request->input('sort_direction', 'desc'))
            ->paginate(15)
            ->withQueryString();

        // Get summary data
        $summary = [
            'total_invoices' => Invoice::count(),
            'paid_invoices' => Invoice::where('status', 'paid')->count(),
            'overdue_invoices' => Invoice::where('status', 'overdue')->count(),
            'total_amount' => Invoice::sum('total_amount'),
            'total_paid' => Invoice::sum('amount_paid'),
            'total_outstanding' => Invoice::sum('total_amount') - Invoice::sum('amount_paid'),
        ];

        // Get status distribution for chart
        $statusDistribution = Invoice::select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get();

        return Inertia::render('Reports/Invoices', [
            'invoices' => $invoices,
            'summary' => $summary,
            'charts' => [
                'statusDistribution' => $statusDistribution
            ],
            'filters' => $request->only(['search', 'status', 'start_date', 'end_date', 'sort_field', 'sort_direction'])
        ]);
    }

    /**
     * Generate payment reports.
     */
    public function payments(Request $request)
    {
        $query = Payment::with(['client', 'invoice']);

        // Apply filters
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where('payment_number', 'like', "%{$search}%")
                ->orWhereHas('client', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%");
                })
                ->orWhereHas('invoice', function ($q) use ($search) {
                    $q->where('invoice_number', 'like', "%{$search}%");
                });
        }

        if ($request->has('payment_method') && $request->input('payment_method')) {
            $query->where('payment_method', $request->input('payment_method'));
        }

        if ($request->has('start_date')) {
            $query->whereDate('payment_date', '>=', $request->input('start_date'));
        }

        if ($request->has('end_date')) {
            $query->whereDate('payment_date', '<=', $request->input('end_date'));
        }

        // Get payments
        $payments = $query->orderBy($request->input('sort_field', 'payment_date'), $request->input('sort_direction', 'desc'))
            ->paginate(15)
            ->withQueryString();

        // Get summary data
        $summary = [
            'total_payments' => Payment::count(),
            'total_amount' => Payment::sum('amount'),
            'payment_methods' => Payment::select('payment_method', DB::raw('count(*) as count'), DB::raw('sum(amount) as total'))
                ->groupBy('payment_method')
                ->get(),
        ];

        // Get monthly payments for chart
        $monthlyPayments = Payment::selectRaw('EXTRACT(MONTH FROM payment_date) as month, EXTRACT(YEAR FROM payment_date) as year, SUM(amount) as total')
            ->whereRaw('EXTRACT(YEAR FROM payment_date) = ?', [date('Y')])
            ->groupBy('year', 'month')
            ->orderBy('year')
            ->orderBy('month')
            ->get()
            ->map(function ($item) {
                return [
                    'month' => date('F', mktime(0, 0, 0, $item->month, 1)),
                    'total' => $item->total,
                ];
            });

        return Inertia::render('Reports/Payments', [
            'payments' => $payments,
            'summary' => $summary,
            'charts' => [
                'monthlyPayments' => $monthlyPayments
            ],
            'filters' => $request->only(['search', 'payment_method', 'start_date', 'end_date', 'sort_field', 'sort_direction'])
        ]);
    }

    /**
     * Generate equipment reports.
     */
    public function equipment(Request $request)
    {
        $query = Equipment::query();

        // Apply filters
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('model', 'like', "%{$search}%")
                    ->orWhere('serial_number', 'like', "%{$search}%");
            });
        }

        if ($request->has('status') && $request->input('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->has('category') && $request->input('category')) {
            $query->where('category', $request->input('category'));
        }

        // Get equipment with rental counts
        $equipment = $query->withCount(['rentalItems as rental_count' => function ($query) {
                $query->whereHas('rental', function ($q) {
                    $q->where('status', 'active');
                });
            }])
            ->orderBy($request->input('sort_field', 'name'), $request->input('sort_direction', 'asc'))
            ->paginate(15)
            ->withQueryString();

        // Get summary data
        $summary = [
            'total_equipment' => Equipment::count(),
            'available_equipment' => Equipment::where('status', 'available')->count(),
            'rented_equipment' => Equipment::where('status', 'rented')->count(),
            'maintenance_equipment' => Equipment::where('status', 'maintenance')->count(),
            'retired_equipment' => Equipment::where('status', 'retired')->count(),
        ];

        // Get category distribution for chart
        $categoryDistribution = Equipment::select('category', DB::raw('count(*) as count'))
            ->groupBy('category')
            ->get();

        // Get status distribution for chart
        $statusDistribution = Equipment::select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get();

        return Inertia::render('Reports/Equipment', [
            'equipment' => $equipment,
            'summary' => $summary,
            'charts' => [
                'categoryDistribution' => $categoryDistribution,
                'statusDistribution' => $statusDistribution,
            ],
            'filters' => $request->only(['search', 'status', 'category', 'sort_field', 'sort_direction'])
        ]);
    }

    public function leaves(Request $request)
    {
        // Get leave data with filters
        $leavesQuery = Leave::with(['employee', 'leaveType'])
            ->select(
                'leaves.*',
                DB::raw('DATEDIFF(leaves.end_date, leaves.start_date) + 1 as days')
            );

        if ($request->has('search')) {
            $search = $request->input('search');
            $leavesQuery->whereHas('employee', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('employee_id', 'like', "%{$search}%");
            });
        }

        if ($request->has('department')) {
            $department = $request->input('department');
            $leavesQuery->whereHas('employee.department', function ($q) use ($department) {
                $q->where('name', $department);
            });
        }

        if ($request->has('leave_type')) {
            $leavesQuery->where('leave_type_id', $request->input('leave_type'));
        }

        if ($request->has('status')) {
            $leavesQuery->where('status', $request->input('status'));
        }

        if ($request->has('start_date')) {
            $leavesQuery->whereDate('start_date', '>=', $request->input('start_date'));
        }

        if ($request->has('end_date')) {
            $leavesQuery->whereDate('end_date', '<=', $request->input('end_date'));
        }

        $leaves = $leavesQuery
            ->orderBy($request->input('sort_field', 'created_at'), $request->input('sort_direction', 'desc'))
            ->paginate(15);

        // Get summary statistics
        $totalLeaves = Leave::count();
        $approvedLeaves = Leave::where('status', 'approved')->count();
        $pendingLeaves = Leave::where('status', 'pending')->count();
        $rejectedLeaves = Leave::where('status', 'rejected')->count();
        $totalDays = Leave::selectRaw('SUM(DATEDIFF(end_date, start_date) + 1) as total_days')->first()->total_days ?? 0;

        // Get departments and leave types for filters
        $departments = DB::table('departments')->select('id', 'name')->get();
        $leaveTypes = DB::table('leave_types')->select('id', 'name')->get();

        return Inertia::render('Reporting::Reports/Leaves', [
            'leaves' => $leaves,
            'summary' => [
                'total_leaves' => $totalLeaves,
                'approved_leaves' => $approvedLeaves,
                'pending_leaves' => $pendingLeaves,
                'rejected_leaves' => $rejectedLeaves,
                'total_days' => $totalDays,
            ],
            'departments' => $departments,
            'leaveTypes' => $leaveTypes,
            'filters' => $request->only([
                'search',
                'status',
                'department',
                'leave_type',
                'start_date',
                'end_date',
                'sort_field',
                'sort_direction',
            ]),
        ]);
    }

    public function revenue()
    {
        $startDate = Carbon::now()->subMonths(6);
        
        $topCustomers = DB::table('payments')
            ->join('customers', 'payments.customer_id', '=', 'customers.id')
            ->select('customers.name', DB::raw('SUM(payments.amount) as total'))
            ->where('payment_date', '>=', $startDate)
            ->groupBy('customers.name')
            ->orderBy('total', 'desc')
            ->limit(10)
            ->get();

        return Inertia::render('Reports/Revenue', [
            'topCustomers' => $topCustomers
        ]);
    }

    /**
     * Export the dashboard report as CSV or PDF.
     */
    public function exportDashboard(Request $request)
    {
        // Accept filters (date range, search, etc.)
        $dateFrom = $request->input('dateFrom');
        $dateTo = $request->input('dateTo');
        $search = $request->input('search');
        $format = $request->input('format', 'csv');

        // For demo, just export the same stats as CSV
        $clientCount = Customer::count();
        $equipmentCount = Equipment::count();
        $rentalCount = Rental::count();
        $invoiceCount = Invoice::count();
        $paymentCount = Payment::count();

        $csv = "Metric,Value\n";
        $csv .= "Clients,$clientCount\n";
        $csv .= "Equipment,$equipmentCount\n";
        $csv .= "Rentals,$rentalCount\n";
        $csv .= "Invoices,$invoiceCount\n";
        $csv .= "Payments,$paymentCount\n";

        $filename = 'dashboard_report_' . date('Ymd_His') . '.csv';
        return response($csv)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', "attachment; filename=\"$filename\"");
    }

    public function exportCustomReport(Request $request)
    {
        // ... existing exportCustomReport code ...
    }

    public function export(Request $request)
    {
        $type = $request->input('type', 'overview');
        $format = $request->input('format', 'csv');
        $dateFrom = $request->input('date_from');
        $dateTo = $request->input('date_to');
        $search = $request->input('search');

        // Generate data based on report type
        $data = $this->generateReportData($type, $dateFrom, $dateTo, $search);
        
        // Export based on format
        switch ($format) {
            case 'pdf':
                return $this->exportToPDF($data, $type);
            case 'excel':
                return $this->exportToExcel($data, $type);
            case 'csv':
            default:
                return $this->exportToCSV($data, $type);
        }
    }

    /**
     * Generate report data based on type
     */
    private function generateReportData($type, $dateFrom = null, $dateTo = null, $search = null)
    {
        switch ($type) {
            case 'clients':
                return $this->getClientsReportData($dateFrom, $dateTo, $search);
            case 'rentals':
                return $this->getRentalsReportData($dateFrom, $dateTo, $search);
            case 'equipment':
                return $this->getEquipmentReportData($dateFrom, $dateTo, $search);
            case 'payments':
                return $this->getPaymentsReportData($dateFrom, $dateTo, $search);
            case 'overview':
            default:
                return $this->getOverviewReportData($dateFrom, $dateTo);
        }
    }

    /**
     * Export data to CSV
     */
    private function exportToCSV($data, $type)
    {
        $filename = "{$type}_report_" . date('Ymd_His') . '.csv';
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"$filename\"",
        ];

        $callback = function () use ($data) {
            $file = fopen('php://output', 'w');
            
            // Write headers
            if (!empty($data)) {
                fputcsv($file, array_keys($data[0]));
                
                // Write data rows
                foreach ($data as $row) {
                    fputcsv($file, $row);
                }
            }
            
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Export data to Excel
     */
    private function exportToExcel($data, $type)
    {
        // For now, return CSV with Excel headers
        $filename = "{$type}_report_" . date('Ymd_His') . '.xlsx';
        $headers = [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => "attachment; filename=\"$filename\"",
        ];

        $callback = function () use ($data) {
            $file = fopen('php://output', 'w');
            
            // Write headers
            if (!empty($data)) {
                fputcsv($file, array_keys($data[0]));
                
                // Write data rows
                foreach ($data as $row) {
                    fputcsv($file, $row);
                }
            }
            
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Export data to PDF
     */
    private function exportToPDF($data, $type)
    {
        $filename = "{$type}_report_" . date('Ymd_His') . '.pdf';
        
        // Create simple HTML for PDF generation
        $html = '<html><head><title>' . ucfirst($type) . ' Report</title></head><body>';
        $html .= '<h1>' . ucfirst($type) . ' Report</h1>';
        $html .= '<p>Generated on: ' . date('Y-m-d H:i:s') . '</p>';
        
        if (!empty($data)) {
            $html .= '<table border="1" cellpadding="5" cellspacing="0">';
            $html .= '<thead><tr>';
            foreach (array_keys($data[0]) as $header) {
                $html .= '<th>' . ucfirst(str_replace('_', ' ', $header)) . '</th>';
            }
            $html .= '</tr></thead><tbody>';
            
            foreach ($data as $row) {
                $html .= '<tr>';
                foreach ($row as $cell) {
                    $html .= '<td>' . htmlspecialchars($cell) . '</td>';
                }
                $html .= '</tr>';
            }
            $html .= '</tbody></table>';
        }
        
        $html .= '</body></html>';

        return response($html, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => "attachment; filename=\"$filename\"",
        ]);
    }

    /**
     * Get overview report data
     */
    private function getOverviewReportData($dateFrom = null, $dateTo = null)
    {
        return [
            [
                'metric' => 'Total Clients',
                'value' => Customer::count(),
                'date' => date('Y-m-d')
            ],
            [
                'metric' => 'Total Equipment',
                'value' => Equipment::count(),
                'date' => date('Y-m-d')
            ],
            [
                'metric' => 'Active Rentals',
                'value' => Rental::where('status', 'active')->count(),
                'date' => date('Y-m-d')
            ],
            [
                'metric' => 'Total Revenue',
                'value' => Payment::sum('amount'),
                'date' => date('Y-m-d')
            ]
        ];
    }

    /**
     * Get clients report data
     */
    private function getClientsReportData($dateFrom = null, $dateTo = null, $search = null)
    {
        $query = Customer::query();
        
        if ($search) {
            $query->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
        }
        
        if ($dateFrom) {
            $query->whereDate('created_at', '>=', $dateFrom);
        }
        
        if ($dateTo) {
            $query->whereDate('created_at', '<=', $dateTo);
        }

        return $query->get()->map(function ($customer) {
            return [
                'id' => $customer->id,
                'name' => $customer->name,
                'email' => $customer->email,
                'phone' => $customer->phone,
                'created_at' => $customer->created_at?->format('Y-m-d H:i:s')->format('Y-m-d'),
                'total_rentals' => $customer->rentals()->count(),
                'total_payments' => $customer->payments()->sum('amount')
            ];
        })->toArray();
    }

    /**
     * Get rentals report data
     */
    private function getRentalsReportData($dateFrom = null, $dateTo = null, $search = null)
    {
        $query = Rental::with(['customer', 'equipment']);
        
        if ($search) {
            $query->whereHas('customer', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            });
        }
        
        if ($dateFrom) {
            $query->whereDate('start_date', '>=', $dateFrom);
        }
        
        if ($dateTo) {
            $query->whereDate('end_date', '<=', $dateTo);
        }

        return $query->get()->map(function ($rental) {
            return [
                'id' => $rental->id,
                'customer_name' => $rental->customer->name,
                'equipment_count' => $rental->rentalItems()->count(),
                'start_date' => $rental->start_date?->format('Y-m-d')->format('Y-m-d'),
                'end_date' => $rental->end_date ? $rental->end_date?->format('Y-m-d')->format('Y-m-d') : '',
                'status' => $rental->status,
                'total_amount' => $rental->total_amount,
                'created_at' => $rental->created_at?->format('Y-m-d H:i:s')->format('Y-m-d')
            ];
        })->toArray();
    }

    /**
     * Get equipment report data
     */
    private function getEquipmentReportData($dateFrom = null, $dateTo = null, $search = null)
    {
        $query = Equipment::query();
        
        if ($search) {
            $query->where('name', 'like', "%{$search}%")
                  ->orWhere('model', 'like', "%{$search}%")
                  ->orWhere('serial_number', 'like', "%{$search}%");
        }
        
        if ($dateFrom) {
            $query->whereDate('created_at', '>=', $dateFrom);
        }
        
        if ($dateTo) {
            $query->whereDate('created_at', '<=', $dateTo);
        }

        return $query->get()->map(function ($equipment) {
            return [
                'id' => $equipment->id,
                'name' => $equipment->name,
                'model' => $equipment->model,
                'serial_number' => $equipment->serial_number,
                'category' => $equipment->category,
                'status' => $equipment->status,
                'daily_rate' => $equipment->daily_rate,
                'created_at' => $equipment->created_at?->format('Y-m-d H:i:s')->format('Y-m-d'),
                'total_rentals' => $equipment->rentalItems()->count()
            ];
        })->toArray();
    }

    /**
     * Get payments report data
     */
    private function getPaymentsReportData($dateFrom = null, $dateTo = null, $search = null)
    {
        $query = Payment::with(['customer']);
        
        if ($search) {
            $query->whereHas('customer', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            });
        }
        
        if ($dateFrom) {
            $query->whereDate('payment_date', '>=', $dateFrom);
        }
        
        if ($dateTo) {
            $query->whereDate('payment_date', '<=', $dateTo);
        }

        return $query->get()->map(function ($payment) {
            return [
                'id' => $payment->id,
                'customer_name' => $payment->customer->name,
                'amount' => $payment->amount,
                'payment_method' => $payment->payment_method,
                'payment_date' => $payment->payment_date->format('Y-m-d'),
                'status' => $payment->status,
                'reference_number' => $payment->reference_number,
                'created_at' => $payment->created_at?->format('Y-m-d H:i:s')->format('Y-m-d')
            ];
        })->toArray();
    }
}




