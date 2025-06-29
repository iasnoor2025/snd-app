<?php
namespace Modules\EmployeeManagement\Domain\Models\Models;

use Modules\EmployeeManagement\Domain\Models\Employee;
use Modules\PayrollManagement\Domain\Models\Payroll;
use Modules\PayrollManagement\Domain\Models\FinalSettlement;
use Modules\EmployeeManagement\Domain\Models\EmployeeResignation;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Carbon\Carbon;

class FinalSettlementTest extends TestCase
{
    use RefreshDatabase;

    protected $employee;
    protected $resignation;

    public function setUp(): void
    {
        parent::setUp();

        // Create an employee for testing
        $this->employee = Employee::factory()->create([
            'first_name' => 'John',
            'last_name' => 'Doe',
            'salary' => 5000, // Monthly salary
            'hire_date' => Carbon::now()->subYears(2), // Hired 2 years ago
            'status' => 'active'
        ]);

        // Create a resignation for the employee
        $this->resignation = EmployeeResignation::factory()->create([
            'employee_id' => $this->employee->id,
            'resignation_date' => Carbon::now()->subDays(30),
            'last_working_day' => Carbon::now()->addDays(30), // 30 days notice period
            'reason' => 'Better opportunity',
            'status' => 'approved'
        ]);
    }

    /** @test */
    public function it_calculates_end_of_service_benefits_correctly()
    {
        // Create a final settlement
        $settlement = FinalSettlement::factory()->create([
            'employee_id' => $this->employee->id,
            'last_working_day' => $this->resignation->last_working_day,
            'status' => 'pending'
        ]);

        // For an employee who worked for 2 years, the benefits should be
        // 21 days salary for each of the first 5 years (daily rate = monthly / 30)
        $dailyRate = $this->employee->salary / 30;
        $expectedBenefit = $dailyRate * 21 * 2; // 21 days per year * 2 years

        $this->assertEquals($expectedBenefit, $settlement->calculateEndOfServiceBenefits());
    }

    /** @test */
    public function it_calculates_unpaid_salary_correctly()
    {
        // Create payroll records for this employee
        Payroll::factory()->create([
            'employee_id' => $this->employee->id,
            'payroll_month' => Carbon::now()->subMonths(2)->startOfMonth(),
            'base_salary' => $this->employee->salary,
            'net_salary' => $this->employee->salary,
            'status' => 'paid'
        ]);

        // Last payroll was 2 months ago, so there's 2 months of unpaid salary
        // (current month plus previous month)
        $settlement = FinalSettlement::factory()->create([
            'employee_id' => $this->employee->id,
            'last_working_day' => $this->resignation->last_working_day,
            'status' => 'pending'
        ]);

        // Get days worked in current month
        $daysInCurrentMonth = Carbon::now()->daysInMonth;
        $daysWorkedInCurrentMonth = min(Carbon::now()->day, $settlement->last_working_day->day);

        // Previous month should be fully paid
        $previousMonthSalary = $this->employee->salary;

        // Current month should be pro-rated based on days worked
        $currentMonthSalary = ($this->employee->salary / $daysInCurrentMonth) * $daysWorkedInCurrentMonth;

        $expectedUnpaidSalary = $previousMonthSalary + $currentMonthSalary;

        $this->assertEquals($expectedUnpaidSalary, $settlement->calculateUnpaidSalary());
    }

    /** @test */
    public function it_calculates_unpaid_leave_balance_correctly()
    {
        // Assume the employee has 10 days of unutilized leave
        $this->employee->update(['leave_balance' => 10]);

        $settlement = FinalSettlement::factory()->create([
            'employee_id' => $this->employee->id,
            'last_working_day' => $this->resignation->last_working_day,
            'status' => 'pending'
        ]);

        // Leave balance payment should be daily rate * leave days
        $dailyRate = $this->employee->salary / 30;
        $expectedLeavePayment = $dailyRate * 10;

        $this->assertEquals($expectedLeavePayment, $settlement->calculateLeaveBalance());
    }

    /** @test */
    public function it_calculates_deductions_correctly()
    {
        // Create a final settlement with deductions
        $settlement = FinalSettlement::factory()->create([
            'employee_id' => $this->employee->id,
            'last_working_day' => $this->resignation->last_working_day,
            'status' => 'pending',
            'deductions' => [
                'loan_balance' => 1000,
                'advance_salary' => 500,
                'company_property' => 300,
                'other_deductions' => 200
            ]
        ]);

        $expectedTotalDeductions = 1000 + 500 + 300 + 200; // Sum of all deductions

        $this->assertEquals($expectedTotalDeductions, $settlement->calculateTotalDeductions());
    }

    /** @test */
    public function it_calculates_overtime_correctly()
    {
        // Create overtime records for this employee in the payroll system
        // Assume the last payroll is 2 months ago with 10 hours of unpaid overtime
        $payroll = Payroll::factory()->create([
            'employee_id' => $this->employee->id,
            'payroll_month' => Carbon::now()->subMonths(2)->startOfMonth(),
            'base_salary' => $this->employee->salary,
            'net_salary' => $this->employee->salary,
            'overtime_hours' => 10,
            'overtime_amount' => 0, // Unpaid overtime
            'status' => 'paid'
        ]);

        $settlement = FinalSettlement::factory()->create([
            'employee_id' => $this->employee->id,
            'last_working_day' => $this->resignation->last_working_day,
            'status' => 'pending'
        ]);

        // Overtime rate is typically 1.5x the hourly rate
        // Hourly rate = (monthly salary / (22 days * 8 hours))
        $hourlyRate = $this->employee->salary / (22 * 8);
        $overtimeRate = $hourlyRate * 1.5;
        $expectedOvertimeAmount = $overtimeRate * 10; // 10 hours of overtime

        $this->assertEquals($expectedOvertimeAmount, $settlement->calculateUnpaidOvertime());
    }

    /** @test */
    public function it_calculates_net_settlement_amount_correctly()
    {
        // Set up employee with specific benefits, leave, and deductions
        $this->employee->update([
            'salary' => 6000,
            'leave_balance' => 15,
            'hire_date' => Carbon::now()->subYears(3)->subMonths(6) // 3.5 years
        ]);

        // Create a settlement with specific deductions
        $settlement = FinalSettlement::factory()->create([
            'employee_id' => $this->employee->id,
            'last_working_day' => $this->resignation->last_working_day,
            'status' => 'pending',
            'deductions' => [
                'loan_balance' => 2000,
                'other_deductions' => 500
            ]
        ]);

        // Create a payroll record to establish last paid month
        Payroll::factory()->create([
            'employee_id' => $this->employee->id,
            'payroll_month' => Carbon::now()->subMonths(1)->startOfMonth(),
            'base_salary' => 6000,
            'net_salary' => 6000,
            'status' => 'paid'
        ]);

        // Calculate the expected settlement amount

        // 1. End of service benefits (21 days per year for first 5 years)
        $dailyRate = 6000 / 30;
        $yearsOfService = 3.5;
        $endOfServiceBenefits = $dailyRate * 21 * $yearsOfService;

        // 2. Unpaid salary (assume half a month)
        $daysInCurrentMonth = Carbon::now()->daysInMonth;
        $daysWorkedInCurrentMonth = min(Carbon::now()->day, $settlement->last_working_day->day);
        $unpaidSalary = (6000 / $daysInCurrentMonth) * $daysWorkedInCurrentMonth;

        // 3. Leave balance (15 days)
        $leaveBalance = $dailyRate * 15;

        // 4. Deductions
        $deductions = 2000 + 500;

        // Calculate net settlement
        $expectedNetSettlement = $endOfServiceBenefits + $unpaidSalary + $leaveBalance - $deductions;

        $this->assertEquals(round($expectedNetSettlement, 2), round($settlement->calculateNetSettlementAmount(), 2));
    }

    /** @test */
    public function it_handles_employee_termination_differently_than_resignation()
    {
        // Create a terminated employee (company initiated)
        $terminatedEmployee = Employee::factory()->create([
            'salary' => 5000,
            'hire_date' => Carbon::now()->subYears(1), // 1 year of service
            'status' => 'terminated'
        ]);

        // Create a termination settlement
        $terminationSettlement = FinalSettlement::factory()->create([
            'employee_id' => $terminatedEmployee->id,
            'last_working_day' => Carbon::now(),
            'status' => 'pending',
            'termination_type' => 'company_initiated'
        ]);

        // Company initiated termination might have additional benefits
        // For example, 1 month notice pay if not given proper notice
        $dailyRate = $terminatedEmployee->salary / 30;
        $baseEndOfServiceBenefit = $dailyRate * 21 * 1; // 21 days per year * 1 year
        $additionalBenefit = $terminatedEmployee->salary; // 1 month notice pay

        $expectedTotalBenefit = $baseEndOfServiceBenefit + $additionalBenefit;

        // The method might have different implementation for termination
        $this->assertEquals($expectedTotalBenefit, $terminationSettlement->calculateTerminationBenefits());
    }
}

