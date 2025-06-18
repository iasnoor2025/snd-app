<?php

namespace Modules\Localization\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;

class Language extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'code',
        'name',
        'native_name',
        'direction',
        'enabled',
        'is_default',
        'completion_percentage',
        'flag_icon',
        'sort_order'
    ];

    protected $casts = [
        'enabled' => 'boolean',
        'is_default' => 'boolean',
        'completion_percentage' => 'integer',
        'sort_order' => 'integer'
    ];

    protected $dates = [
        'created_at',
        'updated_at',
        'deleted_at'
    ];

    /**
     * Boot the model
     */
    protected static function boot()
    {
        parent::boot();

        // Clear cache when language is updated
        static::saved(function ($language) {
            Cache::forget('localization.languages');
            Cache::forget('localization.enabled_languages');
            Cache::forget('localization.default_language');
        });

        static::deleted(function ($language) {
            Cache::forget('localization.languages');
            Cache::forget('localization.enabled_languages');
            Cache::forget('localization.default_language');
        });
    }

    /**
     * Scope for enabled languages
     */
    public function scopeEnabled($query)
    {
        return $query->where('enabled', true);
    }

    /**
     * Scope for default language
     */
    public function scopeDefault($query)
    {
        return $query->where('is_default', true);
    }

    /**
     * Scope for ordered languages
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('name');
    }

    /**
     * Get all enabled languages (cached)
     */
    public static function getEnabled()
    {
        return Cache::remember('localization.enabled_languages', 3600, function () {
            return static::enabled()->ordered()->get();
        });
    }

    /**
     * Get default language (cached)
     */
    public static function getDefault()
    {
        return Cache::remember('localization.default_language', 3600, function () {
            return static::default()->first();
        });
    }

    /**
     * Get all languages as array (cached)
     */
    public static function getAllAsArray()
    {
        return Cache::remember('localization.languages', 3600, function () {
            return static::ordered()->get()->keyBy('code')->toArray();
        });
    }

    /**
     * Set as default language
     */
    public function setAsDefault()
    {
        // Remove default from other languages
        static::where('is_default', true)->update(['is_default' => false]);

        // Set this language as default
        $this->update(['is_default' => true, 'enabled' => true]);

        return $this;
    }

    /**
     * Get translation file path
     */
    public function getTranslationPath($filename = null)
    {
        $basePath = resource_path("lang/{$this->code}");

        if ($filename) {
            return $basePath . '/' . $filename . '.php';
        }

        return $basePath;
    }

    /**
     * Check if translation file exists
     */
    public function hasTranslationFile($filename)
    {
        return File::exists($this->getTranslationPath($filename));
    }

    /**
     * Get all translation files for this language
     */
    public function getTranslationFiles()
    {
        $path = $this->getTranslationPath();

        if (!File::exists($path)) {
            return [];
        }

        $files = File::files($path);
        $translationFiles = [];

        foreach ($files as $file) {
            $filename = pathinfo($file->getFilename(), PATHINFO_FILENAME);
            $translationFiles[$filename] = $file->getPathname();
        }

        return $translationFiles;
    }

    /**
     * Load translations for a specific file
     */
    public function loadTranslations($filename)
    {
        $filePath = $this->getTranslationPath($filename);

        if (!File::exists($filePath)) {
            return [];
        }

        return include $filePath;
    }

    /**
     * Save translations to file
     */
    public function saveTranslations($filename, array $translations)
    {
        $filePath = $this->getTranslationPath($filename);
        $directory = dirname($filePath);

        // Create directory if it doesn't exist
        if (!File::exists($directory)) {
            File::makeDirectory($directory, 0755, true);
        }

        // Format the array as PHP code
        $content = "<?php\n\nreturn " . var_export($translations, true) . ";\n";

        // Write to file
        File::put($filePath, $content);

        // Update completion percentage
        $this->updateCompletionPercentage();

        return true;
    }

    /**
     * Calculate and update completion percentage
     */
    public function updateCompletionPercentage()
    {
        $defaultLanguage = static::getDefault();

        if (!$defaultLanguage || $this->code === $defaultLanguage->code) {
            $this->update(['completion_percentage' => 100]);
            return;
        }

        $defaultTranslations = $this->getAllTranslationsFlat($defaultLanguage->code);
        $currentTranslations = $this->getAllTranslationsFlat($this->code);

        $totalKeys = count($defaultTranslations);
        $translatedKeys = 0;

        foreach ($defaultTranslations as $key => $value) {
            if (isset($currentTranslations[$key]) && !empty($currentTranslations[$key])) {
                $translatedKeys++;
            }
        }

        $percentage = $totalKeys > 0 ? round(($translatedKeys / $totalKeys) * 100) : 0;

        $this->update(['completion_percentage' => $percentage]);
    }

    /**
     * Get all translations as flat array
     */
    private function getAllTranslationsFlat($languageCode)
    {
        $language = static::where('code', $languageCode)->first();

        if (!$language) {
            return [];
        }

        $allTranslations = [];
        $translationFiles = $language->getTranslationFiles();

        foreach ($translationFiles as $filename => $filePath) {
            $translations = $language->loadTranslations($filename);
            $flattened = $this->flattenArray($translations, $filename);
            $allTranslations = array_merge($allTranslations, $flattened);
        }

        return $allTranslations;
    }

    /**
     * Flatten nested array with dot notation
     */
    private function flattenArray(array $array, $prefix = '')
    {
        $result = [];

        foreach ($array as $key => $value) {
            $newKey = $prefix ? $prefix . '.' . $key : $key;

            if (is_array($value)) {
                $result = array_merge($result, $this->flattenArray($value, $newKey));
            } else {
                $result[$newKey] = $value;
            }
        }

        return $result;
    }

    /**
     * Export translations to JSON
     */
    public function exportToJson($filename = null)
    {
        if ($filename) {
            $translations = $this->loadTranslations($filename);
            return json_encode([$filename => $translations], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        }

        $allTranslations = [];
        $translationFiles = $this->getTranslationFiles();

        foreach ($translationFiles as $filename => $filePath) {
            $allTranslations[$filename] = $this->loadTranslations($filename);
        }

        return json_encode($allTranslations, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    }

    /**
     * Import translations from JSON
     */
    public function importFromJson($jsonData)
    {
        $data = json_decode($jsonData, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new \InvalidArgumentException('Invalid JSON data');
        }

        foreach ($data as $filename => $translations) {
            if (is_array($translations)) {
                $this->saveTranslations($filename, $translations);
            }
        }

        return true;
    }

    /**
     * Get missing translations compared to default language
     */
    public function getMissingTranslations()
    {
        $defaultLanguage = static::getDefault();

        if (!$defaultLanguage || $this->code === $defaultLanguage->code) {
            return [];
        }

        $defaultTranslations = $this->getAllTranslationsFlat($defaultLanguage->code);
        $currentTranslations = $this->getAllTranslationsFlat($this->code);

        $missing = [];

        foreach ($defaultTranslations as $key => $value) {
            if (!isset($currentTranslations[$key]) || empty($currentTranslations[$key])) {
                $missing[$key] = $value;
            }
        }

        return $missing;
    }

    /**
     * Create translation directories
     */
    public function createTranslationDirectories()
    {
        $path = $this->getTranslationPath();

        if (!File::exists($path)) {
            File::makeDirectory($path, 0755, true);
        }

        return $this;
    }

    /**
     * Delete translation files
     */
    public function deleteTranslationFiles()
    {
        $path = $this->getTranslationPath();

        if (File::exists($path)) {
            File::deleteDirectory($path);
        }

        return $this;
    }

    /**
     * Get language statistics
     */
    public function getStatistics()
    {
        $translationFiles = $this->getTranslationFiles();
        $totalKeys = 0;
        $translatedKeys = 0;
        $emptyKeys = 0;

        foreach ($translationFiles as $filename => $filePath) {
            $translations = $this->loadTranslations($filename);
            $flattened = $this->flattenArray($translations);

            foreach ($flattened as $key => $value) {
                $totalKeys++;

                if (!empty($value)) {
                    $translatedKeys++;
                } else {
                    $emptyKeys++;
                }
            }
        }

        return [
            'total_files' => count($translationFiles),
            'total_keys' => $totalKeys,
            'translated_keys' => $translatedKeys,
            'empty_keys' => $emptyKeys,
            'completion_percentage' => $this->completion_percentage,
            'last_updated' => $this->updated_at
        ];
    }
}
