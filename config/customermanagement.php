<?php

return [
    'name' => 'CustomerManagement',

    /*
    |--------------------------------------------------------------------------
    | Customer Management Module Configuration
    |--------------------------------------------------------------------------
    |
    | This file is for storing the configuration for the Customer Management module.
    |
    */

    // Default payment terms (in days)
    'default_payment_terms' => 30,

    // Available payment terms (in days)
    'payment_terms_options' => [0, 15, 30, 45, 60],

    // Default credit limit
    'default_credit_limit' => 5000,

    // Document upload settings
    'document_max_size' => 10240, // 10MB in KB
    'allowed_document_types' => ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png']
];

