<?php

/**
 * This script checks all React components in the modules and ensures they are using translations.
 * It will check for components that are not using translations and list them.
 */

// Define the modules directory
$modulesDir = __DIR__ . '/Modules';

// Define patterns to check for translation usage
$translationPatterns = [
    'useTranslation' => 'useTranslation',
    't(' => 't(',
    'i18n' => 'i18n',
];

// Define patterns for CRUD components
$crudPatterns = [
    'Index.tsx',
    'Create.tsx',
    'Edit.tsx',
    'Show.tsx',
];

// Define files to skip
$skipFiles = [
    'node_modules',
    'vendor',
    'dist',
    'build',
    'public',
    'storage',
    'bootstrap',
];

// Results arrays
$filesWithoutTranslations = [];
$filesWithTranslations = [];
$totalFilesChecked = 0;

/**
 * Check if a file uses translations
 * 
 * @param string $filePath The path to the file
 * @return bool True if the file uses translations, false otherwise
 */
function fileUsesTranslations($filePath) {
    global $translationPatterns;
    
    $content = file_get_contents($filePath);
    foreach ($translationPatterns as $pattern) {
        if (strpos($content, $pattern) !== false) {
            return true;
        }
    }
    
    return false;
}

/**
 * Check if a file is a CRUD component
 * 
 * @param string $filePath The path to the file
 * @return bool True if the file is a CRUD component, false otherwise
 */
function isCrudComponent($filePath) {
    global $crudPatterns;
    
    $filename = basename($filePath);
    foreach ($crudPatterns as $pattern) {
        if (strpos($filename, $pattern) !== false) {
            return true;
        }
    }
    
    return false;
}

/**
 * Check if a file should be skipped
 * 
 * @param string $filePath The path to the file
 * @return bool True if the file should be skipped, false otherwise
 */
function shouldSkipFile($filePath) {
    global $skipFiles;
    
    foreach ($skipFiles as $pattern) {
        if (strpos($filePath, $pattern) !== false) {
            return true;
        }
    }
    
    return false;
}

/**
 * Recursively scan a directory for files
 * 
 * @param string $dir The directory to scan
 * @param array $results The results array
 * @return array The results array
 */
function scanDirectory($dir, &$results = []) {
    $files = scandir($dir);
    
    foreach ($files as $file) {
        if ($file === '.' || $file === '..') {
            continue;
        }
        
        $path = $dir . '/' . $file;
        
        if (shouldSkipFile($path)) {
            continue;
        }
        
        if (is_dir($path)) {
            scanDirectory($path, $results);
        } else {
            if (pathinfo($path, PATHINFO_EXTENSION) === 'tsx' || pathinfo($path, PATHINFO_EXTENSION) === 'jsx') {
                $results[] = $path;
            }
        }
    }
    
    return $results;
}

// Scan all modules for React components
$modules = array_filter(scandir($modulesDir), function($item) use ($modulesDir) {
    return is_dir($modulesDir . '/' . $item) && !in_array($item, ['.', '..']);
});

echo "Scanning modules for React components...\n";

foreach ($modules as $module) {
    $moduleDir = $modulesDir . '/' . $module;
    $resourcesDir = $moduleDir . '/resources/js';
    
    if (!is_dir($resourcesDir)) {
        continue;
    }
    
    $files = scanDirectory($resourcesDir);
    
    foreach ($files as $file) {
        $totalFilesChecked++;
        
        if (isCrudComponent($file)) {
            if (fileUsesTranslations($file)) {
                $filesWithTranslations[] = $file;
            } else {
                $filesWithoutTranslations[] = $file;
            }
        }
    }
}

// Print results
echo "\n--- Results ---\n";
echo "Total React components checked: " . $totalFilesChecked . "\n";
echo "CRUD components with translations: " . count($filesWithTranslations) . "\n";
echo "CRUD components without translations: " . count($filesWithoutTranslations) . "\n\n";

if (count($filesWithoutTranslations) > 0) {
    echo "CRUD components without translations:\n";
    foreach ($filesWithoutTranslations as $file) {
        echo "- " . str_replace(__DIR__ . '/', '', $file) . "\n";
    }
}

echo "\nDone!\n"; 