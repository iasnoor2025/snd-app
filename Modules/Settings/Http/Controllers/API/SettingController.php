<?php

namespace Modules\Settings\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Modules\Settings\Domain\Setting;
use Illuminate\Http\Response;
use Exception;
use Illuminate\Support\Facades\Cache;

class SettingController extends Controller
{
    /**
     * Display a listing of settings.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Setting::query();

            // Apply filters if provided
            if ($request->has('group')) {
                $query->where('group', $request->group);
            }

            if ($request->has('type')) {
                $query->where('type', $request->type);
            }

            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('key', 'like', "%{$search}%")
                      ->orWhere('name', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%");
                });
            }

            $settings = $query->orderBy('group')
                             ->orderBy('order')
                             ->paginate($request->get('per_page', 50));

            return response()->json([
                'success' => true,
                'data' => $settings,
                'message' => 'Settings retrieved successfully'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve settings',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Store a newly created setting.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'key' => 'required|string|unique:settings,key',
                'name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'value' => 'required',
                'type' => 'required|in:string,integer,boolean,json,array,float',
                'group' => 'required|string|max:100',
                'is_public' => 'boolean',
                'is_editable' => 'boolean',
                'validation_rules' => 'nullable|string',
                'options' => 'nullable|json',
                'order' => 'nullable|integer'
            ]);

            // Process value based on type
            $validated['value'] = $this->processSettingValue($validated['value'], $validated['type']);

            $setting = Setting::create($validated);

            // Clear settings cache
            Cache::forget('settings');

            return response()->json([
                'success' => true,
                'data' => $setting,
                'message' => 'Setting created successfully'
            ], Response::HTTP_CREATED);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create setting',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Display the specified setting.
     */
    public function show(string $key): JsonResponse
    {
        try {
            $setting = Setting::where('key', $key)->firstOrFail();

            return response()->json([
                'success' => true,
                'data' => $setting,
                'message' => 'Setting retrieved successfully'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Setting not found',
                'error' => $e->getMessage()
            ], Response::HTTP_NOT_FOUND);
        }
    }

    /**
     * Update the specified setting.
     */
    public function update(Request $request, string $key): JsonResponse
    {
        try {
            $setting = Setting::where('key', $key)->firstOrFail();

            // Check if setting is editable
            if (!$setting->is_editable) {
                return response()->json([
                    'success' => false,
                    'message' => 'This setting is not editable'
                ], Response::HTTP_FORBIDDEN);
            }

            $validated = $request->validate([
                'name' => 'sometimes|string|max:255',
                'description' => 'nullable|string',
                'value' => 'required',
                'type' => 'sometimes|in:string,integer,boolean,json,array,float',
                'group' => 'sometimes|string|max:100',
                'is_public' => 'sometimes|boolean',
                'validation_rules' => 'nullable|string',
                'options' => 'nullable|json',
                'order' => 'nullable|integer'
            ]);

            // Process value based on type
            if (isset($validated['value'])) {
                $type = $validated['type'] ?? $setting->type;
                $validated['value'] = $this->processSettingValue($validated['value'], $type);
            }

            $setting->update($validated);

            // Clear settings cache
            Cache::forget('settings');

            return response()->json([
                'success' => true,
                'data' => $setting->fresh(),
                'message' => 'Setting updated successfully'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update setting',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Remove the specified setting.
     */
    public function destroy(string $key): JsonResponse
    {
        try {
            $setting = Setting::where('key', $key)->firstOrFail();

            // Check if setting is editable (deletable)
            if (!$setting->is_editable) {
                return response()->json([
                    'success' => false,
                    'message' => 'This setting cannot be deleted'
                ], Response::HTTP_FORBIDDEN);
            }

            $setting->delete();

            // Clear settings cache
            Cache::forget('settings');

            return response()->json([
                'success' => true,
                'message' => 'Setting deleted successfully'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete setting',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get settings by group.
     */
    public function getByGroup(string $group): JsonResponse
    {
        try {
            $settings = Setting::where('group', $group)
                              ->orderBy('order')
                              ->get();

            return response()->json([
                'success' => true,
                'data' => $settings,
                'message' => 'Settings retrieved successfully'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve settings',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get public settings only.
     */
    public function getPublic(): JsonResponse
    {
        try {
            $settings = Setting::where('is_public', true)
                              ->orderBy('group')
                              ->orderBy('order')
                              ->get()
                              ->groupBy('group');

            return response()->json([
                'success' => true,
                'data' => $settings,
                'message' => 'Public settings retrieved successfully'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve public settings',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Bulk update settings.
     */
    public function bulkUpdate(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'settings' => 'required|array',
                'settings.*.key' => 'required|string|exists:settings,key',
                'settings.*.value' => 'required'
            ]);

            $updatedSettings = [];

            foreach ($validated['settings'] as $settingData) {
                $setting = Setting::where('key', $settingData['key'])->first();

                if ($setting && $setting->is_editable) {
                    $processedValue = $this->processSettingValue($settingData['value'], $setting->type);
                    $setting->update(['value' => $processedValue]);
                    $updatedSettings[] = $setting->fresh();
                }
            }

            // Clear settings cache
            Cache::forget('settings');

            return response()->json([
                'success' => true,
                'data' => $updatedSettings,
                'message' => 'Settings updated successfully'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update settings',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Reset settings to default values.
     */
    public function reset(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'group' => 'nullable|string',
                'keys' => 'nullable|array',
                'keys.*' => 'string|exists:settings,key'
            ]);

            $query = Setting::query();

            if (isset($validated['group'])) {
                $query->where('group', $validated['group']);
            }

            if (isset($validated['keys'])) {
                $query->whereIn('key', $validated['keys']);
            }

            $settings = $query->where('is_editable', true)->get();

            foreach ($settings as $setting) {
                // Reset to default value if available
                if ($setting->default_value !== null) {
                    $setting->update(['value' => $setting->default_value]);
                }
            }

            // Clear settings cache
            Cache::forget('settings');

            return response()->json([
                'success' => true,
                'message' => 'Settings reset successfully'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to reset settings',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Process setting value based on type.
     */
    private function processSettingValue($value, string $type)
    {
        switch ($type) {
            case 'boolean':
                return filter_var($value, FILTER_VALIDATE_BOOLEAN);
            case 'integer':
                return (int) $value;
            case 'float':
                return (float) $value;
            case 'json':
            case 'array':
                return is_string($value) ? json_decode($value, true) : $value;
            default:
                return $value;
        }
    }
}
