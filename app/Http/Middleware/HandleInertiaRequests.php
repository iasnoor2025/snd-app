<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    /**
     * Get the version that will determine if the frontend needs to be refreshed.
     */
    public function version(Request $request): ?string
    {
        try {
            return md5_file(public_path('build/manifest.json'));
        } catch (\Exception $e) {
            // Log the error but don't crash the application
            \Log::error('Error determining asset version: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        $user = $request->user();
        if ($user) {
            $user->load('roles');
        }

        $ziggy = new Ziggy;
        $ziggyArray = $ziggy->toArray();

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => $user,
                'roles' => $user ? $user->getRoleNames() : [],
                'permissions' => $user ? $user->getAllPermissions()->pluck('name') : [],
            ],
            'ziggy' => [
                ...$ziggyArray,
                'location' => $request->url(),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'locale' => app()->getLocale(),
            'availableLocales' => $this->getAvailableLocales(),
            'localeConfig' => [
                'current' => app()->getLocale(),
                'available' => $this->getAvailableLocales(),
                'rtl' => in_array(app()->getLocale(), ['ar', 'he', 'fa', 'ur']),
                'fallback' => config('app.fallback_locale', 'en'),
            ],
            'translations' => $this->getTranslations($request),
        ];
    }

    /**
     * Get available locales from database
     *
     * @return array
     */
    private function getAvailableLocales(): array
    {
        try {
            return \Modules\Localization\Models\Language::where('enabled', true)
                ->pluck('code')
                ->toArray();
        } catch (\Exception $e) {
            // Fallback to config if database is not available
            return array_keys(config('localization.languages.available', ['en' => 'English']));
        }
    }

    /**
     * Get translations for the current locale
     *
     * @param Request $request
     * @return array
     */
    private function getTranslations(Request $request): array
    {
        $locale = app()->getLocale();
        $translations = [];

        // Load common translation files
        $files = ['auth', 'pagination', 'passwords', 'validation'];

        foreach ($files as $file) {
            $filePath = resource_path("lang/{$locale}/{$file}.php");
            if (file_exists($filePath)) {
                $fileTranslations = include $filePath;
                if (is_array($fileTranslations)) {
                    $translations = array_merge($translations, $fileTranslations);
                }
            }
        }

        // Load JSON translations if they exist
        $jsonPath = resource_path("lang/{$locale}.json");
        if (file_exists($jsonPath)) {
            $jsonTranslations = json_decode(file_get_contents($jsonPath), true);
            if (is_array($jsonTranslations)) {
                $translations = array_merge($translations, $jsonTranslations);
            }
        }

        return $translations;
    }
}
