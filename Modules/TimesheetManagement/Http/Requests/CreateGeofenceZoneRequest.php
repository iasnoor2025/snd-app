<?php

namespace Modules\TimesheetManagement\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CreateGeofenceZoneRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->check() && auth()->user()->can('create', \Modules\TimesheetManagement\Domain\Models\GeofenceZone::class);
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('geofence_zones', 'name')
            ],
            'description' => 'nullable|string|max:1000',
            'center_latitude' => 'required|numeric|between:-90,90',
            'center_longitude' => 'required|numeric|between:-180,180',
            'radius_meters' => 'required|integer|min:1|max:50000',
            'polygon_coordinates' => 'nullable|array|min:3',
            'polygon_coordinates.*.lat' => 'required_with:polygon_coordinates|numeric|between:-90,90',
            'polygon_coordinates.*.lng' => 'required_with:polygon_coordinates|numeric|between:-180,180',
            'zone_type' => [
                'required',
                'string',
                Rule::in(['project_site', 'office', 'warehouse', 'restricted', 'custom'])
            ],
            'project_id' => 'nullable|integer|exists:projects,id',
            'site_id' => 'nullable|integer|exists:sites,id',
            'is_active' => 'boolean',
            'strict_enforcement' => 'boolean',
            'buffer_meters' => 'nullable|integer|min:0|max:1000',
            'time_restrictions' => 'nullable|array',
            'time_restrictions.enabled' => 'boolean',
            'time_restrictions.start_time' => 'nullable|date_format:H:i',
            'time_restrictions.end_time' => 'nullable|date_format:H:i|after:time_restrictions.start_time',
            'time_restrictions.days_of_week' => 'nullable|array',
            'time_restrictions.days_of_week.*' => 'integer|between:0,6',
            'monitoring_enabled' => 'boolean',
            'alert_on_entry' => 'boolean',
            'alert_on_exit' => 'boolean',
            'metadata' => 'nullable|array',
            'metadata.color' => 'nullable|string|regex:/^#[0-9A-Fa-f]{6}$/',
            'metadata.icon' => 'nullable|string|max:50',
            'metadata.priority' => 'nullable|integer|between:1,10'
        ];
    }

    /**
     * Get custom validation messages.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'The geofence zone name is required.',
            'name.unique' => 'A geofence zone with this name already exists.',
            'center_latitude.required' => 'The center latitude is required.',
            'center_latitude.between' => 'The center latitude must be between -90 and 90 degrees.',
            'center_longitude.required' => 'The center longitude is required.',
            'center_longitude.between' => 'The center longitude must be between -180 and 180 degrees.',
            'radius_meters.required' => 'The radius in meters is required.',
            'radius_meters.min' => 'The radius must be at least 1 meter.',
            'radius_meters.max' => 'The radius cannot exceed 50,000 meters (50km).',
            'polygon_coordinates.min' => 'A polygon must have at least 3 coordinate points.',
            'polygon_coordinates.*.lat.between' => 'Each polygon latitude must be between -90 and 90 degrees.',
            'polygon_coordinates.*.lng.between' => 'Each polygon longitude must be between -180 and 180 degrees.',
            'zone_type.required' => 'The zone type is required.',
            'zone_type.in' => 'The zone type must be one of: project_site, office, warehouse, restricted, custom.',
            'project_id.exists' => 'The selected project does not exist.',
            'site_id.exists' => 'The selected site does not exist.',
            'buffer_meters.max' => 'The buffer cannot exceed 1,000 meters.',
            'time_restrictions.start_time.date_format' => 'The start time must be in HH:MM format.',
            'time_restrictions.end_time.date_format' => 'The end time must be in HH:MM format.',
            'time_restrictions.end_time.after' => 'The end time must be after the start time.',
            'time_restrictions.days_of_week.*.between' => 'Days of week must be between 0 (Sunday) and 6 (Saturday).',
            'metadata.color.regex' => 'The color must be a valid hex color code (e.g., #FF0000).',
            'metadata.priority.between' => 'The priority must be between 1 and 10.'
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'center_latitude' => 'center latitude',
            'center_longitude' => 'center longitude',
            'radius_meters' => 'radius',
            'polygon_coordinates' => 'polygon coordinates',
            'zone_type' => 'zone type',
            'project_id' => 'project',
            'site_id' => 'site',
            'is_active' => 'active status',
            'strict_enforcement' => 'strict enforcement',
            'buffer_meters' => 'buffer distance',
            'time_restrictions' => 'time restrictions',
            'monitoring_enabled' => 'monitoring',
            'alert_on_entry' => 'entry alerts',
            'alert_on_exit' => 'exit alerts'
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Set default values
        $this->merge([
            'is_active' => $this->boolean('is_active', true),
            'strict_enforcement' => $this->boolean('strict_enforcement', false),
            'monitoring_enabled' => $this->boolean('monitoring_enabled', true),
            'alert_on_entry' => $this->boolean('alert_on_entry', false),
            'alert_on_exit' => $this->boolean('alert_on_exit', false),
            'buffer_meters' => $this->input('buffer_meters', 0)
        ]);

        // Ensure polygon coordinates are properly formatted
        if ($this->has('polygon_coordinates') && is_string($this->polygon_coordinates)) {
            try {
                $this->merge([
                    'polygon_coordinates' => json_decode($this->polygon_coordinates, true)
                ]);
            } catch (\Exception $e) {
                // Let validation handle the error
            }
        }

        // Ensure time restrictions are properly formatted
        if ($this->has('time_restrictions') && is_string($this->time_restrictions)) {
            try {
                $this->merge([
                    'time_restrictions' => json_decode($this->time_restrictions, true)
                ]);
            } catch (\Exception $e) {
                // Let validation handle the error
            }
        }

        // Ensure metadata is properly formatted
        if ($this->has('metadata') && is_string($this->metadata)) {
            try {
                $this->merge([
                    'metadata' => json_decode($this->metadata, true)
                ]);
            } catch (\Exception $e) {
                // Let validation handle the error
            }
        }
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            // Custom validation: if polygon coordinates are provided, validate the polygon
            if ($this->has('polygon_coordinates') && is_array($this->polygon_coordinates)) {
                $coordinates = $this->polygon_coordinates;

                // Check if polygon is closed (first and last points should be the same)
                if (count($coordinates) >= 3) {
                    $first = $coordinates[0];
                    $last = end($coordinates);

                    if ($first['lat'] !== $last['lat'] || $first['lng'] !== $last['lng']) {
                        // Auto-close the polygon by adding the first point at the end
                        $coordinates[] = $first;
                        $this->merge(['polygon_coordinates' => $coordinates]);
                    }
                }
            }

            // Custom validation: ensure project exists if project_id is provided
            if ($this->project_id && !\Modules\Core\Domain\Models\Project::find($this->project_id)) {
                $validator->errors()->add('project_id', 'The selected project does not exist.');
            }

            // Custom validation: time restrictions logic
            if ($this->has('time_restrictions') && is_array($this->time_restrictions)) {
                $restrictions = $this->time_restrictions;

                if (isset($restrictions['enabled']) && $restrictions['enabled']) {
                    if (empty($restrictions['start_time']) || empty($restrictions['end_time'])) {
                        $validator->errors()->add('time_restrictions', 'Start time and end time are required when time restrictions are enabled.');
                    }
                }
            }
        });
    }
}
