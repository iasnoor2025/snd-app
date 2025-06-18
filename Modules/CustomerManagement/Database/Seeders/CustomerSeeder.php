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
                'notes' => 'VIP customer',
                'is_active' => true,
            ],
            [
                'name' => 'Beta LLC',
                'contact_person' => 'Jane Smith',
                'email' => 'jane@beta.com',
                'phone' => '+1987654321',
                'address' => '456 Side St',
                'city' => 'Gotham',
                'state' => 'Gotham',
                'postal_code' => '54321',
                'country' => 'USA',
                'website' => 'https://beta.com',
                'tax_number' => 'TAX456',
                'credit_limit' => 5000,
                'payment_terms' => 'Net 15',
                'notes' => '',
                'is_active' => true,
            ],
            [
                'name' => 'Gamma Inc',
                'contact_person' => 'Alice Johnson',
                'email' => 'alice@gamma.com',
                'phone' => '+1122334455',
                'address' => '789 High St',
                'city' => 'Star City',
                'state' => 'Star',
                'postal_code' => '67890',
                'country' => 'USA',
                'website' => 'https://gamma.com',
                'tax_number' => 'TAX789',
                'credit_limit' => 8000,
                'payment_terms' => 'Net 45',
                'notes' => 'Frequent orders',
                'is_active' => true,
            ],
        ];
        foreach ($customers as $data) {
            Customer::updateOrCreate([
                'name' => $data['name'],
                'email' => $data['email'],
            ], $data);
        }
    }
}
