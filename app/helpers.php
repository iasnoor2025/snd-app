<?php

/**
 * Helper functions for the application
 */

if (!function_exists('module_path')) {
    /**
     * Get the path to the specified module.
     *
     * @param string $name
     * @param string $path
     * @return string
     */
    function module_path($name, $path = '')
    {
        $modulePath = config('modules.paths.modules') . '/' . $name;
        
        if (!is_dir($modulePath)) {
            // Try case-insensitive match
            $modules = array_map('basename', glob(config('modules.paths.modules') . '/*', GLOB_ONLYDIR));
            
            foreach ($modules as $module) {
                if (strcasecmp($name, $module) === 0) {
                    $modulePath = config('modules.paths.modules') . '/' . $module;
                    break;
                }
            }
        }
        
        return $modulePath . ($path ? '/' . $path : '');
    }
}

if (!function_exists('safe_module_path')) {
    /**
     * Get the path to the specified module safely.
     * This is a fallback for when the module_path function fails.
     *
     * @param string $name
     * @param string $path
     * @return string
     */
    function safe_module_path($name, $path = '')
    {
        try {
            // First try to use the original module_path function
            return module_path($name, $path);
        } catch (\Throwable $e) {
            // If it fails, use our fallback
            $modulePath = base_path('Modules/' . $name);
            
            if (!is_dir($modulePath)) {
                // Try case-insensitive match
                $modules = array_map('basename', glob(base_path('Modules/*'), GLOB_ONLYDIR));
                
                foreach ($modules as $module) {
                    if (strcasecmp($name, $module) === 0) {
                        $modulePath = base_path('Modules/' . $module);
                        break;
                    }
                }
            }
            
            return $modulePath . ($path ? '/' . $path : '');
        }
    }
} 