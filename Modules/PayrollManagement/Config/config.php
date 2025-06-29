<?php

return [
    'name' => 'Payroll',

    /*
    |--------------------------------------------------------------------------
    | Payroll Configuration
    |--------------------------------------------------------------------------
    |
    | This is the configuration for the Payroll module.
    |
    */

    // Payroll settings
    'settings' => [
        'default_currency' => 'SAR',
        'payment_methods' => ['bank_transfer', 'cash', 'check'],
        'payment_frequency' => ['monthly', 'bi-weekly', 'weekly']
    ],

    // Tax configuration
    'taxes' => [
        'enabled' => true,
        'default_tax_rate' => 15,
    ],

    // Deductions configuration
    'deductions' => [
        'types' => ['tax', 'insurance', 'loan', 'advance']
    ],

    // Payroll cycle configuration
    'cycles' => [
        'start_day' => 1,
        'end_day' => 'last', // 'last' or a specific day number
        'processing_day' => 25,
    ],
];

