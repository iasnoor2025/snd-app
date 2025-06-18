<?php

namespace Modules\Core\Services;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\File;

class LegacyCodeHandler
{
    /**
     * The legacy code paths.
     *
     * @var array
     */
    protected $legacyPaths;

    /**
     * The module paths.
     *
     * @var array
     */
    protected $modulePaths;

    /**
     * Create a new legacy code handler instance.
     *
     * @return void;
     */
    public function __construct()
    {
        $this->legacyPaths = [
            'app' => base_path('app'),
            'config' => base_path('config'),
            'database' => base_path('database'),
            'resources' => base_path('resources'),
        ];

        $this->modulePaths = [
            'modules' => base_path('Modules')
        ];
    }

    /**
     * Analyze legacy code structure.
     *
     * @return array;
     */
    public function analyzeLegacyCode()
    {
        $analysis = [
            'controllers' => $this->analyzeControllers(),
            'models' => $this->analyzeModels(),
            'migrations' => $this->analyzeMigrations(),
            'routes' => $this->analyzeRoutes(),
            'views' => $this->analyzeViews(),
        ];

        Log::info('Legacy code analysis completed', $analysis);

        return $analysis;
    }

    /**
     * Analyze legacy controllers.
     *
     * @return array;
     */
    protected function analyzeControllers()
    {
        $controllers = [];
        $path = $this->legacyPaths['app'] . '/Http/Controllers';

        if (File::exists($path)) {
            $files = File::allFiles($path);
            foreach ($files as $file) {
                $controllers[] = [
                    'name' => $file->getBasename('.php'),
                    'path' => $file->getPathname(),
                    'namespace' => $this->getNamespaceFromFile($file->getPathname()),
                ];
            }
        }

        return $controllers;
    }

    /**
     * Analyze legacy models.
     *
     * @return array;
     */
    protected function analyzeModels()
    {
        $models = [];
        $path = $this->legacyPaths['app'] . '/Models';

        if (File::exists($path)) {
            $files = File::allFiles($path);
            foreach ($files as $file) {
                $models[] = [
                    'name' => $file->getBasename('.php'),
                    'path' => $file->getPathname(),
                    'namespace' => $this->getNamespaceFromFile($file->getPathname()),
                ];
            }
        }

        return $models;
    }

    /**
     * Analyze legacy migrations.
     *
     * @return array;
     */
    protected function analyzeMigrations()
    {
        $migrations = [];
        $path = $this->legacyPaths['database'] . '/migrations';

        if (File::exists($path)) {
            $files = File::allFiles($path);
            foreach ($files as $file) {
                $migrations[] = [
                    'name' => $file->getBasename('.php'),
                    'path' => $file->getPathname(),
                    'timestamp' => $this->getMigrationTimestamp($file->getBasename('.php')),
                ];
            }
        }

        return $migrations;
    }

    /**
     * Analyze legacy routes.
     *
     * @return array;
     */
    protected function analyzeRoutes()
    {
        $routes = [];
        $path = $this->legacyPaths['app'] . '/../routes';

        if (File::exists($path)) {
            $files = File::allFiles($path);
            foreach ($files as $file) {
                $routes[] = [
                    'name' => $file->getBasename('.php'),
                    'path' => $file->getPathname(),
                ];
            }
        }

        return $routes;
    }

    /**
     * Analyze legacy views.
     *
     * @return array;
     */
    protected function analyzeViews()
    {
        $views = [];
        $path = $this->legacyPaths['resources'] . '/views';

        if (File::exists($path)) {
            $files = File::allFiles($path);
            foreach ($files as $file) {
                $views[] = [
                    'name' => $file->getBasename('.blade.php'),
                    'path' => $file->getPathname(),
                    'type' => $file->getExtension(),
                ];
            }
        }

        return $views;
    }

    /**
     * Get namespace from file.
     *
     * @param  string  $file
     * @return string|null
     */
    protected function getNamespaceFromFile($file)
    {
        $content = File::get($file);
        if (preg_match('/namespace\s+([^;]+)/', $content, $matches)) {
            return $matches[1];
        }
        return null;
    }

    /**
     * Get migration timestamp.
     *
     * @param  string  $filename
     * @return string|null
     */
    protected function getMigrationTimestamp($filename)
    {
        if (preg_match('/^(\d{4}_\d{2}_\d{2}_\d{6})_/', $filename, $matches)) {
            return $matches[1];
        }
        return null;
    }

    /**
     * Generate migration plan.
     *
     * @param  array  $analysis
     * @return array;
     */
    public function generateMigrationPlan(array $analysis)
    {
        $plan = [
            'steps' => [],
            'dependencies' => [],
            'estimated_time' => 0,
        ];

        // Group related components
        $groups = $this->groupRelatedComponents($analysis);

        foreach ($groups as $group) {
            $plan['steps'][] = [
                'name' => "Migrate {$group['name']} module",
                'components' => $group['components'],
                'dependencies' => $group['dependencies'],
                'estimated_time' => $this->estimateMigrationTime($group),
            ];

            $plan['dependencies'] = array_merge($plan['dependencies'], $group['dependencies']);
            $plan['estimated_time'] += $group['estimated_time'];
        }

        return $plan;
    }

    /**
     * Group related components.
     *
     * @param  array  $analysis
     * @return array;
     */
    protected function groupRelatedComponents(array $analysis)
    {
        $groups = [];
        $processed = [];

        foreach ($analysis['controllers'] as $controller) {
            if (!in_array($controller['name'], $processed)) {
                $group = $this->findRelatedComponents($controller, $analysis);
                $groups[] = $group;
                $processed = array_merge($processed, array_column($group['components'], 'name'));
            }
        }

        return $groups;
    }

    /**
     * Find related components.
     *
     * @param  array  $controller
     * @param  array  $analysis
     * @return array;
     */
    protected function findRelatedComponents(array $controller, array $analysis)
    {
        $group = [
            'name' => $this->getModuleNameFromController($controller['name']),
            'components' => [$controller],
            'dependencies' => [],
            'estimated_time' => 0,
        ];

        // Find related models
        foreach ($analysis['models'] as $model) {
            if ($this->isRelatedToController($model, $controller)) {
                $group['components'][] = $model;
            }
        }

        // Find related views
        foreach ($analysis['views'] as $view) {
            if ($this->isRelatedToController($view, $controller)) {
                $group['components'][] = $view;
            }
        }

        // Find related migrations
        foreach ($analysis['migrations'] as $migration) {
            if ($this->isRelatedToController($migration, $controller)) {
                $group['components'][] = $migration;
            }
        }

        return $group;
    }

    /**
     * Get module name from controller.
     *
     * @param  string  $controllerName
     * @return string;
     */
    protected function getModuleNameFromController($controllerName)
    {
        return str_replace('Controller', '', $controllerName);
    }

    /**
     * Check if component is related to controller.
     *
     * @param  array  $component
     * @param  array  $controller
     * @return bool;
     */
    protected function isRelatedToController($component, $controller)
    {
        $controllerName = strtolower($controller['name']);
        $componentName = strtolower($component['name']);

        return strpos($componentName, $controllerName) !== false;
    }

    /**
     * Estimate migration time.
     *
     * @param  array  $group
     * @return int;
     */
    protected function estimateMigrationTime($group)
    {
        $time = 0;
        foreach ($group['components'] as $component) {
            switch (true) {
                case isset($component['type']) && $component['type'] === 'blade.php':
                    $time += 30; // 30 minutes per view
                    break;
                case strpos($component['name'], 'Controller') !== false:
                    $time += 60; // 60 minutes per controller
                    break;
                case strpos($component['name'], 'Model') !== false:
                    $time += 45; // 45 minutes per model
                    break;
                case strpos($component['name'], 'migration') !== false:
                    $time += 15; // 15 minutes per migration
                    break;
            }
        }
        return $time;
    }
}


