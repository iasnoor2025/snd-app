<?php

/**
 * Script to check for code using the old translation system
 * This script will:
 * 1. Scan all PHP files for __() and trans() functions
 * 2. Report any files that are using these functions directly without a module prefix
 */

$directories = [
    __DIR__ . '/app',
    __DIR__ . '/Modules',
    __DIR__ . '/resources/views',
];

$patterns = [
    '/__\([\'"](?!.*::)/', // __() without module prefix
    '/trans\([\'"](?!.*::)/', // trans() without module prefix
    '/Lang::get\([\'"](?!.*::)/', // Lang::get() without module prefix
    '/\$t\([\'"](?!.*:)/', // $t() without namespace in JS/Vue files
];

$excludeDirs = [
    __DIR__ . '/vendor',
    __DIR__ . '/node_modules',
    __DIR__ . '/storage',
    __DIR__ . '/bootstrap/cache',
];

$foundFiles = [];

/**
 * Scan a directory recursively for files matching patterns
 */
function scanDirectory($dir, $patterns, $excludeDirs, &$foundFiles) {
    $files = scandir($dir);
    
    foreach ($files as $file) {
        if ($file === '.' || $file === '..') {
            continue;
        }
        
        $path = $dir . '/' . $file;
        
        // Skip excluded directories
        if (is_dir($path) && in_array($path, $excludeDirs)) {
            continue;
        }
        
        if (is_dir($path)) {
            scanDirectory($path, $patterns, $excludeDirs, $foundFiles);
        } else {
            // Only scan PHP, JS, TS, JSX, TSX, and Vue files
            $extension = pathinfo($path, PATHINFO_EXTENSION);
            if (in_array($extension, ['php', 'js', 'ts', 'jsx', 'tsx', 'vue'])) {
                $content = file_get_contents($path);
                
                foreach ($patterns as $pattern) {
                    if (preg_match($pattern, $content)) {
                        $foundFiles[] = [
                            'path' => $path,
                            'pattern' => $pattern,
                        ];
                        break; // Only report each file once
                    }
                }
            }
        }
    }
}

// Scan all directories
foreach ($directories as $directory) {
    if (is_dir($directory)) {
        scanDirectory($directory, $patterns, $excludeDirs, $foundFiles);
    }
}

// Report findings
if (count($foundFiles) > 0) {
    echo "Found " . count($foundFiles) . " files using the old translation system:\n\n";
    
    foreach ($foundFiles as $file) {
        echo "- {$file['path']}\n";
    }
    
    echo "\nPlease update these files to use module-based translations.\n";
    echo "For PHP files, use: __('ModuleName::file.key') or trans('ModuleName::file.key')\n";
    echo "For JS files, use: t('namespace:key') with proper namespaces\n";
} else {
    echo "No files found using the old translation system. Good job!\n";
} 