<?php

namespace Modules\RentalManagement\Http\Controllers;

use Modules\RentalManagement\Domain\Models\Rental;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RentalHistoryController extends Controller
{
    public function index(Request $request)
    {
        try {
            $rentals = Rental::with(['rentalItems.equipment', 'customer'])
                ->where('customer_id', auth()->user()->customer_id)
                ->latest()
                ->get()
                ->map(function ($rental) {
                    // Get the first rental item's equipment as the main product
                    $firstItem = $rental->rentalItems->first();
                    $equipment = $firstItem ? $firstItem->equipment : null;

                    return [
                        'id' => $rental->id,
                        'product' => [
                            'name' => $equipment ? $equipment->name : 'Unknown Equipment',
                            'image' => $equipment ? $equipment->getFirstMediaUrl('images') : null,
                        ],
                        'start_date' => $rental->start_date,
                        'end_date' => $rental->expected_end_date,
                        'total_amount' => $rental->total_amount,
                        'status' => $rental->status->value,
                        'created_at' => $rental->created_at,
                    ];
                });

            return Inertia::render('RentalHistory', [
                'rentals' => $rentals,
            ]);
        } catch (\Exception $e) {
            \Log::error('Error in RentalHistoryController@index', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->back()
                ->with('error', 'An error occurred while loading rental history. Please try again later.');
        }
    }
}


