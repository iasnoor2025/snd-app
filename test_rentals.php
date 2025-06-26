<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

// Run the application
$response = $kernel->handle(
    $request = Illuminate\Http\Request::capture()
);

// Get the rental service
$rentalService = $app->make(Modules\RentalManagement\Services\RentalService::class);

// Get all rentals
$rentals = $rentalService->getPaginatedRentals(10, []);

// Output the results
echo "Total rentals: " . $rentals->total() . "\n";
echo "Current page: " . $rentals->currentPage() . "\n";
echo "Per page: " . $rentals->perPage() . "\n";
echo "Last page: " . $rentals->lastPage() . "\n";
echo "\n";

// Output each rental
foreach ($rentals as $rental) {
    echo "ID: " . $rental->id . "\n";
    echo "Rental Number: " . $rental->rental_number . "\n";
    echo "Customer: " . $rental->customer_name . "\n";
    echo "Status: " . $rental->status . "\n";
    echo "Start Date: " . $rental->start_date . "\n";
    echo "Expected End Date: " . $rental->expected_end_date . "\n";
    echo "Total Amount: " . $rental->total_amount . "\n";
    echo "Has Operators: " . ($rental->has_operators ? 'Yes' : 'No') . "\n";
    echo "Rental Items: " . (isset($rental->rental_items) ? count($rental->rental_items) : 0) . "\n";
    echo "-------------------\n";
}

// Terminate the application
$kernel->terminate($request, $response); 