<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Schema;

class FixModuleMigrations extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'modules:fix-migrations {module?}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fix duplicate migrations in modules';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $module = $this->argument('module');

        // If no module is provided, check all modules
        if (empty($module)) {
            $modulesPath = base_path('Modules');
            $modules = array_filter(File::directories($modulesPath), function ($dir) {
                return is_dir($dir . '/Database/Migrations');
            });

            foreach ($modules as $modulePath) {
                $moduleName = basename($modulePath);
                $this->fixModuleMigrations($moduleName);
            }
        } else {
            $this->fixModuleMigrations($module);
        }

        $this->info('Module migrations fixed successfully.');
    }

    /**
     * Fix migrations for a specific module.
     *
     * @param string $moduleName
     * @return void
     */
    protected function fixModuleMigrations($moduleName)
    {
        $migrationsPath = base_path("Modules/{$moduleName}/Database/Migrations");

        if (!is_dir($migrationsPath)) {
            $this->warn("No migrations folder found for module {$moduleName}");
            return;
        }

        $this->info("Processing migrations for module {$moduleName}...");

        // Get all migration files
        $files = glob($migrationsPath . '/*.php');
        $coreTables = [
            'users',
            'password_reset_tokens',
            'sessions',
            'cache',
            'cache_locks',
            'jobs',
            'job_batches',
            'failed_jobs',
            'personal_access_tokens',
            'migrations',
            'departments',
            'positions',
            'roles',
            'model_has_permissions',
            'model_has_roles',
            'role_has_permissions',
            'permissions',
            'locations',
            'categories',
            'suppliers',
            'inventory_items',
            'feedback',
            'report_templates',
            'activity_log',
            'media',
            'system_metrics'
        ];

        $skippedCount = 0;

        foreach ($files as $file) {
            $content = file_get_contents($file);
            $filename = basename($file);
            $shouldSkip = false;

            // Check if this migration creates any of the core tables
            foreach ($coreTables as $coreTable) {
                if (stripos($content, "create_table(\"{$coreTable}\"") !== false ||
                    stripos($content, "create_table('{$coreTable}'") !== false ||
                    stripos($content, "Schema::create('{$coreTable}'") !== false ||
                    stripos($content, "Schema::create(\"{$coreTable}\"") !== false) {
                    $shouldSkip = true;
                    $skippedCount++;

                    // Rename the file to indicate it should be skipped
                    $disabledFile = str_replace('.php', '.php.disabled', $file);
                    rename($file, $disabledFile);

                    $this->warn("Migration file {$filename} disabled because it creates core table {$coreTable}");
                    break;
                }
            }
        }

        $this->info("Processed module {$moduleName}: {$skippedCount} migration(s) disabled.");
    }
}
