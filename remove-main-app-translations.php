<?php

/**
 * Script to remove main app language files after ensuring they're migrated to modules
 * This script will:
 * 1. Check if all main app translations have been migrated to modules
 * 2. If yes, remove the main app language files
 * 3. If no, warn the user
 */

// Define the source directory
$mainLangDir = __DIR__ . '/resources/lang';
$modulesLangDir = __DIR__ . '/public/locales';

// Check if the main lang directory exists
if (!is_dir($mainLangDir)) {
    echo "Main app language directory not found at {$mainLangDir}. Nothing to do.\n";
    exit(0);
}

// Get all languages in the main app
$languages = array_filter(scandir($mainLangDir), function($item) use ($mainLangDir) {
    return is_dir($mainLangDir . '/' . $item) && $item !== '.' && $item !== '..';
});

echo "Found " . count($languages) . " languages in main app: " . implode(', ', $languages) . "\n\n";

// Check if all translations have been migrated to modules
$allMigrated = true;
$missingTranslations = [];

foreach ($languages as $lang) {
    $langDir = $mainLangDir . '/' . $lang;
    $files = array_filter(scandir($langDir), function($item) {
        return pathinfo($item, PATHINFO_EXTENSION) === 'php';
    });
    
    foreach ($files as $file) {
        $group = pathinfo($file, PATHINFO_FILENAME);
        $found = false;
        
        // Check if this translation exists in any module
        $modulesDirs = array_filter(scandir($modulesLangDir), function($item) use ($modulesLangDir) {
            return is_dir($modulesLangDir . '/' . $item) && $item !== '.' && $item !== '..';
        });
        
        foreach ($modulesDirs as $module) {
            $moduleLangFile = $modulesLangDir . '/' . $module . '/' . $lang . '/' . $group . '.json';
            
            if (file_exists($moduleLangFile)) {
                $found = true;
                break;
            }
        }
        
        if (!$found) {
            $allMigrated = false;
            $missingTranslations[] = "{$lang}/{$file}";
        }
    }
}

// If not all translations have been migrated, warn the user
if (!$allMigrated) {
    echo "WARNING: Not all translations have been migrated to modules.\n";
    echo "The following translations are missing in modules:\n";
    
    foreach ($missingTranslations as $missing) {
        echo "- {$missing}\n";
    }
    
    echo "\nPlease run the migration script first to ensure all translations are migrated.\n";
    echo "php migrate-translations.php\n";
    exit(1);
}

// Create a backup of the main app translations
echo "Creating backup of main app translations...\n";
$backupDir = __DIR__ . '/storage/app/translation-backup-' . date('Y-m-d-His');
if (!is_dir($backupDir)) {
    mkdir($backupDir, 0755, true);
}

// Copy the main app translations to the backup directory
$command = PHP_OS === 'WINNT' 
    ? "xcopy /E /I /Y \"{$mainLangDir}\" \"{$backupDir}\""
    : "cp -r \"{$mainLangDir}\" \"{$backupDir}\"";

exec($command, $output, $returnVar);

if ($returnVar === 0) {
    echo "Backup created at: {$backupDir}\n";
} else {
    echo "Failed to create backup. Error code: {$returnVar}\n";
    echo implode("\n", $output) . "\n";
    exit(1);
}

// Remove the main app language files
echo "Removing main app language files...\n";
$command = PHP_OS === 'WINNT' 
    ? "rmdir /S /Q \"{$mainLangDir}\""
    : "rm -rf \"{$mainLangDir}\"";

exec($command, $output, $returnVar);

if ($returnVar === 0) {
    echo "Main app language files removed successfully.\n";
} else {
    echo "Failed to remove main app language files. Error code: {$returnVar}\n";
    echo implode("\n", $output) . "\n";
    exit(1);
}

echo "\nAll translations have been migrated to modules and main app language files have been removed.\n";
echo "Remember to update any code that still uses the old translation system.\n";
echo "For PHP files, use: __('ModuleName::file.key') or trans('ModuleName::file.key')\n";
echo "For JS files, use: t('namespace:key') with proper namespaces\n"; 