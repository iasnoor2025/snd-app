<?php

namespace Modules\Localization\Http\Controllers\Api;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Exception;

class LocalizationApiController extends Controller
{
    /**
     * Get all translations for a locale
     */
    public function getTranslations(Request $request): JsonResponse
    {
        try {
            $locale = $request->get('locale', app()->getLocale());
            
            $translations = Cache::remember("translations.{$locale}", 3600, function () use ($locale) {
                return DB::table('translations')
                    ->join('translation_keys', 'translations.key_id', '=', 'translation_keys.id')
                    ->where('translations.language', $locale)
                    ->select('translation_keys.key', 'translations.value')
                    ->get()
                    ->pluck('value', 'key')
                    ->toArray();
            });

            return response()->json([
                'success' => true,
                'data' => $translations,
                'locale' => $locale
            ]);
        } catch (Exception $e) {
            Log::error('Failed to get translations', ['error' => $e->getMessage()]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve translations',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update translations for a locale
     */
    public function updateTranslations(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'locale' => 'required|string|max:10',
            'translations' => 'required|array',
            'translations.*' => 'required|string',
        ]);

        try {
            DB::beginTransaction();

            foreach ($validated['translations'] as $key => $value) {
                // Find or create translation key
                $keyRecord = DB::table('translation_keys')
                    ->where('key', $key)
                    ->first();

                if (!$keyRecord) {
                    $keyId = DB::table('translation_keys')->insertGetId([
                        'key' => $key,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                } else {
                    $keyId = $keyRecord->id;
                }

                // Update or insert translation
                DB::table('translations')
                    ->updateOrInsert(
                        ['key_id' => $keyId, 'language' => $validated['locale']],
                        ['value' => $value, 'updated_at' => now()]
                    );
            }

            DB::commit();

            // Clear cache for this locale
            Cache::forget("translations.{$validated['locale']}");

            return response()->json([
                'success' => true,
                'message' => 'Translations updated successfully'
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Failed to update translations', ['error' => $e->getMessage()]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to update translations',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get translations for a specific group
     */
    public function getTranslationGroup(Request $request, string $locale, string $group): JsonResponse
    {
        try {
            $translations = DB::table('translations')
                ->join('translation_keys', 'translations.key_id', '=', 'translation_keys.id')
                ->where('translations.language', $locale)
                ->where('translation_keys.key', 'LIKE', $group . '.%')
                ->select('translation_keys.key', 'translations.value')
                ->get()
                ->pluck('value', 'key')
                ->toArray();

            return response()->json([
                'success' => true,
                'data' => $translations,
                'locale' => $locale,
                'group' => $group
            ]);
        } catch (Exception $e) {
            Log::error('Failed to get translation group', ['error' => $e->getMessage()]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve translation group',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update translations for a specific group
     */
    public function updateTranslationGroup(Request $request, string $locale, string $group): JsonResponse
    {
        $validated = $request->validate([
            'translations' => 'required|array',
            'translations.*' => 'required|string',
        ]);

        try {
            DB::beginTransaction();

            foreach ($validated['translations'] as $key => $value) {
                // Ensure key starts with group prefix
                $fullKey = str_starts_with($key, $group . '.') ? $key : $group . '.' . $key;

                // Find or create translation key
                $keyRecord = DB::table('translation_keys')
                    ->where('key', $fullKey)
                    ->first();

                if (!$keyRecord) {
                    $keyId = DB::table('translation_keys')->insertGetId([
                        'key' => $fullKey,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                } else {
                    $keyId = $keyRecord->id;
                }

                // Update or insert translation
                DB::table('translations')
                    ->updateOrInsert(
                        ['key_id' => $keyId, 'language' => $locale],
                        ['value' => $value, 'updated_at' => now()]
                    );
            }

            DB::commit();

            // Clear cache for this locale
            Cache::forget("translations.{$locale}");

            return response()->json([
                'success' => true,
                'message' => 'Translation group updated successfully'
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Failed to update translation group', ['error' => $e->getMessage()]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to update translation group',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get available locales
     */
    public function getAvailableLocales(): JsonResponse
    {
        try {
            $locales = DB::table('locales')
                ->where('is_active', true)
                ->select('code', 'name', 'native_name', 'direction')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $locales
            ]);
        } catch (Exception $e) {
            Log::error('Failed to get available locales', ['error' => $e->getMessage()]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve available locales',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get current locale
     */
    public function getCurrentLocale(): JsonResponse
    {
        try {
            $currentLocale = app()->getLocale();
            
            $locale = DB::table('locales')
                ->where('code', $currentLocale)
                ->first();

            return response()->json([
                'success' => true,
                'data' => [
                    'current_locale' => $currentLocale,
                    'locale_info' => $locale
                ]
            ]);
        } catch (Exception $e) {
            Log::error('Failed to get current locale', ['error' => $e->getMessage()]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve current locale',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Set current locale
     */
    public function setCurrentLocale(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'locale' => 'required|string|max:10'
        ]);

        try {
            // Set the locale for the current request
            app()->setLocale($validated['locale']);
            
            // Store this in session
            session(['locale' => $validated['locale']]);

            return response()->json([
                'success' => true,
                'message' => 'Locale set successfully',
                'data' => [
                    'locale' => $validated['locale']
                ]
            ]);
        } catch (Exception $e) {
            Log::error('Failed to set current locale', ['error' => $e->getMessage()]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to set current locale',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get available languages
     */
    public function getLanguages(): JsonResponse
    {
        try {
            $languages = DB::table('languages')
                ->where('is_active', true)
                ->select('code', 'name', 'native_name', 'flag')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $languages
            ]);
        } catch (Exception $e) {
            Log::error('Failed to get languages', ['error' => $e->getMessage()]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve languages',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get specific language
     */
    public function getLanguage(string $language): JsonResponse
    {
        try {
            $languageData = DB::table('languages')
                ->where('code', $language)
                ->first();

            if (!$languageData) {
                return response()->json([
                    'success' => false,
                    'message' => 'Language not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $languageData
            ]);
        } catch (Exception $e) {
            Log::error('Failed to get language', ['error' => $e->getMessage()]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve language',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Add new language
     */
    public function addLanguage(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => 'required|string|max:10|unique:languages,code',
            'name' => 'required|string|max:255',
            'native_name' => 'required|string|max:255',
            'flag' => 'nullable|string|max:255',
        ]);

        try {
            $languageId = DB::table('languages')->insertGetId([
                'code' => $validated['code'],
                'name' => $validated['name'],
                'native_name' => $validated['native_name'],
                'flag' => $validated['flag'] ?? null,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Language added successfully',
                'data' => [
                    'id' => $languageId,
                    'code' => $validated['code'],
                    'name' => $validated['name'],
                    'native_name' => $validated['native_name'],
                    'flag' => $validated['flag'] ?? null,
                ]
            ], 201);
        } catch (Exception $e) {
            Log::error('Failed to add language', ['error' => $e->getMessage()]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to add language',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update language
     */
    public function updateLanguage(Request $request, string $language): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'native_name' => 'required|string|max:255',
            'flag' => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ]);

        try {
            $updated = DB::table('languages')
                ->where('code', $language)
                ->update([
                    'name' => $validated['name'],
                    'native_name' => $validated['native_name'],
                    'flag' => $validated['flag'] ?? null,
                    'is_active' => $validated['is_active'] ?? true,
                    'updated_at' => now(),
                ]);

            if (!$updated) {
                return response()->json([
                    'success' => false,
                    'message' => 'Language not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Language updated successfully'
            ]);
        } catch (Exception $e) {
            Log::error('Failed to update language', ['error' => $e->getMessage()]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to update language',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove language
     */
    public function removeLanguage(string $language): JsonResponse
    {
        try {
            $deleted = DB::table('languages')
                ->where('code', $language)
                ->delete();

            if (!$deleted) {
                return response()->json([
                    'success' => false,
                    'message' => 'Language not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Language removed successfully'
            ]);
        } catch (Exception $e) {
            Log::error('Failed to remove language', ['error' => $e->getMessage()]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to remove language',
                'error' => $e->getMessage()
            ], 500);
        }
    }
} 