<?php

return [
    'name' => 'API',
    'version' => '1.0.0',
    'description' => 'API module for HR & Payroll system',
    'throttle' => [
        'enabled' => true,
        'limit' => 60,
        'decay_minutes' => 1,
    ],
    'auth' => [
        'token_expiration' => 60 * 24, // 24 hours
        'refresh_token_expiration' => 60 * 24 * 7, // 7 days
    ],
    'documentation' => [
        'enabled' => true,
        'path' => '/api/documentation',
    ],
    'versioning' => [
        'default' => 'v1',
        'supported' => ['v1']
    ],
];

