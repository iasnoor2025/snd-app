<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

class PublishModuleTranslations extends Command
{
    protected $signature = 'translations:publish';
    protected $description = 'Publish module translations to the public directory';

    public function handle()
    {
        $modules = array_map('basename', File::directories(base_path('Modules')));
        $publishedCount = 0;

        foreach ($modules as $module) {
            $sourcePath = base_path("Modules/{$module}/resources/lang");
            $targetPath = public_path("locales/{$module}");

            if (!File::exists($sourcePath)) {
                continue;
            }

            // Create target directory if it doesn't exist
            File::makeDirectory($targetPath, 0755, true, true);

            // Copy translation files
            foreach (File::directories($sourcePath) as $langDir) {
                $lang = basename($langDir);
                $langTargetPath = "{$targetPath}/{$lang}";
                
                File::makeDirectory($langTargetPath, 0755, true, true);

                foreach (File::files($langDir) as $file) {
                    $filename = $file->getFilename();
                    $namespace = pathinfo($filename, PATHINFO_FILENAME);
                    
                    File::copy(
                        $file->getPathname(),
                        "{$langTargetPath}/{$namespace}.json"
                    );
                    $publishedCount++;
                }
            }
        }

        $this->info("Published {$publishedCount} translation files.");
    }
} 