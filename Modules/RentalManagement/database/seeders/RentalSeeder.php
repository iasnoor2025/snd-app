<?php

namespace Modules\RentalManagement\database\seeders;

use Illuminate\Database\Seeder;
use Modules\RentalManagement\Domain\Models\Rental;

class RentalSeeder extends Seeder
{
    public function run()
    {
        $rentals = [
            [
                'rental_number' => 'RENT-00001',
                'customer_id' => 1,
                'status' => 'active',
                'start_date' => now()->subDays(10),
                'expected_end_date' => now()->addDays(20),
                'total_amount' => 5000,
                'notes' => 'Ongoing rental',
            ],
            [
                'rental_number' => 'RENT-00002',
                'customer_id' => 2,
                'status' => 'completed',
                'start_date' => now()->subMonths(2),
                'expected_end_date' => now()->subMonth(),
                'total_amount' => 3000,
                'notes' => 'Completed rental',
            ],
            [
                'rental_number' => 'RENT-00003',
                'customer_id' => 3,
                'status' => 'pending',
                'start_date' => now()->addDays(5),
                'expected_end_date' => now()->addDays(25),
                'total_amount' => 7000,
                'notes' => 'Upcoming rental',
            ],
        ];
        foreach ($rentals as $data) {
            Rental::updateOrCreate([
                'customer_id' => $data['customer_id'],
                'start_date' => $data['start_date'],
            ], $data);
        }
    }
}
