<?php
namespace Modules\Core\Http\Controllers;

use Modules\RentalManagement\Domain\Models\Rental;
use Modules\CustomerManagement\Domain\Models\Customer;
use Modules\EquipmentManagement\Domain\Models\Equipment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class EagerLoadingComparisonController extends Controller
{
    /**
     * Compare different eager loading approaches
     *
     * @return \Illuminate\Http\Response;
     */
    public function index()
    {
        // Test scenarios
        return response()->json([
            'title' => 'Eager Loading Comparison',
            'description' => 'Comparing different approaches to eager loading in Laravel 12.8',
            'scenarios' => [
                [
                    'name' => 'N+1 Problem',
                    'url' => route('demo.eager-loading.n-plus-1'),
                    'description' => 'Demonstrates the N+1 query problem without eager loading'
                ],
                [
                    'name' => 'Traditional Eager Loading',
                    'url' => route('demo.eager-loading.traditional'),
                    'description' => 'Using Laravel\'s traditional with() method for eager loading'
                ],
                [
                    'name' => 'Automatic Eager Loading',
                    'url' => route('demo.eager-loading.automatic'),
                    'description' => 'Using Laravel 12.8\'s automatic eager loading feature'
                ]
            ]
        ]);
    }

    /**
     * Demonstrate the N+1 query problem
     */
    public function nPlusOne()
    {
        DB::enableQueryLog();

        // Get rentals WITHOUT eager loading
        $rentals = Rental::latest()->take(5)->get();

        // Manually disable auto-loading by using original attributes
        Rental::withoutRelations();

        // Access relationships (causes N+1 query issue)
        $rentalData = [];
        foreach ($rentals as $rental) {
            $rentalData[] = [
                'id' => $rental->id,
                'rental_number' => $rental->rental_number,
                'customer_name' => $rental->customer->company_name,
                'items' => $rental->rentalItems->count(),
                'equipment' => $rental->rentalItems->map(function ($item) {
                    return $item->equipment->name;
                }),
                'status' => $rental->status,
                'total_amount' => $rental->total_amount,
            ];
        }

        $queryLog = DB::getQueryLog();

        return response()->json([
            'title' => 'N+1 Query Problem',
            'description' => 'Each relationship access in the loop causes a separate database query',
            'data' => $rentalData,
            'query_count' => count($queryLog),
            'queries' => $queryLog,
        ]);
    }

    /**
     * Demonstrate traditional eager loading
     */
    public function traditional()
    {
        DB::enableQueryLog();

        // Get rentals WITH traditional eager loading
        $rentals = Rental::with([
            'customer',
            'rentalItems',
            'rentalItems.equipment'
        ])->latest()->take(5)->get();

        $rentalData = [];
        foreach ($rentals as $rental) {
            $rentalData[] = [
                'id' => $rental->id,
                'rental_number' => $rental->rental_number,
                'customer_name' => $rental->customer->company_name,
                'items' => $rental->rentalItems->count(),
                'equipment' => $rental->rentalItems->map(function ($item) {
                    return $item->equipment->name;
                }),
                'status' => $rental->status,
                'total_amount' => $rental->total_amount,
            ];
        }

        $queryLog = DB::getQueryLog();

        return response()->json([
            'title' => 'Traditional Eager Loading',
            'description' => 'Using with() to explicitly load relationships in advance',
            'data' => $rentalData,
            'query_count' => count($queryLog),
            'queries' => $queryLog,
        ]);
    }

    /**
     * Demonstrate automatic eager loading
     */
    public function automatic()
    {
        DB::enableQueryLog();

        // Get rentals - relationships will be automatically loaded
        $rentals = Rental::latest()->take(5)->get();

        $rentalData = [];
        foreach ($rentals as $rental) {
            $rentalData[] = [
                'id' => $rental->id,
                'rental_number' => $rental->rental_number,
                'customer_name' => $rental->customer->company_name,
                'items' => $rental->rentalItems->count(),
                'equipment' => $rental->rentalItems->map(function ($item) {
                    return $item->equipment->name;
                }),
                'status' => $rental->status,
                'total_amount' => $rental->total_amount,
            ];
        }

        $queryLog = DB::getQueryLog();

        return response()->json([
            'title' => 'Automatic Eager Loading',
            'description' => 'Laravel 12.8 automatically detects and eager loads relationships used in loops',
            'data' => $rentalData,
            'query_count' => count($queryLog),
            'queries' => $queryLog,
        ]);
    }
}


