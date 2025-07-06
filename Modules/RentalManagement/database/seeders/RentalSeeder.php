<?php

namespace Modules\RentalManagement\Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\RentalManagement\Domain\Models\Rental;
use Modules\RentalManagement\Domain\Models\RentalItem;
use Modules\EquipmentManagement\Domain\Models\Equipment;
use Modules\CustomerManagement\Domain\Models\Customer;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use App\Models\User;

class RentalSeeder extends Seeder
{
    public function run()
    {
        Rental::truncate(); // Remove all rentals to avoid unique constraint
        $customer = Customer::first();
        $user = User::first();
        if (!$customer || !$user) {
            echo "Missing customer or user, skipping rental seeding.\n";
            return;
        }
        $rental = Rental::create([
            'customer_id' => $customer->id,
            'rental_number' => 'RENT-' . now()->format('YmdHis'),
            'start_date' => now(),
            'status' => 'pending',
            'subtotal' => 1000.00,
            'tax_amount' => 150.00,
            'total_amount' => 1150.00,
            'discount' => 0.00,
            'tax' => 0.00,
            'final_amount' => 1150.00,
            'payment_status' => 'pending',
            'created_by' => $user->id,
        ]);
        echo "Created rental: {$rental->id}\n";

        // Ensure we have at least one equipment
        $equipment = Equipment::firstOrCreate(
            ['serial_number' => 'SN001'],
            [
                'name' => ['en' => 'Test Equipment'],
                'description' => ['en' => 'Test equipment for rental'],
                'manufacturer' => 'Test Manufacturer',
                'model_number' => 'TEST-001',
                'serial_number' => 'SN001',
                'status' => 'available',
                'daily_rate' => 500,
                'weekly_rate' => 3000,
                'monthly_rate' => 10000,
                'unit' => 'unit',
                'is_active' => true,
            ]
        );

        $now = Carbon::now();
        $unique = uniqid();

        // Create rentals in a transaction
        DB::transaction(function () use ($customer, $equipment, $now, $unique) {
            // Active rental
            $rental1 = Rental::firstOrCreate([
                'rental_number' => 'RNT-' . $now->format('Ymd') . '-001-' . $unique,
            ], [
                'customer_id' => $customer->id,
                'status' => 'active',
                'start_date' => $now->copy()->subDays(10),
                'expected_end_date' => $now->copy()->addDays(20),
                'notes' => 'Ongoing rental',
                'subtotal' => 15000,
                'tax_amount' => 2250,
                'total_amount' => 17250,
                'payment_status' => 'pending',
                'payment_terms_days' => 30,
                'has_timesheet' => true,
                'has_operators' => false,
                'deposit_amount' => 1000,
            ]);

            RentalItem::create([
                'rental_id' => $rental1->id,
                'equipment_id' => $equipment->id,
                'quantity' => 1,
                'unit_price' => 500,
                'rate' => 500,
                'rental_rate_period' => 'daily',
                'rate_type' => 'daily',
                'days' => 30,
                'discount_percentage' => 0,
                'total_amount' => 15000,
                'notes' => 'Daily rental',
            ]);

            // Completed rental
            $rental2 = Rental::firstOrCreate([
                'rental_number' => 'RNT-' . $now->format('Ymd') . '-002-' . $unique,
            ], [
                'customer_id' => $customer->id,
                'status' => 'completed',
                'start_date' => $now->copy()->subMonths(2),
                'expected_end_date' => $now->copy()->subMonth(),
                'actual_end_date' => $now->copy()->subMonth(),
                'notes' => 'Completed rental',
                'subtotal' => 3000,
                'tax_amount' => 450,
                'total_amount' => 3450,
                'payment_status' => 'paid',
                'payment_terms_days' => 30,
                'has_timesheet' => false,
                'has_operators' => false,
                'deposit_amount' => 500,
            ]);

            RentalItem::create([
                'rental_id' => $rental2->id,
                'equipment_id' => $equipment->id,
                'quantity' => 1,
                'unit_price' => 3000,
                'rate' => 3000,
                'rental_rate_period' => 'weekly',
                'rate_type' => 'weekly',
                'days' => 7,
                'discount_percentage' => 0,
                'total_amount' => 3000,
                'notes' => 'Weekly rental',
            ]);

            // Pending rental
            $rental3 = Rental::firstOrCreate([
                'rental_number' => 'RNT-' . $now->format('Ymd') . '-003-' . $unique,
            ], [
                'customer_id' => $customer->id,
                'status' => 'pending',
                'start_date' => $now->copy()->addDays(5),
                'expected_end_date' => $now->copy()->addDays(25),
                'notes' => 'Upcoming rental',
                'subtotal' => 10000,
                'tax_amount' => 1500,
                'total_amount' => 11500,
                'payment_status' => 'pending',
                'payment_terms_days' => 30,
                'has_timesheet' => true,
                'has_operators' => true,
                'deposit_amount' => 2000,
            ]);

            RentalItem::create([
                'rental_id' => $rental3->id,
                'equipment_id' => $equipment->id,
                'quantity' => 1,
                'unit_price' => 10000,
                'rate' => 10000,
                'rental_rate_period' => 'monthly',
                'rate_type' => 'monthly',
                'days' => 30,
                'discount_percentage' => 0,
                'total_amount' => 10000,
                'notes' => 'Monthly rental',
            ]);
        });
    }
}
