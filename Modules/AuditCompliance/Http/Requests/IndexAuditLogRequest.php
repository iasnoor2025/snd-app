<?php

namespace Modules\AuditCompliance\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class IndexAuditLogRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array;
     */
    public function rules()
    {
        return [
            'user_id' => 'nullable|exists:users,id',
            'event' => 'nullable|string',
            'model_type' => 'nullable|string',
            'model_id' => 'nullable|integer',
            'from_date' => 'nullable|date',
            'to_date' => 'nullable|date|after_or_equal:from_date',
            'tags' => 'nullable|array',
            'tags.*' => 'string',
        ];
    }

    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool;
     */
    public function authorize()
    {
        // Only users with appropriate permissions should view audit logs
        return $this->user()->can('view audit logs');
    }
}

