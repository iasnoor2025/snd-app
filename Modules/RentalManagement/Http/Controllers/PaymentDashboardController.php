<?php
namespace Modules\RentalManagement\Http\Controllers;

use Modules\RentalManagement\Domain\Models\Payment;
use Modules\RentalManagement\Domain\Models\Rental;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PaymentDashboardController extends Controller
{
    public function index()
    {
        $period = request('period', 'month');

        // Determine date range based on period
        $startDate = $this->getStartDate($period);
        $endDate = now();

        // Get total payments
        $totalPayments = Payment::whereBetween('payment_date', [$startDate, $endDate])->count();
        $totalAmount = Payment::whereBetween('payment_date', [$startDate, $endDate])->sum('amount');

        // Get payments by status (if status column exists)
        $totalPaid = Payment::whereBetween('payment_date', [$startDate, $endDate])->sum('amount');
        $totalPending = 0;
        $totalFailed = 0;

        // Get payment methods distribution
        $paymentMethods = Payment::whereBetween('payment_date', [$startDate, $endDate])
            ->select('payment_method as method', DB::raw('count(*) as count'), DB::raw('sum(amount) as amount'))
            ->groupBy('payment_method')
            ->get();

        // Get monthly/weekly stats based on period
        $groupByFormat = $this->getGroupByFormat($period);
        $monthlyStats = Payment::whereBetween('payment_date', [$startDate, $endDate])
            ->select(DB::raw("TO_CHAR(payment_date, '{$groupByFormat}') as month"), DB::raw('sum(amount) as amount'))
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        // Get recent payments
        $recentPayments = Payment::with(['customer:id,company_name'])
            ->orderBy('payment_date', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($payment) {
                return [
                    'id' => $payment->id,
                    'payment_number' => $payment->payment_number,
                    'amount' => $payment->amount,
                    'payment_date' => $payment->payment_date,
                    'payment_method' => $payment->payment_method,
                    'customer' => $payment->customer,
                    'status' => 'completed', // Default to completed since we don't have status
                ];
            });

        // Get overdue payments count
        $overduePayments = Rental::where('payment_status', '=', 'overdue')->count();

        // Get historical trend data for comparison
        $previousPeriodStart = $this->getPreviousPeriodStart($period);
        $previousPeriodEnd = $startDate->copy()->subDay();

        $currentPeriodTotal = $totalAmount;
        $previousPeriodTotal = Payment::whereBetween('payment_date', [$previousPeriodStart, $previousPeriodEnd])
            ->sum('amount');

        $monthlyComparison = 0;
        if ($previousPeriodTotal > 0) {
            $monthlyComparison = round((($currentPeriodTotal - $previousPeriodTotal) / $previousPeriodTotal) * 100);
        }

        // Get client spending data
        $topClients = Payment::whereBetween('payment_date', [$startDate, $endDate])
            ->select('customer_id', DB::raw('sum(amount) as total_spent'))
            ->groupBy('customer_id')
            ->with('client:id,company_name')
            ->orderBy('total_spent', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($payment) {
                return [
                    'customer_id' => $payment->customer_id,
                    'client_name' => $payment->client ? $payment->customer->company_name : 'Unknown',
                    'total_spent' => $payment->total_spent,
                ];
            });

        // Daily trending data for the current period
        $dailyTrend = Payment::whereBetween('payment_date', [$startDate, $endDate])
            ->select(DB::raw('DATE(payment_date) as date'), DB::raw('sum(amount) as amount'))
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(function ($item) {
                return [
                    'date' => $item->date?->format('Y-m-d'),
                    'amount' => $item->amount,
                ];
            });

        return Inertia::render('Payments/Dashboard', [
            'payment_summary' => [
                'total_payments' => $totalPayments,
                'total_amount' => $totalAmount,
                'total_paid' => $totalPaid,
                'total_pending' => $totalPending,
                'total_failed' => $totalFailed,
                'payment_methods' => $paymentMethods,
                'monthly_stats' => $monthlyStats,
                'recent_payments' => $recentPayments,
                'overdue_payments' => $overduePayments,
                'monthly_comparison' => $monthlyComparison,
                'top_clients' => $topClients,
                'daily_trend' => $dailyTrend,
                'current_period' => $period,
            ],
        ]);
    }

    private function getStartDate($period)
    {
        $now = now();

        return match ($period) {
            'week' => $now->copy()->startOfWeek(),
            'month' => $now->copy()->startOfMonth(),
            'year' => $now->copy()->startOfYear(),
            default => $now->copy()->startOfMonth(),
        };
    }

    private function getPreviousPeriodStart($period)
    {
        $startDate = $this->getStartDate($period);

        return match ($period) {
            'week' => $startDate->copy()->subWeek(),
            'month' => $startDate->copy()->subMonth(),
            'year' => $startDate->copy()->subYear(),
            default => $startDate->copy()->subMonth(),
        };
    }

    private function getGroupByFormat($period)
    {
        return match ($period) {
            'week' => 'YYYY-MM-DD', // Daily for week
            'month' => 'YYYY-MM-DD', // Daily for month
            'year' => 'YYYY-MM', // Monthly for year
            default => 'YYYY-MM-DD',
        };
    }
}


