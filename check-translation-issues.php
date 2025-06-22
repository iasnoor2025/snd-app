<?php

/**
 * Script to check for translation issues
 * This script will:
 * 1. Check for inconsistencies between PHP and JSON translations
 * 2. Check for missing translations
 * 3. Check for invalid JSON files
 */

// Define the modules to check
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

// Define the languages to check
$languages = ['en', 'ar', 'hi', 'bn', 'ur'];

// Define the source directories
$phpDir = __DIR__ . '/Modules';
$jsonDir = __DIR__ . '/public/locales';

// Arrays to store issues
$missingTranslations = [];
$invalidJsonFiles = [];
$inconsistencies = [];

// Check each module
foreach ($modules as $module) {
    echo "Checking module: {$module}\n";
    
    // Check PHP translations
    $phpTranslations = [];
    $phpLangDir = "{$phpDir}/{$module}/resources/lang";
    
    if (is_dir($phpLangDir)) {
        foreach ($languages as $lang) {
            $langDir = "{$phpLangDir}/{$lang}";
            
            if (is_dir($langDir)) {
                $files = glob("{$langDir}/*.php");
                
                foreach ($files as $file) {
                    $group = pathinfo($file, PATHINFO_FILENAME);
                    $translations = include($file);
                    
                    if (is_array($translations)) {
                        $phpTranslations[$lang][$group] = $translations;
                    }
                }
            } else {
                $missingTranslations[] = "Missing PHP translations for {$module}/{$lang}";
            }
        }
    }
    
    // Check JSON translations
    $jsonTranslations = [];
    $jsonModuleDir = "{$jsonDir}/{$module}";
    
    if (is_dir($jsonModuleDir)) {
        foreach ($languages as $lang) {
            $langDir = "{$jsonModuleDir}/{$lang}";
            
            if (is_dir($langDir)) {
                $files = glob("{$langDir}/*.json");
                
                foreach ($files as $file) {
                    $group = pathinfo($file, PATHINFO_FILENAME);
                    
                    try {
                        $content = file_get_contents($file);
                        $translations = json_decode($content, true);
                        
                        if (json_last_error() !== JSON_ERROR_NONE) {
                            $invalidJsonFiles[] = "Invalid JSON in {$file}: " . json_last_error_msg();
                        } else {
                            $jsonTranslations[$lang][$group] = $translations;
                        }
                    } catch (\Exception $e) {
                        $invalidJsonFiles[] = "Error reading {$file}: " . $e->getMessage();
                    }
                }
            } else {
                $missingTranslations[] = "Missing JSON translations for {$module}/{$lang}";
            }
        }
    }
    
    // Check for inconsistencies between PHP and JSON translations
    foreach ($languages as $lang) {
        if (isset($phpTranslations[$lang]) && isset($jsonTranslations[$lang])) {
            $phpGroups = array_keys($phpTranslations[$lang]);
            $jsonGroups = array_keys($jsonTranslations[$lang]);
            
            // Find groups that exist in PHP but not in JSON
            $missingJsonGroups = array_diff($phpGroups, $jsonGroups);
            foreach ($missingJsonGroups as $group) {
                $inconsistencies[] = "Group {$group} exists in PHP but not in JSON for {$module}/{$lang}";
            }
            
            // Find groups that exist in JSON but not in PHP
            $missingPhpGroups = array_diff($jsonGroups, $phpGroups);
            foreach ($missingPhpGroups as $group) {
                $inconsistencies[] = "Group {$group} exists in JSON but not in PHP for {$module}/{$lang}";
            }
            
            // Check for keys that exist in PHP but not in JSON
            foreach ($phpGroups as $group) {
                if (isset($jsonTranslations[$lang][$group])) {
                    $phpKeys = array_keys($phpTranslations[$lang][$group]);
                    $jsonKeys = array_keys($jsonTranslations[$lang][$group]);
                    
                    $missingJsonKeys = array_diff($phpKeys, $jsonKeys);
                    foreach ($missingJsonKeys as $key) {
                        $inconsistencies[] = "Key {$key} in group {$group} exists in PHP but not in JSON for {$module}/{$lang}";
                    }
                }
            }
        }
    }
}

// Report findings
echo "\n=== Missing Translations ===\n";
foreach ($missingTranslations as $issue) {
    echo "- {$issue}\n";
}

echo "\n=== Invalid JSON Files ===\n";
foreach ($invalidJsonFiles as $issue) {
    echo "- {$issue}\n";
}

echo "\n=== Inconsistencies ===\n";
foreach ($inconsistencies as $issue) {
    echo "- {$issue}\n";
}

if (count($missingTranslations) === 0 && count($invalidJsonFiles) === 0 && count($inconsistencies) === 0) {
    echo "\nNo issues found. All translations are consistent!\n";
} else {
    echo "\nFound " . (count($missingTranslations) + count($invalidJsonFiles) + count($inconsistencies)) . " issues.\n";
    echo "Please fix these issues to ensure consistent translations.\n";
} 