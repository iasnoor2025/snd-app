<?php

namespace Modules\EmployeeManagement\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class EmployeeResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'employee_id' => $this->employee_id,
            'file_number' => $this->file_number,
            'first_name' => $this->first_name,
            'middle_name' => $this->middle_name,
            'last_name' => $this->last_name,
            'full_name' => $this->full_name,
            'email' => $this->email,
            'phone' => $this->phone,
            'address' => $this->address,
            'city' => $this->city,
            'nationality' => $this->nationality,
            'position' => [
                'id' => $this->position->id,
                'name' => $this->position->name,
            ],
            'department' => [
                'id' => $this->department->id,
                'name' => $this->department->name,
            ],
            'supervisor' => $this->supervisor,
            'hourly_rate' => $this->hourly_rate,
            'basic_salary' => $this->basic_salary,
            'food_allowance' => $this->food_allowance,
            'housing_allowance' => $this->housing_allowance,
            'transport_allowance' => $this->transport_allowance,
            'total_allowances' => $this->total_allowances,
            'absent_deduction_rate' => $this->absent_deduction_rate,
            'overtime_rate_multiplier' => $this->overtime_rate_multiplier,
            'overtime_fixed_rate' => $this->overtime_fixed_rate,
            'bank_details' => $this->bank_details,
            'contract_hours_per_day' => $this->contract_hours_per_day,
            'contract_days_per_month' => $this->contract_days_per_month,
            'daily_rate' => $this->daily_rate,
            'calculated_hourly_rate' => $this->calculated_hourly_rate,
            'monthly_salary' => $this->monthly_salary,
            'hire_date' => $this->hire_date->format('Y-m-d'),
            'status' => $this->status,
            'current_location' => $this->current_location,
            'emergency_contact' => [
                'name' => $this->emergency_contact_name,
                'phone' => $this->emergency_contact_phone,
            ],
            'notes' => $this->notes,
            'advance_salary_eligible' => $this->advance_salary_eligible,
            'advance_salary_approved_this_month' => $this->advance_salary_approved_this_month,
            'personal_info' => [
                'date_of_birth' => $this->date_of_birth?->format('Y-m-d')->format('Y-m-d'),
                'iqama' => [
                    'number' => $this->iqama_number,
                    'expiry' => $this->iqama_expiry->format('Y-m-d'),
                    'cost' => $this->iqama_cost,
                ],
                'passport' => [
                    'number' => $this->passport_number,
                    'expiry' => $this->passport_expiry->format('Y-m-d'),
                ],
            ],
            'licenses' => [
                'driving' => [
                    'number' => $this->driving_license_number,
                    'expiry' => $this->driving_license_expiry?->format('Y-m-d'),
                    'cost' => $this->driving_license_cost,
                ],
                'operator' => [
                    'number' => $this->operator_license_number,
                    'expiry' => $this->operator_license_expiry?->format('Y-m-d'),
                    'cost' => $this->operator_license_cost,
                ],
                'tuv' => [
                    'number' => $this->tuv_certification_number,
                    'expiry' => $this->tuv_certification_expiry?->format('Y-m-d'),
                    'cost' => $this->tuv_certification_cost,
                ],
                'spsp' => [
                    'number' => $this->spsp_license_number,
                    'expiry' => $this->spsp_license_expiry?->format('Y-m-d'),
                    'cost' => $this->spsp_license_cost,
                ],
                'custom' => $this->custom_certifications,
            ],
            'current_salary' => $this->whenLoaded('current_salary', function () {
                return [
                    'base_salary' => $this->current_salary->base_salary,
                    'food_allowance' => $this->current_salary->food_allowance,
                    'housing_allowance' => $this->current_salary->housing_allowance,
                    'transport_allowance' => $this->current_salary->transport_allowance,
                    'total_allowances' => $this->current_salary->total_allowances,
                    'total_salary' => $this->current_salary->total_salary,
                    'effective_from' => $this->current_salary->effective_from->format('Y-m-d'),
                    'effective_to' => $this->current_salary->effective_to?->format('Y-m-d'),
                ];
            }),
            'salary_history' => $this->whenLoaded('salaryHistory', function ($salary) {
                return [
                    'base_salary' => $salary->base_salary,
                    'food_allowance' => $salary->food_allowance,
                    'housing_allowance' => $salary->housing_allowance,
                    'transport_allowance' => $salary->transport_allowance,
                    'total_allowances' => $salary->total_allowances,
                    'total_salary' => $salary->total_salary,
                    'effective_from' => $salary->effective_from->format('Y-m-d'),
                    'effective_to' => $salary->effective_to?->format('Y-m-d'),
                    'reason' => $salary->reason,
                    'status' => $salary->status,
                    'approved_by' => $salary->approved_by,
                    'approved_at' => $salary->approved_at?->format('Y-m-d H:i:s'),
                ];
            }),
            'pending_advances' => $this->pending_advances,
            'advance_history' => $this->whenLoaded('advancePaymentHistories', function ($advance) {
                return [
                    'id' => $advance->id,
                    'amount' => $advance->amount,
                    'status' => $advance->status,
                    'created_at' => $advance->created_at?->format('Y-m-d H:i:s')->format('Y-m-d H:i:s'),
                    'approved_at' => $advance->approved_at?->format('Y-m-d H:i:s'),
                ];
            }),
            'timesheets' => $this->whenLoaded('timesheets', function ($timesheet) {
                return [
                    'id' => $timesheet->id,
                    'date' => $timesheet->date?->format('Y-m-d')->format('Y-m-d'),
                    'hours' => $timesheet->hours,
                    'overtime_hours' => $timesheet->overtime_hours,
                    'status' => $timesheet->status,
                ];
            }),
            'leave_requests' => $this->whenLoaded('leaveRequests', function ($leave) {
                return [
                    'id' => $leave->id,
                    'type' => $leave->type,
                    'start_date' => $leave->start_date?->format('Y-m-d')->format('Y-m-d'),
                    'end_date' => $leave->end_date?->format('Y-m-d')->format('Y-m-d'),
                    'days' => $leave->days,
                    'status' => $leave->status,
                    'reason' => $leave->reason,
                ];
            }),
            'performance_reviews' => $this->whenLoaded('performanceReviews', function ($review) {
                return [
                    'id' => $review->id,
                    'date' => $review->date?->format('Y-m-d')->format('Y-m-d'),
                    'rating' => $review->rating,
                    'comments' => $review->comments,
                    'reviewer' => $review->reviewer,
                ];
            }),
            'documents' => $this->whenLoaded('media', function ($media) {
                return [
                    'id' => $media->id,
                    'name' => $media->name,
                    'file_name' => $media->file_name,
                    'mime_type' => $media->mime_type,
                    'size' => $media->size,
                    'url' => $media->getUrl(),
                    'created_at' => $media->created_at?->format('Y-m-d H:i:s')->format('Y-m-d H:i:s'),
                ];
            }),
            'created_at' => $this->created_at?->format('Y-m-d H:i:s')->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s')->format('Y-m-d H:i:s'),
        ];
    }
}

