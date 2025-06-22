<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use App\Models\User;

class TestTimesheetRoutes extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:timesheet-routes';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test timesheet routes accessibility';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Testing Timesheet Routes...');
        
        $baseUrl = config('app.url');
        
        // Test routes that should exist
        $routes = [
            'GET /hr/timesheets' => 'hr/timesheets',
            'GET /hr/timesheets/create' => 'hr/timesheets/create',
            'GET /hr/timesheets/1' => 'hr/timesheets/1',
            'GET /hr/timesheets/1/edit' => 'hr/timesheets/1/edit',
        ];
        
        $this->info('Testing route accessibility (expecting redirects for auth)...');
        
        foreach ($routes as $description => $path) {
            try {
                $response = Http::timeout(5)->get($baseUrl . '/' . $path);
                $status = $response->status();
                
                if ($status === 302) {
                    $this->info("✓ {$description}: {$status} (Redirect - Expected for auth)");
                } elseif ($status === 200) {
                    $this->info("✓ {$description}: {$status} (OK)");
                } elseif ($status === 404) {
                    $this->error("✗ {$description}: {$status} (Not Found)");
                } else {
                    $this->warn("? {$description}: {$status}");
                }
            } catch (\Exception $e) {
                $this->error("✗ {$description}: Error - " . $e->getMessage());
            }
        }
        
        // Test Laravel route helper
        $this->info('');
        $this->info('Testing Laravel route helper...');
        
        try {
            $indexRoute = route('timesheets.index');
            $this->info("✓ timesheets.index: {$indexRoute}");
        } catch (\Exception $e) {
            $this->error("✗ timesheets.index: " . $e->getMessage());
        }
        
        try {
            $showRoute = route('timesheets.show', 1);
            $this->info("✓ timesheets.show: {$showRoute}");
        } catch (\Exception $e) {
            $this->error("✗ timesheets.show: " . $e->getMessage());
        }
        
        try {
            $editRoute = route('timesheets.edit', 1);
            $this->info("✓ timesheets.edit: {$editRoute}");
        } catch (\Exception $e) {
            $this->error("✗ timesheets.edit: " . $e->getMessage());
        }
        
        try {
            $createRoute = route('timesheets.create');
            $this->info("✓ timesheets.create: {$createRoute}");
        } catch (\Exception $e) {
            $this->error("✗ timesheets.create: " . $e->getMessage());
        }
        
        $this->info('');
        $this->info('Route testing completed!');
    }
}
