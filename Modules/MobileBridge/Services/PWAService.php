<?php

namespace Modules\MobileBridge\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Modules\Core\Services\NotificationService;

class PWAService
{
    protected NotificationService $notificationService;
    protected array $config;
    
    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
        $this->config = config('mobileBridge.pwa');
    }

    /**
     * Generate the service worker script
     */
    public function generateServiceWorker(): string
    {
        $cacheVersion = $this->config['cache_version'] ?? '1.0.0';
        $cacheName = "pwa-cache-v{$cacheVersion}";
        
        $assets = $this->getAssetsList();
        $routes = $this->getCacheableRoutes();
        
        return view('mobileBridge::serviceWorker', [
            'cacheName' => $cacheName,
            'assets' => $assets,
            'routes' => $routes,
            'offlineRoute' => $this->config['offline_route'] ?? '/offline',
            'cacheStrategy' => $this->config['cache_strategy'] ?? 'network-first',
        ])->render();
    }

    /**
     * Generate the manifest file
     */
    public function generateManifest(): array
    {
        return [
            'name' => config('app.name'),
            'short_name' => config('app.short_name', config('app.name')),
            'start_url' => '/',
            'display' => 'standalone',
            'background_color' => '#ffffff',
            'theme_color' => '#000000',
            'icons' => $this->getManifestIcons(),
            'orientation' => 'portrait',
            'scope' => '/',
            'prefer_related_applications' => false,
            'shortcuts' => $this->getAppShortcuts(),
        ];
    }

    /**
     * Get the list of assets to cache
     */
    protected function getAssetsList(): array
    {
        $assets = [];
        
        // Add CSS files
        $assets = array_merge($assets, glob(public_path('css/*.css')));
        
        // Add JS files
        $assets = array_merge($assets, glob(public_path('js/*.js')));
        
        // Add image files
        $assets = array_merge($assets, 
            glob(public_path('images/*.{jpg,jpeg,png,gif,svg,webp}'), GLOB_BRACE)
        );
        
        // Add font files
        $assets = array_merge($assets, 
            glob(public_path('fonts/*.{woff,woff2,ttf,eot}'), GLOB_BRACE)
        );
        
        // Make paths relative to public directory
        return array_map(function ($path) {
            return str_replace(public_path(), '', $path);
        }, $assets);
    }

    /**
     * Get the list of routes that should be cached
     */
    protected function getCacheableRoutes(): array
    {
        return $this->config['cacheable_routes'] ?? [
            '/',
            '/login',
            '/offline',
            '/dashboard',
        ];
    }

    /**
     * Get the manifest icons configuration
     */
    protected function getManifestIcons(): array
    {
        return [
            [
                'src' => '/images/icons/icon-72x72.png',
                'sizes' => '72x72',
                'type' => 'image/png',
                'purpose' => 'any maskable',
            ],
            [
                'src' => '/images/icons/icon-96x96.png',
                'sizes' => '96x96',
                'type' => 'image/png',
                'purpose' => 'any maskable',
            ],
            [
                'src' => '/images/icons/icon-128x128.png',
                'sizes' => '128x128',
                'type' => 'image/png',
                'purpose' => 'any maskable',
            ],
            [
                'src' => '/images/icons/icon-144x144.png',
                'sizes' => '144x144',
                'type' => 'image/png',
                'purpose' => 'any maskable',
            ],
            [
                'src' => '/images/icons/icon-152x152.png',
                'sizes' => '152x152',
                'type' => 'image/png',
                'purpose' => 'any maskable',
            ],
            [
                'src' => '/images/icons/icon-192x192.png',
                'sizes' => '192x192',
                'type' => 'image/png',
                'purpose' => 'any maskable',
            ],
            [
                'src' => '/images/icons/icon-384x384.png',
                'sizes' => '384x384',
                'type' => 'image/png',
                'purpose' => 'any maskable',
            ],
            [
                'src' => '/images/icons/icon-512x512.png',
                'sizes' => '512x512',
                'type' => 'image/png',
                'purpose' => 'any maskable',
            ],
        ];
    }

    /**
     * Get the app shortcuts configuration
     */
    protected function getAppShortcuts(): array
    {
        return [
            [
                'name' => 'Dashboard',
                'short_name' => 'Dashboard',
                'description' => 'View your dashboard',
                'url' => '/dashboard',
                'icons' => [
                    [
                        'src' => '/images/icons/dashboard.png',
                        'sizes' => '96x96',
                        'type' => 'image/png',
                    ],
                ],
            ],
            [
                'name' => 'Profile',
                'short_name' => 'Profile',
                'description' => 'View your profile',
                'url' => '/profile',
                'icons' => [
                    [
                        'src' => '/images/icons/profile.png',
                        'sizes' => '96x96',
                        'type' => 'image/png',
                    ],
                ],
            ],
        ];
    }

    /**
     * Register a push notification subscription
     */
    public function registerPushSubscription(string $endpoint, array $keys, int $userId): void
    {
        $subscription = [
            'endpoint' => $endpoint,
            'keys' => $keys,
            'user_id' => $userId,
            'created_at' => now(),
        ];

        Cache::tags(['push-subscriptions'])->forever(
            "push-sub-" . Str::random(40),
            $subscription
        );
    }

    /**
     * Send a push notification
     */
    public function sendPushNotification(int $userId, string $title, string $body, array $data = []): void
    {
        $subscriptions = Cache::tags(['push-subscriptions'])->get('push-sub-*', []);
        
        foreach ($subscriptions as $subscription) {
            if ($subscription['user_id'] === $userId) {
                $this->notificationService->sendWebPushNotification(
                    $subscription['endpoint'],
                    $subscription['keys'],
                    $title,
                    $body,
                    $data
                );
            }
        }
    }

    /**
     * Check if the app shell needs to be updated
     */
    public function checkAppShellUpdate(): bool
    {
        $currentVersion = Cache::get('app-shell-version');
        $latestVersion = $this->getLatestAppShellVersion();
        
        return $currentVersion !== $latestVersion;
    }

    /**
     * Get the latest app shell version
     */
    protected function getLatestAppShellVersion(): string
    {
        // This could be based on git commit hash, timestamp, or other versioning strategy
        return md5(json_encode([
            'assets' => $this->getAssetsList(),
            'routes' => $this->getCacheableRoutes(),
            'manifest' => $this->generateManifest(),
        ]));
    }

    /**
     * Update the app shell cache
     */
    public function updateAppShell(): void
    {
        $version = $this->getLatestAppShellVersion();
        
        // Update service worker
        File::put(
            public_path('sw.js'),
            $this->generateServiceWorker()
        );
        
        // Update manifest
        File::put(
            public_path('manifest.json'),
            json_encode($this->generateManifest(), JSON_PRETTY_PRINT)
        );
        
        Cache::forever('app-shell-version', $version);
    }

    /**
     * Get the offline page content
     */
    public function getOfflinePage(): string
    {
        return view('mobileBridge::offline')->render();
    }

    /**
     * Check if the request is from a PWA
     */
    public function isPWA(): bool
    {
        return request()->header('X-PWA') === 'true' || 
            request()->header('Display-Mode') === 'standalone';
    }

    /**
     * Get the PWA status information
     */
    public function getPWAStatus(): array
    {
        return [
            'installed' => $this->isPWA(),
            'serviceWorkerRegistered' => $this->isServiceWorkerRegistered(),
            'pushNotificationsEnabled' => $this->arePushNotificationsEnabled(),
            'offlineCapable' => $this->isOfflineCapable(),
            'appShellVersion' => Cache::get('app-shell-version'),
            'lastUpdate' => Cache::get('app-shell-last-update'),
        ];
    }

    /**
     * Check if service worker is registered
     */
    protected function isServiceWorkerRegistered(): bool
    {
        return File::exists(public_path('sw.js'));
    }

    /**
     * Check if push notifications are enabled
     */
    protected function arePushNotificationsEnabled(): bool
    {
        return config('mobileBridge.pwa.push_notifications_enabled', false);
    }

    /**
     * Check if offline capability is available
     */
    protected function isOfflineCapable(): bool
    {
        return $this->isServiceWorkerRegistered() && 
            File::exists(public_path('offline.html'));
    }
} 