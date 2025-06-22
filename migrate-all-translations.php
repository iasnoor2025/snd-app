<?php

/**
 * Master script to migrate all translations to module-based system
 */

// Step 1: Migrate translations from main app to modules
echo "Step 1: Migrating translations from main app to modules...\n";
require_once __DIR__ . '/migrate-translations.php';

// Step 2: Check for any code still using the old translation system
echo "\nStep 2: Checking for code using the old translation system...\n";
require_once __DIR__ . '/check-translation-usage.php';

// Step 3: Create a backup of the main app translations
echo "\nStep 3: Creating a backup of the main app translations...\n";
$backupDir = __DIR__ . '/storage/app/translation-backup-' . date('Y-m-d-His');
if (!is_dir($backupDir)) {
    mkdir($backupDir, 0755, true);
}

// Copy the main app translations to the backup directory
if (is_dir(__DIR__ . '/resources/lang')) {
    $command = PHP_OS === 'WINNT' 
        ? "xcopy /E /I /Y \"" . __DIR__ . "/resources/lang\" \"" . $backupDir . "\""
        : "cp -r \"" . __DIR__ . "/resources/lang\" \"" . $backupDir . "\"";
    
    exec($command, $output, $returnVar);
    
    if ($returnVar === 0) {
        echo "  Backup created at: {$backupDir}\n";
    } else {
        echo "  Failed to create backup. Error code: {$returnVar}\n";
        echo "  " . implode("\n  ", $output) . "\n";
    }
} else {
    echo "  No translations directory found at resources/lang\n";
}

// Step 4: Update the config to use the module-based translations
echo "\nStep 4: Updating the config to use module-based translations...\n";

// Update the app.php config file
$appConfigFile = __DIR__ . '/config/app.php';
if (file_exists($appConfigFile)) {
    $appConfig = file_get_contents($appConfigFile);
    
    // Update the locale configuration
    $appConfig = preg_replace(
        "/'locale' => '([a-z]{2})'/",
        "'locale' => env('APP_LOCALE', '$1')",
        $appConfig
    );
    
    // Update the fallback locale configuration
    $appConfig = preg_replace(
        "/'fallback_locale' => '([a-z]{2})'/",
        "'fallback_locale' => env('APP_FALLBACK_LOCALE', '$1')",
        $appConfig
    );
    
    file_put_contents($appConfigFile, $appConfig);
    echo "  Updated config/app.php\n";
} else {
    echo "  Could not find config/app.php\n";
}

echo "\nMigration complete!\n";
echo "Please review the changes and make any necessary adjustments.\n";
echo "Remember to update any code that still uses the old translation system.\n"; 