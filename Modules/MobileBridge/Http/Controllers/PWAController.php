<?php

namespace Modules\MobileBridge\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\View;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Modules\MobileBridge\Services\NotificationService;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class PWAController extends Controller
{
    protected $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    /**
     * Display the PWA management page
     */
    public function index(): InertiaResponse
    {
        $stats = $this->getPWAStats();

        return Inertia::render('PWA/Index', [
            'stats' => $stats
        ]);
    }

    /**
     * Get PWA statistics for the dashboard
     */
    private function getPWAStats(): array
    {
        try {
            // Get installation stats
            $totalUsers = \App\Models\User::count();
            $installedUsers = Cache::get('pwa_installed_users', 0);
            $installRate = $totalUsers > 0 ? round(($installedUsers / $totalUsers) * 100, 1) : 0;

            // Get active users (users who have accessed the app in the last 30 days)
            $activeUsers = \App\Models\User::where('last_login_at', '>=', now()->subDays(30))->count();

            // Get offline usage stats
            $offlineUsage = Cache::get('pwa_offline_usage_percentage', 15); // Default 15%

            // Get notification engagement
            $notificationStats = $this->notificationService->getOverallStats();
            $notificationEngagement = $notificationStats['click_rate'] ?? 0;

            return [
                'installRate' => $installRate,
                'activeUsers' => $activeUsers,
                'offlineUsage' => $offlineUsage,
                'notificationEngagement' => $notificationEngagement
            ];
        } catch (\Exception $e) {
            Log::error('Failed to get PWA stats: ' . $e->getMessage());

            return [
                'installRate' => 0,
                'activeUsers' => 0,
                'offlineUsage' => 0,
                'notificationEngagement' => 0
            ];
        }
    }

    /**
     * Serve the PWA manifest file
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function manifest()
    {
        $manifest = [
            'name' => config('app.name', 'SND Rental Management System'),
            'short_name' => config('mobilebridge.pwa.manifest.short_name', 'SND Rental'),
            'description' => 'Complete rental management solution with real-time tracking and analytics',
            'start_url' => '/',
            'display' => config('mobilebridge.pwa.manifest.display', 'standalone'),
            'background_color' => config('mobilebridge.pwa.manifest.background_color', '#ffffff'),
            'theme_color' => config('mobilebridge.pwa.manifest.theme_color', '#4A90E2'),
            'orientation' => 'portrait-primary',
            'scope' => '/',
            'lang' => app()->getLocale(),
            'dir' => 'ltr',
            'categories' => ['business', 'productivity', 'utilities'],
            'icons' => $this->getManifestIcons(),
            'shortcuts' => $this->getManifestShortcuts(),
            'screenshots' => $this->getManifestScreenshots(),
            'prefer_related_applications' => false,
            'edge_side_panel' => [
                'preferred_width' => 400
            ],
            'protocol_handlers' => [
                [
                    'protocol' => 'web+snd',
                    'url' => '/handle?type=%s'
                ]
            ]
        ];

        return response()->json($manifest)
            ->header('Content-Type', 'application/manifest+json')
            ->header('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
    }

    /**
     * Serve the service worker file
     *
     * @return \Illuminate\Http\Response
     */
    public function serviceWorker()
    {
        $serviceWorkerPath = public_path('sw.js');

        if (!file_exists($serviceWorkerPath)) {
            return response('Service worker not found', 404);
        }

        $content = file_get_contents($serviceWorkerPath);

        return response($content)
            ->header('Content-Type', 'application/javascript')
            ->header('Cache-Control', 'no-cache, no-store, must-revalidate')
            ->header('Service-Worker-Allowed', '/');
    }

    /**
     * Show the offline page
     *
     * @return \Illuminate\View\View
     */
    public function offline()
    {
        return view('offline');
    }

    /**
     * Handle PWA installation
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function install(Request $request)
    {
        try {
            // Log PWA installation
            Log::info('PWA installation initiated', [
                'user_agent' => $request->userAgent(),
                'ip' => $request->ip(),
                'timestamp' => now()
            ]);

            // You can add analytics tracking here
            $this->trackPWAInstallation($request);

            return response()->json([
                'success' => true,
                'message' => 'PWA installation tracked successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('PWA installation tracking failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to track PWA installation'
            ], 500);
        }
    }

    /**
     * Get PWA installation statistics
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function stats()
    {
        try {
            $stats = Cache::remember('pwa_stats', 3600, function () {
                return [
                    'total_installations' => $this->getTotalInstallations(),
                    'installations_today' => $this->getInstallationsToday(),
                    'installations_this_week' => $this->getInstallationsThisWeek(),
                    'installations_this_month' => $this->getInstallationsThisMonth(),
                    'top_devices' => $this->getTopDevices(),
                    'top_browsers' => $this->getTopBrowsers()
                ];
            });

            return response()->json($stats);
        } catch (\Exception $e) {
            Log::error('Failed to get PWA stats', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'error' => 'Failed to retrieve PWA statistics'
            ], 500);
        }
    }

    /**
     * Handle push notification subscription
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function subscribe(Request $request)
    {
        $request->validate([
            'endpoint' => 'required|url',
            'keys' => 'required|array',
            'keys.p256dh' => 'required|string',
            'keys.auth' => 'required|string'
        ]);

        try {
            // Store the subscription in database
            $subscription = $this->storePushSubscription($request);

            return response()->json([
                'success' => true,
                'message' => 'Push notification subscription saved successfully',
                'subscription_id' => $subscription->id ?? null
            ]);
        } catch (\Exception $e) {
            Log::error('Push subscription failed', [
                'error' => $e->getMessage(),
                'request_data' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to save push notification subscription'
            ], 500);
        }
    }

    /**
     * Handle push notification unsubscription
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function unsubscribe(Request $request)
    {
        $request->validate([
            'endpoint' => 'required|url'
        ]);

        try {
            $this->removePushSubscription($request->endpoint);

            return response()->json([
                'success' => true,
                'message' => 'Push notification subscription removed successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Push unsubscription failed', [
                'error' => $e->getMessage(),
                'endpoint' => $request->endpoint
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to remove push notification subscription'
            ], 500);
        }
    }

    /**
     * Get manifest icons configuration
     *
     * @return array
     */
    private function getManifestIcons()
    {
        $sizes = [72, 96, 128, 144, 152, 192, 384, 512];
        $icons = [];

        foreach ($sizes as $size) {
            $iconPath = "/images/icons/icon-{$size}x{$size}.png";

            if (file_exists(public_path($iconPath))) {
                $icons[] = [
                    'src' => $iconPath,
                    'sizes' => "{$size}x{$size}",
                    'type' => 'image/png',
                    'purpose' => 'maskable any'
                ];
            }
        }

        // Fallback icon if no icons exist
        if (empty($icons)) {
            $icons[] = [
                'src' => '/images/logo.png',
                'sizes' => '192x192',
                'type' => 'image/png',
                'purpose' => 'any'
            ];
        }

        return $icons;
    }

    /**
     * Get manifest shortcuts configuration
     *
     * @return array
     */
    private function getManifestShortcuts()
    {
        return [
            [
                'name' => 'Dashboard',
                'short_name' => 'Dashboard',
                'description' => 'View rental analytics and overview',
                'url' => '/dashboard',
                'icons' => [
                    [
                        'src' => '/images/icons/dashboard-96x96.png',
                        'sizes' => '96x96'
                    ]
                ]
            ],
            [
                'name' => 'Equipment',
                'short_name' => 'Equipment',
                'description' => 'Manage rental equipment',
                'url' => '/equipment',
                'icons' => [
                    [
                        'src' => '/images/icons/equipment-96x96.png',
                        'sizes' => '96x96'
                    ]
                ]
            ],
            [
                'name' => 'Rentals',
                'short_name' => 'Rentals',
                'description' => 'View and manage rentals',
                'url' => '/rentals',
                'icons' => [
                    [
                        'src' => '/images/icons/rentals-96x96.png',
                        'sizes' => '96x96'
                    ]
                ]
            ],
            [
                'name' => 'Customers',
                'short_name' => 'Customers',
                'description' => 'Manage customer accounts',
                'url' => '/customers',
                'icons' => [
                    [
                        'src' => '/images/icons/customers-96x96.png',
                        'sizes' => '96x96'
                    ]
                ]
            ]
        ];
    }

    /**
     * Get manifest screenshots configuration
     *
     * @return array
     */
    private function getManifestScreenshots()
    {
        $screenshots = [];

        $desktopScreenshot = '/images/screenshots/desktop-dashboard.png';
        $mobileScreenshot = '/images/screenshots/mobile-dashboard.png';

        if (file_exists(public_path($desktopScreenshot))) {
            $screenshots[] = [
                'src' => $desktopScreenshot,
                'sizes' => '1280x720',
                'type' => 'image/png',
                'form_factor' => 'wide',
                'label' => 'Dashboard view on desktop'
            ];
        }

        if (file_exists(public_path($mobileScreenshot))) {
            $screenshots[] = [
                'src' => $mobileScreenshot,
                'sizes' => '375x667',
                'type' => 'image/png',
                'form_factor' => 'narrow',
                'label' => 'Dashboard view on mobile'
            ];
        }

        return $screenshots;
    }

    /**
     * Track PWA installation
     *
     * @param Request $request
     * @return void
     */
    private function trackPWAInstallation(Request $request)
    {
        // Implementation would depend on your analytics/tracking system
        // This could store data in database, send to analytics service, etc.

        $installationData = [
            'user_agent' => $request->userAgent(),
            'ip_address' => $request->ip(),
            'timestamp' => now(),
            'referrer' => $request->header('referer'),
            'platform' => $this->detectPlatform($request->userAgent())
        ];

        // Store in cache for stats
        $key = 'pwa_installation_' . now()->format('Y-m-d');
        $installations = Cache::get($key, []);
        $installations[] = $installationData;
        Cache::put($key, $installations, now()->addDays(30));
    }

    /**
     * Store push notification subscription
     *
     * @param Request $request
     * @return mixed
     */
    private function storePushSubscription(Request $request)
    {
        // Implementation would depend on your database schema
        // This is a placeholder for the actual implementation

        return (object) ['id' => uniqid()];
    }

    /**
     * Remove push notification subscription
     *
     * @param string $endpoint
     * @return void
     */
    private function removePushSubscription(string $endpoint)
    {
        // Implementation would depend on your database schema
        // This is a placeholder for the actual implementation
    }

    /**
     * Detect platform from user agent
     *
     * @param string $userAgent
     * @return string
     */
    private function detectPlatform(string $userAgent)
    {
        if (strpos($userAgent, 'iPhone') !== false) {
            return 'iOS';
        } elseif (strpos($userAgent, 'Android') !== false) {
            return 'Android';
        } elseif (strpos($userAgent, 'Windows') !== false) {
            return 'Windows';
        } elseif (strpos($userAgent, 'Macintosh') !== false) {
            return 'macOS';
        } elseif (strpos($userAgent, 'Linux') !== false) {
            return 'Linux';
        }

        return 'Unknown';
    }

    /**
     * Get total PWA installations
     *
     * @return int
     */
    private function getTotalInstallations()
    {
        // Placeholder implementation
        return 0;
    }

    /**
     * Get PWA installations today
     *
     * @return int
     */
    private function getInstallationsToday()
    {
        $key = 'pwa_installation_' . now()->format('Y-m-d');
        $installations = Cache::get($key, []);
        return count($installations);
    }

    /**
     * Get PWA installations this week
     *
     * @return int
     */
    private function getInstallationsThisWeek()
    {
        // Placeholder implementation
        return 0;
    }

    /**
     * Get PWA installations this month
     *
     * @return int
     */
    private function getInstallationsThisMonth()
    {
        // Placeholder implementation
        return 0;
    }

    /**
     * Get top devices for PWA installations
     *
     * @return array
     */
    private function getTopDevices()
    {
        // Placeholder implementation
        return [];
    }

    /**
     * Get top browsers for PWA installations
     *
     * @return array
     */
    private function getTopBrowsers()
    {
        // Placeholder implementation
        return [];
    }
}
