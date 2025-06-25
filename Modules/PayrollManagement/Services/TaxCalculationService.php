<?php

namespace Modules\PayrollManagement\Services;

use Carbon\Carbon;
use Illuminate\Support\Collection;
use Modules\PayrollManagement\Models\TaxRule;
use Modules\PayrollManagement\Models\TaxBracket;
use Modules\PayrollManagement\Models\TaxDeduction;
use Modules\PayrollManagement\Models\Employee;
use Modules\PayrollManagement\Models\Payroll;

class TaxCalculationService
{
    /**
     * Calculate taxes for a payroll entry
     */
    public function calculateTaxes(Payroll $payroll): array
    {
        $employee = $payroll->employee;
        $grossIncome = $payroll->gross_amount;
        $taxableIncome = $this->calculateTaxableIncome($payroll);
        
        // Get applicable tax rules
        $taxRules = $this->getApplicableTaxRules($employee);
        
        $taxDetails = [];
        $totalTax = 0;
        
        foreach ($taxRules as $rule) {
            $taxAmount = $this->calculateTaxByRule($taxableIncome, $rule);
            $totalTax += $taxAmount;
            
            $taxDetails[] = [
                'rule_id' => $rule->id,
                'rule_name' => $rule->name,
                'tax_amount' => $taxAmount,
                'tax_rate' => $rule->rate,
                'taxable_income' => $taxableIncome,
                'calculation_method' => $rule->calculation_method,
            ];
        }
        
        return [
            'gross_income' => $grossIncome,
            'taxable_income' => $taxableIncome,
            'total_tax' => $totalTax,
            'tax_details' => $taxDetails,
            'calculation_date' => Carbon::now(),
        ];
    }

    /**
     * Calculate taxable income after deductions
     */
    protected function calculateTaxableIncome(Payroll $payroll): float
    {
        $grossIncome = $payroll->gross_amount;
        $deductions = $this->getTaxDeductions($payroll);
        
        return $grossIncome - $deductions->sum('amount');
    }

    /**
     * Get applicable tax rules for an employee
     */
    protected function getApplicableTaxRules(Employee $employee): Collection
    {
        return TaxRule::where('status', 'active')
            ->where(function ($query) use ($employee) {
                $query->where('employee_category', $employee->category)
                    ->orWhere('employee_category', 'all');
            })
            ->where('effective_from', '<=', Carbon::now())
            ->where(function ($query) {
                $query->where('effective_until', '>=', Carbon::now())
                    ->orWhereNull('effective_until');
            })
            ->get();
    }

    /**
     * Calculate tax amount based on a specific rule
     */
    protected function calculateTaxByRule(float $taxableIncome, TaxRule $rule): float
    {
        if ($rule->calculation_method === 'flat_rate') {
            return $this->calculateFlatRateTax($taxableIncome, $rule);
        }
        
        if ($rule->calculation_method === 'progressive') {
            return $this->calculateProgressiveTax($taxableIncome, $rule);
        }
        
        if ($rule->calculation_method === 'threshold_based') {
            return $this->calculateThresholdBasedTax($taxableIncome, $rule);
        }
        
        throw new \InvalidArgumentException("Unsupported tax calculation method: {$rule->calculation_method}");
    }

    /**
     * Calculate flat rate tax
     */
    protected function calculateFlatRateTax(float $taxableIncome, TaxRule $rule): float
    {
        return $taxableIncome * ($rule->rate / 100);
    }

    /**
     * Calculate progressive tax using brackets
     */
    protected function calculateProgressiveTax(float $taxableIncome, TaxRule $rule): float
    {
        $brackets = TaxBracket::where('tax_rule_id', $rule->id)
            ->orderBy('income_from')
            ->get();
            
        $totalTax = 0;
        $remainingIncome = $taxableIncome;
        
        foreach ($brackets as $bracket) {
            if ($remainingIncome <= 0) {
                break;
            }
            
            $bracketAmount = $bracket->income_to 
                ? min($remainingIncome, $bracket->income_to - $bracket->income_from)
                : $remainingIncome;
                
            $totalTax += $bracketAmount * ($bracket->rate / 100);
            $remainingIncome -= $bracketAmount;
        }
        
        return $totalTax;
    }

    /**
     * Calculate threshold-based tax
     */
    protected function calculateThresholdBasedTax(float $taxableIncome, TaxRule $rule): float
    {
        $brackets = TaxBracket::where('tax_rule_id', $rule->id)
            ->orderBy('income_from')
            ->get();
            
        foreach ($brackets as $bracket) {
            if ($taxableIncome >= $bracket->income_from && 
                (!$bracket->income_to || $taxableIncome <= $bracket->income_to)) {
                return $taxableIncome * ($bracket->rate / 100);
            }
        }
        
        return 0;
    }

    /**
     * Get tax deductions for a payroll entry
     */
    protected function getTaxDeductions(Payroll $payroll): Collection
    {
        return TaxDeduction::where('payroll_id', $payroll->id)
            ->where('status', 'approved')
            ->get();
    }

    /**
     * Generate tax report for a period
     */
    public function generateTaxReport(Carbon $startDate, Carbon $endDate, ?string $employeeCategory = null): array
    {
        $query = Payroll::whereBetween('payment_date', [$startDate, $endDate]);
        
        if ($employeeCategory) {
            $query->whereHas('employee', function ($q) use ($employeeCategory) {
                $q->where('category', $employeeCategory);
            });
        }
        
        $payrolls = $query->with(['employee', 'taxDeductions'])->get();
        
        $reportData = [
            'period_start' => $startDate->format('Y-m-d'),
            'period_end' => $endDate->format('Y-m-d'),
            'total_gross_income' => 0,
            'total_taxable_income' => 0,
            'total_tax' => 0,
            'total_deductions' => 0,
            'employee_category' => $employeeCategory ?? 'all',
            'tax_details' => [],
            'employee_details' => [],
        ];
        
        foreach ($payrolls as $payroll) {
            $taxCalculation = $this->calculateTaxes($payroll);
            
            $reportData['total_gross_income'] += $taxCalculation['gross_income'];
            $reportData['total_taxable_income'] += $taxCalculation['taxable_income'];
            $reportData['total_tax'] += $taxCalculation['total_tax'];
            $reportData['total_deductions'] += $payroll->taxDeductions->sum('amount');
            
            $reportData['employee_details'][] = [
                'employee_id' => $payroll->employee_id,
                'employee_name' => $payroll->employee->name,
                'gross_income' => $taxCalculation['gross_income'],
                'taxable_income' => $taxCalculation['taxable_income'],
                'total_tax' => $taxCalculation['total_tax'],
                'tax_details' => $taxCalculation['tax_details'],
            ];
        }
        
        return $reportData;
    }

    /**
     * Calculate year-end tax adjustments
     */
    public function calculateYearEndAdjustments(Employee $employee, int $year): array
    {
        $startDate = Carbon::create($year, 1, 1);
        $endDate = Carbon::create($year, 12, 31);
        
        $payrolls = Payroll::where('employee_id', $employee->id)
            ->whereBetween('payment_date', [$startDate, $endDate])
            ->with(['taxDeductions'])
            ->get();
            
        $totalGrossIncome = $payrolls->sum('gross_amount');
        $totalTaxPaid = 0;
        $totalDeductions = 0;
        
        foreach ($payrolls as $payroll) {
            $taxCalculation = $this->calculateTaxes($payroll);
            $totalTaxPaid += $taxCalculation['total_tax'];
            $totalDeductions += $payroll->taxDeductions->sum('amount');
        }
        
        $finalTaxCalculation = $this->calculateTaxes(
            new Payroll(['gross_amount' => $totalGrossIncome])
        );
        
        $adjustment = $finalTaxCalculation['total_tax'] - $totalTaxPaid;
        
        return [
            'year' => $year,
            'total_gross_income' => $totalGrossIncome,
            'total_deductions' => $totalDeductions,
            'total_tax_paid' => $totalTaxPaid,
            'final_tax_calculation' => $finalTaxCalculation['total_tax'],
            'adjustment_amount' => $adjustment,
            'adjustment_type' => $adjustment > 0 ? 'additional_payment' : 'refund',
            'calculation_details' => $finalTaxCalculation,
        ];
    }
} 