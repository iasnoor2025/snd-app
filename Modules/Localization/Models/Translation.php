<?php

namespace Modules\Localization\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class Translation extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'language_code',
        'group',
        'key',
        'value',
        'is_dirty',
        'created_by',
        'updated_by'
    ];

    protected $casts = [
        'is_dirty' => 'boolean'
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

        // Clear cache when translation is updated
        static::saved(function ($translation) {
            Cache::forget("translations.{$translation->language_code}.{$translation->group}");
            Cache::forget("translations.{$translation->language_code}");
            Cache::forget('translations.all');
        });

        static::deleted(function ($translation) {
            Cache::forget("translations.{$translation->language_code}.{$translation->group}");
            Cache::forget("translations.{$translation->language_code}");
            Cache::forget('translations.all');
        });

        // Set created_by and updated_by automatically
        static::creating(function ($translation) {
            if (auth()->check()) {
                $translation->created_by = auth()->id();
                $translation->updated_by = auth()->id();
            }
        });

        static::updating(function ($translation) {
            if (auth()->check()) {
                $translation->updated_by = auth()->id();
            }
            $translation->is_dirty = true;
        });
    }

    /**
     * Relationship with Language model
     */
    public function language()
    {
        return $this->belongsTo(Language::class, 'language_code', 'code');
    }

    /**
     * Relationship with User model (created by)
     */
    public function creator()
    {
        return $this->belongsTo(\App\Models\User::class, 'created_by');
    }

    /**
     * Relationship with User model (updated by)
     */
    public function updater()
    {
        return $this->belongsTo(\App\Models\User::class, 'updated_by');
    }

    /**
     * Scope for specific language
     */
    public function scopeForLanguage($query, $languageCode)
    {
        return $query->where('language_code', $languageCode);
    }

    /**
     * Scope for specific group
     */
    public function scopeForGroup($query, $group)
    {
        return $query->where('group', $group);
    }

    /**
     * Scope for dirty translations
     */
    public function scopeDirty($query)
    {
        return $query->where('is_dirty', true);
    }

    /**
     * Scope for empty translations
     */
    public function scopeEmpty($query)
    {
        return $query->where(function ($q) {
            $q->whereNull('value')
              ->orWhere('value', '')
              ->orWhere('value', '[]')
              ->orWhere('value', '{}');
        });
    }

    /**
     * Scope for search
     */
    public function scopeSearch($query, $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('key', 'like', "%{$search}%")
              ->orWhere('value', 'like', "%{$search}%")
              ->orWhere('group', 'like', "%{$search}%");
        });
    }

    /**
     * Get translation by key
     */
    public static function getByKey($languageCode, $group, $key)
    {
        return static::forLanguage($languageCode)
                    ->forGroup($group)
                    ->where('key', $key)
                    ->first();
    }

    /**
     * Set translation value
     */
    public static function setTranslation($languageCode, $group, $key, $value)
    {
        return static::updateOrCreate(
            [
                'language_code' => $languageCode,
                'group' => $group,
                'key' => $key
            ],
            [
                'value' => $value,
                'is_dirty' => true
            ]
        );
    }

    /**
     * Get all translations for a language and group
     */
    public static function getForGroup($languageCode, $group)
    {
        $cacheKey = "translations.{$languageCode}.{$group}";

        return Cache::remember($cacheKey, 3600, function () use ($languageCode, $group) {
            return static::forLanguage($languageCode)
                        ->forGroup($group)
                        ->pluck('value', 'key')
                        ->toArray();
        });
    }

    /**
     * Get all translations for a language
     */
    public static function getForLanguage($languageCode)
    {
        $cacheKey = "translations.{$languageCode}";

        return Cache::remember($cacheKey, 3600, function () use ($languageCode) {
            $translations = static::forLanguage($languageCode)->get();
            $grouped = [];

            foreach ($translations as $translation) {
                $grouped[$translation->group][$translation->key] = $translation->value;
            }

            return $grouped;
        });
    }

    /**
     * Get all translations
     */
    public static function getAll()
    {
        return Cache::remember('translations.all', 3600, function () {
            $translations = static::all();
            $grouped = [];

            foreach ($translations as $translation) {
                $grouped[$translation->language_code][$translation->group][$translation->key] = $translation->value;
            }

            return $grouped;
        });
    }

    /**
     * Import translations from array
     */
    public static function importFromArray($languageCode, array $translations)
    {
        $imported = 0;
        $updated = 0;
        $errors = [];

        foreach ($translations as $group => $groupTranslations) {
            if (!is_array($groupTranslations)) {
                $errors[] = "Group '{$group}' is not an array";
                continue;
            }

            foreach ($groupTranslations as $key => $value) {
                try {
                    $translation = static::updateOrCreate(
                        [
                            'language_code' => $languageCode,
                            'group' => $group,
                            'key' => $key
                        ],
                        [
                            'value' => $value,
                            'is_dirty' => false
                        ]
                    );

                    if ($translation->wasRecentlyCreated) {
                        $imported++;
                    } else {
                        $updated++;
                    }
                } catch (\Exception $e) {
                    $errors[] = "Error importing {$group}.{$key}: " . $e->getMessage();
                }
            }
        }

        return [
            'imported' => $imported,
            'updated' => $updated,
            'errors' => $errors
        ];
    }

    /**
     * Export translations to array
     */
    public static function exportToArray($languageCode, $group = null)
    {
        $query = static::forLanguage($languageCode);

        if ($group) {
            $query->forGroup($group);
        }

        $translations = $query->get();
        $exported = [];

        foreach ($translations as $translation) {
            $exported[$translation->group][$translation->key] = $translation->value;
        }

        return $exported;
    }

    /**
     * Get missing translations for a language
     */
    public static function getMissingForLanguage($languageCode, $baseLanguageCode = null)
    {
        if (!$baseLanguageCode) {
            $defaultLanguage = Language::getDefault();
            $baseLanguageCode = $defaultLanguage ? $defaultLanguage->code : 'en';
        }

        $baseTranslations = static::forLanguage($baseLanguageCode)
                                 ->select('group', 'key', 'value')
                                 ->get()
                                 ->keyBy(function ($item) {
                                     return $item->group . '.' . $item->key;
                                 });

        $currentTranslations = static::forLanguage($languageCode)
                                    ->select('group', 'key', 'value')
                                    ->get()
                                    ->keyBy(function ($item) {
                                        return $item->group . '.' . $item->key;
                                    });

        $missing = [];

        foreach ($baseTranslations as $key => $translation) {
            if (!isset($currentTranslations[$key]) || empty($currentTranslations[$key]->value)) {
                $missing[] = [
                    'group' => $translation->group,
                    'key' => $translation->key,
                    'base_value' => $translation->value,
                    'current_value' => $currentTranslations[$key]->value ?? null
                ];
            }
        }

        return $missing;
    }

    /**
     * Get translation statistics
     */
    public static function getStatistics($languageCode = null)
    {
        $query = static::query();

        if ($languageCode) {
            $query->forLanguage($languageCode);
        }

        $total = $query->count();
        $empty = (clone $query)->empty()->count();
        $dirty = (clone $query)->dirty()->count();

        $groups = $query->distinct('group')->pluck('group')->count();

        return [
            'total' => $total,
            'translated' => $total - $empty,
            'empty' => $empty,
            'dirty' => $dirty,
            'groups' => $groups,
            'completion_percentage' => $total > 0 ? round((($total - $empty) / $total) * 100, 2) : 0
        ];
    }

    /**
     * Sync translations to files
     */
    public static function syncToFiles($languageCode = null)
    {
        $query = static::query();

        if ($languageCode) {
            $query->forLanguage($languageCode);
        }

        $translations = $query->get()->groupBy(['language_code', 'group']);
        $synced = 0;

        foreach ($translations as $langCode => $groups) {
            $language = Language::where('code', $langCode)->first();

            if (!$language) {
                continue;
            }

            foreach ($groups as $group => $groupTranslations) {
                $translationArray = [];

                foreach ($groupTranslations as $translation) {
                    $translationArray[$translation->key] = $translation->value;
                }

                $language->saveTranslations($group, $translationArray);
                $synced++;
            }
        }

        // Mark all as not dirty
        $query->update(['is_dirty' => false]);

        return $synced;
    }

    /**
     * Load translations from files
     */
    public static function loadFromFiles($languageCode = null)
    {
        $languages = $languageCode
            ? [Language::where('code', $languageCode)->first()]
            : Language::all();

        $loaded = 0;

        foreach ($languages as $language) {
            if (!$language) continue;

            $translationFiles = $language->getTranslationFiles();

            foreach ($translationFiles as $group => $filePath) {
                $translations = $language->loadTranslations($group);

                foreach ($translations as $key => $value) {
                    static::updateOrCreate(
                        [
                            'language_code' => $language->code,
                            'group' => $group,
                            'key' => $key
                        ],
                        [
                            'value' => $value,
                            'is_dirty' => false
                        ]
                    );

                    $loaded++;
                }
            }
        }

        return $loaded;
    }

    /**
     * Get full translation key (group.key)
     */
    public function getFullKeyAttribute()
    {
        return $this->group . '.' . $this->key;
    }

    /**
     * Check if translation is empty
     */
    public function getIsEmptyAttribute()
    {
        return empty($this->value) || $this->value === '[]' || $this->value === '{}';
    }

    /**
     * Get translation preview (truncated value)
     */
    public function getPreviewAttribute()
    {
        return Str::limit($this->value, 50);
    }

    /**
     * Search translations across all languages
     */
    public static function globalSearch($search, $languageCode = null, $group = null)
    {
        $query = static::query();

        if ($languageCode) {
            $query->forLanguage($languageCode);
        }

        if ($group) {
            $query->forGroup($group);
        }

        return $query->search($search)
                    ->with(['language', 'creator', 'updater'])
                    ->orderBy('group')
                    ->orderBy('key')
                    ->paginate(50);
    }

    /**
     * Bulk update translations
     */
    public static function bulkUpdate(array $updates)
    {
        $updated = 0;
        $errors = [];

        foreach ($updates as $update) {
            try {
                $translation = static::where('id', $update['id'])->first();

                if ($translation) {
                    $translation->update([
                        'value' => $update['value'],
                        'is_dirty' => true
                    ]);
                    $updated++;
                }
            } catch (\Exception $e) {
                $errors[] = "Error updating translation ID {$update['id']}: " . $e->getMessage();
            }
        }

        return [
            'updated' => $updated,
            'errors' => $errors
        ];
    }
}
