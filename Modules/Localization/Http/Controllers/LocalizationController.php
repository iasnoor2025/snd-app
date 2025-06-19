<?php

namespace Modules\Localization\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Inertia\Inertia;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Lang;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;
use Exception;

class LocalizationController extends Controller
{
    /**
     * Display the localization dashboard.
     *
     * @return \Inertia\Response
     */
    public function index()
    {
        $currentLocale = App::getLocale();
        $availableLocales = $this->getAvailableLocalesWithNames();
        $defaultLocale = config('localization.languages.default', 'en');

        // Get translation statistics
        $translationStats = $this->getTranslationStats();

        return Inertia::render('Localization/Index', [
            'currentLocale' => $currentLocale,
            'availableLocales' => $availableLocales,
            'defaultLocale' => $defaultLocale,
            'translationStats' => $translationStats,
            'dateFormats' => config('localization.date_formats.available', []),
            'timeFormats' => config('localization.time_formats.available', []),
            'currencies' => config('localization.currencies.available', []),
        ]);
    }

    /**
     * Display translations management.
     *
     * @return \Inertia\Response
     */
    public function translations(Request $request)
    {
        $locale = $request->get('locale', App::getLocale());
        $group = $request->get('group', 'common');
        $search = $request->get('search', '');

        $translations = $this->getTranslations($locale, $group, $search);
        $translationGroups = $this->getTranslationGroups();
        $availableLocales = $this->getAvailableLocalesWithNames();

        return Inertia::render('Localization/Translations', [
            'translations' => $translations,
            'translationGroups' => $translationGroups,
            'availableLocales' => $availableLocales,
            'currentLocale' => $locale,
            'currentGroup' => $group,
            'search' => $search,
        ]);
    }

    /**
     * Update translations.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function updateTranslations(Request $request)
    {
        $request->validate([
            'locale' => 'required|string|max:5',
            'group' => 'required|string|max:100',
            'translations' => 'required|array',
            'translations.*' => 'string',
        ]);

        $locale = $request->input('locale');
        $group = $request->input('group');
        $translations = $request->input('translations');

        // Save translations to file
        $this->saveTranslations($locale, $group, $translations);

        return redirect()->back()->with('message', 'Translations updated successfully.');
    }

    /**
     * Get specific translation group.
     *
     * @param string $locale
     * @param string $group
     * @return \Inertia\Response
     */
    public function translationGroup($locale, $group)
    {
        $translations = $this->getTranslations($locale, $group);
        $availableLocales = $this->getAvailableLocalesWithNames();
        $translationGroups = $this->getTranslationGroups();

        return Inertia::render('Localization/TranslationGroup', [
            'translations' => $translations,
            'availableLocales' => $availableLocales,
            'translationGroups' => $translationGroups,
            'currentLocale' => $locale,
            'currentGroup' => $group,
        ]);
    }

    /**
     * Update specific translation group.
     *
     * @param \Illuminate\Http\Request $request
     * @param string $locale
     * @param string $group
     * @return \Illuminate\Http\RedirectResponse
     */
    public function updateTranslationGroup(Request $request, $locale, $group)
    {
        $request->validate([
            'translations' => 'required|array',
            'translations.*' => 'string',
        ]);

        $translations = $request->input('translations');
        $this->saveTranslations($locale, $group, $translations);

        return redirect()->back()->with('message', 'Translation group updated successfully.');
    }

    /**
     * Import translations from file.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function importTranslations(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:json,php',
            'locale' => 'required|string|max:5',
            'group' => 'required|string|max:100',
        ]);

        $file = $request->file('file');
        $locale = $request->input('locale');
        $group = $request->input('group');

        $content = file_get_contents($file->getPathname());

        if ($file->getClientOriginalExtension() === 'json') {
            $translations = json_decode($content, true);
        } else {
            // PHP file
            $translations = include $file->getPathname();
        }

        if (!is_array($translations)) {
            return redirect()->back()->withErrors(['file' => 'Invalid translation file format.']);
        }

        $this->saveTranslations($locale, $group, $translations);

        return redirect()->back()->with('message', 'Translations imported successfully.');
    }

    /**
     * Export translations.
     *
     * @param string|null $locale
     * @return \Illuminate\Http\Response
     */
    public function exportTranslations($locale = null)
    {
        $locale = $locale ?: App::getLocale();
        $allTranslations = [];

        $translationGroups = $this->getTranslationGroups();

        foreach ($translationGroups as $group) {
            $allTranslations[$group] = $this->getTranslations($locale, $group);
        }

        $filename = "translations_{$locale}_" . date('Y-m-d_H-i-s') . '.json';

        return response()->json($allTranslations)
            ->header('Content-Disposition', "attachment; filename={$filename}");
    }

    /**
     * Display locales management.
     *
     * @return \Inertia\Response
     */
    public function locales()
    {
        $availableLocales = $this->getAvailableLocalesWithNames();
        $defaultLocale = config('localization.languages.default', 'en');
        $currentLocale = App::getLocale();

        return Inertia::render('Localization/Locales', [
            'availableLocales' => $availableLocales,
            'defaultLocale' => $defaultLocale,
            'currentLocale' => $currentLocale,
        ]);
    }

    /**
     * Store a new locale
     */
    public function storeLocale(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:10|unique:locales,code',
            'name' => 'required|string|max:255',
            'native_name' => 'required|string|max:255',
            'direction' => 'required|in:ltr,rtl',
            'is_active' => 'boolean',
        ]);

        try {
            $locale = DB::table('locales')->insertGetId([
                'code' => $validated['code'],
                'name' => $validated['name'],
                'native_name' => $validated['native_name'],
                'direction' => $validated['direction'],
                'is_active' => $validated['is_active'] ?? true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Locale created successfully',
                'data' => [
                    'id' => $locale,
                    'code' => $validated['code'],
                    'name' => $validated['name'],
                    'native_name' => $validated['native_name'],
                    'direction' => $validated['direction'],
                    'is_active' => $validated['is_active'] ?? true,
                ]
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create locale',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a locale
     */
    public function deleteLocale($id)
    {
        try {
            $deleted = DB::table('locales')->where('id', $id)->delete();
            
            if (!$deleted) {
                return response()->json([
                    'success' => false,
                    'message' => 'Locale not found'
                ], 404);
            }

            // Also delete associated translations
            DB::table('translations')->where('locale', $id)->delete();

            return response()->json([
                'success' => true,
                'message' => 'Locale deleted successfully'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete locale',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Switch application locale.
     *
     * @param string $locale
     * @return \Illuminate\Http\RedirectResponse
     */
    public function switchLocale($locale)
    {
        // Get available locales from database instead of config
        $availableLocales = $this->getAvailableLocales();

        if (!in_array($locale, $availableLocales)) {
            return redirect()->back()->withErrors(['locale' => 'Invalid locale.']);
        }

        Session::put('locale', $locale);
        App::setLocale($locale);

        // Update user preference if authenticated
        if (auth()->check()) {
            auth()->user()->update(['locale' => $locale]);
        }

        // Get the URL to redirect back to
        $redirectUrl = url()->previous();

        // If the previous URL is the login page or contains 'login', keep it as is
        // Otherwise, redirect back to the previous page
        if (strpos($redirectUrl, '/login') !== false) {
            return redirect($redirectUrl);
        }

        return redirect()->back();
    }

    /**
     * Get available locales from database
     */
    private function getAvailableLocales()
    {
        try {
            return \DB::table('languages')
                ->where('enabled', true)
                ->pluck('code')
                ->toArray();
        } catch (\Exception $e) {
            // Fallback to config if database is not available
            return array_keys(config('localization.languages.available', []));
        }
    }

    /**
     * Get available locales with names from database
     */
    private function getAvailableLocalesWithNames()
    {
        try {
            return \DB::table('languages')
                ->where('enabled', true)
                ->pluck('name', 'code')
                ->toArray();
        } catch (\Exception $e) {
            // Fallback to config if database is not available
            return config('localization.languages.available', []);
        }
    }

    /**
     * Display languages management.
     *
     * @return \Inertia\Response
     */
    public function languages()
    {
        $languages = $this->getAvailableLocalesWithNames();
        $defaultLanguage = config('localization.languages.default', 'en');

        return Inertia::render('Localization/Languages', [
            'languages' => $languages,
            'defaultLanguage' => $defaultLanguage,
        ]);
    }

    /**
     * Store a new language
     */
    public function storeLanguage(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:10|unique:languages,code',
            'name' => 'required|string|max:255',
            'native_name' => 'required|string|max:255',
            'flag' => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ]);

        try {
            $language = DB::table('languages')->insertGetId([
                'code' => $validated['code'],
                'name' => $validated['name'],
                'native_name' => $validated['native_name'],
                'flag' => $validated['flag'] ?? null,
                'is_active' => $validated['is_active'] ?? true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Language created successfully',
                'data' => [
                    'id' => $language,
                    'code' => $validated['code'],
                    'name' => $validated['name'],
                    'native_name' => $validated['native_name'],
                    'flag' => $validated['flag'] ?? null,
                    'is_active' => $validated['is_active'] ?? true,
                ]
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create language',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update a language
     */
    public function updateLanguage(Request $request, $id)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:10|unique:languages,code,' . $id,
            'name' => 'required|string|max:255',
            'native_name' => 'required|string|max:255',
            'flag' => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ]);

        try {
            $updated = DB::table('languages')
                ->where('id', $id)
                ->update([
                    'code' => $validated['code'],
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
            return response()->json([
                'success' => false,
                'message' => 'Failed to update language',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a language
     */
    public function deleteLanguage($id)
    {
        try {
            $deleted = DB::table('languages')->where('id', $id)->delete();
            
            if (!$deleted) {
                return response()->json([
                    'success' => false,
                    'message' => 'Language not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Language deleted successfully'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete language',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get translation statistics
     */
    public function getTranslationStatistics()
    {
        try {
            $stats = [
                'total_keys' => DB::table('translation_keys')->count(),
                'total_translations' => DB::table('translations')->count(),
                'languages' => DB::table('languages')->where('is_active', true)->count(),
                'completion_rate' => 0,
            ];

            // Calculate completion rate
            if ($stats['total_keys'] > 0 && $stats['languages'] > 0) {
                $expectedTranslations = $stats['total_keys'] * $stats['languages'];
                $stats['completion_rate'] = ($stats['total_translations'] / $expectedTranslations) * 100;
            }

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get translation statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get translations for a specific language
     */
    public function getTranslations($language)
    {
        try {
            $translations = DB::table('translations')
                ->join('translation_keys', 'translations.key_id', '=', 'translation_keys.id')
                ->where('translations.language', $language)
                ->select('translation_keys.key', 'translations.value', 'translations.updated_at')
                ->get()
                ->keyBy('key')
                ->map(function ($item) {
                    return $item->value;
                });

            return response()->json([
                'success' => true,
                'data' => $translations
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get translations',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get translation groups
     */
    public function getTranslationGroups()
    {
        try {
            $groups = DB::table('translation_keys')
                ->select(DB::raw('SUBSTRING_INDEX(key, ".", 1) as group_name'))
                ->distinct()
                ->get()
                ->pluck('group_name')
                ->filter()
                ->values();

            return response()->json([
                'success' => true,
                'data' => $groups
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get translation groups',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Save translations
     */
    public function saveTranslations(Request $request)
    {
        $validated = $request->validate([
            'language' => 'required|string|max:10',
            'translations' => 'required|array',
            'translations.*' => 'required|string',
        ]);

        try {
            DB::beginTransaction();

            foreach ($validated['translations'] as $key => $value) {
                // Find or create translation key
                $keyId = DB::table('translation_keys')
                    ->where('key', $key)
                    ->value('id');

                if (!$keyId) {
                    $keyId = DB::table('translation_keys')->insertGetId([
                        'key' => $key,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }

                // Update or insert translation
                DB::table('translations')
                    ->updateOrInsert(
                        ['key_id' => $keyId, 'language' => $validated['language']],
                        ['value' => $value, 'updated_at' => now()]
                    );
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Translations saved successfully'
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to save translations',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
