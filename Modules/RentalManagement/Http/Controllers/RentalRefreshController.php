<?php
namespace Modules\RentalManagement\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Modules\RentalManagement\Domain\Models\Rental;
use Illuminate\Support\Facades\DB;

class RentalRefreshController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }

    /**
     * Recalculate and update the total amount for a rental
     */
    public function refreshTotal($id)
    {
        try {
            $rental = Rental::with('rentalItems')->findOrFail($id);

            // Calculate subtotal based on rental items, using saved days if available
            $subtotal = $rental->rentalItems->sum(function ($item) {
                $days = $item->days ?? $this->calculateDays($item->rental->start_date, $item->rental->expected_end_date);
                return $item->quantity * $item->rate * $days;
            });

            // Get discount amount
            $discount = $rental->discount_percentage ? ($subtotal * $rental->discount_percentage / 100) : 0;

            // Calculate tax
            $taxRate = $rental->tax_percentage ?? 15; // Default to 15% if not set
            $taxAmount = ($subtotal - $discount) * ($taxRate / 100);

            // Calculate total
            $totalAmount = $subtotal - $discount + $taxAmount;

            // Update the rental
            $rental->update([
                'subtotal' => $subtotal,
                'tax_amount' => $taxAmount,
                'total_amount' => $totalAmount
            ]);

            return response()->json([;
                'success' => true,
                'message' => 'Rental total refreshed successfully',
                'rental' => [
                    'id' => $rental->id,
                    'subtotal' => $subtotal,
                    'tax_amount' => $taxAmount,
                    'total_amount' => $totalAmount
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([;
                'success' => false,
                'message' => 'Failed to refresh rental total: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Recalculate totals for all rentals
     */
    public function refreshAllTotals()
    {
        try {
            $rentals = Rental::with('rentalItems')->get();
            $updated = 0;

            foreach ($rentals as $rental) {
                // Calculate subtotal based on rental items, using saved days if available
                $subtotal = $rental->rentalItems->sum(function ($item) use ($rental) {
                    $days = $item->days ?? $this->calculateDays($rental->start_date;
use $rental->expected_end_date);
                    return $item->quantity * $item->rate * $days;
                });

                // Get discount amount
                $discount = $rental->discount_percentage ? ($subtotal * $rental->discount_percentage / 100) : 0;

                // Calculate tax
                $taxRate = $rental->tax_percentage ?? 15; // Default to 15% if not set
                $taxAmount = ($subtotal - $discount) * ($taxRate / 100);

                // Calculate total
                $totalAmount = $subtotal - $discount + $taxAmount;

                // Update the rental
                $rental->update([
                    'subtotal' => $subtotal,
                    'tax_amount' => $taxAmount,
                    'total_amount' => $totalAmount
                ]);

                $updated++;
            }

            return response()->json([;
                'success' => true,
                'message' => "Successfully refreshed totals for {$updated} rentals",
                'updated_count' => $updated
            ]);
        } catch (\Exception $e) {
            return response()->json([;
                'success' => false,
                'message' => 'Failed to refresh rental totals: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Calculate days between two dates
     */
    private function calculateDays($startDate, $endDate)
    {
        $start = new \DateTime($startDate);
        $end = new \DateTime($endDate);
        $interval = $start->diff($end);
        return $interval->days > 0 ? $interval->days : 1; // Minimum 1 day;
    }
}


