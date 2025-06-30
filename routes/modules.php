<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Modules\EmployeeManagement\Domain\Models\Employee;
use Modules\ProjectManagement\Domain\Models\Project;
use Modules\RentalManagement\Domain\Models\Rental;
use Modules\RentalManagement\Domain\Models\RentalItem;

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

    Route::get('/create', function () {
        return Inertia::render('LeaveRequests/Create');
    });
});

// Direct routes for timesheets are handled by the TimesheetManagement module

// Direct routes for HR timesheets
Route::middleware(['auth', 'verified'])->prefix('hr/timesheets')->group(function () {
    Route::get('/', function () {
        return redirect()->route('hr.api.timesheets.index');
    });

    Route::get('/create', function () {
        // Fetch required data for the Create component
        $employees = Employee::select(['id', 'first_name', 'last_name'])->get();
        $projects = Project::select(['id', 'name'])->get();

        // Get rentals with their equipment through rental items
        $rentals = Rental::select(['id', 'rental_number'])
            ->with(['rentalItems.equipment:id,name'])
            ->get()
            ->map(function ($rental) {
                return [
                    'id' => $rental->id,
                    'rental_number' => $rental->rental_number,
                    'equipment' => $rental->rentalItems->first() ? [
                        'name' => $rental->rentalItems->first()->equipment->name ?? 'Unknown'
                    ] : ['name' => 'No equipment']
                ];
            });

        return Inertia::render('Timesheets/Create', [
            'employees' => $employees,
            'projects' => $projects,
            'rentals' => $rentals,
            'include_rentals' => true
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
        return redirect('/hr/payroll');
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

    Route::get('/create', function () {
        return Inertia::render('LeaveRequests/Create');
    });
});

// Direct route for leave
Route::middleware(['auth', 'verified'])->get('/leave', function () {
    return redirect('/leaves');
});
