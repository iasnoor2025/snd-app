<?php

/**
 * Master script to fix module translations
 * 
 * This script will:
 * 1. Migrate translations from main app to modules
 * 2. Check for code using the old translation system
 * 3. Check for translation issues
 * 4. Create a backup of the main app translations
 */

// Start timer
$startTime = microtime(true);

echo "=== Module Translation Migration Tool ===\n";
echo "This tool will migrate all translations to the module-based system.\n\n";

// Step 1: Migrate translations from main app to modules
echo "Step 1: Migrating translations from main app to modules...\n";
require_once __DIR__ . '/migrate-translations.php';

// Step 2: Check for any code still using the old translation system
echo "\nStep 2: Checking for code using the old translation system...\n";
require_once __DIR__ . '/check-translation-usage.php';

// Step 3: Check for translation issues
echo "\nStep 3: Checking for translation issues...\n";
require_once __DIR__ . '/check-translation-issues.php';

// Step 4: Create a backup of the main app translations
echo "\nStep 4: Creating a backup of the main app translations...\n";
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

// Calculate execution time
$executionTime = microtime(true) - $startTime;

echo "\n=== Migration Complete ===\n";
echo "Execution time: " . round($executionTime, 2) . " seconds\n";
echo "Please review the output and make any necessary adjustments.\n";
echo "For more information, see the documentation at docs/module-translations.md\n"; 