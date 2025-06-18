<?php

namespace Modules\Localization\Services;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Modules\Localization\Models\Language;
use Spatie\Translatable\HasTranslations;

class SpatieTranslatableService
{
    /**
     * Get all translatable models in the application
     *
     * @return array
     */
    public function getTranslatableModels(): array
    {
        return [
            'Modules\\Core\\Domain\\Models\\Category',
            'Modules\\EmployeeManagement\\Domain\\Models\\Department',
            'Modules\\EmployeeManagement\\Domain\\Models\\Position',
            'Modules\\EquipmentManagement\\Domain\\Models\\Equipment',
        ];
    }

    /**
     * Get translation statistics for all translatable models
     *
     * @return array
     */
    public function getTranslationStatistics(): array
    {
        $statistics = [];
        $languages = Language::where('enabled', true)->get();

        foreach ($this->getTranslatableModels() as $modelClass) {
            if (!class_exists($modelClass)) {
                continue;
            }

            $model = new $modelClass;
            if (!in_array(HasTranslations::class, class_uses_recursive($model))) {
                continue;
            }

            $modelName = class_basename($modelClass);
            $statistics[$modelName] = [
                'total_records' => $model->count(),
                'translatable_fields' => $model->getTranslatableAttributes(),
                'languages' => []
            ];

            foreach ($languages as $language) {
                $translated = 0;
                $total = 0;

                foreach ($model->getTranslatableAttributes() as $attribute) {
                    $records = $model->whereNotNull($attribute)->get();
                    foreach ($records as $record) {
                        $total++;
                        if ($record->hasTranslation($attribute, $language->code)) {
                            $translated++;
                        }
                    }
                }

                $statistics[$modelName]['languages'][$language->code] = [
                    'translated' => $translated,
                    'total' => $total,
                    'percentage' => $total > 0 ? round(($translated / $total) * 100, 2) : 0
                ];
            }
        }

        return $statistics;
    }

    /**
     * Get missing translations for a specific model and language
     *
     * @param string $modelClass
     * @param string $languageCode
     * @return Collection
     */
    public function getMissingTranslations(string $modelClass, string $languageCode): Collection
    {
        if (!class_exists($modelClass)) {
            return collect();
        }

        $model = new $modelClass;
        if (!in_array(HasTranslations::class, class_uses_recursive($model))) {
            return collect();
        }

        $missing = collect();
        $records = $model->all();

        foreach ($records as $record) {
            foreach ($record->getTranslatableAttributes() as $attribute) {
                if (!$record->hasTranslation($attribute, $languageCode)) {
                    $missing->push([
                        'model' => class_basename($modelClass),
                        'id' => $record->id,
                        'attribute' => $attribute,
                        'language' => $languageCode,
                        'fallback_value' => $record->getTranslation($attribute, app()->getLocale())
                    ]);
                }
            }
        }

        return $missing;
    }

    /**
     * Copy translations from one language to another for a specific model
     *
     * @param string $modelClass
     * @param string $fromLanguage
     * @param string $toLanguage
     * @param bool $overwrite
     * @return int Number of translations copied
     */
    public function copyTranslations(string $modelClass, string $fromLanguage, string $toLanguage, bool $overwrite = false): int
    {
        if (!class_exists($modelClass)) {
            return 0;
        }

        $model = new $modelClass;
        if (!in_array(HasTranslations::class, class_uses_recursive($model))) {
            return 0;
        }

        $copied = 0;
        $records = $model->all();

        foreach ($records as $record) {
            foreach ($record->getTranslatableAttributes() as $attribute) {
                if ($record->hasTranslation($attribute, $fromLanguage)) {
                    if (!$record->hasTranslation($attribute, $toLanguage) || $overwrite) {
                        $value = $record->getTranslation($attribute, $fromLanguage);
                        $record->setTranslation($attribute, $toLanguage, $value);
                        $copied++;
                    }
                }
            }
            $record->save();
        }

        return $copied;
    }

    /**
     * Export translations for a specific model to array
     *
     * @param string $modelClass
     * @param string|null $languageCode
     * @return array
     */
    public function exportModelTranslations(string $modelClass, string $languageCode = null): array
    {
        if (!class_exists($modelClass)) {
            return [];
        }

        $model = new $modelClass;
        if (!in_array(HasTranslations::class, class_uses_recursive($model))) {
            return [];
        }

        $export = [];
        $records = $model->all();
        $languages = $languageCode ? [$languageCode] : Language::where('enabled', true)->pluck('code')->toArray();

        foreach ($records as $record) {
            $recordData = [
                'id' => $record->id,
                'translations' => []
            ];

            foreach ($languages as $lang) {
                foreach ($record->getTranslatableAttributes() as $attribute) {
                    if ($record->hasTranslation($attribute, $lang)) {
                        $recordData['translations'][$lang][$attribute] = $record->getTranslation($attribute, $lang);
                    }
                }
            }

            $export[] = $recordData;
        }

        return $export;
    }

    /**
     * Import translations for a specific model from array
     *
     * @param string $modelClass
     * @param array $translations
     * @param bool $overwrite
     * @return int Number of translations imported
     */
    public function importModelTranslations(string $modelClass, array $translations, bool $overwrite = false): int
    {
        if (!class_exists($modelClass)) {
            return 0;
        }

        $model = new $modelClass;
        if (!in_array(HasTranslations::class, class_uses_recursive($model))) {
            return 0;
        }

        $imported = 0;

        foreach ($translations as $translationData) {
            if (!isset($translationData['id']) || !isset($translationData['translations'])) {
                continue;
            }

            $record = $model->find($translationData['id']);
            if (!$record) {
                continue;
            }

            foreach ($translationData['translations'] as $language => $attributes) {
                foreach ($attributes as $attribute => $value) {
                    if (in_array($attribute, $record->getTranslatableAttributes())) {
                        if (!$record->hasTranslation($attribute, $language) || $overwrite) {
                            $record->setTranslation($attribute, $language, $value);
                            $imported++;
                        }
                    }
                }
            }

            $record->save();
        }

        return $imported;
    }

    /**
     * Clean up empty translations for all models
     *
     * @return int Number of cleaned translations
     */
    public function cleanupEmptyTranslations(): int
    {
        $cleaned = 0;

        foreach ($this->getTranslatableModels() as $modelClass) {
            if (!class_exists($modelClass)) {
                continue;
            }

            $model = new $modelClass;
            if (!in_array(HasTranslations::class, class_uses_recursive($model))) {
                continue;
            }

            $records = $model->all();

            foreach ($records as $record) {
                foreach ($record->getTranslatableAttributes() as $attribute) {
                    $translations = $record->getTranslations($attribute);
                    $hasChanges = false;

                    foreach ($translations as $language => $value) {
                        if (empty(trim($value))) {
                            unset($translations[$language]);
                            $hasChanges = true;
                            $cleaned++;
                        }
                    }

                    if ($hasChanges) {
                        $record->setTranslations($attribute, $translations);
                    }
                }

                if ($hasChanges) {
                    $record->save();
                }
            }
        }

        return $cleaned;
    }

    /**
     * Get all available locales from enabled languages
     *
     * @return array
     */
    public function getAvailableLocales(): array
    {
        return Language::where('enabled', true)
            ->orderBy('sort_order')
            ->pluck('code')
            ->toArray();
    }

    /**
     * Set the fallback locale for translations
     *
     * @param string $locale
     * @return void
     */
    public function setFallbackLocale(string $locale): void
    {
        config(['translatable.fallback_locale' => $locale]);
    }

    /**
     * Get translation completion percentage for a specific model and language
     *
     * @param string $modelClass
     * @param string $languageCode
     * @return float
     */
    public function getModelTranslationCompletion(string $modelClass, string $languageCode): float
    {
        if (!class_exists($modelClass)) {
            return 0;
        }

        $model = new $modelClass;
        if (!in_array(HasTranslations::class, class_uses_recursive($model))) {
            return 0;
        }

        $total = 0;
        $translated = 0;
        $records = $model->all();

        foreach ($records as $record) {
            foreach ($record->getTranslatableAttributes() as $attribute) {
                if ($record->getTranslation($attribute, app()->getLocale())) {
                    $total++;
                    if ($record->hasTranslation($attribute, $languageCode)) {
                        $translated++;
                    }
                }
            }
        }

        return $total > 0 ? round(($translated / $total) * 100, 2) : 0;
    }
}
