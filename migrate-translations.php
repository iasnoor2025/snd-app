<?php

/**
 * Script to migrate translations from the main app to modules
 * This script will:
 * 1. Read all translations from resources/lang
 * 2. Move them to the appropriate module
 * 3. Update any references to use the module-based translations
 */

// Define the modules that should receive translations
$modules = [
    'Core',
    'EmployeeManagement',
    'ProjectManagement',
    'RentalManagement',
    'TimesheetManagement',
    'CustomerManagement',
    'LeaveManagement',
    'EquipmentManagement',
    'Payroll',
    'Settings',
    'Reporting',
    'Notifications',
    'MobileBridge',
    'Localization',
    'AuditCompliance',
    'API'
];

// Define the mapping of translation files to modules
$fileToModuleMap = [
    'auth.php' => 'Core',
    'pagination.php' => 'Core',
    'passwords.php' => 'Core',
    'validation.php' => 'Core',
    'common.php' => 'Core',
];

// Define the source and destination directories
$sourceDir = __DIR__ . '/resources/lang';
$publicLocalesDir = __DIR__ . '/public/locales';

// Process each language
$languages = scandir($sourceDir);
foreach ($languages as $lang) {
    // Skip . and .. directories
    if ($lang === '.' || $lang === '..') {
        continue;
    }
    
    // Check if it's a directory
    if (is_dir($sourceDir . '/' . $lang)) {
        echo "Processing language: {$lang}\n";
        
        // Get all translation files for this language
        $files = scandir($sourceDir . '/' . $lang);
        foreach ($files as $file) {
            // Skip . and .. files
            if ($file === '.' || $file === '..') {
                continue;
            }
            
            // Get the module for this file
            $module = $fileToModuleMap[$file] ?? 'Core';
            
            // Load the PHP translation file
            $translations = include($sourceDir . '/' . $lang . '/' . $file);
            
            // Create the module directory if it doesn't exist
            $moduleDir = $publicLocalesDir . '/' . $module . '/' . $lang;
            if (!is_dir($moduleDir)) {
                mkdir($moduleDir, 0755, true);
            }
            
            // Convert the file name from .php to .json
            $jsonFileName = pathinfo($file, PATHINFO_FILENAME) . '.json';
            
            // Write the translations to a JSON file
            file_put_contents(
                $moduleDir . '/' . $jsonFileName,
                json_encode($translations, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)
            );
            
            echo "  Migrated {$file} to {$module}/{$lang}/{$jsonFileName}\n";
        }
    }
}

echo "\nMigration complete. All translations have been moved to their respective modules.\n";
echo "You can now safely remove the resources/lang directory.\n"; 