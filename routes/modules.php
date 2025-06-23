<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Module Direct Routes
|--------------------------------------------------------------------------
|
| This file contains routes that map directly to module routes but with
| cleaner URL paths for frontend usage. These redirect to the appropriate
| module routes.
|
*/

// Direct routes for leave requests
Route::middleware(['auth', 'verified'])->prefix('leave-requests')->group(function () {
    Route::get('/', function () {
        return Inertia::render('LeaveRequests/Index');
    });
});

// Direct routes for timesheets
Route::middleware(['auth', 'verified'])->prefix('timesheets')->group(function () {
    Route::get('/', function () {
        return Inertia::render('Timesheets/Index', [
            'timesheets' => [
                'data' => [],
                'current_page' => 1,
                'per_page' => 15,
                'last_page' => 1,
                'total' => 0
            ],
            'filters' => [
                'status' => 'all',
                'search' => '',
                'date_from' => '',
                'date_to' => '',
                'per_page' => 15
            ]
        ]);
    });
});

// Direct routes for rentals
Route::middleware(['auth', 'verified'])->prefix('rentals')->group(function () {
    Route::get('/', function () {
        return Inertia::render('Rentals/Index');
    });
});

// Direct routes for payrolls
Route::middleware(['auth', 'verified'])->prefix('payrolls')->group(function () {
    Route::get('/', function () {
        return redirect()->route('payroll.index');
    });
});

// Direct routes for localization
Route::middleware(['auth', 'verified'])->prefix('localization')->group(function () {
    Route::get('/', function () {
        return Inertia::render('Localization/Index');
    });
});

// Direct routes for audit
Route::middleware(['auth', 'verified'])->prefix('audit')->group(function () {
    Route::get('/', function () {
        return redirect()->route('audit.index');
    });
});

// Direct routes for leaves
Route::middleware(['auth', 'verified'])->prefix('leaves')->group(function () {
    Route::get('/', function () {
        return Inertia::render('LeaveRequests/Index');
    });
});

// Direct route for leave
Route::middleware(['auth', 'verified'])->get('/leave', function () {
    return redirect('/leaves');
});
