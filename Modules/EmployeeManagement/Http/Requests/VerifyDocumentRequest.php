<?php

namespace Modules\EmployeeManagement\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Modules\EmployeeManagement\Domain\Models\EmployeeDocument;
use Modules\EmployeeManagement\Policies\EmployeeDocumentPolicy;

class VerifyDocumentRequest extends FormRequest
{
    public function authorize(): bool
    {
        $document = EmployeeDocument::findOrFail($this->route('documentId'));
        return $this->user()->can('verify', $document);
    }

    public function rules(): array
    {
        return [
            'notes' => 'nullable|string|max:1000'
        ];
    }

    public function messages(): array
    {
        return [
            'notes.max' => 'The notes cannot exceed 1000 characters.'
        ];
    }
}


