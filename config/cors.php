<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    // WARNING: This allows any domain. For production, restrict to your real domains for security.
    'allowed_origins' => [],
    'allowed_origins_patterns' => ['/^https?:\/\/.+/'],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];
