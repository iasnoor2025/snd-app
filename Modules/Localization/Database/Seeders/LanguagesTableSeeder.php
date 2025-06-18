<?php

namespace Modules\Localization\Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\Localization\Models\Language;
use Illuminate\Support\Facades\File;

class LanguagesTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $languages = [
            [
                'code' => 'en',
                'name' => 'English',
                'native_name' => 'English',
                'direction' => 'ltr',
                'enabled' => true,
                'is_default' => true,
                'completion_percentage' => 100,
                'flag_icon' => 'us',
                'sort_order' => 1,
                'metadata' => json_encode([
                    'country_code' => 'US',
                    'currency' => 'SAR',
                    'date_format' => 'MM/DD/YYYY',
                    'time_format' => '12',
                    'timezone' => 'Asia/Riyadh'
                ])
            ],
            [
                'code' => 'ar',
                'name' => 'Arabic',
                'native_name' => 'العربية',
                'direction' => 'rtl',
                'enabled' => true,
                'is_default' => false,
                'completion_percentage' => 0,
                'flag_icon' => 'sa',
                'sort_order' => 10,
                'metadata' => json_encode([
                    'country_code' => 'SA',
                    'currency' => 'SAR',
                    'date_format' => 'DD/MM/YYYY',
                    'time_format' => '12',
                    'timezone' => 'Asia/Riyadh'
                ])
            ],
            [
                'code' => 'hi',
                'name' => 'Hindi',
                'native_name' => 'हिन्दी',
                'direction' => 'ltr',
                'enabled' => true,
                'is_default' => false,
                'completion_percentage' => 0,
                'flag_icon' => 'in',
                'sort_order' => 11,
                'metadata' => json_encode([
                    'country_code' => 'IN',
                    'currency' => 'SAR',
                    'date_format' => 'DD/MM/YYYY',
                    'time_format' => '12',
                    'timezone' => 'Asia/Riyadh'
                ])
            ],
            [
                'code' => 'bn',
                'name' => 'Bengali',
                'native_name' => 'বাংলা',
                'direction' => 'ltr',
                'enabled' => true,
                'is_default' => false,
                'completion_percentage' => 0,
                'flag_icon' => 'bd',
                'sort_order' => 12,
                'metadata' => json_encode([
                    'country_code' => 'BD',
                    'currency' => 'SAR',
                    'date_format' => 'DD/MM/YYYY',
                    'time_format' => '12',
                    'timezone' => 'Asia/Riyadh'
                ])
            ],
            [
                'code' => 'ur',
                'name' => 'Urdu',
                'native_name' => 'اردو',
                'direction' => 'rtl',
                'enabled' => true,
                'is_default' => false,
                'completion_percentage' => 0,
                'flag_icon' => 'pk',
                'sort_order' => 13,
                'metadata' => json_encode([
                    'country_code' => 'SA',
                    'currency' => 'SAR',
                    'date_format' => 'DD/MM/YYYY',
                    'time_format' => '12',
                    'timezone' => 'Asia/Riyadh'
                ])
            ]
        ];

        foreach ($languages as $languageData) {
            $language = Language::updateOrCreate(
                ['code' => $languageData['code']],
                $languageData
            );

            // Create translation directories for enabled languages
            if ($language->enabled) {
                $language->createTranslationDirectories();

                // Create basic translation files if they don't exist
                $this->createBasicTranslationFiles($language);
            }
        }

        $this->command->info('Languages seeded successfully!');
    }

    /**
     * Create basic translation files for a language
     */
    private function createBasicTranslationFiles(Language $language)
    {
        $basicTranslations = [
            'auth' => [
                'failed' => 'These credentials do not match our records.',
                'password' => 'The provided password is incorrect.',
                'throttle' => 'Too many login attempts. Please try again in :seconds seconds.',
                'login' => 'Login',
                'logout' => 'Logout',
                'register' => 'Register',
                'email' => 'Email Address',
                'password_confirmation' => 'Confirm Password',
                'remember_me' => 'Remember Me',
                'forgot_password' => 'Forgot Your Password?',
                'reset_password' => 'Reset Password',
                'send_password_reset_link' => 'Send Password Reset Link',
                'confirm_password' => 'Please confirm your password before continuing.',
                'verify_email' => 'Verify Your Email Address',
            ],
            'pagination' => [
                'previous' => '&laquo; Previous',
                'next' => 'Next &raquo;',
            ],
            'passwords' => [
                'reset' => 'Your password has been reset!',
                'sent' => 'We have emailed your password reset link!',
                'throttled' => 'Please wait before retrying.',
                'token' => 'This password reset token is invalid.',
                'user' => 'We can\'t find a user with that email address.',
            ],
            'validation' => [
                'accepted' => 'The :attribute must be accepted.',
                'active_url' => 'The :attribute is not a valid URL.',
                'after' => 'The :attribute must be a date after :date.',
                'after_or_equal' => 'The :attribute must be a date after or equal to :date.',
                'alpha' => 'The :attribute may only contain letters.',
                'alpha_dash' => 'The :attribute may only contain letters, numbers, dashes and underscores.',
                'alpha_num' => 'The :attribute may only contain letters and numbers.',
                'array' => 'The :attribute must be an array.',
                'before' => 'The :attribute must be a date before :date.',
                'before_or_equal' => 'The :attribute must be a date before or equal to :date.',
                'between' => [
                    'numeric' => 'The :attribute must be between :min and :max.',
                    'file' => 'The :attribute must be between :min and :max kilobytes.',
                    'string' => 'The :attribute must be between :min and :max characters.',
                    'array' => 'The :attribute must have between :min and :max items.',
                ],
                'boolean' => 'The :attribute field must be true or false.',
                'confirmed' => 'The :attribute confirmation does not match.',
                'date' => 'The :attribute is not a valid date.',
                'date_equals' => 'The :attribute must be a date equal to :date.',
                'date_format' => 'The :attribute does not match the format :format.',
                'different' => 'The :attribute and :other must be different.',
                'digits' => 'The :attribute must be :digits digits.',
                'digits_between' => 'The :attribute must be between :min and :max digits.',
                'dimensions' => 'The :attribute has invalid image dimensions.',
                'distinct' => 'The :attribute field has a duplicate value.',
                'email' => 'The :attribute must be a valid email address.',
                'ends_with' => 'The :attribute must end with one of the following: :values.',
                'exists' => 'The selected :attribute is invalid.',
                'file' => 'The :attribute must be a file.',
                'filled' => 'The :attribute field must have a value.',
                'gt' => [
                    'numeric' => 'The :attribute must be greater than :value.',
                    'file' => 'The :attribute must be greater than :value kilobytes.',
                    'string' => 'The :attribute must be greater than :value characters.',
                    'array' => 'The :attribute must have more than :value items.',
                ],
                'gte' => [
                    'numeric' => 'The :attribute must be greater than or equal :value.',
                    'file' => 'The :attribute must be greater than or equal :value kilobytes.',
                    'string' => 'The :attribute must be greater than or equal :value characters.',
                    'array' => 'The :attribute must have :value items or more.',
                ],
                'image' => 'The :attribute must be an image.',
                'in' => 'The selected :attribute is invalid.',
                'in_array' => 'The :attribute field does not exist in :other.',
                'integer' => 'The :attribute must be an integer.',
                'ip' => 'The :attribute must be a valid IP address.',
                'ipv4' => 'The :attribute must be a valid IPv4 address.',
                'ipv6' => 'The :attribute must be a valid IPv6 address.',
                'json' => 'The :attribute must be a valid JSON string.',
                'lt' => [
                    'numeric' => 'The :attribute must be less than :value.',
                    'file' => 'The :attribute must be less than :value kilobytes.',
                    'string' => 'The :attribute must be less than :value characters.',
                    'array' => 'The :attribute must have less than :value items.',
                ],
                'lte' => [
                    'numeric' => 'The :attribute must be less than or equal :value.',
                    'file' => 'The :attribute must be less than or equal :value kilobytes.',
                    'string' => 'The :attribute must be less than or equal :value characters.',
                    'array' => 'The :attribute must not have more than :value items.',
                ],
                'max' => [
                    'numeric' => 'The :attribute may not be greater than :max.',
                    'file' => 'The :attribute may not be greater than :max kilobytes.',
                    'string' => 'The :attribute may not be greater than :max characters.',
                    'array' => 'The :attribute may not have more than :max items.',
                ],
                'mimes' => 'The :attribute must be a file of type: :values.',
                'mimetypes' => 'The :attribute must be a file of type: :values.',
                'min' => [
                    'numeric' => 'The :attribute must be at least :min.',
                    'file' => 'The :attribute must be at least :min kilobytes.',
                    'string' => 'The :attribute must be at least :min characters.',
                    'array' => 'The :attribute must have at least :min items.',
                ],
                'not_in' => 'The selected :attribute is invalid.',
                'not_regex' => 'The :attribute format is invalid.',
                'numeric' => 'The :attribute must be a number.',
                'password' => 'The password is incorrect.',
                'present' => 'The :attribute field must be present.',
                'regex' => 'The :attribute format is invalid.',
                'required' => 'The :attribute field is required.',
                'required_if' => 'The :attribute field is required when :other is :value.',
                'required_unless' => 'The :attribute field is required unless :other is in :values.',
                'required_with' => 'The :attribute field is required when :values is present.',
                'required_with_all' => 'The :attribute field is required when :values are present.',
                'required_without' => 'The :attribute field is required when :values is not present.',
                'required_without_all' => 'The :attribute field is required when none of :values are present.',
                'same' => 'The :attribute and :other must match.',
                'size' => [
                    'numeric' => 'The :attribute must be :size.',
                    'file' => 'The :attribute must be :size kilobytes.',
                    'string' => 'The :attribute must be :size characters.',
                    'array' => 'The :attribute must contain :size items.',
                ],
                'starts_with' => 'The :attribute must start with one of the following: :values.',
                'string' => 'The :attribute must be a string.',
                'timezone' => 'The :attribute must be a valid zone.',
                'unique' => 'The :attribute has already been taken.',
                'uploaded' => 'The :attribute failed to upload.',
                'url' => 'The :attribute format is invalid.',
                'uuid' => 'The :attribute must be a valid UUID.',
                'custom' => [
                    'attribute-name' => [
                        'rule-name' => 'custom-message',
                    ],
                ],
                'attributes' => [],
            ],
            'common' => [
                'save' => 'Save',
                'cancel' => 'Cancel',
                'delete' => 'Delete',
                'edit' => 'Edit',
                'create' => 'Create',
                'update' => 'Update',
                'view' => 'View',
                'search' => 'Search',
                'filter' => 'Filter',
                'export' => 'Export',
                'import' => 'Import',
                'yes' => 'Yes',
                'no' => 'No',
                'loading' => 'Loading...',
                'success' => 'Success',
                'error' => 'Error',
                'warning' => 'Warning',
                'info' => 'Information',
                'confirm' => 'Confirm',
                'close' => 'Close',
                'back' => 'Back',
                'next' => 'Next',
                'previous' => 'Previous',
                'home' => 'Home',
                'dashboard' => 'Dashboard',
                'settings' => 'Settings',
                'profile' => 'Profile',
                'logout' => 'Logout',
                'name' => 'Name',
                'email' => 'Email',
                'phone' => 'Phone',
                'address' => 'Address',
                'date' => 'Date',
                'time' => 'Time',
                'status' => 'Status',
                'active' => 'Active',
                'inactive' => 'Inactive',
                'enabled' => 'Enabled',
                'disabled' => 'Disabled',
                'actions' => 'Actions',
                'total' => 'Total',
                'subtotal' => 'Subtotal',
                'tax' => 'Tax',
                'discount' => 'Discount',
                'amount' => 'Amount',
                'quantity' => 'Quantity',
                'price' => 'Price',
                'description' => 'Description',
                'notes' => 'Notes',
                'comments' => 'Comments',
                'created_at' => 'Created At',
                'updated_at' => 'Updated At',
                'created_by' => 'Created By',
                'updated_by' => 'Updated By',
            ]
        ];

        // Only create files for English (default language)
        if ($language->code === 'en') {
            foreach ($basicTranslations as $group => $translations) {
                if (!$language->hasTranslationFile($group)) {
                    $language->saveTranslations($group, $translations);
                }
            }
        }
    }
}
