<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class TestAllModuleRoutes extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:all-module-routes';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test all major module routes to identify routing issues';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Testing All Module Routes...');
        $this->info('=====================================');
        
        // Define all major module routes to test
        $moduleRoutes = [
            'Core Module' => [
                'users.index' => 'users',
                'users.show' => 'users.1',
                'users.edit' => 'users.1.edit',
                'users.create' => 'users.create',
                'roles.index' => 'settings/roles',
                'roles.show' => 'settings/roles.1',
                'roles.edit' => 'settings/roles.1.edit',
                'permissions.index' => 'settings/permissions',
            ],
            'Employee Management' => [
                'employees.index' => 'hr/employees',
                'employees.show' => 'hr/employees.1',
                'employees.edit' => 'hr/employees.1.edit',
                'employees.create' => 'hr/employees.create',
                'departments.index' => 'hr/departments',
                'positions.index' => 'hr/positions',
            ],
            'Timesheet Management' => [
                'timesheets.index' => 'hr/timesheets',
                'timesheets.show' => 'hr/timesheets.1',
                'timesheets.edit' => 'hr/timesheets.1.edit',
                'timesheets.create' => 'hr/timesheets.create',
            ],
            'Leave Management' => [
                'leaves.index' => 'hr/leaves',
                'leaves.show' => 'hr/leaves.1',
                'leaves.edit' => 'hr/leaves.1.edit',
                'leaves.create' => 'hr/leaves.create',
            ],
            'Customer Management' => [
                'customers.index' => 'customers',
                'customers.show' => 'customers.1',
                'customers.edit' => 'customers.1.edit',
                'customers.create' => 'customers.create',
            ],
            'Equipment Management' => [
                'equipment.index' => 'equipment',
                'equipment.show' => 'equipment.1',
                'equipment.edit' => 'equipment.1.edit',
                'equipment.create' => 'equipment.create',
            ],
            'Rental Management' => [
                'rentals.index' => 'rentals',
                'rentals.show' => 'rentals.1',
                'rentals.edit' => 'rentals.1.edit',
                'rentals.create' => 'rentals.create',
            ],
            'Project Management' => [
                'projects.index' => 'projects',
                'projects.show' => 'projects.1',
                'projects.edit' => 'projects.1.edit',
                'projects.create' => 'projects.create',
            ],
            'Payroll Management' => [
                'payroll.index' => 'hr/payroll',
                'payroll.show' => 'hr/payroll.1',
                'payroll.edit' => 'hr/payroll.1.edit',
                'payroll.create' => 'hr/payroll.create',
            ],
        ];
        
        $totalRoutes = 0;
        $workingRoutes = 0;
        $brokenRoutes = 0;
        $routeIssues = [];
        
        foreach ($moduleRoutes as $moduleName => $routes) {
            $this->info('');
            $this->info("Testing {$moduleName}:");
            $this->info(str_repeat('-', 40));
            
            foreach ($routes as $routeName => $expectedPath) {
                $totalRoutes++;
                
                try {
                    // Test if route exists and can be generated
                    if (strpos($routeName, '.1') !== false) {
                        // Routes with parameters
                        $routeNameWithoutParam = str_replace('.1', '', $routeName);
                        $generatedUrl = route($routeNameWithoutParam, 1);
                    } else {
                        // Routes without parameters
                        $generatedUrl = route($routeName);
                    }
                    
                    // Check if the generated URL matches expected pattern
                    $baseUrl = config('app.url');
                    $expectedUrl = $baseUrl . '/' . str_replace('.', '/', $expectedPath);
                    
                    if ($generatedUrl === $expectedUrl || 
                        str_contains($generatedUrl, str_replace('.', '/', $expectedPath))) {
                        $this->info("  ✓ {$routeName}: {$generatedUrl}");
                        $workingRoutes++;
                    } else {
                        $this->warn("  ? {$routeName}: {$generatedUrl} (unexpected pattern)");
                        $routeIssues[] = [
                            'module' => $moduleName,
                            'route' => $routeName,
                            'generated' => $generatedUrl,
                            'expected_pattern' => $expectedPath,
                            'issue' => 'Unexpected URL pattern'
                        ];
                        $workingRoutes++; // Still working, just different pattern
                    }
                    
                } catch (\Exception $e) {
                    $this->error("  ✗ {$routeName}: " . $e->getMessage());
                    $routeIssues[] = [
                        'module' => $moduleName,
                        'route' => $routeName,
                        'generated' => null,
                        'expected_pattern' => $expectedPath,
                        'issue' => $e->getMessage()
                    ];
                    $brokenRoutes++;
                }
            }
        }
        
        // Summary
        $this->info('');
        $this->info('SUMMARY:');
        $this->info('=====================================');
        $this->info("Total routes tested: {$totalRoutes}");
        $this->info("Working routes: {$workingRoutes}");
        $this->info("Broken routes: {$brokenRoutes}");
        
        if (!empty($routeIssues)) {
            $this->info('');
            $this->error('ROUTE ISSUES FOUND:');
            $this->info('=====================================');
            
            foreach ($routeIssues as $issue) {
                $this->error("Module: {$issue['module']}");
                $this->error("Route: {$issue['route']}");
                $this->error("Issue: {$issue['issue']}");
                if ($issue['generated']) {
                    $this->error("Generated: {$issue['generated']}");
                }
                $this->error("Expected pattern: {$issue['expected_pattern']}");
                $this->info('---');
            }
        }
        
        if ($brokenRoutes === 0) {
            $this->info('');
            $this->info('🎉 All tested routes are working!');
        } else {
            $this->info('');
            $this->warn("⚠️  {$brokenRoutes} routes need attention.");
        }
        
        // Test CrudButtons compatibility
        $this->info('');
        $this->info('Testing CrudButtons compatibility...');
        $this->info('=====================================');
        
        $crudButtonsTestRoutes = [
            'users' => 'users',
            'employees' => 'hr/employees', 
            'timesheets' => 'hr/timesheets',
            'leaves' => 'hr/leaves',
            'customers' => 'customers',
            'equipment' => 'equipment',
            'rentals' => 'rentals',
            'projects' => 'projects',
        ];
        
        foreach ($crudButtonsTestRoutes as $resourceType => $expectedPrefix) {
            try {
                $showUrl = route("{$resourceType}.show", 1);
                $editUrl = route("{$resourceType}.edit", 1);
                
                $this->info("  {$resourceType}:");
                $this->info("    Show: {$showUrl}");
                $this->info("    Edit: {$editUrl}");
                
                // Check if CrudButtons would generate correct URLs
                if (str_contains($showUrl, $expectedPrefix) && str_contains($editUrl, $expectedPrefix)) {
                    $this->info("    ✓ CrudButtons compatible");
                } else {
                    $this->warn("    ? CrudButtons may have issues");
                }
                
            } catch (\Exception $e) {
                $this->error("  ✗ {$resourceType}: " . $e->getMessage());
            }
        }
        
        $this->info('');
        $this->info('Route testing completed!');
    }
}
