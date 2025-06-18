<?php

namespace Modules\Settings\Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\Settings\Domain\Models\Setting;

class SettingsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void;
     */
    public function run()
    {
        $settings = [
            // Company settings
            [
                'group' => 'company',
                'key' => 'company_name',
                'value' => 'HR & Payroll System',
                'type' => 'string',
                'display_name' => 'Company Name',
                'description' => 'The name of the company',
                'is_system' => true,
                'order' => 1,
            ],
            [
                'group' => 'company',
                'key' => 'company_email',
                'value' => 'info@company.com',
                'type' => 'string',
                'display_name' => 'Company Email',
                'description' => 'The main email address of the company',
                'is_system' => true,
                'order' => 2,
            ],
            [
                'group' => 'company',
                'key' => 'company_phone',
                'value' => '+1234567890',
                'type' => 'string',
                'display_name' => 'Company Phone',
                'description' => 'The main phone number of the company',
                'is_system' => true,
                'order' => 3,
            ],
            [
                'group' => 'company',
                'key' => 'company_address',
                'value' => '123 Business Street',
                'type' => 'string',
                'display_name' => 'Company Address',
                'description' => 'The physical address of the company',
                'is_system' => true,
                'order' => 4,
            ],

            // Notification settings
            [
                'group' => 'notifications',
                'key' => 'email_notifications',
                'value' => true,
                'type' => 'boolean',
                'display_name' => 'Email Notifications',
                'description' => 'Enable or disable email notifications',
                'is_system' => true,
                'order' => 1,
            ],
            [
                'group' => 'notifications',
                'key' => 'sms_notifications',
                'value' => false,
                'type' => 'boolean',
                'display_name' => 'SMS Notifications',
                'description' => 'Enable or disable SMS notifications',
                'is_system' => true,
                'order' => 2,
            ],

            // Payroll settings
            [
                'group' => 'payroll',
                'key' => 'payroll_cycle',
                'value' => 'monthly',
                'type' => 'string',
                'options' => json_encode(['weekly', 'bi-weekly', 'monthly']),
                'display_name' => 'Payroll Cycle',
                'description' => 'The frequency of payroll processing',
                'is_system' => true,
                'order' => 1,
            ],
            [
                'group' => 'payroll',
                'key' => 'payment_method',
                'value' => 'bank_transfer',
                'type' => 'string',
                'options' => json_encode(['bank_transfer', 'check', 'cash']),
                'display_name' => 'Default Payment Method',
                'description' => 'The default method of payment for employees',
                'is_system' => true,
                'order' => 2,
            ],
            [
                'group' => 'payroll',
                'key' => 'tax_rate',
                'value' => 15,
                'type' => 'integer',
                'display_name' => 'Default Tax Rate (%)',
                'description' => 'The default tax rate percentage',
                'is_system' => true,
                'order' => 3,
            ],

            // System settings
            [
                'group' => 'system',
                'key' => 'timezone',
                'value' => 'UTC',
                'type' => 'string',
                'display_name' => 'Timezone',
                'description' => 'The default timezone for the application',
                'is_system' => true,
                'order' => 1,
            ],
            [
                'group' => 'system',
                'key' => 'date_format',
                'value' => 'Y-m-d',
                'type' => 'string',
                'display_name' => 'Date Format',
                'description' => 'The default date format for the application',
                'is_system' => true,
                'order' => 2,
            ],
            [
                'group' => 'system',
                'key' => 'time_format',
                'value' => 'H:i',
                'type' => 'string',
                'display_name' => 'Time Format',
                'description' => 'The default time format for the application',
                'is_system' => true,
                'order' => 3,
            ],
            [
                'group' => 'system',
                'key' => 'default_language',
                'value' => 'en',
                'type' => 'string',
                'options' => json_encode(['en', 'ar']),
                'display_name' => 'Default Language',
                'description' => 'The default language for the application',
                'is_system' => true,
                'order' => 4,
            ],
            [
                'group' => 'system',
                'key' => 'currency',
                'value' => 'USD',
                'type' => 'string',
                'display_name' => 'Currency',
                'description' => 'The default currency for the application',
                'is_system' => true,
                'order' => 5,
            ],
        ];

        foreach ($settings as $setting) {
            Setting::updateOrCreate(
                [
                    'group' => $setting['group'],
                    'key' => $setting['key']
                ],
                $setting
            );
        }
    }
}


