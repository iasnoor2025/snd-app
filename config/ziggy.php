<?php

return [
    'except' => [
        'debugbar::*',
        'ignition::*',
        'telescope::*',
    ],
    'url' => env('APP_URL'),
    'port' => env('VITE_PORT'),
    'group' => false,
    'only' => ['*'],
]; 