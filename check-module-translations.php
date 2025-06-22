<?php

/**
 * Script to check if all modules have their own translation files
 * This script will:
 * 1. Check all modules for translation files
 * 2. Report any modules that are missing translation files
 */

// Define the languages to check
$languages = ['en', 'ar', 'hi', 'bn', 'ur'];

// Get all modules
$modules = array_filter(scandir(__DIR__ . '/Modules'), function($item) {
    return $item !== '.' && $item !== '..' && is_dir(__DIR__ . '/Modules/' . $item);
});

echo "Found " . count($modules) . " modules: " . implode(', ', $modules) . "\n\n";

// Check each module
$missingTranslations = [];

foreach ($modules as $module) {
    echo "Checking module: {$module}\n";
    
    // Check for public/locales/{Module}/{lang} files
    $publicLocalesDir = __DIR__ . '/public/locales/' . $module;
    
    if (!is_dir($publicLocalesDir)) {
        $missingTranslations[] = "{$module}: Missing public/locales/{$module} directory";
        continue;
    }
    
    // Check for each language
    foreach ($languages as $lang) {
        $langDir = $publicLocalesDir . '/' . $lang;
        
        if (!is_dir($langDir)) {
            $missingTranslations[] = "{$module}: Missing {$lang} translations";
            continue;
        }
        
        // Check for common.json
        $commonFile = $langDir . '/common.json';
        
        if (!file_exists($commonFile)) {
            $missingTranslations[] = "{$module}: Missing {$lang}/common.json";
        }
    }
}

// Report findings
if (count($missingTranslations) > 0) {
    echo "\nMissing translations:\n";
    
    foreach ($missingTranslations as $missing) {
        echo "- {$missing}\n";
    }
    
    echo "\nYou should create these translation files to ensure all modules have their own translations.\n";
} else {
    echo "\nAll modules have their own translation files. Great job!\n";
} 