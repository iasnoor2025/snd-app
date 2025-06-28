<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Modules\RentalManagement\Domain\Models\Rental;
use Modules\RentalManagement\Domain\Models\RentalItem;
use Modules\EquipmentManagement\Domain\Models\Equipment;
use Modules\CustomerManagement\Domain\Models\Customer;
use Carbon\Carbon;

class RentalDataSeeder extends Seeder
{
    public function run()
    {
        \Log::info('Starting rental test data seeding...');

        $unique = uniqid();

        try {
            // Create test equipment directly in the database to avoid model casting
            $equipmentId = DB::table('equipment')->insertGetId([
                'model_number' => 'TEST-001',
                'name' => '{"en":"Test Equipment"}',
                'description' => '{"en":"Test equipment for rental"}',
                'manufacturer' => 'Test Manufacturer',
                'serial_number' => 'SN001',
                'status' => 'available',
                'daily_rate' => 500,
                'weekly_rate' => 3000,
                'monthly_rate' => 10000,
                'unit' => 'unit',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Create test customer directly in the database
            $customer = DB::table('customers')->where('email', 'test@example.com')->first();
            if (!$customer) {
                $customerId = DB::table('customers')->insertGetId([
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
                    'status' => 'active',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            } else {
                $customerId = $customer->id;
            }

            $now = now();

            // Create rentals directly using DB facade to avoid model events and casting
            $this->createSingleRental($equipmentId, $customerId, 1, 'daily', 500, 30, $now, $unique);
            $this->createSingleRental($equipmentId, $customerId, 2, 'weekly', 3000, 7, $now, $unique);
            $this->createSingleRental($equipmentId, $customerId, 3, 'monthly', 10000, 30, $now, $unique);

            \Log::info('Rental test data seeding completed successfully.');
        } catch (\Exception $e) {
            \Log::error('Error seeding rental test data: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }

    private function createSingleRental($equipmentId, $customerId, $number, $rateType, $rate, $days, $now, $unique)
    {
        try {
            return DB::transaction(function () use ($equipmentId, $customerId, $number, $rateType, $rate, $days, $now, $unique) {
                // Calculate dates
                $startDate = $number === 1 ? $now->copy()->subDays(10) : 
                            ($number === 2 ? $now->copy()->subMonths(2) : $now->copy()->addDays(5));
                
                $expectedEndDate = $number === 1 ? $now->copy()->addDays(20) : 
                                 ($number === 2 ? $now->copy()->subMonth() : $now->copy()->addDays(25));
                
                $actualEndDate = $number === 2 ? $now->copy()->subMonth() : null;

                // Calculate amounts
                $subtotal = $rate * $days;
                $taxAmount = $subtotal * 0.15;
                $totalAmount = $subtotal + $taxAmount;

                // Set notes based on rental status
                $notes = $number === 1 ? 'Ongoing rental' : 
                        ($number === 2 ? 'Completed rental' : 'Upcoming rental');

                // Insert rental directly
                $rental = DB::table('rentals')->insertGetId([
                    'rental_number' => 'RENT-' . $now->format('Y') . '-' . str_pad($number, 5, '0', STR_PAD_LEFT) . '-' . $unique,
                    'customer_id' => $customerId,
                    'status' => $number === 1 ? 'active' : ($number === 2 ? 'completed' : 'pending'),
                    'start_date' => $startDate,
                    'expected_end_date' => $expectedEndDate,
                    'actual_end_date' => $actualEndDate,
                    'notes' => $notes,
                    'subtotal' => $subtotal,
                    'tax_amount' => $taxAmount,
                    'total_amount' => $totalAmount,
                    'payment_status' => $number === 2 ? 'paid' : 'pending',
                    'payment_terms_days' => 30,
                    'has_timesheet' => $number !== 2,
                    'has_operators' => $number === 3,
                    'deposit_amount' => $number * 1000,
                    'deposit_paid' => $number === 2,
                    'deposit_paid_date' => $number === 2 ? $now->copy()->subMonths(2) : null,
                    'deposit_refunded' => $number === 2,
                    'deposit_refund_date' => $number === 2 ? $now->copy()->subMonth() : null,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);

                // Insert rental items with the correct rental_id
                DB::table('rental_items')->insert([
                    'rental_id' => $rental,
                    'equipment_id' => $equipmentId,
                    'rate' => $rate,
                    'rate_type' => $rateType,
                    'days' => $days,
                    'unit_price' => $rate,
                    'quantity' => 1,
                    'discount_percentage' => 0,
                    'total_amount' => $subtotal,
                    'notes' => $notes,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);

                return $rental;
            });
        } catch (\Exception $e) {
            \Log::error('Error creating single rental: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }
} 