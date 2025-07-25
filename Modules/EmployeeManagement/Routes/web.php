<?php

use Illuminate\Support\Facades\Route;
use Modules\EmployeeManagement\Http\Controllers\EmployeeManagementController;
use Modules\EmployeeManagement\Http\Controllers\EmployeeController;
use Modules\EmployeeManagement\Http\Controllers\DepartmentController;
use Modules\EmployeeManagement\Http\Controllers\DesignationController;
use Modules\EmployeeManagement\Http\Controllers\ResignationController;
use Modules\EmployeeManagement\Http\Controllers\SalaryIncrementController;
use Modules\EmployeeManagement\Http\Controllers\EmployeeNumberController;
use Modules\EmployeeManagement\Http\Controllers\PublicDesignationController;
use Inertia\Inertia;
use Modules\EmployeeManagement\Http\Controllers\EmployeeAdvanceController;

// Public routes
Route::get('/api/employees/simple-file-number', [EmployeeNumberController::class, 'generateUniqueFileNumber'])
    ->name('api.employees.simple-file-number');

// Public route for positions
Route::get('/api/designations/public', [DesignationController::class, 'publicIndex'])
    ->name('api.designations.public');

// Public API for positions - no authentication required
Route::group(['prefix' => 'public-api/designations', 'middleware' => ['api'], 'excluded_middleware' => ['web', 'csrf']], function() {
    Route::get('/', [PublicDesignationController::class, 'index']);
    Route::post('/', [PublicDesignationController::class, 'store']);
    Route::put('/{id}', [PublicDesignationController::class, 'update']);
    Route::delete('/{id}', [PublicDesignationController::class, 'destroy']);
});

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

    // Department routes
    Route::get('/departments', [DepartmentController::class, 'index'])
        ->middleware('permission:departments.view')
        ->name('departments.index');
    Route::get('/departments/create', [DepartmentController::class, 'create'])
        ->middleware('permission:departments.create')
        ->name('departments.create');
    Route::post('/departments', [DepartmentController::class, 'store'])
        ->middleware('permission:departments.create')
        ->name('departments.store');
    Route::get('/departments/{department}', [DepartmentController::class, 'show'])
        ->middleware('permission:departments.view')
        ->name('departments.show');
    Route::get('/departments/{department}/edit', [DepartmentController::class, 'edit'])
        ->middleware('permission:departments.edit')
        ->name('departments.edit');
    Route::put('/departments/{department}', [DepartmentController::class, 'update'])
        ->middleware('permission:departments.edit')
        ->name('departments.update');
    Route::delete('/departments/{department}', [DepartmentController::class, 'destroy'])
        ->middleware('permission:departments.delete')
        ->name('departments.destroy');

    // Designation routes
    Route::get('/designations', [DesignationController::class, 'index'])
        ->middleware('permission:designations.view')
        ->name('designations.index');
    Route::get('/designations/create', [DesignationController::class, 'create'])
        ->middleware('permission:designations.create')
        ->name('designations.create');
    Route::post('/designations', [DesignationController::class, 'store'])
        ->middleware('permission:designations.create')
        ->name('designations.store');
    Route::get('/designations/{designation}', [DesignationController::class, 'show'])
        ->middleware('permission:designations.view')
        ->name('designations.show');
    Route::get('/designations/{designation}/edit', [DesignationController::class, 'edit'])
        ->middleware('permission:designations.edit')
        ->name('designations.edit');
    Route::put('/designations/{designation}', [DesignationController::class, 'update'])
        ->middleware('permission:designations.edit')
        ->name('designations.update');
    Route::delete('/designations/{designation}', [DesignationController::class, 'destroy'])
        ->middleware('permission:designations.delete')
        ->name('designations.destroy');

    // Employee document management
    Route::get('/employees/{employee}/documents', function ($employee) {
        return Inertia::render('Employees/Documents', ['employeeId' => $employee]);
    })
        ->middleware('permission:employees.view')
        ->name('employees.documents');

    // Employee document upload routes (web-based)
    Route::post('/employees/{employee}/documents/upload', [\Modules\EmployeeManagement\Http\Controllers\EmployeeDocumentController::class, 'uploadGeneral'])
        ->middleware('permission:employees.edit')
        ->name('employees.documents.upload');

    Route::post('/employees/{employee}/documents/upload/iqama', [\Modules\EmployeeManagement\Http\Controllers\EmployeeDocumentController::class, 'uploadIqama'])
        ->middleware('permission:employees.edit')
        ->name('employees.documents.upload.iqama');

    Route::post('/employees/{employee}/documents/upload/passport', [\Modules\EmployeeManagement\Http\Controllers\EmployeeDocumentController::class, 'uploadPassport'])
        ->middleware('permission:employees.edit')
        ->name('employees.documents.upload.passport');

    Route::post('/employees/{employee}/documents/upload/contract', [\Modules\EmployeeManagement\Http\Controllers\EmployeeDocumentController::class, 'uploadContract'])
        ->middleware('permission:employees.edit')
        ->name('employees.documents.upload.contract');

    Route::post('/employees/{employee}/documents/upload/medical', [\Modules\EmployeeManagement\Http\Controllers\EmployeeDocumentController::class, 'uploadMedical'])
        ->middleware('permission:employees.edit')
        ->name('employees.documents.upload.medical');

    // Employee documents API (web-based)
    Route::get('/employees/{employee}/documents/api', [\Modules\EmployeeManagement\Http\Controllers\EmployeeDocumentController::class, 'index'])
        ->middleware('permission:employees.view')
        ->name('employees.documents.api');

    // Employee document download (web-based)
    Route::get('/employees/{employee}/documents/{document}/download', [\Modules\EmployeeManagement\Http\Controllers\EmployeeDocumentController::class, 'download'])
        ->middleware('permission:employees.view')
        ->name('employees.documents.download');

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
                'status' => $increment->status === 'approved' ? 'applied' : $increment->status,
                'paid_date' => $increment->approved_at,
                'notes' => $increment->notes,
                'requested_by' => $increment->requestedBy ? [
                    'name' => $increment->requestedBy->name
                ] : null,
                'approved_by' => $increment->approvedBy ? [
                    'name' => $increment->approvedBy->name
                ] : null,
            ];
        });

        return Inertia::render('Employees/SalaryHistory', [
            'employeeId' => $employee,
            'employee' => [
                'id' => $employeeModel->id,
                'first_name' => $employeeModel->first_name,
                'last_name' => $employeeModel->last_name,
                'employee_id' => $employeeModel->employee_id,
                'file_number' => $employeeModel->file_number,
            ],
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

    // Employee Advances (EmployeeManagement, not salary advances)
    Route::get('/employees/{employee}/advances/history/api', [\Modules\EmployeeManagement\Http\Controllers\AdvancePaymentController::class, 'apiPaymentHistory'])
        ->middleware('permission:employees.view')
        ->name('employees.advances.history.api');

    Route::delete('/employees/{employee}/advances/{advance}', [\Modules\EmployeeManagement\Http\Controllers\AdvancePaymentController::class, 'destroy'])
        ->middleware('permission:employees.edit')
        ->name('employees.advances.destroy');

    Route::post('/employees/{employee}/advances/{advance}/repayment', [\Modules\EmployeeManagement\Http\Controllers\AdvancePaymentController::class, 'recordRepayment'])
        ->middleware('permission:employees.edit')
        ->name('employees.advances.repayment');

    Route::post('/employees/{employee}/advances', [\Modules\EmployeeManagement\Http\Controllers\AdvancePaymentController::class, 'store'])
        ->middleware('permission:employees.edit')
        ->name('employees.advances.store');

    Route::post('/employees/{employee}/advances/{advance}/approve', [\Modules\EmployeeManagement\Http\Controllers\AdvancePaymentController::class, 'approve'])
        ->middleware('permission:employees.edit')
        ->name('employees.advances.approve');

    Route::delete('/employees/{employee}/advances/repayment/{payment}', [\Modules\EmployeeManagement\Http\Controllers\AdvancePaymentController::class, 'deleteRepayment'])
        ->middleware('permission:employees.edit')
        ->name('employees.advances.repayment.delete');

    Route::get('/employees/{employee}/advances/repayment/{payment}/receipt', [\Modules\EmployeeManagement\Http\Controllers\AdvancePaymentController::class, 'receipt'])
        ->middleware('permission:employees.view')
        ->name('employees.advances.repayment.receipt');
});

// Add access restriction update route
Route::post('/employees/{employee}/access-restrictions', [EmployeeController::class, 'updateAccessRestrictions'])
    ->name('employees.update-access-restrictions')
    ->middleware(['permission:employees.edit']);

Route::middleware(['auth', 'permission:employees.edit'])->group(function () {
    Route::post('/employees/{employee}/assign-manual-assignment', [EmployeeController::class, 'assignManualAssignment'])
        ->name('employees.assignManualAssignment');
    Route::get('/employees/{employee}/assignments/{assignment}/edit', [EmployeeController::class, 'editAssignment'])
        ->name('employees.assignments.edit');
    Route::delete('/employees/{employee}/assignments/{assignment}', [EmployeeController::class, 'destroyAssignment'])
        ->name('employees.assignments.destroy');
    Route::post('/employees/{employee}/assignments/{assignment}/update', [EmployeeController::class, 'updateAssignment'])->name('employees.assignments.update.web');
    Route::post('/employees/{employee}/assignments/manage-statuses', [EmployeeController::class, 'manageAssignmentStatuses'])->name('employees.assignments.manage-statuses');
});

// Employee ERPNext sync (admin only)
Route::post('/employees/sync-from-erpnext', [\Modules\EmployeeManagement\Http\Controllers\EmployeeController::class, 'syncFromERPNext'])->middleware('auth');

// All EmployeeAdvance routes are deprecated. Use PayrollManagement advance routes instead.
// Advance-related routes are now handled in Modules/PayrollManagement/Routes/web.php and api.php

