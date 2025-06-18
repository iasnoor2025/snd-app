<?php

namespace Modules\Core\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Modules\Core\Domain\Models\SystemSetting;

class UpdateSystemSettingsRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('manage-system-settings');
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        $rules = [];

        // Get all settings to build dynamic validation rules
        $settings = SystemSetting::all()->keyBy('key');

        foreach ($this->all() as $category => $categorySettings) {
            if (!is_array($categorySettings)) {
                continue;
            }

            foreach ($categorySettings as $key => $value) {
                $setting = $settings->get($key);

                if ($setting) {
                    $rules["{$category}.{$key}"] = $this->getRulesForSetting($setting);
                }
            }
        }

        return $rules;
    }

    /**
     * Get validation rules for a specific setting
     */
    private function getRulesForSetting(SystemSetting $setting): array
    {
        $rules = ['required'];

        switch ($setting->type) {
            case 'boolean':
                $rules[] = 'boolean';
                break;

            case 'integer':
                $rules[] = 'integer';
                $rules = array_merge($rules, $this->getIntegerConstraints($setting->key));
                break;

            case 'float':
                $rules[] = 'numeric';
                $rules = array_merge($rules, $this->getFloatConstraints($setting->key));
                break;

            case 'string':
                $rules[] = 'string';
                $rules = array_merge($rules, $this->getStringConstraints($setting->key));
                break;

            case 'array':
            case 'json':
                $rules[] = 'array';
                break;
        }

        return $rules;
    }

    /**
     * Get integer-specific validation constraints
     */
    private function getIntegerConstraints(string $key): array
    {
        $constraints = [];

        switch ($key) {
            case 'pagination_size':
                $constraints[] = 'min:1';
                $constraints[] = 'max:100';
                break;

            case 'session_timeout':
                $constraints[] = 'min:5';
                $constraints[] = 'max:1440'; // 24 hours
                break;

            case 'password_min_length':
                $constraints[] = 'min:4';
                $constraints[] = 'max:128';
                break;

            case 'max_login_attempts':
                $constraints[] = 'min:1';
                $constraints[] = 'max:20';
                break;

            case 'lockout_duration':
                $constraints[] = 'min:1';
                $constraints[] = 'max:1440'; // 24 hours
                break;

            case 'cache_ttl':
                $constraints[] = 'min:60';
                $constraints[] = 'max:86400'; // 24 hours
                break;

            case 'max_file_upload_size':
                $constraints[] = 'min:1024'; // 1MB
                $constraints[] = 'max:102400'; // 100MB
                break;

            case 'decimal_places':
                $constraints[] = 'min:0';
                $constraints[] = 'max:8';
                break;

            default:
                if (str_contains($key, 'retention_days')) {
                    $constraints[] = 'min:1';
                    $constraints[] = 'max:365';
                } elseif (str_contains($key, '_days')) {
                    $constraints[] = 'min:1';
                    $constraints[] = 'max:365';
                } else {
                    $constraints[] = 'min:0';
                }
                break;
        }

        return $constraints;
    }

    /**
     * Get float-specific validation constraints
     */
    private function getFloatConstraints(string $key): array
    {
        $constraints = [];

        // Add specific float constraints based on key
        if (str_contains($key, 'rate') || str_contains($key, 'percentage')) {
            $constraints[] = 'min:0';
            $constraints[] = 'max:100';
        } else {
            $constraints[] = 'min:0';
        }

        return $constraints;
    }

    /**
     * Get string-specific validation constraints
     */
    private function getStringConstraints(string $key): array
    {
        $constraints = [];

        switch ($key) {
            case 'currency':
                $constraints[] = 'size:3';
                $constraints[] = 'regex:/^[A-Z]{3}$/';
                break;

            case 'default_language':
                $constraints[] = 'size:2';
                $constraints[] = 'regex:/^[a-z]{2}$/';
                break;

            case 'default_timezone':
                $constraints[] = Rule::in(timezone_identifiers_list());
                break;

            case 'date_format':
                $constraints[] = 'regex:/^[YmdHis\-\/\s:]+$/';
                break;

            case 'time_format':
                $constraints[] = 'regex:/^[His:]+$/';
                break;

            case 'app_name':
                $constraints[] = 'max:100';
                $constraints[] = 'regex:/^[a-zA-Z0-9\s\-_]+$/';
                break;

            case 'app_description':
                $constraints[] = 'max:500';
                break;

            case 'maintenance_message':
                $constraints[] = 'max:1000';
                break;

            case 'backup_frequency':
            case 'digest_frequency':
                $constraints[] = Rule::in(['hourly', 'daily', 'weekly', 'monthly']);
                break;

            default:
                if (str_contains($key, 'email')) {
                    $constraints[] = 'email';
                    $constraints[] = 'max:255';
                } elseif (str_contains($key, 'url')) {
                    $constraints[] = 'url';
                    $constraints[] = 'max:255';
                } elseif (str_contains($key, 'path')) {
                    $constraints[] = 'max:500';
                } else {
                    $constraints[] = 'max:255';
                }
                break;
        }

        return $constraints;
    }

    /**
     * Get custom validation messages
     */
    public function messages(): array
    {
        return [
            '*.*.required' => 'This setting is required.',
            '*.*.boolean' => 'This setting must be true or false.',
            '*.*.integer' => 'This setting must be a whole number.',
            '*.*.numeric' => 'This setting must be a number.',
            '*.*.string' => 'This setting must be text.',
            '*.*.array' => 'This setting must be a list of values.',
            '*.*.email' => 'This setting must be a valid email address.',
            '*.*.url' => 'This setting must be a valid URL.',
            '*.*.min' => 'This setting must be at least :min.',
            '*.*.max' => 'This setting must not exceed :max.',
            '*.*.size' => 'This setting must be exactly :size characters.',
            '*.*.regex' => 'This setting format is invalid.',
            '*.*.in' => 'This setting value is not allowed.',

            // Specific field messages
            '*.currency.regex' => 'Currency must be a 3-letter ISO code (e.g., USD, EUR).',
            '*.default_language.regex' => 'Language must be a 2-letter ISO code (e.g., en, es).',
            '*.date_format.regex' => 'Date format contains invalid characters.',
            '*.time_format.regex' => 'Time format contains invalid characters.',
            '*.app_name.regex' => 'Application name can only contain letters, numbers, spaces, hyphens, and underscores.',
            '*.pagination_size.min' => 'Pagination size must be at least 1.',
            '*.pagination_size.max' => 'Pagination size must not exceed 100.',
            '*.session_timeout.min' => 'Session timeout must be at least 5 minutes.',
            '*.session_timeout.max' => 'Session timeout must not exceed 24 hours.',
            '*.password_min_length.min' => 'Minimum password length must be at least 4 characters.',
            '*.password_min_length.max' => 'Minimum password length must not exceed 128 characters.',
            '*.max_login_attempts.min' => 'Maximum login attempts must be at least 1.',
            '*.max_login_attempts.max' => 'Maximum login attempts must not exceed 20.',
            '*.lockout_duration.min' => 'Lockout duration must be at least 1 minute.',
            '*.lockout_duration.max' => 'Lockout duration must not exceed 24 hours.',
            '*.cache_ttl.min' => 'Cache TTL must be at least 60 seconds.',
            '*.cache_ttl.max' => 'Cache TTL must not exceed 24 hours.',
            '*.max_file_upload_size.min' => 'Maximum file upload size must be at least 1MB.',
            '*.max_file_upload_size.max' => 'Maximum file upload size must not exceed 100MB.',
            '*.decimal_places.min' => 'Decimal places must be at least 0.',
            '*.decimal_places.max' => 'Decimal places must not exceed 8.',
        ];
    }

    /**
     * Get custom attribute names
     */
    public function attributes(): array
    {
        return [
            '*.app_name' => 'application name',
            '*.app_description' => 'application description',
            '*.default_timezone' => 'default timezone',
            '*.default_language' => 'default language',
            '*.date_format' => 'date format',
            '*.time_format' => 'time format',
            '*.currency' => 'currency',
            '*.decimal_places' => 'decimal places',
            '*.session_timeout' => 'session timeout',
            '*.password_min_length' => 'minimum password length',
            '*.password_require_uppercase' => 'require uppercase letters',
            '*.password_require_lowercase' => 'require lowercase letters',
            '*.password_require_numbers' => 'require numbers',
            '*.password_require_symbols' => 'require symbols',
            '*.max_login_attempts' => 'maximum login attempts',
            '*.lockout_duration' => 'lockout duration',
            '*.two_factor_enabled' => 'two-factor authentication',
            '*.cache_enabled' => 'cache enabled',
            '*.cache_ttl' => 'cache TTL',
            '*.query_cache_enabled' => 'query cache enabled',
            '*.compression_enabled' => 'compression enabled',
            '*.lazy_loading_enabled' => 'lazy loading enabled',
            '*.pagination_size' => 'pagination size',
            '*.max_file_upload_size' => 'maximum file upload size',
            '*.image_optimization_enabled' => 'image optimization enabled',
            '*.email_notifications_enabled' => 'email notifications enabled',
            '*.sms_notifications_enabled' => 'SMS notifications enabled',
            '*.push_notifications_enabled' => 'push notifications enabled',
            '*.notification_queue_enabled' => 'notification queue enabled',
            '*.digest_notifications_enabled' => 'digest notifications enabled',
            '*.digest_frequency' => 'digest frequency',
            '*.notification_retention_days' => 'notification retention days',
            '*.maintenance_mode_enabled' => 'maintenance mode enabled',
            '*.maintenance_message' => 'maintenance message',
            '*.auto_backup_enabled' => 'auto backup enabled',
            '*.backup_frequency' => 'backup frequency',
            '*.backup_retention_days' => 'backup retention days',
            '*.log_cleanup_enabled' => 'log cleanup enabled',
            '*.log_retention_days' => 'log retention days',
            '*.temp_file_cleanup_enabled' => 'temporary file cleanup enabled',
        ];
    }

    /**
     * Handle a failed validation attempt.
     */
    protected function failedValidation(\Illuminate\Contracts\Validation\Validator $validator)
    {
        $errors = $validator->errors()->toArray();

        // Group errors by category for better UX
        $groupedErrors = [];
        foreach ($errors as $field => $messages) {
            $parts = explode('.', $field);
            if (count($parts) >= 2) {
                $category = $parts[0];
                $setting = $parts[1];
                $groupedErrors[$category][$setting] = $messages;
            }
        }

        throw new \Illuminate\Validation\ValidationException(
            $validator,
            response()->json([
                'message' => 'The given data was invalid.',
                'errors' => $errors,
                'grouped_errors' => $groupedErrors
            ], 422)
        );
    }
}
