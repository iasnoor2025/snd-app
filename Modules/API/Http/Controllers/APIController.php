<?php

namespace Modules\API\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;

class APIController extends Controller
{
    /**
     * Display the API dashboard.
     *
     * @return \Inertia\Response;
     */
    public function index()
    {
        return Inertia::render('API/Index', [
            'apiVersion' => config('api.version'),
            'apiDescription' => config('api.description'),
        ]);
    }

    /**
     * Display the API documentation.
     *
     * @return \Inertia\Response;
     */
    public function documentation()
    {
        return Inertia::render('API/Documentation', [
            'apiVersion' => config('api.version'),
            'apiVersions' => config('api.versioning.supported'),
            'defaultVersion' => config('api.versioning.default'),
        ]);
    }

    /**
     * Display API statistics.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function stats()
    {
        $stats = $this->getApiStatistics();
        return response()->json($stats);
    }

    /**
     * Get usage statistics.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function usageStats()
    {
        $usageStats = [
            'daily' => $this->getDailyUsageStats(),
            'hourly' => $this->getHourlyUsageStats(),
        ];

        return response()->json($usageStats);
    }

    /**
     * Get endpoint statistics.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function endpointStats()
    {
        $endpointStats = $this->getEndpointStatistics();
        return response()->json($endpointStats);
    }

    /**
     * Export statistics.
     *
     * @return \Illuminate\Http\Response
     */
    public function exportStats()
    {
        $stats = $this->getEndpointStatistics();
        
        $csvData = "Endpoint,Requests,Average Response Time,Success Rate\n";
        foreach ($stats as $stat) {
            $csvData .= "{$stat['endpoint']},{$stat['requests']},{$stat['avg_time']},{$stat['success_rate']}%\n";
        }

        return response($csvData)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', 'attachment; filename="api-stats-' . date('Y-m-d') . '.csv"');
    }

    /**
     * Display API settings.
     *
     * @return \Inertia\Response;
     */
    public function settings()
    {
        $settings = [
            'rate_limit_per_minute' => config('api.throttle.per_minute', 60),
            'rate_limit_per_hour' => config('api.throttle.per_hour', 1000),
            'token_expiration_days' => config('api.token_expiration_minutes', 1440) / 1440,
            'enable_cors' => config('cors.paths', []) !== [],
            'enable_documentation' => config('api.documentation.enabled', true),
            'log_requests' => config('api.logging.enabled', true),
        ];

        return Inertia::render('API/Settings', [
            'settings' => $settings,
        ]);
    }

    /**
     * Update API settings.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function updateSettings(Request $request)
    {
        $request->validate([
            'rate_limit_per_minute' => 'required|integer|min:1|max:1000',
            'rate_limit_per_hour' => 'required|integer|min:1|max:10000',
            'token_expiration_days' => 'required|integer|min:1|max:365',
            'enable_cors' => 'boolean',
            'enable_documentation' => 'boolean',
            'log_requests' => 'boolean',
        ]);

        // Update configuration in cache (in production, this would update config files)
        Cache::put('api.settings.rate_limit_per_minute', $request->rate_limit_per_minute, 3600);
        Cache::put('api.settings.rate_limit_per_hour', $request->rate_limit_per_hour, 3600);
        Cache::put('api.settings.token_expiration_days', $request->token_expiration_days, 3600);
        Cache::put('api.settings.enable_cors', $request->boolean('enable_cors'), 3600);
        Cache::put('api.settings.enable_documentation', $request->boolean('enable_documentation'), 3600);
        Cache::put('api.settings.log_requests', $request->boolean('log_requests'), 3600);

        return redirect()->back()->with('message', 'API settings updated successfully.');
    }

    /**
     * Display rate limits.
     *
     * @return \Inertia\Response;
     */
    public function rateLimits()
    {
        $rateLimits = [
            'global' => [
                'per_minute' => Cache::get('api.settings.rate_limit_per_minute', 60),
                'per_hour' => Cache::get('api.settings.rate_limit_per_hour', 1000),
                'per_day' => Cache::get('api.settings.rate_limit_per_day', 10000),
            ],
            'per_user' => [
                'per_minute' => 30,
                'per_hour' => 500,
                'per_day' => 5000,
            ],
            'per_endpoint' => $this->getEndpointRateLimits(),
        ];

        return Inertia::render('API/RateLimits', [
            'rateLimits' => $rateLimits,
        ]);
    }

    /**
     * Update rate limits.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function updateRateLimits(Request $request)
    {
        $request->validate([
            'global.per_minute' => 'required|integer|min:1',
            'global.per_hour' => 'required|integer|min:1',
            'global.per_day' => 'required|integer|min:1',
            'per_user.per_minute' => 'required|integer|min:1',
            'per_user.per_hour' => 'required|integer|min:1',
            'per_user.per_day' => 'required|integer|min:1',
        ]);

        // Update rate limits in cache
        Cache::put('api.rate_limits.global', $request->input('global'), 3600);
        Cache::put('api.rate_limits.per_user', $request->input('per_user'), 3600);

        return redirect()->back()->with('message', 'Rate limits updated successfully.');
    }

    /**
     * Get API statistics from various sources.
     *
     * @return array
     */
    private function getApiStatistics(): array
    {
        // Get statistics from different modules
        $totalRequests = $this->getTotalApiRequests();
        $todayRequests = $this->getTodayApiRequests();
        $activeTokens = $this->getActiveTokensCount();
        $endpointsUsed = $this->getUniqueEndpointsCount();
        $avgResponseTime = $this->getAverageResponseTime();
        $errorRate = $this->getErrorRate();

        return [
            'total_requests' => $totalRequests,
            'requests_today' => $todayRequests,
            'active_tokens' => $activeTokens,
            'endpoints_used' => $endpointsUsed,
            'avg_response_time' => $avgResponseTime,
            'error_rate' => $errorRate,
            'last_updated' => now()->toISOString(),
        ];
    }

    /**
     * Get daily usage statistics for the last 7 days.
     *
     * @return array
     */
    private function getDailyUsageStats(): array
    {
        $stats = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i);
            $stats[] = [
                'date' => $date->format('Y-m-d'),
                'requests' => $this->getRequestsForDate($date),
            ];
        }
        return $stats;
    }

    /**
     * Get hourly usage statistics for today.
     *
     * @return array
     */
    private function getHourlyUsageStats(): array
    {
        $stats = [];
        for ($hour = 0; $hour < 24; $hour++) {
            $stats[] = [
                'hour' => sprintf('%02d:00', $hour),
                'requests' => $this->getRequestsForHour($hour),
            ];
        }
        return $stats;
    }

    /**
     * Get endpoint statistics.
     *
     * @return array
     */
    private function getEndpointStatistics(): array
    {
        // This would typically query from API logs or metrics storage
        return [
            ['endpoint' => '/api/employees', 'requests' => 450, 'avg_time' => 95, 'success_rate' => 98.5],
            ['endpoint' => '/api/customers', 'requests' => 380, 'avg_time' => 85, 'success_rate' => 99.2],
            ['endpoint' => '/api/equipment', 'requests' => 320, 'avg_time' => 110, 'success_rate' => 97.8],
            ['endpoint' => '/api/rentals', 'requests' => 290, 'avg_time' => 130, 'success_rate' => 98.9],
            ['endpoint' => '/api/projects', 'requests' => 250, 'avg_time' => 140, 'success_rate' => 97.5],
            ['endpoint' => '/api/timesheets', 'requests' => 220, 'avg_time' => 120, 'success_rate' => 99.1],
            ['endpoint' => '/api/leaves', 'requests' => 180, 'avg_time' => 90, 'success_rate' => 99.5],
            ['endpoint' => '/api/payroll', 'requests' => 150, 'avg_time' => 180, 'success_rate' => 98.7],
        ];
    }

    /**
     * Get endpoint-specific rate limits.
     *
     * @return array
     */
    private function getEndpointRateLimits(): array
    {
        return [
            '/api/employees' => ['per_minute' => 100],
            '/api/customers' => ['per_minute' => 100],
            '/api/equipment' => ['per_minute' => 75],
            '/api/rentals' => ['per_minute' => 50],
            '/api/projects' => ['per_minute' => 75],
            '/api/timesheets' => ['per_minute' => 100],
            '/api/leaves' => ['per_minute' => 50],
            '/api/payroll' => ['per_minute' => 25],
        ];
    }

    // Helper methods for statistics calculation
    private function getTotalApiRequests(): int
    {
        // In production, this would query from API logs or metrics database
        return Cache::remember('api.stats.total_requests', 300, function () {
            return rand(1000, 5000); // Placeholder - replace with actual query
        });
    }

    private function getTodayApiRequests(): int
    {
        return Cache::remember('api.stats.today_requests', 60, function () {
            return rand(50, 200); // Placeholder - replace with actual query
        });
    }

    private function getActiveTokensCount(): int
    {
        // Query actual personal access tokens
        return DB::table('personal_access_tokens')
            ->whereNull('expires_at')
            ->orWhere('expires_at', '>', now())
            ->count();
    }

    private function getUniqueEndpointsCount(): int
    {
        return Cache::remember('api.stats.unique_endpoints', 300, function () {
            return 12; // Number of unique API endpoints
        });
    }

    private function getAverageResponseTime(): int
    {
        return Cache::remember('api.stats.avg_response_time', 300, function () {
            return rand(80, 150); // Placeholder - replace with actual metrics
        });
    }

    private function getErrorRate(): float
    {
        return Cache::remember('api.stats.error_rate', 300, function () {
            return round(rand(1, 5) + (rand(0, 9) / 10), 1); // Placeholder
        });
    }

    private function getRequestsForDate(Carbon $date): int
    {
        return Cache::remember("api.stats.requests.{$date->format('Y-m-d')}", 3600, function () {
            return rand(80, 250); // Placeholder - replace with actual query
        });
    }

    private function getRequestsForHour(int $hour): int
    {
        return Cache::remember("api.stats.requests.hour.{$hour}", 300, function () use ($hour) {
            // Simulate realistic usage patterns (lower at night, higher during work hours)
            if ($hour >= 9 && $hour <= 17) {
                return rand(15, 35);
            } elseif ($hour >= 18 && $hour <= 22) {
                return rand(5, 15);
            } else {
                return rand(0, 5);
            }
        });
    }
}


