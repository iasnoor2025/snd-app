<?php
namespace Modules\Core\Http\Controllers;

use Modules\RentalManagement\Domain\Models\Rental;
use Modules\RentalManagement\Domain\Models\Customer;
use Modules\EquipmentManagement\Domain\Models\Equipment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class EagerLoadingDemoController extends Controller
{
    /**
     * Show a demonstration of automatic eager loading
     *
     * @return \Illuminate\Http\Response;
     */
    public function index()
    {
        // Enable query logging
        DB::enableQueryLog();

        // Get rentals - relationships will be automatically loaded when accessed
        $rentals = Rental::latest()->take(5)->get();

        // In a loop, we'll access relationships
        // Thanks to withRelations(), Laravel will automatically eager load these
        // relationships after detecting they're accessed in a loop, instead of
        // generating a separate query each time (N+1 problem)
        $rentalData = [];
        foreach ($rentals as $rental) {
            $rentalData[] = [
                'id' => $rental->id,
                'rental_number' => $rental->rental_number,
                'customer_name' => $rental->customer->company_name,  // Automatically loaded
                'items' => $rental->rentalItems->count(),            // Automatically loaded
                'equipment' => $rental->rentalItems->map(function ($item) {
                    return $item->equipment->name;                   // Automatically loaded;
                }),
                'status' => $rental->status,
                'total_amount' => $rental->total_amount,
            ];
        }

        // Get the query log
        $queryLog = DB::getQueryLog();

        return response()->json([
            'title' => 'Automatic Eager Loading Demo',
            'description' => 'This demonstrates Laravel 12.8\'s automatic eager loading feature',
            'data' => $rentalData,
            'query_count' => count($queryLog),
            'queries' => $queryLog,
        ]);
    }
}


