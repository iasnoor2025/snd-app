<?php

namespace Modules\TimesheetManagement\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class TimeEntryResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request
     * @return array
     */
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'weekly_timesheet_id' => $this->weekly_timesheet_id,
            'employee_id' => $this->employee_id,
            'project_id' => $this->project_id,
            'project' => $this->whenLoaded('project', function () {
                return [
                    'id' => $this->project->id,
                    'name' => $this->project->name,
                    'code' => $this->project->code,
                ];
            }),
            'task_id' => $this->task_id,
            'task' => $this->whenLoaded('task', function () {
                return [
                    'id' => $this->task->id,
                    'name' => $this->task->name,
                ];
            }),
            'date' => $this->date?->format('Y-m-d')->format('Y-m-d'),
            'hours' => $this->hours,
            'description' => $this->description,
            'is_overtime' => $this->is_overtime,
            'is_billable' => $this->is_billable,
            'start_time' => $this->start_time ? $this->start_time->format('H:i:s') : null,
            'end_time' => $this->end_time ? $this->end_time->format('H:i:s') : null,
            'break_duration' => $this->break_duration,
            'status' => $this->status,
            'day_of_week' => $this->day_of_week,
            'day_name' => $this->day_name,
            'created_at' => $this->created_at?->format('Y-m-d H:i:s')->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s')->format('Y-m-d H:i:s'),
        ];
    }
}

