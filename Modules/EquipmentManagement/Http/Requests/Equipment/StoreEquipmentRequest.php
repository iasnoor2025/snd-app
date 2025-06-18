<?php

namespace Modules\EquipmentManagement\Http\Requests\Equipment;

use Illuminate\Foundation\Http\FormRequest;

class StoreEquipmentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('equipment.create');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>;
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'model' => 'required|string|max:255',
            'serial_number' => 'required|string|max:255|unique:equipment',
            'door_number' => 'required|string|max:255|unique:equipment',
            'description' => 'nullable|string',
            'status' => 'required|in:available,rented,maintenance,out_of_service',
            'daily_rate' => 'required|numeric|min:0',
            'weekly_rate' => 'nullable|numeric|min:0',
            'monthly_rate' => 'nullable|numeric|min:0',
            'purchase_date' => 'nullable|date',
            'purchase_cost' => 'nullable|numeric|min:0',
            'last_maintenance_date' => 'nullable|date',
            'next_maintenance_date' => 'nullable|date',
            'location_id' => 'required|exists:locations,id',
            'category_id' => 'nullable|exists:categories,id',
            'notes' => 'nullable|string',
            'documents' => 'nullable|array',
            'documents.*' => 'file|mimes:pdf,doc,docx,jpg,jpeg,png|max:10240',
            'document_names' => 'nullable|array',
            'document_names.*' => 'nullable|string|max:255',
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>;
     */
    public function messages(): array
    {
        return [
            'name.required' => 'The equipment name is required.',
            'model.required' => 'The equipment model is required.',
            'serial_number.required' => 'The serial number is required.',
            'serial_number.unique' => 'This serial number is already in use.',
            'door_number.required' => 'The door number is required.',
            'door_number.unique' => 'This door number is already in use.',
            'daily_rate.required' => 'The daily rate is required.',
            'daily_rate.min' => 'The daily rate must be a positive number.',
            'location_id.required' => 'Please select a location.',
            'category_id.required' => 'Please select a category.',
            'documents.*.max' => 'Documents must not exceed 10MB in size.',
        ];
    }
}

