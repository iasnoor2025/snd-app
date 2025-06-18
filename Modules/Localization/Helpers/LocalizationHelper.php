<?php

namespace Modules\Localization\Helpers;

use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Cache;
use Modules\Localization\Models\Language;
use Modules\Localization\Models\Translation;

class LocalizationHelper
{
    /**
     * Get all available languages
     */
    public static function getAvailableLanguages(): array
    {
        return Cache::remember('localization.available_languages', 3600, function () {
            return Language::enabled()->ordered()->get()->toArray();
        });
    }

    /**
     * Get current language
     */
    public static function getCurrentLanguage(): ?Language
    {
        $currentLocale = App::getLocale();
        return Language::where('code', $currentLocale)->first();
    }

    /**
     * Get default language
     */
    public static function getDefaultLanguage(): ?Language
    {
        return Cache::remember('localization.default_language', 3600, function () {
            return Language::default()->first();
        });
    }

    /**
     * Switch to a specific language
     */
    public static function switchLanguage(string $languageCode): bool
    {
        $language = Language::where('code', $languageCode)
            ->where('enabled', true)
            ->first();

        if (!$language) {
            return false;
        }

        App::setLocale($languageCode);
        session(['locale' => $languageCode]);

        // Update user preference if authenticated
        if (auth()->check()) {
            auth()->user()->update(['locale' => $languageCode]);
        }

        return true;
    }

    /**
     * Get translation with fallback
     */
    public static function trans(string $key, array $replace = [], string $locale = null): string
    {
        $locale = $locale ?: App::getLocale();

        // Try to get translation from database first
        $translation = static::getTranslationFromDatabase($key, $locale);

        if ($translation) {
            return static::replaceParameters($translation, $replace);
        }

        // Fall back to Laravel's translation system
        $laravelTranslation = trans($key, $replace, $locale);

        // If Laravel translation is different from key, return it
        if ($laravelTranslation !== $key) {
            return $laravelTranslation;
        }

        // Try default language if current locale failed
        if ($locale !== static::getDefaultLanguage()?->code) {
            $defaultTranslation = static::getTranslationFromDatabase($key, static::getDefaultLanguage()?->code);
            if ($defaultTranslation) {
                return static::replaceParameters($defaultTranslation, $replace);
            }
        }

        // Return the key if no translation found
        return $key;
    }

    /**
     * Get translation from database
     */
    private static function getTranslationFromDatabase(string $key, string $locale): ?string
    {
        $parts = explode('.', $key);
        if (count($parts) < 2) {
            return null;
        }

        $group = $parts[0];
        $translationKey = implode('.', array_slice($parts, 1));

        $translation = Translation::where('language_code', $locale)
            ->where('group', $group)
            ->where('key', $translationKey)
            ->first();

        return $translation?->value;
    }

    /**
     * Replace parameters in translation
     */
    private static function replaceParameters(string $translation, array $replace): string
    {
        foreach ($replace as $key => $value) {
            $translation = str_replace(':' . $key, $value, $translation);
        }

        return $translation;
    }

    /**
     * Get all translations for a specific group and language
     */
    public static function getTranslations(string $group, string $locale = null): array
    {
        $locale = $locale ?: App::getLocale();

        $cacheKey = "localization.translations.{$locale}.{$group}";

        return Cache::remember($cacheKey, 3600, function () use ($group, $locale) {
            $translations = Translation::where('language_code', $locale)
                ->where('group', $group)
                ->pluck('value', 'key')
                ->toArray();

            return static::buildNestedArray($translations);
        });
    }

    /**
     * Build nested array from dot notation keys
     */
    private static function buildNestedArray(array $translations): array
    {
        $result = [];

        foreach ($translations as $key => $value) {
            $keys = explode('.', $key);
            $current = &$result;

            foreach ($keys as $k) {
                if (!isset($current[$k])) {
                    $current[$k] = [];
                }
                $current = &$current[$k];
            }

            $current = $value;
        }

        return $result;
    }

    /**
     * Save translation
     */
    public static function saveTranslation(string $group, string $key, string $value, string $locale = null): bool
    {
        $locale = $locale ?: App::getLocale();

        try {
            Translation::updateOrCreate(
                [
                    'language_code' => $locale,
                    'group' => $group,
                    'key' => $key,
                ],
                [
                    'value' => $value,
                    'updated_by' => auth()->id(),
                ]
            );

            // Clear cache
            static::clearTranslationCache($group, $locale);

            return true;
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Clear translation cache
     */
    public static function clearTranslationCache(string $group = null, string $locale = null): void
    {
        if ($group && $locale) {
            Cache::forget("localization.translations.{$locale}.{$group}");
        } else {
            // Clear all translation caches
            $languages = Language::pluck('code');
            $groups = Translation::distinct('group')->pluck('group');

            foreach ($languages as $lang) {
                foreach ($groups as $grp) {
                    Cache::forget("localization.translations.{$lang}.{$grp}");
                }
            }
        }

        // Clear language caches
        Cache::forget('localization.available_languages');
        Cache::forget('localization.default_language');
    }

    /**
     * Get missing translations for a language
     */
    public static function getMissingTranslations(string $locale): array
    {
        $defaultLanguage = static::getDefaultLanguage();
        if (!$defaultLanguage || $defaultLanguage->code === $locale) {
            return [];
        }

        $defaultTranslations = Translation::where('language_code', $defaultLanguage->code)
            ->select('group', 'key')
            ->get()
            ->map(function ($item) {
                return $item->group . '.' . $item->key;
            })
            ->toArray();

        $currentTranslations = Translation::where('language_code', $locale)
            ->select('group', 'key')
            ->get()
            ->map(function ($item) {
                return $item->group . '.' . $item->key;
            })
            ->toArray();

        return array_diff($defaultTranslations, $currentTranslations);
    }

    /**
     * Get language statistics
     */
    public static function getLanguageStatistics(): array
    {
        $languages = Language::enabled()->get();
        $defaultLanguage = static::getDefaultLanguage();

        if (!$defaultLanguage) {
            return [];
        }

        $defaultTranslationCount = Translation::where('language_code', $defaultLanguage->code)->count();

        $statistics = [];

        foreach ($languages as $language) {
            $translationCount = Translation::where('language_code', $language->code)->count();
            $completionPercentage = $defaultTranslationCount > 0
                ? round(($translationCount / $defaultTranslationCount) * 100, 2)
                : 0;

            $statistics[] = [
                'language' => $language,
                'translation_count' => $translationCount,
                'completion_percentage' => $completionPercentage,
                'missing_count' => $defaultTranslationCount - $translationCount,
            ];
        }

        return $statistics;
    }

    /**
     * Format date according to current locale
     */
    public static function formatDate($date, string $format = null): string
    {
        if (!$date) {
            return '';
        }

        $format = $format ?: Config::get('localization.date_format', 'Y-m-d');

        if (is_string($date)) {
            $date = \Carbon\Carbon::parse($date);
        }

        return $date->format($format);
    }

    /**
     * Format currency according to current locale
     */
    public static function formatCurrency(float $amount, string $currency = null): string
    {
        $currency = $currency ?: Config::get('localization.currency', 'USD');
        $locale = App::getLocale();

        $formatter = new \NumberFormatter($locale, \NumberFormatter::CURRENCY);
        return $formatter->formatCurrency($amount, $currency);
    }

    /**
     * Get text direction for current locale
     */
    public static function getTextDirection(): string
    {
        return Config::get('localization.direction', 'ltr');
    }

    /**
     * Check if current locale is RTL
     */
    public static function isRtl(): bool
    {
        return static::getTextDirection() === 'rtl';
    }

    /**
     * Export translations to array
     */
    public static function exportTranslations(string $locale, string $group = null): array
    {
        $query = Translation::where('language_code', $locale);

        if ($group) {
            $query->where('group', $group);
        }

        $translations = $query->get();

        $result = [];

        foreach ($translations as $translation) {
            if (!isset($result[$translation->group])) {
                $result[$translation->group] = [];
            }

            $result[$translation->group][$translation->key] = $translation->value;
        }

        return $result;
    }

    /**
     * Import translations from array
     */
    public static function importTranslations(string $locale, array $translations): bool
    {
        try {
            foreach ($translations as $group => $groupTranslations) {
                foreach ($groupTranslations as $key => $value) {
                    static::saveTranslation($group, $key, $value, $locale);
                }
            }

            return true;
        } catch (\Exception $e) {
            return false;
        }
    }
}
