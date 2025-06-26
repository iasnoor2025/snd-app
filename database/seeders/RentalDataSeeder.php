<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\RentalManagement\Domain\Models\Rental;
use Modules\RentalManagement\Domain\Models\RentalItem;
use Modules\EquipmentManagement\Domain\Models\Equipment;
use Modules\CustomerManagement\Domain\Models\Customer;
use Carbon\Carbon;

class RentalDataSeeder extends Seeder
{
    public function run()
    {
        // Get some equipment IDs
        $equipmentIds = Equipment::pluck('id')->take(3)->toArray();

        if (empty($equipmentIds)) {
            // Create some equipment if none exists
            $equipment = Equipment::create([
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
            ]);
            $equipmentIds = [$equipment->id];
        }

        // Get customer IDs
        $customerIds = Customer::pluck('id')->take(3)->toArray();

        if (empty($customerIds)) {
            // Create a test customer if none exists
            $customer = Customer::create([
                'name' => 'Test Customer',
                'contact_person' => 'John Doe',
                'email' => 'test@example.com',
                'phone' => '1234567890',
                'address' => 'Test Address',
                'city' => 'Test City',
                'state' => 'Test State',
                'postal_code' => '12345',
                'country' => 'Test Country',
                'tax_number' => 'TAX001',
                'credit_limit' => 10000,
                'payment_terms' => 'Net 30',
                'is_active' => true,
            ]);
            $customerIds = [$customer->id];
        }

        $now = Carbon::now();

        $rentals = [
            [
                'rental_number' => 'RNT-' . $now->format('Ymd') . '-001',
                'customer_id' => $customerIds[0],
                'status' => 'active',
                'start_date' => $now->subDays(10),
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
                'items' => [
                    [
                        'equipment_id' => $equipmentIds[0],
                        'quantity' => 1,
                        'unit_price' => 500,
                        'rental_rate_period' => 'daily',
                        'days' => 30,
                        'discount_percentage' => 0,
                        'total_amount' => 15000,
                        'notes' => 'Daily rental',
                    ],
                ],
            ],
            [
                'rental_number' => 'RNT-' . $now->format('Ymd') . '-002',
                'customer_id' => $customerIds[0],
                'status' => 'completed',
                'start_date' => $now->subMonths(2),
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
                'deposit_paid' => true,
                'deposit_paid_date' => $now->copy()->subMonths(2),
                'deposit_refunded' => true,
                'deposit_refund_date' => $now->copy()->subMonth(),
                'items' => [
                    [
                        'equipment_id' => $equipmentIds[0],
                        'quantity' => 1,
                        'unit_price' => 3000,
                        'rental_rate_period' => 'weekly',
                        'days' => 7,
                        'discount_percentage' => 0,
                        'total_amount' => 3000,
                        'notes' => 'Weekly rental',
                    ],
                ],
            ],
            [
                'rental_number' => 'RNT-' . $now->format('Ymd') . '-003',
                'customer_id' => $customerIds[0],
                'status' => 'pending',
                'start_date' => $now->addDays(5),
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
                'items' => [
                    [
                        'equipment_id' => $equipmentIds[0],
                        'quantity' => 1,
                        'unit_price' => 10000,
                        'rental_rate_period' => 'monthly',
                        'days' => 30,
                        'discount_percentage' => 0,
                        'total_amount' => 10000,
                        'notes' => 'Monthly rental',
                    ],
                ],
            ],
        ];

        foreach ($rentals as $data) {
            $items = $data['items'];
            unset($data['items']);

            $rental = Rental::create($data);

            foreach ($items as $item) {
                $rental->rentalItems()->create($item);
            }
        }
    }
} 