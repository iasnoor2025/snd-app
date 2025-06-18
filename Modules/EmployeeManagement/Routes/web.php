<?php

use Illuminate\Support\Facades\Route;
use Modules\EmployeeManagement\Http\Controllers\EmployeeManagementController;
use Modules\EmployeeManagement\Http\Controllers\EmployeeController;
use Modules\EmployeeManagement\Http\Controllers\ResignationController;
use Modules\EmployeeManagement\Http\Controllers\SalaryIncrementController;
use Inertia\Inertia;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('employeemanagements', EmployeeManagementController::class)
        ->middleware([
            'permission:employeemanagement.view',
        ])
        ->names('employeemanagement');

    // Employees index
    Route::get('/employees', [EmployeeController::class, 'index'])
        ->middleware('permission:employees.view')
        ->name('employees.index');

    // Employees routes
    Route::get('/employees/create', [EmployeeController::class, 'create'])
        ->middleware('permission:employees.create')
        ->name('employees.create');
    Route::post('/employees', [EmployeeController::class, 'store'])
        ->middleware('permission:employees.create')
        ->name('employees.store');
    Route::get('/employees/{employee}', [EmployeeController::class, 'show'])
        ->middleware('permission:employees.view')
        ->name('employees.show');
    Route::get('/employees/{employee}/edit', [EmployeeController::class, 'edit'])
        ->middleware('permission:employees.edit')
        ->name('employees.edit');
    Route::put('/employees/{employee}', [EmployeeController::class, 'update'])
        ->middleware('permission:employees.edit')
        ->name('employees.update');
    Route::delete('/employees/{employee}', [EmployeeController::class, 'destroy'])
        ->middleware('permission:employees.delete')
        ->name('employees.destroy');

    // Employee document management
    Route::get('/employees/{employee}/documents', function ($employee) {
        return Inertia::render('Employees/Documents', ['employeeId' => $employee]);
    })
        ->middleware('permission:employees.view')
        ->name('employees.documents');

    // Employee timesheet history
    Route::get('/employees/{employee}/timesheet-history', function ($employee) {
        return Inertia::render('Employees/TimesheetHistory', ['employeeId' => $employee]);
    })
        ->middleware('permission:employees.view')
        ->name('employees.timesheet-history');

    // Employee performance reviews
    Route::get('/employees/{employee}/performance-reviews', function ($employee) {
        return Inertia::render('Employees/PerformanceReviews', ['employeeId' => $employee]);
    })
        ->middleware('permission:employees.view')
        ->name('employees.performance-reviews');

    // Employee performance management
    Route::get('/employees/{employee}/performance-management', function ($employee) {
        return Inertia::render('Employees/PerformanceManagement', ['employeeId' => $employee]);
    })
        ->middleware('permission:employees.view')
        ->name('employees.performance-management');

    // Employee salary history
    Route::get('/employees/{employee}/salary-history', function ($employee) {
        $employeeModel = \Modules\EmployeeManagement\Domain\Models\Employee::findOrFail($employee);

        // Get salary increments and transform them to match the expected structure
        $salaryIncrements = \Modules\EmployeeManagement\Domain\Models\SalaryIncrement::forEmployee($employee)
            ->with(['requestedBy', 'approvedBy'])
            ->where('status', 'approved')
            ->latest('effective_date')
            ->get();

        $records = $salaryIncrements->map(function ($increment) {
            $basicSalary = (float) ($increment->new_base_salary ?? 0);
            $foodAllowance = (float) ($increment->new_food_allowance ?? 0);
            $housingAllowance = (float) ($increment->new_housing_allowance ?? 0);
            $transportAllowance = (float) ($increment->new_transport_allowance ?? 0);

            return [
                'id' => $increment->id,
                'salary_month' => $increment->effective_date,
                'basic_salary' => $basicSalary,
                'food_allowance' => $foodAllowance,
                'housing_allowance' => $housingAllowance,
                'transport_allowance' => $transportAllowance,
                'overtime_amount' => 0.0, // Not available in salary increments
                'deductions' => 0.0, // Not available in salary increments
                'net_salary' => $basicSalary + $foodAllowance + $housingAllowance + $transportAllowance,
                'status' => $increment->status === 'approved' ? 'approved' : $increment->status,
                'paid_date' => $increment->approved_at,
                'notes' => $increment->notes,
            ];
        });

        return Inertia::render('Employees/SalaryHistory', [
            'employeeId' => $employee,
            'records' => $records
        ]);
    })
        ->middleware('permission:employees.view')
        ->name('employees.salary-history');

    // Employee leave history
    Route::get('/employees/{employee}/leave-history', function ($employee) {
        $employeeService = app(\Modules\EmployeeManagement\Services\EmployeeService::class);
        $records = $employeeService->getEmployeeLeaveHistory($employee);

        return Inertia::render('Employees/LeaveHistory', [
            'employeeId' => $employee,
            'records' => $records
        ]);
    })
        ->middleware('permission:employees.view')
        ->name('employees.leave-history');

    // Add resignations.create route for the frontend
    Route::get('/resignations/create', [ResignationController::class, 'create'])
        ->middleware('permission:resignations.create')
        ->name('resignations.create');

    // Salary Increment routes
    Route::get('/salary-increments', [SalaryIncrementController::class, 'index'])
        ->middleware('permission:salary-increments.view')
        ->name('salary-increments.index');
    Route::get('/salary-increments/create', [SalaryIncrementController::class, 'create'])
        ->middleware('permission:salary-increments.create')
        ->name('salary-increments.create');
    Route::post('/salary-increments', [SalaryIncrementController::class, 'store'])
        ->middleware('permission:salary-increments.create')
        ->name('salary-increments.store');
    Route::get('/salary-increments/{salaryIncrement}', [SalaryIncrementController::class, 'show'])
        ->middleware('permission:salary-increments.view')
        ->name('salary-increments.show');
    Route::get('/salary-increments/{salaryIncrement}/edit', [SalaryIncrementController::class, 'edit'])
        ->middleware('permission:salary-increments.edit')
        ->name('salary-increments.edit');
    Route::put('/salary-increments/{salaryIncrement}', [SalaryIncrementController::class, 'update'])
        ->middleware('permission:salary-increments.edit')
        ->name('salary-increments.update');
    Route::delete('/salary-increments/{salaryIncrement}', [SalaryIncrementController::class, 'destroy'])
        ->middleware('permission:salary-increments.delete')
        ->name('salary-increments.destroy');
    Route::post('/salary-increments/{salaryIncrement}/approve', [SalaryIncrementController::class, 'approve'])
        ->middleware('permission:salary-increments.approve')
        ->name('salary-increments.approve');
    Route::post('/salary-increments/{salaryIncrement}/reject', [SalaryIncrementController::class, 'reject'])
        ->middleware('permission:salary-increments.approve')
        ->name('salary-increments.reject');
    Route::post('/salary-increments/{salaryIncrement}/apply', [SalaryIncrementController::class, 'apply'])
        ->middleware('permission:salary-increments.apply')
        ->name('salary-increments.apply');
});

// Add access restriction update route
Route::post('/employees/{employee}/access-restrictions', [EmployeeController::class, 'updateAccessRestrictions'])
    ->name('employees.update-access-restrictions')
    ->middleware(['permission:employees.edit']);

