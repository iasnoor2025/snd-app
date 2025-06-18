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

class ReportController extends Controller
{
    /**
     * Display the reports dashboard.
     */
    public function index(Request $request)
    {
        // Get counts for dashboard
        $clientCount = Customer::count();
        $equipmentCount = Equipment::count();
        $rentalCount = Rental::count();
        $invoiceCount = Invoice::count();
        $paymentCount = Payment::count();

        // Sorting and pagination params
        $rentalsPage = $request->input('rentals_page', 1);
        $rentalsSort = $request->input('rentals_sort', 'created_at');
        $rentalsDir = $request->input('rentals_dir', 'desc');
        $invoicesPage = $request->input('invoices_page', 1);
        $invoicesSort = $request->input('invoices_sort', 'created_at');
        $invoicesDir = $request->input('invoices_dir', 'desc');
        $paymentsPage = $request->input('payments_page', 1);
        $paymentsSort = $request->input('payments_sort', 'created_at');
        $paymentsDir = $request->input('payments_dir', 'desc');
        $perPage = 5;

        // Get recent activity (paginated and sorted)
        $recentRentals = Rental::with('client')
            ->orderBy($rentalsSort, $rentalsDir)
            ->paginate($perPage, ['*'], 'rentals_page', $rentalsPage);

        $recentInvoices = Invoice::with('client')
            ->orderBy($invoicesSort, $invoicesDir)
            ->paginate($perPage, ['*'], 'invoices_page', $invoicesPage);

        $recentPayments = Payment::with(['client', 'invoice'])
            ->orderBy($paymentsSort, $paymentsDir)
            ->paginate($perPage, ['*'], 'payments_page', $paymentsPage);

        // Get revenue data for chart
        $monthlyRevenue = Payment::selectRaw('EXTRACT(MONTH FROM payment_date) as month, EXTRACT(YEAR FROM payment_date) as year, SUM(amount) as total')
            ->whereNotNull('payment_date')
            ->whereRaw('EXTRACT(YEAR FROM payment_date) = ?', [date('Y')])
            ->groupByRaw('EXTRACT(YEAR FROM payment_date), EXTRACT(MONTH FROM payment_date)')
            ->orderBy('year')
            ->orderBy('month')
            ->get()
            ->map(function ($item) {
                return [
                    'month' => date('F', mktime(0, 0, 0, $item->month, 1)),
                    'total' => $item->total,
                ];
            });

        return Inertia::render('Reports/Index', [
            'stats' => [
                'clients' => $clientCount,
                'equipment' => $equipmentCount,
                'rentals' => $rentalCount,
                'invoices' => $invoiceCount,
                'payments' => $paymentCount,
            ],
            'recentActivity' => [
                'rentals' => $recentRentals,
                'invoices' => $recentInvoices,
                'payments' => $recentPayments,
            ],
            'charts' => [
                'monthlyRevenue' => $monthlyRevenue
            ],
            'filters' => $request->only(['date_from', 'date_to'])
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
                $q->where('company_name', 'like', "%{$search}%")
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
            ->orderBy($request->input('sort_field', 'company_name'), $request->input('sort_direction', 'asc'))
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
        $query = Rental::with('client');

        // Apply filters
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where('rental_number', 'like', "%{$search}%")
                ->orWhereHas('client', function ($q) use ($search) {
                    $q->where('company_name', 'like', "%{$search}%");
                });
        }

        if ($request->has('status') && $request->input('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->has('start_date')) {
            $query->whereDate('start_date', '>=', $request->input('start_date'));
        }

        if ($request->has('end_date')) {
            $query->whereDate('expected_end_date', '<=', $request->input('end_date'));
        }

        // Get rentals with related data
        $rentals = $query->withCount('rentalItems')
            ->withSum('rentalItems', 'total_amount')
            ->orderBy($request->input('sort_field', 'start_date'), $request->input('sort_direction', 'desc'))
            ->paginate(15)
            ->withQueryString();

        // Get summary data
        $summary = [
            'total_rentals' => Rental::count(),
            'active_rentals' => Rental::where('status', 'active')->count(),
            'completed_rentals' => Rental::where('status', 'completed')->count(),
            'overdue_rentals' => Rental::where('status', 'overdue')->count(),
            'total_revenue' => Rental::join('rental_items', 'rentals.id', '=', 'rental_items.rental_id')
                ->sum('rental_items.total_amount'),
        ];

        // Get status distribution for chart
        $statusDistribution = Rental::select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get();

        return Inertia::render('Reports/Rentals', [
            'rentals' => $rentals,
            'summary' => $summary,
            'charts' => [
                'statusDistribution' => $statusDistribution
            ],
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
                    $q->where('company_name', 'like', "%{$search}%");
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
                    $q->where('company_name', 'like', "%{$search}%");
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

    public function revenue()
    {
        // Get monthly revenue data for the past 12 months
        $monthlyRevenue = DB::table('payments')
            ->select(DB::raw('TO_CHAR(payment_date, \'YYYY-MM\') as month'), DB::raw('SUM(amount) as total'))
            ->where('payment_date', '>=', now()->subMonths(12))
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        // Get revenue by client
        $revenueByClient = DB::table('payments')
            ->join('customers', 'payments.customer_id', '=', 'customers.id')
            ->select('customers.company_name', DB::raw('SUM(payments.amount) as total'))
            ->where('payment_date', '>=', now()->subMonths(12))
            ->groupBy('customers.company_name')
            ->orderBy('total', 'desc')
            ->limit(10)
            ->get();

        // Get revenue by payment method
        $revenueByMethod = DB::table('payments')
            ->select('payment_method', DB::raw('SUM(amount) as total'))
            ->where('payment_date', '>=', now()->subMonths(12))
            ->groupBy('payment_method')
            ->orderBy('total', 'desc')
            ->get();

        // Get total revenue
        $totalRevenue = DB::table('payments')
            ->where('payment_date', '>=', now()->subMonths(12))
            ->sum('amount');

        return Inertia::render('Reports/Revenue', [
            'monthlyRevenue' => $monthlyRevenue,
            'revenueByClient' => $revenueByClient,
            'revenueByMethod' => $revenueByMethod,
            'totalRevenue' => $totalRevenue,
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
}




