<?php

namespace Modules\CustomerManagement\Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\CustomerManagement\Domain\Models\Customer;

class CustomerSeeder extends Seeder
{
    public function run()
    {
        $customers = [
            [
                'name' => 'Acme Corp',
                'contact_person' => 'John Doe',
                'email' => 'john@acme.com',
                'phone' => '+1234567890',
                'address' => '123 Main St',
                'city' => 'Metropolis',
                'state' => 'Metro',
                'postal_code' => '12345',
                'country' => 'USA',
                'website' => 'https://acme.com',
                'tax_number' => 'TAX123',
                'credit_limit' => 10000,
                'payment_terms' => 'Net 30',
                'is_active' => true,
            ],
            [
                'name' => 'TechCorp',
                'contact_person' => 'Jane Smith',
                'email' => 'jane@techcorp.com',
                'phone' => '+0987654321',
                'address' => '456 Tech Ave',
                'city' => 'Silicon Valley',
                'state' => 'CA',
                'postal_code' => '94025',
                'country' => 'USA',
                'website' => 'https://techcorp.com',
                'tax_number' => 'TAX456',
                'credit_limit' => 20000,
                'payment_terms' => 'Net 45',
                'is_active' => true,
            ],
            [
                'name' => 'Global Industries',
                'contact_person' => 'Bob Wilson',
                'email' => 'bob@global.com',
                'phone' => '+1122334455',
                'address' => '789 Global Blvd',
                'city' => 'International City',
                'state' => 'IC',
                'postal_code' => '33333',
                'country' => 'USA',
                'website' => 'https://global.com',
                'tax_number' => 'TAX789',
                'credit_limit' => 30000,
                'payment_terms' => 'Net 60',
                'is_active' => true,
            ],
        ];

        foreach ($customers as $customer) {
            Customer::create($customer);
        }
    }
}
