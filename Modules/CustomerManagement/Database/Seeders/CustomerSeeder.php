<?php

namespace Modules\CustomerManagement\Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\CustomerManagement\Domain\Models\Customer;

class CustomerSeeder extends Seeder
{
    public function run()
    {
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
            'is_active' => true,
            'status' => 'active',
        ]);
        echo "Created customer: {$customer->id}\n";
    }
}
