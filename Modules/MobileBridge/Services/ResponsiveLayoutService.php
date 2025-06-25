<?php

namespace Modules\MobileBridge\Services;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Jenssegers\Agent\Agent;
use Modules\Core\Services\ImageService;

class ResponsiveLayoutService
{
    protected Agent $agent;
    protected ImageService $imageService;
    protected array $config;
    
    public function __construct(Agent $agent, ImageService $imageService)
    {
        $this->agent = $agent;
        $this->imageService = $imageService;
        $this->config = config('mobileBridge.responsive');
    }

    /**
     * Get device-specific layout configuration
     */
    public function getLayoutConfig(): array
    {
        $device = $this->detectDevice();
        $orientation = $this->detectOrientation();
        
        return [
            'device' => $device,
            'orientation' => $orientation,
            'breakpoints' => $this->getBreakpoints($device),
            'navigation' => $this->getNavigationConfig($device),
            'gestures' => $this->getGestureConfig($device),
            'imageOptimization' => $this->getImageOptimizationConfig($device),
            'touchTargets' => $this->getTouchTargetConfig($device),
            'fontSizes' => $this->getFontSizeConfig($device),
            'spacing' => $this->getSpacingConfig($device),
        ];
    }

    /**
     * Detect the current device type
     */
    public function detectDevice(): string
    {
        if ($this->agent->isTablet()) {
            return 'tablet';
        }
        
        if ($this->agent->isMobile()) {
            return 'mobile';
        }
        
        return 'desktop';
    }

    /**
     * Detect the current device orientation
     */
    public function detectOrientation(): string
    {
        return $this->agent->isTablet() || $this->agent->isMobile()
            ? (request()->header('X-Device-Orientation', 'portrait'))
            : 'landscape';
    }

    /**
     * Get breakpoints for the current device
     */
    protected function getBreakpoints(string $device): array
    {
        return match($device) {
            'mobile' => [
                'xs' => '320px',
                'sm' => '375px',
                'md' => '425px',
                'lg' => '768px',
            ],
            'tablet' => [
                'sm' => '768px',
                'md' => '1024px',
                'lg' => '1280px',
            ],
            default => [
                'sm' => '1024px',
                'md' => '1280px',
                'lg' => '1440px',
                'xl' => '1920px',
            ],
        };
    }

    /**
     * Get navigation configuration for the current device
     */
    protected function getNavigationConfig(string $device): array
    {
        return match($device) {
            'mobile' => [
                'type' => 'bottom-nav',
                'collapsible' => true,
                'showLabels' => false,
                'maxItems' => 5,
                'swipeable' => true,
            ],
            'tablet' => [
                'type' => 'side-nav',
                'collapsible' => true,
                'showLabels' => true,
                'maxItems' => 8,
                'swipeable' => true,
            ],
            default => [
                'type' => 'side-nav',
                'collapsible' => false,
                'showLabels' => true,
                'maxItems' => 12,
                'swipeable' => false,
            ],
        };
    }

    /**
     * Get gesture configuration for the current device
     */
    protected function getGestureConfig(string $device): array
    {
        $baseGestures = [
            'tap' => true,
            'doubleTap' => true,
            'longPress' => true,
        ];

        if ($device === 'desktop') {
            return $baseGestures;
        }

        return array_merge($baseGestures, [
            'swipe' => true,
            'pinch' => true,
            'rotate' => true,
            'pan' => true,
            'edgeSwipe' => true,
        ]);
    }

    /**
     * Get image optimization configuration for the current device
     */
    protected function getImageOptimizationConfig(string $device): array
    {
        return match($device) {
            'mobile' => [
                'quality' => 70,
                'maxWidth' => 768,
                'formats' => ['webp', 'jpeg'],
                'lazyLoad' => true,
                'placeholder' => 'blur',
            ],
            'tablet' => [
                'quality' => 80,
                'maxWidth' => 1280,
                'formats' => ['webp', 'jpeg'],
                'lazyLoad' => true,
                'placeholder' => 'blur',
            ],
            default => [
                'quality' => 90,
                'maxWidth' => 1920,
                'formats' => ['webp', 'jpeg', 'png'],
                'lazyLoad' => true,
                'placeholder' => 'blur',
            ],
        };
    }

    /**
     * Get touch target configuration for the current device
     */
    protected function getTouchTargetConfig(string $device): array
    {
        return match($device) {
            'mobile' => [
                'minSize' => '44px',
                'spacing' => '8px',
                'feedback' => true,
                'highlightColor' => 'rgba(0, 0, 0, 0.1)',
            ],
            'tablet' => [
                'minSize' => '40px',
                'spacing' => '8px',
                'feedback' => true,
                'highlightColor' => 'rgba(0, 0, 0, 0.1)',
            ],
            default => [
                'minSize' => '32px',
                'spacing' => '4px',
                'feedback' => false,
                'highlightColor' => 'transparent',
            ],
        };
    }

    /**
     * Get font size configuration for the current device
     */
    protected function getFontSizeConfig(string $device): array
    {
        return match($device) {
            'mobile' => [
                'base' => '16px',
                'scale' => 1.2,
                'lineHeight' => 1.5,
                'minSize' => '12px',
                'maxSize' => '24px',
            ],
            'tablet' => [
                'base' => '16px',
                'scale' => 1.25,
                'lineHeight' => 1.5,
                'minSize' => '12px',
                'maxSize' => '32px',
            ],
            default => [
                'base' => '16px',
                'scale' => 1.333,
                'lineHeight' => 1.5,
                'minSize' => '12px',
                'maxSize' => '48px',
            ],
        };
    }

    /**
     * Get spacing configuration for the current device
     */
    protected function getSpacingConfig(string $device): array
    {
        return match($device) {
            'mobile' => [
                'base' => '16px',
                'scale' => 1.5,
                'levels' => 5,
                'minSpace' => '4px',
                'maxSpace' => '32px',
            ],
            'tablet' => [
                'base' => '16px',
                'scale' => 1.5,
                'levels' => 6,
                'minSpace' => '4px',
                'maxSpace' => '48px',
            ],
            default => [
                'base' => '16px',
                'scale' => 1.5,
                'levels' => 7,
                'minSpace' => '4px',
                'maxSpace' => '64px',
            ],
        };
    }

    /**
     * Optimize an image for the current device
     */
    public function optimizeImage(string $path, array $options = []): string
    {
        $device = $this->detectDevice();
        $config = $this->getImageOptimizationConfig($device);
        
        $defaultOptions = [
            'quality' => $config['quality'],
            'width' => $config['maxWidth'],
            'format' => $config['formats'][0],
        ];
        
        $options = array_merge($defaultOptions, $options);
        
        return $this->imageService->optimize($path, $options);
    }

    /**
     * Generate responsive image srcset
     */
    public function generateImageSrcset(string $path, array $options = []): array
    {
        $device = $this->detectDevice();
        $config = $this->getImageOptimizationConfig($device);
        
        $widths = match($device) {
            'mobile' => [320, 375, 425, 768],
            'tablet' => [768, 1024, 1280],
            default => [1024, 1280, 1440, 1920],
        };
        
        $srcset = [];
        foreach ($widths as $width) {
            $srcset[] = [
                'src' => $this->optimizeImage($path, ['width' => $width] + $options),
                'width' => $width,
            ];
        }
        
        return $srcset;
    }

    /**
     * Check if touch gestures are supported
     */
    public function supportsGestures(): bool
    {
        return $this->agent->isTablet() || $this->agent->isMobile();
    }

    /**
     * Get touch gesture configuration for an element
     */
    public function getGestureOptions(string $elementType): array
    {
        if (!$this->supportsGestures()) {
            return [];
        }

        return match($elementType) {
            'carousel' => [
                'swipe' => true,
                'momentum' => true,
                'resistance' => 0.8,
                'velocityThreshold' => 0.3,
            ],
            'modal' => [
                'swipe' => true,
                'direction' => 'vertical',
                'threshold' => 0.3,
                'velocity' => 0.3,
            ],
            'menu' => [
                'edge' => true,
                'threshold' => 20,
                'resistance' => 0.8,
                'velocity' => 0.3,
            ],
            default => [
                'tap' => true,
                'doubleTap' => false,
                'longPress' => false,
                'swipe' => false,
            ],
        };
    }

    /**
     * Get navigation menu type based on device and screen size
     */
    public function getNavigationType(): string
    {
        $device = $this->detectDevice();
        $width = request()->header('X-Device-Width', 1920);
        
        if ($device === 'mobile' || $width < 768) {
            return 'bottom';
        }
        
        if ($device === 'tablet' || $width < 1280) {
            return 'collapsible';
        }
        
        return 'expanded';
    }

    /**
     * Check if the layout needs to be recomputed
     */
    public function shouldRecomputeLayout(Request $request): bool
    {
        $cacheKey = 'layout-hash-' . $request->ip();
        $currentHash = $this->computeLayoutHash($request);
        $cachedHash = Cache::get($cacheKey);
        
        if ($currentHash !== $cachedHash) {
            Cache::put($cacheKey, $currentHash, now()->addMinutes(60));
            return true;
        }
        
        return false;
    }

    /**
     * Compute a hash of the current layout configuration
     */
    protected function computeLayoutHash(Request $request): string
    {
        return md5(json_encode([
            'device' => $this->detectDevice(),
            'orientation' => $this->detectOrientation(),
            'width' => $request->header('X-Device-Width'),
            'height' => $request->header('X-Device-Height'),
            'pixelRatio' => $request->header('X-Device-Pixel-Ratio'),
        ]));
    }
} 