<?php

namespace Modules\Localization\Services;

use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Modules\Localization\Models\Language;
use Modules\Localization\Models\Translation;
use Modules\Localization\Helpers\LocalizationHelper;

class TranslationService
{
    /**
     * Scan and import translations from files
     */
    public function scanAndImportTranslations(string $languageCode): array
    {
        $language = Language::where('code', $languageCode)->first();

        if (!$language) {
            throw new \Exception("Language {$languageCode} not found");
        }

        $translationPath = resource_path("lang/{$languageCode}");

        if (!File::exists($translationPath)) {
            return ['imported' => 0, 'updated' => 0, 'errors' => []];
        }

        $imported = 0;
        $updated = 0;
        $errors = [];

        $files = File::files($translationPath);

        foreach ($files as $file) {
            try {
                $group = pathinfo($file->getFilename(), PATHINFO_FILENAME);
                $translations = include $file->getPathname();

                if (!is_array($translations)) {
                    $errors[] = "Invalid translation file: {$file->getFilename()}";
                    continue;
                }

                $result = $this->importTranslationGroup($languageCode, $group, $translations);
                $imported += $result['imported'];
                $updated += $result['updated'];

            } catch (\Exception $e) {
                $errors[] = "Error processing {$file->getFilename()}: {$e->getMessage()}";
            }
        }

        // Update language completion percentage
        $this->updateLanguageCompletion($language);

        return [
            'imported' => $imported,
            'updated' => $updated,
            'errors' => $errors
        ];
    }

    /**
     * Import translation group
     */
    private function importTranslationGroup(string $languageCode, string $group, array $translations, string $prefix = ''): array
    {
        $imported = 0;
        $updated = 0;

        foreach ($translations as $key => $value) {
            $fullKey = $prefix ? "{$prefix}.{$key}" : $key;

            if (is_array($value)) {
                $result = $this->importTranslationGroup($languageCode, $group, $value, $fullKey);
                $imported += $result['imported'];
                $updated += $result['updated'];
            } else {
                $translation = Translation::where('language_code', $languageCode)
                    ->where('group', $group)
                    ->where('key', $fullKey)
                    ->first();

                if ($translation) {
                    if ($translation->value !== $value) {
                        $translation->update([
                            'value' => $value,
                            'updated_by' => auth()->id(),
                        ]);
                        $updated++;
                    }
                } else {
                    Translation::create([
                        'language_code' => $languageCode,
                        'group' => $group,
                        'key' => $fullKey,
                        'value' => $value,
                        'created_by' => auth()->id(),
                        'updated_by' => auth()->id(),
                    ]);
                    $imported++;
                }
            }
        }

        return ['imported' => $imported, 'updated' => $updated];
    }

    /**
     * Export translations to files
     */
    public function exportTranslationsToFiles(string $languageCode): bool
    {
        $language = Language::where('code', $languageCode)->first();

        if (!$language) {
            throw new \Exception("Language {$languageCode} not found");
        }

        $translationPath = resource_path("lang/{$languageCode}");

        if (!File::exists($translationPath)) {
            File::makeDirectory($translationPath, 0755, true);
        }

        $groups = Translation::where('language_code', $languageCode)
            ->distinct('group')
            ->pluck('group');

        foreach ($groups as $group) {
            $translations = Translation::where('language_code', $languageCode)
                ->where('group', $group)
                ->get();

            $translationArray = [];

            foreach ($translations as $translation) {
                $this->setNestedValue($translationArray, $translation->key, $translation->value);
            }

            $content = "<?php\n\nreturn " . var_export($translationArray, true) . ";\n";

            File::put("{$translationPath}/{$group}.php", $content);
        }

        return true;
    }

    /**
     * Set nested array value using dot notation
     */
    private function setNestedValue(array &$array, string $key, $value): void
    {
        $keys = explode('.', $key);
        $current = &$array;

        foreach ($keys as $k) {
            if (!isset($current[$k])) {
                $current[$k] = [];
            }
            $current = &$current[$k];
        }

        $current = $value;
    }

    /**
     * Copy translations from one language to another
     */
    public function copyTranslations(string $fromLanguage, string $toLanguage, bool $overwrite = false): array
    {
        $sourceLanguage = Language::where('code', $fromLanguage)->first();
        $targetLanguage = Language::where('code', $toLanguage)->first();

        if (!$sourceLanguage || !$targetLanguage) {
            throw new \Exception('Source or target language not found');
        }

        $sourceTranslations = Translation::where('language_code', $fromLanguage)->get();

        $copied = 0;
        $skipped = 0;

        foreach ($sourceTranslations as $sourceTranslation) {
            $existingTranslation = Translation::where('language_code', $toLanguage)
                ->where('group', $sourceTranslation->group)
                ->where('key', $sourceTranslation->key)
                ->first();

            if ($existingTranslation && !$overwrite) {
                $skipped++;
                continue;
            }

            Translation::updateOrCreate(
                [
                    'language_code' => $toLanguage,
                    'group' => $sourceTranslation->group,
                    'key' => $sourceTranslation->key,
                ],
                [
                    'value' => $sourceTranslation->value,
                    'created_by' => auth()->id(),
                    'updated_by' => auth()->id(),
                ]
            );

            $copied++;
        }

        // Update target language completion percentage
        $this->updateLanguageCompletion($targetLanguage);

        return [
            'copied' => $copied,
            'skipped' => $skipped
        ];
    }

    /**
     * Find and mark missing translations
     */
    public function findMissingTranslations(string $languageCode): array
    {
        $defaultLanguage = LocalizationHelper::getDefaultLanguage();

        if (!$defaultLanguage || $defaultLanguage->code === $languageCode) {
            return [];
        }

        $defaultTranslations = Translation::where('language_code', $defaultLanguage->code)
            ->select('group', 'key', 'value')
            ->get();

        $existingTranslations = Translation::where('language_code', $languageCode)
            ->select('group', 'key')
            ->get()
            ->map(function ($item) {
                return $item->group . '.' . $item->key;
            })
            ->toArray();

        $missing = [];

        foreach ($defaultTranslations as $defaultTranslation) {
            $key = $defaultTranslation->group . '.' . $defaultTranslation->key;

            if (!in_array($key, $existingTranslations)) {
                $missing[] = [
                    'group' => $defaultTranslation->group,
                    'key' => $defaultTranslation->key,
                    'default_value' => $defaultTranslation->value,
                ];
            }
        }

        return $missing;
    }

    /**
     * Auto-translate missing translations using a translation service
     */
    public function autoTranslateMissing(string $languageCode, array $missingTranslations): array
    {
        // This is a placeholder for integration with translation services
        // like Google Translate, DeepL, etc.

        $translated = 0;
        $errors = [];

        foreach ($missingTranslations as $missing) {
            try {
                // For now, we'll just copy the default value
                // In a real implementation, you would call a translation API here
                $translatedValue = $this->translateText($missing['default_value'], $languageCode);

                Translation::create([
                    'language_code' => $languageCode,
                    'group' => $missing['group'],
                    'key' => $missing['key'],
                    'value' => $translatedValue,
                    'created_by' => auth()->id(),
                    'updated_by' => auth()->id(),
                ]);

                $translated++;

            } catch (\Exception $e) {
                $errors[] = "Error translating {$missing['group']}.{$missing['key']}: {$e->getMessage()}";
            }
        }

        return [
            'translated' => $translated,
            'errors' => $errors
        ];
    }

    /**
     * Placeholder for translation API integration
     */
    private function translateText(string $text, string $targetLanguage): string
    {
        // This is where you would integrate with a translation service
        // For now, we'll just return the original text with a prefix
        return "[{$targetLanguage}] {$text}";
    }

    /**
     * Update language completion percentage
     */
    public function updateLanguageCompletion(Language $language): void
    {
        $defaultLanguage = LocalizationHelper::getDefaultLanguage();

        if (!$defaultLanguage) {
            return;
        }

        $defaultCount = Translation::where('language_code', $defaultLanguage->code)->count();
        $languageCount = Translation::where('language_code', $language->code)->count();

        $completionPercentage = $defaultCount > 0
            ? round(($languageCount / $defaultCount) * 100, 2)
            : 0;

        $language->update(['completion_percentage' => $completionPercentage]);
    }

    /**
     * Clean up unused translations
     */
    public function cleanupUnusedTranslations(): array
    {
        // This would scan the codebase for used translation keys
        // and remove unused ones from the database

        // For now, we'll just return a placeholder
        return [
            'removed' => 0,
            'kept' => Translation::count()
        ];
    }

    /**
     * Validate translation files
     */
    public function validateTranslationFiles(string $languageCode): array
    {
        $errors = [];
        $warnings = [];

        $translationPath = resource_path("lang/{$languageCode}");

        if (!File::exists($translationPath)) {
            $errors[] = "Translation directory does not exist: {$translationPath}";
            return ['errors' => $errors, 'warnings' => $warnings];
        }

        $files = File::files($translationPath);

        foreach ($files as $file) {
            try {
                $translations = include $file->getPathname();

                if (!is_array($translations)) {
                    $errors[] = "Invalid translation file: {$file->getFilename()} (not an array)";
                    continue;
                }

                $this->validateTranslationArray($translations, $file->getFilename(), $errors, $warnings);

            } catch (\Exception $e) {
                $errors[] = "Error loading {$file->getFilename()}: {$e->getMessage()}";
            }
        }

        return [
            'errors' => $errors,
            'warnings' => $warnings
        ];
    }

    /**
     * Validate translation array recursively
     */
    private function validateTranslationArray(array $translations, string $filename, array &$errors, array &$warnings, string $prefix = ''): void
    {
        foreach ($translations as $key => $value) {
            $fullKey = $prefix ? "{$prefix}.{$key}" : $key;

            if (is_array($value)) {
                $this->validateTranslationArray($value, $filename, $errors, $warnings, $fullKey);
            } else {
                if (!is_string($value)) {
                    $warnings[] = "Non-string value in {$filename} at key '{$fullKey}'";
                }

                if (empty(trim($value))) {
                    $warnings[] = "Empty translation in {$filename} at key '{$fullKey}'";
                }

                // Check for placeholder consistency
                if (preg_match_all('/:([a-zA-Z_]+)/', $value, $matches)) {
                    // This could be expanded to check placeholder consistency across languages
                }
            }
        }
    }

    /**
     * Get translation statistics
     */
    public function getTranslationStatistics(): array
    {
        $languages = Language::enabled()->get();
        $statistics = [];

        foreach ($languages as $language) {
            $totalTranslations = Translation::where('language_code', $language->code)->count();
            $groups = Translation::where('language_code', $language->code)
                ->distinct('group')
                ->count();

            $recentlyUpdated = Translation::where('language_code', $language->code)
                ->where('updated_at', '>=', now()->subDays(7))
                ->count();

            $statistics[$language->code] = [
                'language' => $language,
                'total_translations' => $totalTranslations,
                'groups' => $groups,
                'recently_updated' => $recentlyUpdated,
                'completion_percentage' => $language->completion_percentage,
            ];
        }

        return $statistics;
    }

    /**
     * Clear all translation caches
     */
    public function clearAllCaches(): void
    {
        LocalizationHelper::clearTranslationCache();

        // Clear additional caches if needed
        Cache::forget('localization.statistics');
    }
}
