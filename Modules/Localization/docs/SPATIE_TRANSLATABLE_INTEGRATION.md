# Spatie Translatable Integration Guide

This document explains how the Spatie Translatable package has been integrated into the rental management system while preserving all existing functionality.

## Overview

The integration adds multi-language support to model attributes using the `spatie/laravel-translatable` package. This allows storing translations directly in model attributes as JSON, providing better performance and simpler queries compared to separate translation tables.

## Integrated Models

The following models now support translatable attributes:

### 1. Category (Core Module)
- **File**: `Modules/Core/Domain/Models/Category.php`
- **Translatable Fields**: `name`, `description`
- **Migration**: `2024_01_01_000003_add_translations_to_categories_table.php`

### 2. Department (EmployeeManagement Module)
- **File**: `Modules/EmployeeManagement/Domain/Models/Department.php`
- **Translatable Fields**: `name`, `description`
- **Migration**: `2024_01_01_000003_add_translations_to_departments_table.php`

### 3. Position (EmployeeManagement Module)
- **File**: `Modules/EmployeeManagement/Domain/Models/Position.php`
- **Translatable Fields**: `name`, `description`
- **Migration**: `2024_01_01_000004_add_translations_to_positions_table.php`

### 4. Equipment (EquipmentManagement Module)
- **File**: `Modules/EquipmentManagement/Domain/Models/Equipment.php`
- **Translatable Fields**: `name`, `description`
- **Migration**: `2024_01_01_000003_add_translations_to_equipment_table.php`

## Database Changes

Each model's table has been updated with JSON columns for storing translations:

```sql
-- Example for categories table
ALTER TABLE categories 
ADD COLUMN name_translations JSON NULL,
ADD COLUMN description_translations JSON NULL;
```

The JSON structure stores translations like:
```json
{
  "en": "English Name",
  "es": "Nombre en Español",
  "fr": "Nom en Français"
}
```

## Usage Examples

### Setting Translations

```php
// Set translation for current locale
$category = Category::find(1);
$category->setTranslation('name', 'en', 'Equipment Category');
$category->setTranslation('name', 'es', 'Categoría de Equipo');
$category->save();

// Or use mass assignment
$category->update([
    'name' => [
        'en' => 'Equipment Category',
        'es' => 'Categoría de Equipo',
        'fr' => 'Catégorie d\'Équipement'
    ]
]);
```

### Getting Translations

```php
// Get translation for current locale
$name = $category->name; // Returns translation for app()->getLocale()

// Get translation for specific locale
$spanishName = $category->getTranslation('name', 'es');

// Get all translations
$allTranslations = $category->getTranslations('name');
// Returns: ['en' => 'Equipment Category', 'es' => 'Categoría de Equipo']

// Check if translation exists
if ($category->hasTranslation('name', 'fr')) {
    $frenchName = $category->getTranslation('name', 'fr');
}
```

### Querying with Translations

```php
// Find records with specific translation
$categories = Category::whereJsonContains('name_translations->en', 'Equipment')->get();

// Order by translated field
$categories = Category::orderByRaw("JSON_UNQUOTE(JSON_EXTRACT(name_translations, '$." . app()->getLocale() . "'))");
```

## New Services and Controllers

### SpatieTranslatableService

**File**: `Modules/Localization/Services/SpatieTranslatableService.php`

Provides methods for:
- Getting translation statistics
- Finding missing translations
- Copying translations between languages
- Exporting/importing translations
- Cleaning up empty translations

**Key Methods**:
```php
// Get translation statistics for all models
$stats = $service->getTranslationStatistics();

// Find missing translations
$missing = $service->getMissingTranslations('Category', 'es');

// Copy translations
$service->copyTranslations('Category', 'en', 'es', $overwrite = false);

// Export translations
$translations = $service->exportTranslations('Category', 'en');
```

### ModelTranslationController

**File**: `Modules/Localization/Http/Controllers/ModelTranslationController.php`

Provides API endpoints for managing model translations:

- `GET /admin/localization/model-translations/statistics` - Get translation statistics
- `GET /admin/localization/model-translations/models` - Get available models
- `GET /admin/localization/model-translations/missing` - Get missing translations
- `POST /admin/localization/model-translations/copy` - Copy translations
- `GET /admin/localization/model-translations/export` - Export translations
- `POST /admin/localization/model-translations/cleanup` - Cleanup empty translations

## Frontend Component

### ModelTranslationManager

**File**: `Modules/Localization/resources/js/components/ModelTranslationManager.jsx`

A React component providing a user interface for:
- Viewing translation statistics
- Finding missing translations
- Copying translations between languages
- Exporting translations
- Cleaning up empty translations

## Migration Guide

### Running Migrations

1. Run the new migrations to add translation columns:
```bash
php artisan migrate
```

2. The existing data will remain intact in the original columns.

### Data Migration (Optional)

To migrate existing data to the new translation format:

```php
// Example migration script
use Modules\Core\Domain\Models\Category;

// Migrate existing category names to default locale
Category::chunk(100, function ($categories) {
    foreach ($categories as $category) {
        if ($category->name && !$category->getTranslations('name')) {
            $category->setTranslation('name', config('app.locale'), $category->getOriginal('name'));
            if ($category->description) {
                $category->setTranslation('description', config('app.locale'), $category->getOriginal('description'));
            }
            $category->save();
        }
    }
});
```

## Configuration

### Supported Locales

The system uses the existing language configuration from the Localization module. Available locales are determined by the `Language` model.

### Fallback Behavior

When a translation is not available:
1. Falls back to the application's default locale
2. If still not available, returns the original attribute value
3. If no value exists, returns null

## Best Practices

### 1. Always Set Default Locale
```php
// When creating new records, always set the default locale
$category = Category::create([
    'name' => [
        config('app.locale') => 'Default Name'
    ]
]);
```

### 2. Validate Translations
```php
// In form requests, validate required translations
public function rules()
{
    return [
        'name.' . config('app.locale') => 'required|string|max:255',
        'name.*' => 'nullable|string|max:255',
    ];
}
```

### 3. Use Service Methods
```php
// Use the service for bulk operations
$service = app(SpatieTranslatableService::class);
$service->copyTranslations('Category', 'en', 'es');
```

### 4. Index Translation Columns
```php
// For better query performance, consider adding indexes
$table->index(DB::raw('(JSON_UNQUOTE(JSON_EXTRACT(name_translations, "$.en")))');
```

## Backward Compatibility

The integration maintains full backward compatibility:

1. **Existing Code**: All existing code continues to work without changes
2. **Database**: Original columns remain untouched
3. **APIs**: Existing API responses remain the same
4. **Queries**: Existing queries continue to work

## Performance Considerations

1. **JSON Storage**: Translations are stored as JSON, which is efficient for read operations
2. **Indexing**: Consider adding functional indexes for frequently queried translations
3. **Caching**: The package supports Laravel's attribute casting and caching
4. **Memory**: JSON columns use less memory than separate translation tables

## Troubleshooting

### Common Issues

1. **Migration Errors**: Ensure all modules are properly loaded before running migrations
2. **Missing Translations**: Use the ModelTranslationManager to identify and fix missing translations
3. **Performance**: Add indexes for frequently queried translation fields

### Debug Commands

```bash
# Check translation statistics
php artisan tinker
>>> app(\Modules\Localization\Services\SpatieTranslatableService::class)->getTranslationStatistics()

# Find missing translations
>>> app(\Modules\Localization\Services\SpatieTranslatableService::class)->getMissingTranslations('Category', 'es')
```

## Future Enhancements

1. **Auto-Translation**: Integration with translation services (Google Translate, DeepL)
2. **Translation Memory**: Reuse translations across similar content
3. **Workflow**: Translation approval workflow for content managers
4. **Import/Export**: Enhanced import/export functionality with various formats
5. **Real-time Updates**: WebSocket-based real-time translation updates

## Support

For issues or questions regarding the Spatie Translatable integration:

1. Check the [Spatie Translatable documentation](https://github.com/spatie/laravel-translatable)
2. Review this integration guide
3. Use the ModelTranslationManager for diagnostics
4. Check the application logs for detailed error messages
