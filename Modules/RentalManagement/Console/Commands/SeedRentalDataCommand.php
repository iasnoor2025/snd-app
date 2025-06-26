<?php

namespace Modules\RentalManagement\Console\Commands;

use Illuminate\Console\Command;
use Modules\RentalManagement\Domain\Models\Rental;
use Modules\RentalManagement\Domain\Models\RentalItem;
use Modules\EquipmentManagement\Domain\Models\Equipment;
use Modules\CustomerManagement\Domain\Models\Customer;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Spatie\Activitylog\Facades\LogBatch;

class SeedRentalDataCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'rental:seed';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Seed rental data';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting rental data seeding...');

        try {
            // Enable query logging for debugging
            DB::enableQueryLog();
            
            $this->info('Checking for existing equipment...');
            
            // Get some equipment IDs
            $equipmentId = Equipment::select('id')->first()?->id;

            if (!$equipmentId) {
                $this->info('No equipment found, creating test equipment...');
                
                // Create some equipment if none exists
                $equipmentId = DB::table('equipment')->insertGetId([
                    'name' => json_encode(['en' => 'Test Equipment']),
                    'description' => json_encode(['en' => 'Test equipment for rental']),
                    'manufacturer' => 'Test Manufacturer',
                    'model_number' => 'TEST-001',
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
                $this->info('Created test equipment with ID: ' . $equipmentId);
            } else {
                $this->info('Found existing equipment with ID: ' . $equipmentId);
            }

            $this->info('Checking for existing customers...');
            
            // Get customer IDs
            $customerId = Customer::select('id')->first()?->id;

            if (!$customerId) {
                $this->info('No customers found, creating test customer...');
                
                // Create a test customer if none exists
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
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                $this->info('Created test customer with ID: ' . $customerId);
            } else {
                $this->info('Found existing customer with ID: ' . $customerId);
            }

            $now = Carbon::now();
            $timestamp = $now->format('YmdHis');

            $this->info('Creating first rental...');
            
            // Create first rental using direct DB operations
            $rental1Id = DB::table('rentals')->insertGetId([
                'rental_number' => 'RNT-' . $timestamp . '-001',
                'customer_id' => $customerId,
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
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            $this->info('Created first rental with ID: ' . $rental1Id);

            $this->info('Creating first rental item...');
            
            DB::table('rental_items')->insert([
                'rental_id' => $rental1Id,
                'equipment_id' => $equipmentId,
                'rate' => 500,
                'rate_type' => 'daily',
                'discount_percentage' => 0,
                'total_amount' => 15000,
                'notes' => 'Daily rental',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $this->info('Created first rental item.');

            $this->info('Creating second rental...');
            
            // Create second rental
            $rental2Id = DB::table('rentals')->insertGetId([
                'rental_number' => 'RNT-' . $timestamp . '-002',
                'customer_id' => $customerId,
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
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            $this->info('Created second rental with ID: ' . $rental2Id);

            $this->info('Creating second rental item...');
            
            DB::table('rental_items')->insert([
                'rental_id' => $rental2Id,
                'equipment_id' => $equipmentId,
                'rate' => 3000,
                'rate_type' => 'weekly',
                'discount_percentage' => 0,
                'total_amount' => 3000,
                'notes' => 'Weekly rental',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $this->info('Created second rental item.');

            $this->info('Creating third rental...');
            
            // Create third rental
            $rental3Id = DB::table('rentals')->insertGetId([
                'rental_number' => 'RNT-' . $timestamp . '-003',
                'customer_id' => $customerId,
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
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            $this->info('Created third rental with ID: ' . $rental3Id);

            $this->info('Creating third rental item...');
            
            DB::table('rental_items')->insert([
                'rental_id' => $rental3Id,
                'equipment_id' => $equipmentId,
                'rate' => 10000,
                'rate_type' => 'monthly',
                'discount_percentage' => 0,
                'total_amount' => 10000,
                'notes' => 'Monthly rental',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $this->info('Created third rental item.');

            // Log all queries for debugging
            $queries = DB::getQueryLog();
            $this->info('Executed queries:');
            foreach ($queries as $query) {
                $this->info($query['query']);
            }

            DB::commit();
            $this->info('Rental data seeded successfully!');

        } catch (\Exception $e) {
            DB::rollBack();
            $this->error('Failed to seed rental data: ' . $e->getMessage());
            $this->error('Stack trace: ' . $e->getTraceAsString());
            
            // Log all queries that were executed before the error
            $queries = DB::getQueryLog();
            $this->error('Last executed queries:');
            foreach ($queries as $query) {
                $this->error($query['query']);
            }
        }
    }
} 