<?php

namespace Modules\PayrollManagement\Services;

use Carbon\Carbon;
use Illuminate\Support\Collection;
use Modules\PayrollManagement\Models\DeductionRule;
use Modules\PayrollManagement\Models\DeductionTemplate;
use Modules\PayrollManagement\Models\PayrollDeduction;
use Modules\PayrollManagement\Models\Employee;
use Modules\PayrollManagement\Models\Payroll;
use Modules\Core\Services\NotificationService;
use Illuminate\Support\Facades\DB;

class DeductionRuleService
{
    protected NotificationService $notificationService;
    
    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    /**
     * Create a new deduction rule
     */
    public function createRule(array $data): DeductionRule
    {
        return DB::transaction(function () use ($data) {
            $rule = DeductionRule::create([
                'name' => $data['name'],
                'description' => $data['description'] ?? null,
                'type' => $data['type'],
                'calculation_method' => $data['calculation_method'],
                'amount' => $data['amount'] ?? null,
                'percentage' => $data['percentage'] ?? null,
                'frequency' => $data['frequency'],
                'effective_from' => $data['effective_from'],
                'effective_until' => $data['effective_until'] ?? null,
                'requires_approval' => $data['requires_approval'] ?? false,
                'auto_apply' => $data['auto_apply'] ?? false,
                'employee_category' => $data['employee_category'] ?? 'all',
                'status' => $data['status'] ?? 'draft',
                'metadata' => $data['metadata'] ?? null,
            ]);

            if (isset($data['conditions'])) {
                foreach ($data['conditions'] as $condition) {
                    $rule->conditions()->create($condition);
                }
            }

            return $rule;
        });
    }

    /**
     * Create a deduction template
     */
    public function createTemplate(array $data): DeductionTemplate
    {
        return DeductionTemplate::create([
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
            'rules' => $data['rules'],
            'metadata' => $data['metadata'] ?? null,
        ]);
    }

    /**
     * Apply deduction template to employees
     */
    public function applyTemplate(DeductionTemplate $template, Collection $employees): Collection
    {
        $results = collect();

        foreach ($employees as $employee) {
            try {
                $deductions = $this->applyTemplateToEmployee($template, $employee);
                $results->push([
                    'employee_id' => $employee->id,
                    'status' => 'success',
                    'deductions' => $deductions,
                ]);
            } catch (\Exception $e) {
                $results->push([
                    'employee_id' => $employee->id,
                    'status' => 'error',
                    'message' => $e->getMessage(),
                ]);
            }
        }

        return $results;
    }

    /**
     * Apply template to a single employee
     */
    protected function applyTemplateToEmployee(DeductionTemplate $template, Employee $employee): Collection
    {
        $deductions = collect();

        foreach ($template->rules as $ruleData) {
            $rule = $this->createRule(array_merge($ruleData, [
                'employee_category' => $employee->category,
                'status' => 'active',
            ]));

            $deductions->push($rule);
        }

        return $deductions;
    }

    /**
     * Calculate deductions for a payroll entry
     */
    public function calculateDeductions(Payroll $payroll): array
    {
        $employee = $payroll->employee;
        $rules = $this->getApplicableRules($employee);
        
        $deductions = [];
        $totalDeduction = 0;
        
        foreach ($rules as $rule) {
            $amount = $this->calculateDeductionAmount($payroll, $rule);
            
            if ($amount > 0) {
                $deduction = [
                    'rule_id' => $rule->id,
                    'name' => $rule->name,
                    'amount' => $amount,
                    'type' => $rule->type,
                    'requires_approval' => $rule->requires_approval,
                ];
                
                $deductions[] = $deduction;
                $totalDeduction += $amount;
            }
        }
        
        return [
            'deductions' => $deductions,
            'total_deduction' => $totalDeduction,
        ];
    }

    /**
     * Get applicable deduction rules for an employee
     */
    protected function getApplicableRules(Employee $employee): Collection
    {
        return DeductionRule::where('status', 'active')
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
     * Calculate deduction amount based on a rule
     */
    protected function calculateDeductionAmount(Payroll $payroll, DeductionRule $rule): float
    {
        $baseAmount = $this->getBaseAmount($payroll, $rule);
        
        switch ($rule->calculation_method) {
            case 'fixed':
                return $rule->amount;
                
            case 'percentage':
                return $baseAmount * ($rule->percentage / 100);
                
            case 'tiered':
                return $this->calculateTieredDeduction($baseAmount, $rule);
                
            case 'conditional':
                return $this->calculateConditionalDeduction($payroll, $rule);
                
            default:
                throw new \InvalidArgumentException("Unsupported calculation method: {$rule->calculation_method}");
        }
    }

    /**
     * Get base amount for deduction calculation
     */
    protected function getBaseAmount(Payroll $payroll, DeductionRule $rule): float
    {
        switch ($rule->base_amount_type) {
            case 'gross':
                return $payroll->gross_amount;
                
            case 'basic':
                return $payroll->basic_salary;
                
            case 'net':
                return $payroll->net_amount;
                
            default:
                return $payroll->gross_amount;
        }
    }

    /**
     * Calculate tiered deduction
     */
    protected function calculateTieredDeduction(float $amount, DeductionRule $rule): float
    {
        $tiers = collect($rule->metadata['tiers'] ?? [])
            ->sortBy('amount_from');
            
        foreach ($tiers as $tier) {
            if ($amount >= $tier['amount_from'] && 
                (!isset($tier['amount_to']) || $amount <= $tier['amount_to'])) {
                return $tier['fixed_amount'] ?? ($amount * ($tier['percentage'] / 100));
            }
        }
        
        return 0;
    }

    /**
     * Calculate conditional deduction
     */
    protected function calculateConditionalDeduction(Payroll $payroll, DeductionRule $rule): float
    {
        $conditions = $rule->conditions;
        $amount = 0;
        
        foreach ($conditions as $condition) {
            if ($this->evaluateCondition($payroll, $condition)) {
                $amount += $condition['amount'] ?? ($payroll->gross_amount * ($condition['percentage'] / 100));
            }
        }
        
        return $amount;
    }

    /**
     * Evaluate a deduction condition
     */
    protected function evaluateCondition(Payroll $payroll, array $condition): bool
    {
        $value = $this->getConditionValue($payroll, $condition['field']);
        
        switch ($condition['operator']) {
            case '=':
                return $value == $condition['value'];
            case '>':
                return $value > $condition['value'];
            case '<':
                return $value < $condition['value'];
            case '>=':
                return $value >= $condition['value'];
            case '<=':
                return $value <= $condition['value'];
            case 'in':
                return in_array($value, $condition['value']);
            case 'not_in':
                return !in_array($value, $condition['value']);
            default:
                throw new \InvalidArgumentException("Unsupported operator: {$condition['operator']}");
        }
    }

    /**
     * Get value for condition evaluation
     */
    protected function getConditionValue(Payroll $payroll, string $field)
    {
        $employee = $payroll->employee;
        
        switch ($field) {
            case 'gross_amount':
                return $payroll->gross_amount;
            case 'basic_salary':
                return $payroll->basic_salary;
            case 'department':
                return $employee->department;
            case 'position':
                return $employee->position;
            case 'employment_type':
                return $employee->employment_type;
            case 'years_of_service':
                return $employee->join_date->diffInYears(now());
            default:
                throw new \InvalidArgumentException("Unsupported field: {$field}");
        }
    }

    /**
     * Process bulk deductions
     */
    public function processBulkDeductions(Collection $payrolls, array $rules): array
    {
        $results = [
            'processed' => 0,
            'failed' => 0,
            'details' => [],
        ];
        
        foreach ($payrolls as $payroll) {
            try {
                $deductions = $this->calculateDeductions($payroll);
                
                foreach ($deductions['deductions'] as $deduction) {
                    PayrollDeduction::create([
                        'payroll_id' => $payroll->id,
                        'rule_id' => $deduction['rule_id'],
                        'amount' => $deduction['amount'],
                        'status' => $deduction['requires_approval'] ? 'pending' : 'approved',
                    ]);
                }
                
                $results['processed']++;
                $results['details'][] = [
                    'payroll_id' => $payroll->id,
                    'status' => 'success',
                    'deductions' => $deductions,
                ];
            } catch (\Exception $e) {
                $results['failed']++;
                $results['details'][] = [
                    'payroll_id' => $payroll->id,
                    'status' => 'error',
                    'message' => $e->getMessage(),
                ];
            }
        }
        
        return $results;
    }

    /**
     * Handle deduction approval workflow
     */
    public function handleApprovalWorkflow(PayrollDeduction $deduction, string $action, int $approverId): void
    {
        if ($action === 'approve') {
            $deduction->update([
                'status' => 'approved',
                'approved_by' => $approverId,
                'approved_at' => now(),
            ]);
            
            $this->notificationService->sendNotification(
                $deduction->payroll->employee->user,
                'Deduction Approved',
                "Your deduction for {$deduction->rule->name} has been approved."
            );
        } elseif ($action === 'reject') {
            $deduction->update([
                'status' => 'rejected',
                'approved_by' => $approverId,
                'approved_at' => now(),
            ]);
            
            $this->notificationService->sendNotification(
                $deduction->payroll->employee->user,
                'Deduction Rejected',
                "Your deduction for {$deduction->rule->name} has been rejected."
            );
        }
    }
} 