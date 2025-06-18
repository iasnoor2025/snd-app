<?php

namespace Modules\API\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ApiTokenCreateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool;
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>;
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'abilities' => ['sometimes', 'array'],
            'abilities.*' => ['required', 'string'],
            'expires_in_minutes' => ['sometimes', 'nullable', 'integer', 'min:1']
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array;
     */
    public function messages(): array
    {
        return [
            'name.required' => 'A token name is required.',
            'name.max' => 'The token name must not exceed 255 characters.',
            'abilities.array' => 'Abilities must be provided as an array.',
            'abilities.*.string' => 'Each ability must be a string.',
            'expires_in_minutes.integer' => 'The expiration time must be an integer.',
            'expires_in_minutes.min' => 'The expiration time must be at least 1 minute.',
        ];
    }
}

