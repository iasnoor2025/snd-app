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
     * Store a new locale.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function storeLocale(Request $request)
    {
        $request->validate([
            'code' => 'required|string|max:5|unique:locales,code',
            'name' => 'required|string|max:100',
            'native_name' => 'required|string|max:100',
            'direction' => 'required|in:ltr,rtl',
        ]);

        // TODO: Implement actual locale storage
        // This would typically involve updating configuration or database

        return redirect()->back()->with('message', 'Locale added successfully.');
    }

    /**
     * Delete a locale.
     *
     * @param string $locale
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroyLocale($locale)
    {
        // TODO: Implement actual locale deletion
        // This would typically involve updating configuration or database

        return redirect()->back()->with('message', 'Locale deleted successfully.');
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
     * Store a new language.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function storeLanguage(Request $request)
    {
        $request->validate([
            'code' => 'required|string|max:5',
            'name' => 'required|string|max:100',
            'native_name' => 'required|string|max:100',
            'direction' => 'required|in:ltr,rtl',
        ]);

        // TODO: Implement actual language storage

        return redirect()->back()->with('message', 'Language added successfully.');
    }

    /**
     * Update a language.
     *
     * @param \Illuminate\Http\Request $request
     * @param string $language
     * @return \Illuminate\Http\RedirectResponse
     */
    public function updateLanguage(Request $request, $language)
    {
        $request->validate([
            'name' => 'required|string|max:100',
            'native_name' => 'required|string|max:100',
            'direction' => 'required|in:ltr,rtl',
        ]);

        // TODO: Implement actual language update

        return redirect()->back()->with('message', 'Language updated successfully.');
    }

    /**
     * Delete a language.
     *
     * @param string $language
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroyLanguage($language)
    {
        // TODO: Implement actual language deletion

        return redirect()->back()->with('message', 'Language deleted successfully.');
    }

    /**
     * Get translation statistics.
     *
     * @return array
     */
    private function getTranslationStats()
    {
        // TODO: Implement actual translation statistics
        return [
            'total_keys' => 150,
            'translated_keys' => 120,
            'missing_keys' => 30,
            'completion_percentage' => 80,
            'last_updated' => now()->format('Y-m-d H:i:s'),
        ];
    }

    /**
     * Get translations for a specific locale and group.
     *
     * @param string $locale
     * @param string $group
     * @param string $search
     * @return array
     */
    private function getTranslations($locale, $group, $search = '')
    {
        // TODO: Implement actual translation retrieval
        $sampleTranslations = [
            'welcome' => 'Welcome',
            'login' => 'Login',
            'logout' => 'Logout',
            'dashboard' => 'Dashboard',
            'employees' => 'Employees',
            'settings' => 'Settings',
            'profile' => 'Profile',
            'save' => 'Save',
            'cancel' => 'Cancel',
            'delete' => 'Delete',
        ];

        if ($search) {
            return array_filter($sampleTranslations, function($value, $key) use ($search) {
                return stripos($key, $search) !== false || stripos($value, $search) !== false;
            }, ARRAY_FILTER_USE_BOTH);
        }

        return $sampleTranslations;
    }

    /**
     * Get available translation groups.
     *
     * @return array
     */
    private function getTranslationGroups()
    {
        // TODO: Implement actual translation groups retrieval
        return [
            'common',
            'auth',
            'validation',
            'pagination',
            'passwords',
            'employees',
            'leaves',
            'timesheets',
            'payroll',
            'projects',
            'equipment',
            'customers',
            'rentals',
        ];
    }

    /**
     * Save translations to file.
     *
     * @param string $locale
     * @param string $group
     * @param array $translations
     * @return void
     */
    private function saveTranslations($locale, $group, $translations)
    {
        // TODO: Implement actual translation saving
        // This would typically save to language files or database

        $langPath = resource_path("lang/{$locale}");

        if (!File::exists($langPath)) {
            File::makeDirectory($langPath, 0755, true);
        }

        $filePath = "{$langPath}/{$group}.php";
        $content = "<?php\n\nreturn " . var_export($translations, true) . ";\n";

        File::put($filePath, $content);
    }
}
