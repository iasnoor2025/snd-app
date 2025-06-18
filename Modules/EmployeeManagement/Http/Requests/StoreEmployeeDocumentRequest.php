<?php

namespace Modules\EmployeeManagement\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Modules\EmployeeManagement\Policies\EmployeeDocumentPolicy;

class StoreEmployeeDocumentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', EmployeeDocumentPolicy::class);
    }

    public function rules(): array
    {
        return [
            'document_type' => 'required|string|max:100',
            'document_number' => 'nullable|string|max:100',
            'issue_date' => 'nullable|date',
            'expiry_date' => 'nullable|date|after:issue_date',
            'issuing_authority' => 'nullable|string|max:255',
            'description' => 'nullable|string|max:1000',
            'file' => 'required|file|mimes:pdf,jpg,jpeg,png|max:10240', // 10MB max
            'notes' => 'nullable|string|max:1000',
        ];
    }

    public function messages(): array
    {
        return [
            'document_type.required' => 'The document type is required.',
            'document_type.max' => 'The document type cannot exceed 100 characters.',
            'document_number.max' => 'The document number cannot exceed 100 characters.',
            'issue_date.date' => 'The issue date must be a valid date.',
            'expiry_date.date' => 'The expiry date must be a valid date.',
            'expiry_date.after' => 'The expiry date must be after the issue date.',
            'issuing_authority.max' => 'The issuing authority cannot exceed 255 characters.',
            'description.max' => 'The description cannot exceed 1000 characters.',
            'file.required' => 'The document file is required.',
            'file.file' => 'The uploaded file must be a valid file.',
            'file.mimes' => 'The file must be a PDF, JPG, JPEG, or PNG.',
            'file.max' => 'The file size cannot exceed 10MB.',
            'notes.max' => 'The notes cannot exceed 1000 characters.',
        ];
    }
}

