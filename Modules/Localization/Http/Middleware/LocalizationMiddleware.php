<?php

namespace Modules\Localization\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Config;
use Modules\Localization\Models\Language;
use Symfony\Component\HttpFoundation\Response;

class LocalizationMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Get the locale from various sources in order of priority
        $locale = $this->getLocale($request);

        // Validate the locale
        $validatedLocale = $this->validateLocale($locale);

        // Set the application locale
        App::setLocale($validatedLocale);

        // Store the locale in session for persistence
        Session::put('locale', $validatedLocale);

        // Set additional locale-specific configurations
        $this->setLocaleConfiguration($validatedLocale);

        // Add locale to request for easy access in controllers
        $request->merge(['current_locale' => $validatedLocale]);

        return $next($request);
    }

    /**
     * Get locale from various sources
     */
    private function getLocale(Request $request): string
    {
        // 1. Check URL parameter (highest priority)
        if ($request->has('locale')) {
            return $request->get('locale');
        }

        // 2. Check route parameter
        if ($request->route('locale')) {
            return $request->route('locale');
        }

        // 3. Check session
        if (Session::has('locale')) {
            return Session::get('locale');
        }

        // 4. Check user preference (if authenticated)
        if (auth()->check()) {
            $userLocale = auth()->user()->locale;
            if ($userLocale) {
                return $userLocale;
            }
        }

        // 5. Check Accept-Language header
        $acceptLanguage = $request->header('Accept-Language');
        if ($acceptLanguage) {
            $preferredLanguage = $this->parseAcceptLanguage($acceptLanguage);
            if ($preferredLanguage) {
                return $preferredLanguage;
            }
        }

        // 6. Fall back to default locale
        return $this->getDefaultLocale();
    }

    /**
     * Validate if the locale is supported
     */
    private function validateLocale(string $locale): string
    {
        // Check if the language exists and is enabled
        $language = Language::where('code', $locale)
            ->where('enabled', true)
            ->first();

        if ($language) {
            return $locale;
        }

        // If not valid, return default locale
        return $this->getDefaultLocale();
    }

    /**
     * Get the default locale
     */
    private function getDefaultLocale(): string
    {
        // Try to get from database
        $defaultLanguage = Language::where('is_default', true)
            ->where('enabled', true)
            ->first();

        if ($defaultLanguage) {
            return $defaultLanguage->code;
        }

        // Fall back to config
        return Config::get('localization.default_language', 'en');
    }

    /**
     * Parse Accept-Language header
     */
    private function parseAcceptLanguage(string $acceptLanguage): ?string
    {
        // Parse the Accept-Language header
        $languages = [];
        $parts = explode(',', $acceptLanguage);

        foreach ($parts as $part) {
            $part = trim($part);
            if (strpos($part, ';q=') !== false) {
                [$lang, $quality] = explode(';q=', $part);
                $languages[trim($lang)] = (float) $quality;
            } else {
                $languages[trim($part)] = 1.0;
            }
        }

        // Sort by quality
        arsort($languages);

        // Find the first supported language
        foreach (array_keys($languages) as $lang) {
            // Extract language code (remove country code if present)
            $langCode = strtolower(substr($lang, 0, 2));

            // Check if we support this language
            if (Language::where('code', $langCode)->where('enabled', true)->exists()) {
                return $langCode;
            }
        }

        return null;
    }

    /**
     * Set locale-specific configuration
     */
    private function setLocaleConfiguration(string $locale): void
    {
        $language = Language::where('code', $locale)->first();

        if (!$language || !$language->metadata) {
            return;
        }

        $metadata = json_decode($language->metadata, true);

        if (!$metadata) {
            return;
        }

        // Set timezone if specified
        if (isset($metadata['timezone'])) {
            Config::set('app.timezone', $metadata['timezone']);
            date_default_timezone_set($metadata['timezone']);
        }

        // Set currency if specified
        if (isset($metadata['currency'])) {
            Config::set('localization.currency', $metadata['currency']);
        }

        // Set date format if specified
        if (isset($metadata['date_format'])) {
            Config::set('localization.date_format', $metadata['date_format']);
        }

        // Set time format if specified
        if (isset($metadata['time_format'])) {
            Config::set('localization.time_format', $metadata['time_format']);
        }

        // Set text direction
        Config::set('localization.direction', $language->direction);
    }
}
