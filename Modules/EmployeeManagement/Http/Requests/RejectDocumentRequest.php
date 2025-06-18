<?php

namespace Modules\EmployeeManagement\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Modules\EmployeeManagement\Domain\Models\EmployeeDocument;
use Modules\EmployeeManagement\Policies\EmployeeDocumentPolicy;

class RejectDocumentRequest extends FormRequest
{
    public function authorize(): bool
    {
        $document = EmployeeDocument::findOrFail($this->route('documentId'));
        return $this->user()->can('reject', $document);
    }

    public function rules(): array
    {
        return [
            'reason' => 'required|string|max:1000'
        ];
    }

    public function messages(): array
    {
        return [
            'reason.required' => 'The rejection reason is required.',
            'reason.max' => 'The rejection reason cannot exceed 1000 characters.',
        ];
    }
}


