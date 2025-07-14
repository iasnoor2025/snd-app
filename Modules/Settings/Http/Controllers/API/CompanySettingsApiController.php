<?php

namespace Modules\Settings\Http\Controllers\API;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Exception;

class CompanySettingsApiController extends Controller
{
    /**
     * Get company settings
     */
    public function getCompanySettings(): JsonResponse
    {
        try {
            $settings = DB::table('company_settings')->first();

            if (!$settings) {
                // Return default settings if none exist
                $settings = [
                    'company_name' => config('app.name', 'Laravel App'),
                    'company_email' => null,
                    'company_phone' => null,
                    'company_address' => null,
                    'company_logo' => null,
                    'company_website' => null,
                    'tax_number' => null,
                    'currency' => 'USD',
                    'timezone' => config('app.timezone', 'UTC'),
                    'date_format' => 'Y-m-d',
                    'time_format' => 'H:i:s',
                ];
            }

            return response()->json([
                'success' => true,
                'data' => $settings
            ]);
        } catch (Exception $e) {
            Log::error('Failed to get company settings', ['error' => $e->getMessage()]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve company settings',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update company settings
     */
    public function updateCompanySettings(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'company_name' => 'required|string|max:255',
            'company_email' => 'nullable|email|max:255',
            'company_phone' => 'nullable|string|max:50',
            'company_address' => 'nullable|string|max:500',
            'company_website' => 'nullable|url|max:255',
            'tax_number' => 'nullable|string|max:100',
            'currency' => 'required|string|max:10',
            'timezone' => 'required|string|max:50',
            'date_format' => 'required|string|max:20',
            'time_format' => 'required|string|max:20',
        ]);

        try {
            DB::beginTransaction();

            // Check if settings exist
            $existingSettings = DB::table('company_settings')->first();

            if ($existingSettings) {
                // Update existing settings
                DB::table('company_settings')
                    ->where('id', $existingSettings->id)
                    ->update([
                        ...$validated,
                        'updated_at' => now(),
                    ]);
            } else {
                // Create new settings
                DB::table('company_settings')->insert([
                    ...$validated,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Company settings updated successfully'
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Failed to update company settings', ['error' => $e->getMessage()]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to update company settings',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update company logo
     */
    public function updateLogo(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'logo' => 'required|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        try {
            $logoFile = $request->file('logo');

            // Store the logo
            $logoPath = $logoFile->store('company/logos', 'public');

            // Update the company settings with the new logo path
            $existingSettings = DB::table('company_settings')->first();

            if ($existingSettings) {
                // Delete old logo if it exists
                if ($existingSettings->company_logo) {
                    Storage::disk('public')->delete($existingSettings->company_logo);
                }

                DB::table('company_settings')
                    ->where('id', $existingSettings->id)
                    ->update([
                        'company_logo' => $logoPath,
                        'updated_at' => now(),
                    ]);
            } else {
                // Create new settings with logo
                DB::table('company_settings')->insert([
                    'company_name' => config('app.name', 'Laravel App'),
                    'company_logo' => $logoPath,
                    'currency' => 'USD',
                    'timezone' => config('app.timezone', 'UTC'),
                    'date_format' => 'Y-m-d',
                    'time_format' => 'H:i:s',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Company logo updated successfully',
                'data' => [
                    'logo_path' => $logoPath,
                    'logo_url' => Storage::url($logoPath)
                ]
            ]);
        } catch (Exception $e) {
            Log::error('Failed to update company logo', ['error' => $e->getMessage()]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to update company logo',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
