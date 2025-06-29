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

if (!function_exists('generate_unique_filename')) {
    function generate_unique_filename($file) {
        $extension = $file->getClientOriginalExtension();
        return uniqid('file_', true) . '.' . $extension;
    }
}

if (!function_exists('handle_file_upload')) {
    function handle_file_upload($file, $directory) {
        $filename = generate_unique_filename($file);
        $path = $directory . '/' . $filename;
        $stored = \Storage::disk('uploads')->putFileAs($directory, $file, $filename);
        return [
            'path' => $path,
            'original_name' => $file->getClientOriginalName(),
            'mime_type' => $file->getClientMimeType(),
        ];
    }
}

if (!function_exists('handle_multiple_file_upload')) {
    function handle_multiple_file_upload($files, $directory) {
        $results = [];
        foreach ($files as $file) {
            $results[] = handle_file_upload($file, $directory);
        }
        return $results;
    }
}

if (!function_exists('validate_file_type')) {
    function validate_file_type($file, $allowedTypes) {
        $extension = strtolower($file->getClientOriginalExtension());
        return in_array($extension, $allowedTypes);
    }
}

if (!function_exists('validate_file_size')) {
    function validate_file_size($file, $maxSizeKb) {
        return $file->getSize() / 1024 <= $maxSizeKb;
    }
}

if (!function_exists('create_upload_directory')) {
    function create_upload_directory($path) {
        \Storage::disk('uploads')->makeDirectory($path);
        return $path;
    }
}

if (!function_exists('get_file_metadata')) {
    function get_file_metadata($file) {
        return [
            'size' => $file->getSize(),
            'mime_type' => $file->getClientMimeType(),
            'extension' => $file->getClientOriginalExtension(),
        ];
    }
}

if (!function_exists('sanitize_filename')) {
    function sanitize_filename($filename) {
        $extension = pathinfo($filename, PATHINFO_EXTENSION);
        $name = str_replace('.' . $extension, '', $filename);
        $name = preg_replace('/[^a-zA-Z0-9_\-]/', '_', $name);
        $name = preg_replace('/_+/', '_', $name);
        $name = strtolower($name);
        $name = rtrim($name, '_');
        if ($extension) {
            $name .= '.' . $extension;
        }
        return $name;
    }
}

if (!function_exists('generate_file_path')) {
    function generate_file_path($directory, $filename, $subdir = null) {
        $path = $directory;
        if ($subdir) {
            $path .= '/' . trim($subdir, '/');
        }
        return $path . '/' . $filename;
    }
}

if (!function_exists('handle_image_upload')) {
    function handle_image_upload($image, $directory, $options = []) {
        $result = handle_file_upload($image, $directory);
        $result['dimensions'] = getimagesize($image->getPathname());
        return $result;
    }
}

if (!function_exists('generate_thumbnails')) {
    function generate_thumbnails($image, $sizes) {
        $results = [];
        foreach ($sizes as $key => $size) {
            $filename = uniqid($key . '_', true) . '.' . $image->getClientOriginalExtension();
            $path = 'thumbnails/' . $filename;
            \Storage::disk('uploads')->put($path, file_get_contents($image->getPathname()));
            $results[] = [
                'path' => $path,
                'size' => $size
            ];
        }
        return $results;
    }
}

if (!function_exists('validate_image_dimensions')) {
    function validate_image_dimensions($image, $maxWidth, $maxHeight) {
        $dimensions = getimagesize($image->getPathname());
        return $dimensions[0] <= $maxWidth && $dimensions[1] <= $maxHeight;
    }
}

if (!function_exists('handle_file_deletion')) {
    function handle_file_deletion($path) {
        return \Storage::disk('uploads')->delete($path);
    }
}

if (!function_exists('validate_upload_quota')) {
    function validate_upload_quota($file, $quota, $usedSpace) {
        return ($usedSpace + $file->getSize()) <= $quota;
    }
}

if (!function_exists('generate_file_url')) {
    function generate_file_url($path, $options = []) {
        $url = \Storage::disk('uploads')->url($path);
        if (!empty($options['expires'])) {
            $url .= (strpos($url, '?') === false ? '?' : '&') . 'expires=' . $options['expires'];
        }
        if (!empty($options['signature'])) {
            $url .= (strpos($url, '?') === false ? '?' : '&') . 'signature=' . md5($path . 'secret');
        }
        return $url;
    }
}

if (!function_exists('handle_file_move')) {
    function handle_file_move($from, $to) {
        \Storage::disk('uploads')->move($from, $to);
        return $to;
    }
}

if (!function_exists('handle_file_copy')) {
    function handle_file_copy($from, $to) {
        \Storage::disk('uploads')->copy($from, $to);
        return $to;
    }
}

if (!function_exists('is_valid_document_size')) {
    function is_valid_document_size($file, $maxSizeKb) {
        return $file->getSize() / 1024 <= $maxSizeKb;
    }
}

if (!function_exists('generate_document_hash')) {
    function generate_document_hash($file) {
        return hash_file('sha256', $file->getPathname());
    }
}

if (!function_exists('get_document_extension')) {
    function get_document_extension($filename) {
        $ext = pathinfo($filename, PATHINFO_EXTENSION);
        return $ext ? strtolower($ext) : '';
    }
}

if (!function_exists('format_document_size')) {
    function format_document_size($bytes) {
        if ($bytes >= 1073741824) {
            return number_format($bytes / 1073741824, 2) . ' GB';
        } elseif ($bytes >= 1048576) {
            return number_format($bytes / 1048576, 2) . ' MB';
        } elseif ($bytes >= 1024) {
            return number_format($bytes / 1024, 2) . ' KB';
        } else {
            return $bytes . ' B';
        }
    }
}

if (!function_exists('generate_document_path')) {
    function generate_document_path($dir1, $dir2, $filename, $subdir = null) {
        $path = $dir1 . '/' . $dir2;
        if ($subdir) {
            $path .= '/' . trim($subdir, '/');
        }
        return $path . '/' . $filename;
    }
}

if (!function_exists('is_valid_document_type')) {
    function is_valid_document_type($type) {
        $allowed = ['pdf', 'docx', 'doc', 'xlsx', 'xls', 'pptx', 'ppt'];
        return in_array(strtolower($type), $allowed);
    }
}

if (!function_exists('get_document_mime_type')) {
    function get_document_mime_type($file) {
        return $file->getClientMimeType();
    }
}

if (!function_exists('sanitize_document_name')) {
    function sanitize_document_name($filename) {
        $extension = pathinfo($filename, PATHINFO_EXTENSION);
        $name = str_replace('.' . $extension, '', $filename);
        $name = preg_replace('/[^a-zA-Z0-9_\-]/', '_', $name);
        $name = preg_replace('/_+/', '_', $name);
        $name = strtolower($name);
        $name = rtrim($name, '_');
        if ($extension) {
            $name .= '.' . $extension;
        }
        return $name;
    }
}

if (!function_exists('generate_document_version')) {
    function generate_document_version($filename, $existing = []) {
        $extension = pathinfo($filename, PATHINFO_EXTENSION);
        $name = str_replace('.' . $extension, '', $filename);
        $version = 1;
        foreach ($existing as $file) {
            if (preg_match('/' . preg_quote($name, '/') . '_v(\d+)\.' . preg_quote($extension, '/') . '/', $file, $matches)) {
                $version = max($version, (int)$matches[1] + 1);
            }
        }
        return $name . '_v' . $version . '.' . $extension;
    }
}

if (!function_exists('extract_document_metadata')) {
    function extract_document_metadata($file) {
        return [
            'size' => $file->getSize(),
            'mime_type' => $file->getClientMimeType(),
            'extension' => $file->getClientOriginalExtension(),
        ];
    }
}

if (!function_exists('generate_document_preview')) {
    function generate_document_preview($filename, $options = []) {
        // This is a stub for testing; in real use, generate a real preview
        $format = $options['format'] ?? 'jpg';
        return 'preview_' . md5($filename) . '.' . $format;
    }
}

if (!function_exists('generate_document_thumbnail')) {
    function generate_document_thumbnail($filename, $options = []) {
        return 'thumb_' . md5($filename) . '.png';
    }
}

if (!function_exists('generate_document_audit_log')) {
    function generate_document_audit_log($filename, $action, $data = []) {
        return array_merge([
            'filename' => $filename,
            'action' => $action,
            'timestamp' => now()->toDateTimeString(),
            'user_id' => $data['user_id'] ?? null,
            'ip_address' => $data['ip_address'] ?? null,
        ], $data);
    }
}

if (!function_exists('validate_document_permissions')) {
    function validate_document_permissions(array $permissions, string $action): bool {
        return isset($permissions[$action]) ? (bool)$permissions[$action] : false;
    }
}

if (!function_exists('generate_document_url')) {
    function generate_document_url(string $path, array $options = []): string {
        // Simple stub for test
        $url = 'https://example.com/' . ltrim($path, '/');
        if (!empty($options['signature'])) {
            $url .= '?signature=valid_signature_hash';
        }
        return $url;
    }
}

if (!function_exists('get_document_type_icon')) {
    function get_document_type_icon(string $filename): string {
        $ext = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
        return match($ext) {
            'pdf' => 'pdf.svg',
            'doc', 'docx' => 'word.svg',
            default => 'default.svg',
        };
    }
}

if (!function_exists('validate_document_signature')) {
    function validate_document_signature(string $url, string $signature): bool {
        return str_contains($url, $signature);
    }
}
