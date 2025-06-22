<?php

/**
 * Script to fix invalid JSON translation files
 * This script will:
 * 1. Find all JSON files in public/locales
 * 2. Check if they are valid JSON
 * 3. If not, try to fix them by properly encoding the PHP arrays
 */

// Define the source directory
$jsonDir = __DIR__ . '/public/locales';

// Find all JSON files
$jsonFiles = [];
$iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($jsonDir));
foreach ($iterator as $file) {
    if ($file->isFile() && $file->getExtension() === 'json') {
        $jsonFiles[] = $file->getPathname();
    }
}

echo "Found " . count($jsonFiles) . " JSON files to check.\n\n";

// Check and fix each file
$fixedCount = 0;
$errorCount = 0;

foreach ($jsonFiles as $file) {
    echo "Checking {$file}... ";
    
    $content = file_get_contents($file);
    $data = json_decode($content, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        echo "INVALID JSON: " . json_last_error_msg() . "\n";
        
        // Try to fix the file
        try {
            // Check if it's a PHP array format
            if (preg_match('/^\s*array\s*\(/i', $content)) {
                echo "  Looks like a PHP array. Converting to JSON... ";
                
                // Create a temporary PHP file to evaluate the array
                $tempFile = tempnam(sys_get_temp_dir(), 'json_fix_');
                file_put_contents($tempFile, "<?php\nreturn {$content};");
                
                // Load the array
                $array = include($tempFile);
                
                // Delete the temporary file
                unlink($tempFile);
                
                if (is_array($array)) {
                    // Convert to JSON
                    $json = json_encode($array, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
                    
                    // Write back to the file
                    file_put_contents($file, $json);
                    
                    echo "FIXED\n";
                    $fixedCount++;
                } else {
                    echo "FAILED (not a valid array)\n";
                    $errorCount++;
                }
            } else {
                // Try to manually fix common JSON errors
                
                // Remove trailing commas
                $fixed = preg_replace('/,\s*([}\]])/m', '$1', $content);
                
                // Ensure property names are quoted
                $fixed = preg_replace('/([{,])\s*([a-zA-Z0-9_]+)\s*:/m', '$1"$2":', $fixed);
                
                // Fix single quotes to double quotes
                $fixed = preg_replace("/'([^']*?)'/m", '"$1"', $fixed);
                
                // Parse the fixed content
                $data = json_decode($fixed, true);
                
                if (json_last_error() === JSON_ERROR_NONE) {
                    // Write the fixed JSON back to the file
                    file_put_contents($file, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
                    
                    echo "FIXED\n";
                    $fixedCount++;
                } else {
                    echo "FAILED (could not fix automatically)\n";
                    $errorCount++;
                }
            }
        } catch (\Exception $e) {
            echo "ERROR: " . $e->getMessage() . "\n";
            $errorCount++;
        }
    } else {
        echo "OK\n";
    }
}

echo "\nSummary:\n";
echo "  Total files checked: " . count($jsonFiles) . "\n";
echo "  Files fixed: {$fixedCount}\n";
echo "  Files with errors: {$errorCount}\n";

if ($errorCount > 0) {
    echo "\nSome files could not be fixed automatically. Please check them manually.\n";
} else {
    echo "\nAll files have been fixed successfully.\n";
} 