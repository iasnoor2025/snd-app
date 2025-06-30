<?php

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

use Illuminate\Support\Facades\Route;
use Modules\TimesheetManagement\Http\Controllers\TimesheetController;
use Modules\TimesheetManagement\Http\Controllers\TimesheetDashboardController;
use Modules\TimesheetManagement\Http\Controllers\WeeklyTimesheetController;
use Modules\TimesheetManagement\Http\Controllers\TimeEntryController;
use Modules\TimesheetManagement\Http\Controllers\OvertimeController;
use Modules\TimesheetManagement\Http\Controllers\TimesheetApprovalController;
use Modules\TimesheetManagement\Http\Controllers\TimesheetReportController;
use Modules\TimesheetManagement\Http\Controllers\TimesheetProjectController;
use Modules\TimesheetManagement\Http\Controllers\TimesheetSettingController;
use Inertia\Inertia;

Route::prefix('timesheets')->name('timesheets.')->middleware(['auth', 'verified'])->group(function () {
    // Dashboard
    Route::get('/', [TimesheetController::class, 'index'])
        ->middleware('permission:timesheets.view')
        ->name('index');
    Route::get('/dashboard', [TimesheetDashboardController::class, 'index'])
        ->middleware('permission:timesheets.view')
        ->name('dashboard');

    // Timesheets CRUD
    Route::get('/create', [TimesheetController::class, 'create'])
        ->middleware('permission:timesheets.create')
        ->name('create');
    Route::post('/', [TimesheetController::class, 'store'])
        ->middleware('permission:timesheets.create')
        ->name('store');
    Route::post('/bulk', [TimesheetController::class, 'storeBulk'])
        ->middleware('permission:timesheets.create')
        ->name('store-bulk');
    Route::post('/check-duplicate', [TimesheetController::class, 'checkDuplicate'])
        ->middleware('permission:timesheets.view')
        ->name('check-duplicate');
    Route::get('/monthly', [TimesheetController::class, 'monthly'])
        ->middleware('permission:timesheets.view')
        ->name('monthly');
    Route::get('/summary', [TimesheetController::class, 'summary'])
        ->middleware('permission:timesheets.view')
        ->name('summary');
    Route::get('/{timesheet}', [TimesheetController::class, 'show'])
        ->middleware('permission:timesheets.view')
        ->name('show');
    Route::get('/{timesheet}/edit', [TimesheetController::class, 'edit'])
        ->middleware('permission:timesheets.edit')
        ->name('edit');
    Route::put('/{timesheet}', [TimesheetController::class, 'update'])
        ->middleware('permission:timesheets.edit')
        ->name('update');
    Route::delete('/{timesheet}', [TimesheetController::class, 'destroy'])
        ->middleware('permission:timesheets.delete')
        ->name('destroy');
    Route::post('/{timesheet}/submit', [TimesheetController::class, 'submit'])
        ->middleware('permission:timesheets.edit')
        ->name('submit');
    Route::put('/{timesheet}/approve', [TimesheetController::class, 'approveWeb'])
        ->middleware('permission:timesheets.approve')
        ->name('approve');
    Route::put('/{timesheet}/reject', [TimesheetController::class, 'rejectWeb'])
        ->middleware('permission:timesheets.approve')
        ->name('reject');
    Route::post('/bulk-approve', [TimesheetController::class, 'bulkApproveWeb'])
        ->middleware('permission:timesheets.approve')
        ->name('bulk-approve');

    // Daily timesheet entries
    Route::get('/entries', [TimeEntryController::class, 'index'])
        ->middleware('permission:timesheets.view')
        ->name('entries.index');
    Route::get('/entries/create', [TimeEntryController::class, 'create'])
        ->middleware('permission:timesheets.create')
        ->name('entries.create');
    Route::post('/entries', [TimeEntryController::class, 'store'])
        ->middleware('permission:timesheets.create')
        ->name('entries.store');
    Route::get('/entries/{entryId}', [TimeEntryController::class, 'show'])
        ->middleware('permission:timesheets.view')
        ->name('entries.show');
    Route::get('/entries/{entryId}/edit', [TimeEntryController::class, 'edit'])
        ->middleware('permission:timesheets.edit')
        ->name('entries.edit');
    Route::put('/entries/{entryId}', [TimeEntryController::class, 'update'])
        ->middleware('permission:timesheets.edit')
        ->name('entries.update');
    Route::delete('/entries/{entryId}', [TimeEntryController::class, 'destroy'])
        ->middleware('permission:timesheets.delete')
        ->name('entries.destroy');

    // Overtime entries
    Route::get('/overtime', [OvertimeController::class, 'index'])
        ->middleware('permission:timesheets.view')
        ->name('overtime.index');
    Route::get('/overtime/create', [OvertimeController::class, 'create'])
        ->middleware('permission:timesheets.create')
        ->name('overtime.create');
    Route::post('/overtime', [OvertimeController::class, 'store'])
        ->middleware('permission:timesheets.create')
        ->name('overtime.store');

    // Approval routes
    Route::get('/approvals', [TimesheetApprovalController::class, 'index'])
        ->middleware('permission:timesheets.view')
        ->name('approvals.index');
    Route::put('/approvals/{timesheetId}/approve', [TimesheetApprovalController::class, 'approve'])
        ->middleware('permission:timesheets.edit')
        ->name('approvals.approve');
    Route::put('/approvals/{timesheetId}/reject', [TimesheetApprovalController::class, 'reject'])
        ->middleware('permission:timesheets.edit')
        ->name('approvals.reject');

    // Reports
    Route::get('/reports', [TimesheetReportController::class, 'index'])
        ->middleware('permission:timesheets.view')
        ->name('reports.index');
    Route::post('/reports/generate', [TimesheetReportController::class, 'generate'])
        ->middleware('permission:timesheets.view')
        ->name('reports.generate');
    Route::get('/reports/export', [TimesheetReportController::class, 'export'])
        ->middleware('permission:timesheets.view')
        ->name('reports.export');
    Route::get('/reports/monthly', [TimesheetReportController::class, 'monthlyReport'])
        ->middleware('permission:timesheets.view')
        ->name('reports.monthly');
    Route::get('/reports/payslip/{employeeId}/{month}', [TimesheetReportController::class, 'generatePaySlip'])
        ->middleware('permission:timesheets.view')
        ->name('reports.payslip');

    // Projects for timesheet
    Route::get('/projects', [TimesheetProjectController::class, 'index'])
        ->middleware('permission:timesheets.view')
        ->name('projects.index');

    // Settings
    Route::get('/settings', [TimesheetSettingController::class, 'edit'])
        ->middleware('can:manage-timesheet-settings')
        ->name('settings.edit');
    Route::put('/settings', [TimesheetSettingController::class, 'update'])
        ->middleware('can:manage-timesheet-settings')
        ->name('settings.update');

    // Additional routes with permission middleware
    Route::middleware(['permission:timesheets.view'])->group(function () {
        Route::get('/monthly-report', [TimesheetController::class, 'monthlyReport'])->name('monthly-report');
        Route::get('/pay-slip/{employee}/{month}', [TimesheetController::class, 'generatePaySlip'])->name('pay-slip');
        Route::get('/html-pay-slip/{employee}/{month}', [TimesheetController::class, 'generateHtmlPaySlip'])->name('html-pay-slip');
        Route::get('/pay-slip-test/{employee?}/{month?}', function($employee = null, $month = null) {
            return Inertia::render('Timesheets/PaySlipTest', [
                'employeeId' => $employee,
                'month' => $month,
            ]);
        })->name('pay-slip-test');

        // Alternative direct pay slip route that bypasses some middleware
        Route::get('/direct-pay-slip/{employee}/{month}', function($employee, $month) {
            // Get the employee
            $employee = \Modules\EmployeeManagement\Domain\Models\Employee::select([
                'id', 'first_name', 'last_name', 'employee_id', 'position'
            ])->findOrFail($employee);

            // Parse the month
            list($year, $monthNum) = explode('-', $month);
            $startDate = "{$year}-{$monthNum}-01";
            $endDate = date('Y-m-t', strtotime($startDate));
            $monthName = date('F', strtotime($startDate));

            // Get timesheets
            $timesheets = \Modules\TimesheetManagement\Domain\Models\Timesheet::where('employee_id', $employee->id)
                ->whereBetween('date', [$startDate, $endDate])
                ->orderBy('date')
                ->get();

            // Calculate totals
            $totalRegularHours = $timesheets->sum('hours_worked');
            $totalOvertimeHours = $timesheets->sum('overtime_hours');
            $totalHours = $totalRegularHours + $totalOvertimeHours;
            $daysWorked = $timesheets->count();

            // Create calendar data
            $calendar = [];
            foreach ($timesheets as $timesheet) {
                $date = $timesheet->date;
                $dayOfWeek = date('w', strtotime($date));
                $dayName = date('D', strtotime($date));

                $calendar[(string)$date] = [
                    'date' => $date,
                    'day_of_week' => (string)$dayOfWeek,
                    'day_name' => $dayName,
                    'regular_hours' => $timesheet->hours_worked,
                    'overtime_hours' => $timesheet->overtime_hours,
                ];
            }

            // Fill in missing days
            $currentDate = new \DateTime($startDate);
            $lastDate = new \DateTime($endDate);

            while ($currentDate <= $lastDate) {
                $dateString = $currentDate->format('Y-m-d');
                if (!isset($calendar[$dateString])) {
                    $calendar[$dateString] = [
                        'date' => $dateString,
                        'day_of_week' => (string)$currentDate->format('w'),
                        'day_name' => $currentDate->format('D'),
                        'regular_hours' => 0,
                        'overtime_hours' => 0,
                    ];
                }
                $currentDate->modify('+1 day');
            }

            return Inertia::render('Timesheets/PaySlip', [
                'employee' => $employee,
                'month' => $monthName,
                'year' => $year,
                'start_date' => $startDate,
                'end_date' => $endDate,
                'total_regular_hours' => $totalRegularHours,
                'total_overtime_hours' => $totalOvertimeHours,
                'total_hours' => $totalHours,
                'days_worked' => $daysWorked,
                'calendar' => $calendar,
            ]);
        })->name('direct-pay-slip');
    });
});




