<?php

/**
 * Script to generate missing translation files
 * This script will:
 * 1. Check all modules for translation files
 * 2. Generate missing translation files
 */

// Define the languages to check
$languages = ['en', 'ar', 'hi', 'bn', 'ur'];

// Get all modules
$modules = array_filter(scandir(__DIR__ . '/Modules'), function($item) {
    return $item !== '.' && $item !== '..' && is_dir(__DIR__ . '/Modules/' . $item);
});

echo "Found " . count($modules) . " modules: " . implode(', ', $modules) . "\n\n";

// Default common.json content for each module
function getDefaultCommonContent($module) {
    return [
        'module_name' => $module,
        'module_description' => $module . ' Module',
        'navigation_title' => $module,
        'create_button' => 'Create',
        'edit_button' => 'Edit',
        'delete_button' => 'Delete',
        'save_button' => 'Save',
        'cancel_button' => 'Cancel',
        'back_button' => 'Back',
        'success_message' => 'Operation completed successfully',
        'error_message' => 'An error occurred',
        'loading_message' => 'Loading...',
    ];
}

// Check each module
$generatedFiles = 0;

foreach ($modules as $module) {
    echo "Checking module: {$module}\n";
    
    // Check for public/locales/{Module} directory
    $publicLocalesDir = __DIR__ . '/public/locales/' . $module;
    
    if (!is_dir($publicLocalesDir)) {
        echo "  Creating directory: public/locales/{$module}\n";
        mkdir($publicLocalesDir, 0755, true);
    }
    
    // Check for each language
    foreach ($languages as $lang) {
        $langDir = $publicLocalesDir . '/' . $lang;
        
        if (!is_dir($langDir)) {
            echo "  Creating directory: public/locales/{$module}/{$lang}\n";
            mkdir($langDir, 0755, true);
        }
        
        // Check for common.json
        $commonFile = $langDir . '/common.json';
        
        if (!file_exists($commonFile)) {
            echo "  Creating file: public/locales/{$module}/{$lang}/common.json\n";
            
            // Get default content
            $content = getDefaultCommonContent($module);
            
            // Write to file
            file_put_contents($commonFile, json_encode($content, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
            
            $generatedFiles++;
        }
    }
}

echo "\nGenerated {$generatedFiles} translation files.\n";
echo "All modules now have their own translation files.\n"; 