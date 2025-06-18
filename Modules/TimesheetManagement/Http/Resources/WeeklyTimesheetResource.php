<?php

namespace Modules\TimesheetManagement\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class WeeklyTimesheetResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request
     * @return array;
     */
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'employee_id' => $this->employee_id,
            'employee' => $this->whenLoaded('employee', function () {
                return [
                    'id' => $this->employee->id,
                    'name' => $this->employee->full_name,
                    'department' => $this->employee->department?->name,
                    'position' => $this->employee->position?->name,
                ];
            }),
            'week_start_date' => $this->week_start_date->format('Y-m-d'),
            'week_end_date' => $this->week_end_date->format('Y-m-d'),
            'status' => $this->status,
            'total_hours' => $this->total_hours,
            'regular_hours' => $this->regular_hours,
            'overtime_hours' => $this->overtime_hours,
            'notes' => $this->notes,
            'submitted_at' => $this->submitted_at ? $this->submitted_at->format('Y-m-d H:i:s') : null,
            'approver' => $this->whenLoaded('approver', function() {
                return [
                    'id' => $this->approver->id,
                    'name' => $this->approver->name,
                ];
            }),
            'approved_at' => $this->approved_at ? $this->approved_at->format('Y-m-d H:i:s') : null,
            'rejector' => $this->whenLoaded('rejector', function() {
                return [
                    'id' => $this->rejector->id,
                    'name' => $this->rejector->name,
                ];
            }),
            'rejected_at' => $this->rejected_at ? $this->rejected_at->format('Y-m-d H:i:s') : null,
            'rejection_reason' => $this->rejection_reason,
            'time_entries' => TimeEntryResource::collection($this->whenLoaded('timeEntries')),
            'date_range' => $this->date_range,
            'week_number' => $this->week_number,
            'year' => $this->year,
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at->format('Y-m-d H:i:s'),
        ];
    }
}

