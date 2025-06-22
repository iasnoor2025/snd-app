<?php

/**
 * This script checks all translation files and ensures they exist for each module.
 * It also checks for missing translations between languages.
 */

// Define supported languages
$supportedLanguages = ['en', 'ar'];

// Define core translation files that should exist for each language
$coreTranslationFiles = [
    'common',
    'validation',
    'fields',
    'users',
    'roles',
    'permissions',
    'navigation',
    'dashboard',
    'settings',
    'profile',
    'notifications',
];

// Get all modules
$modulesDir = __DIR__ . '/Modules';
$modules = array_filter(scandir($modulesDir), function($item) use ($modulesDir) {
    return is_dir($modulesDir . '/' . $item) && !in_array($item, ['.', '..']);
});

// Check if public/locales directory exists for each module
$missingLocalesDirs = [];
foreach ($modules as $module) {
    $localesDir = __DIR__ . '/public/locales/' . $module;
    if (!is_dir($localesDir)) {
        $missingLocalesDirs[] = $module;
        echo "❌ Missing locales directory for module: {$module}\n";
        mkdir($localesDir, 0755, true);
        echo "✅ Created locales directory for module: {$module}\n";
    }

    // Check if language directories exist for each module
    foreach ($supportedLanguages as $lang) {
        $langDir = $localesDir . '/' . $lang;
        if (!is_dir($langDir)) {
            echo "❌ Missing language directory for module: {$module}, language: {$lang}\n";
            mkdir($langDir, 0755, true);
            echo "✅ Created language directory for module: {$module}, language: {$lang}\n";
        }
    }
}

// Check if core translation files exist for each language
foreach ($supportedLanguages as $lang) {
    $coreDir = __DIR__ . '/public/locales/Core/' . $lang;
    if (!is_dir($coreDir)) {
        echo "❌ Missing Core language directory for language: {$lang}\n";
        mkdir($coreDir, 0755, true);
        echo "✅ Created Core language directory for language: {$lang}\n";
    }

    foreach ($coreTranslationFiles as $file) {
        $filePath = $coreDir . '/' . $file . '.json';
        if (!file_exists($filePath)) {
            echo "❌ Missing Core translation file: {$file}.json for language: {$lang}\n";
            
            // If English file exists, copy structure from English
            $enFilePath = __DIR__ . '/public/locales/Core/en/' . $file . '.json';
            if (file_exists($enFilePath)) {
                $enContent = json_decode(file_get_contents($enFilePath), true);
                $newContent = [];
                
                // Create empty structure based on English file
                foreach ($enContent as $key => $value) {
                    if (is_array($value)) {
                        $newContent[$key] = $value;
                    } else {
                        $newContent[$key] = $key; // Use key as placeholder
                    }
                }
                
                file_put_contents($filePath, json_encode($newContent, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
                echo "✅ Created empty structure for: {$file}.json for language: {$lang}\n";
            } else {
                file_put_contents($filePath, '{}');
                echo "✅ Created empty file for: {$file}.json for language: {$lang}\n";
            }
        }
    }
}

// Check for missing translations between languages
$missingTranslations = [];
foreach ($modules as $module) {
    $localesDir = __DIR__ . '/public/locales/' . $module;
    if (!is_dir($localesDir)) {
        continue;
    }

    // Get all translation files in English
    $enDir = $localesDir . '/en';
    if (!is_dir($enDir)) {
        continue;
    }

    $enFiles = array_filter(scandir($enDir), function($item) use ($enDir) {
        return is_file($enDir . '/' . $item) && pathinfo($item, PATHINFO_EXTENSION) === 'json';
    });

    foreach ($enFiles as $file) {
        $enFilePath = $enDir . '/' . $file;
        $enContent = json_decode(file_get_contents($enFilePath), true);

        foreach ($supportedLanguages as $lang) {
            if ($lang === 'en') {
                continue;
            }

            $langFilePath = $localesDir . '/' . $lang . '/' . $file;
            if (!file_exists($langFilePath)) {
                echo "❌ Missing translation file: {$file} for module: {$module}, language: {$lang}\n";
                
                // Create empty structure based on English file
                $newContent = [];
                foreach ($enContent as $key => $value) {
                    if (is_array($value)) {
                        $newContent[$key] = $value;
                    } else {
                        $newContent[$key] = $key; // Use key as placeholder
                    }
                }
                
                file_put_contents($langFilePath, json_encode($newContent, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
                echo "✅ Created empty structure for: {$file} for module: {$module}, language: {$lang}\n";
            } else {
                $langContent = json_decode(file_get_contents($langFilePath), true);
                
                // Check for missing keys
                $missingKeys = [];
                foreach ($enContent as $key => $value) {
                    if (!isset($langContent[$key])) {
                        $missingKeys[] = $key;
                    } else if (is_array($value)) {
                        foreach ($value as $subKey => $subValue) {
                            if (!isset($langContent[$key][$subKey])) {
                                $missingKeys[] = $key . '.' . $subKey;
                            }
                        }
                    }
                }
                
                if (!empty($missingKeys)) {
                    $missingTranslations[] = [
                        'module' => $module,
                        'language' => $lang,
                        'file' => $file,
                        'keys' => $missingKeys
                    ];
                    
                    echo "⚠️ Missing translations in {$module}/{$lang}/{$file}: " . implode(', ', $missingKeys) . "\n";
                }
            }
        }
    }
}

echo "\n--- Summary ---\n";
echo "Total modules: " . count($modules) . "\n";
echo "Modules with missing locales directories: " . count($missingLocalesDirs) . "\n";
echo "Files with missing translations: " . count($missingTranslations) . "\n";

if (!empty($missingTranslations)) {
    echo "\nDetailed missing translations:\n";
    foreach ($missingTranslations as $item) {
        echo "Module: {$item['module']}, Language: {$item['language']}, File: {$item['file']}\n";
        echo "Missing keys: " . implode(', ', $item['keys']) . "\n\n";
    }
}

echo "\nDone!\n"; 