<?php

return [
    'name' => 'Reporting',

    /*
    |--------------------------------------------------------------------------
    | Reporting Configuration
    |--------------------------------------------------------------------------
    |
    | This is the configuration for the Reporting module.
    |
    */

    // Report settings
    'reports' => [
        'types' => [
            'financial',
            'equipment_usage',
            'employee_performance',
            'project_progress',
            'maintenance',
            'audit',
        ],
        'formats' => [
            'pdf',
            'excel',
            'csv',
            'html',
        ],
        'default_format' => 'pdf',
    ],

    // Chart settings
    'charts' => [
        'types' => [
            'bar',
            'line',
            'pie',
            'doughnut',
            'area',
            'scatter',
        ],
        'library' => 'chartjs',
        'default_color_palette' => [
            '#4A90E2',
            '#50E3C2',
            '#F8E71C',
            '#FF6B6B',
            '#9013FE',
            '#FF9500',
        ],
    ],

    // Data export settings
    'exports' => [
        'max_rows' => 10000,
        'chunk_size' => 1000,
        'queue' => true,
    ],

    // Scheduled reports
    'scheduled_reports' => [
        'enabled' => true,
        'max_per_user' => 10,
        'frequencies' => [
            'daily',
            'weekly',
            'monthly',
            'quarterly',
            'yearly',
        ],
    ],
];
