<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\File;

class AvatarUploadRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->check();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'avatar' => [
                'required',
                'file',
                File::image()
                    ->max(5 * 1024) // 5MB max
                    ->dimensions(
                        minWidth: 50,
                        minHeight: 50,
                        maxWidth: 2000,
                        maxHeight: 2000
                    ),
            ],
        ];
    }

    /**
     * Get custom error messages for validation rules.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'avatar.required' => 'Please select an avatar image to upload.',
            'avatar.file' => 'The avatar must be a valid file.',
            'avatar.image' => 'The avatar must be an image file (JPEG, PNG, BMP, GIF, SVG, or WebP).',
            'avatar.max' => 'The avatar file size must not exceed 5MB.',
            'avatar.dimensions.min_width' => 'The avatar image must be at least 50 pixels wide.',
            'avatar.dimensions.min_height' => 'The avatar image must be at least 50 pixels tall.',
            'avatar.dimensions.max_width' => 'The avatar image must not exceed 2000 pixels in width.',
            'avatar.dimensions.max_height' => 'The avatar image must not exceed 2000 pixels in height.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'avatar' => 'avatar image',
        ];
    }

    /**
     * Handle a failed validation attempt.
     *
     * @param  \Illuminate\Contracts\Validation\Validator  $validator
     * @return void
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    protected function failedValidation(\Illuminate\Contracts\Validation\Validator $validator)
    {
        if ($this->expectsJson()) {
            $response = response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);

            throw new \Illuminate\Validation\ValidationException($validator, $response);
        }

        parent::failedValidation($validator);
    }
}
