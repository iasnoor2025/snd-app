<?php

namespace Modules\Core\Services;

use Illuminate\Support\Facades\Storage;
use Intervention\Image\Facades\Image;
use Illuminate\Support\Str;

class ImageService
{
    protected array $config;
    
    public function __construct()
    {
        $this->config = config('core.images');
    }

    /**
     * Optimize an image for web delivery
     */
    public function optimize(string $path, array $options = []): string
    {
        $defaultOptions = [
            'quality' => 80,
            'format' => 'webp',
            'width' => null,
            'height' => null,
            'blur' => null,
            'optimize' => true,
            'cache' => true,
        ];
        
        $options = array_merge($defaultOptions, $options);
        
        // Generate cache key
        $cacheKey = $this->generateCacheKey($path, $options);
        
        // Check cache
        if ($options['cache'] && Storage::exists($cacheKey)) {
            return Storage::url($cacheKey);
        }
        
        // Load image
        $image = Image::make(Storage::path($path));
        
        // Apply transformations
        $this->applyTransformations($image, $options);
        
        // Save optimized image
        $optimizedPath = $this->saveOptimizedImage($image, $cacheKey, $options);
        
        return Storage::url($optimizedPath);
    }

    /**
     * Generate a cache key for the optimized image
     */
    protected function generateCacheKey(string $path, array $options): string
    {
        $hash = md5(json_encode([
            'path' => $path,
            'options' => $options,
        ]));
        
        $extension = $options['format'] ?? pathinfo($path, PATHINFO_EXTENSION);
        
        return "cache/images/{$hash}.{$extension}";
    }

    /**
     * Apply image transformations
     */
    protected function applyTransformations($image, array $options): void
    {
        // Resize if dimensions provided
        if ($options['width'] || $options['height']) {
            $image->resize($options['width'], $options['height'], function ($constraint) {
                $constraint->aspectRatio();
                $constraint->upsize();
            });
        }
        
        // Apply blur if specified
        if ($options['blur']) {
            $image->blur($options['blur']);
        }
        
        // Optimize for web delivery
        if ($options['optimize']) {
            $image->optimize();
        }
    }

    /**
     * Save the optimized image
     */
    protected function saveOptimizedImage($image, string $path, array $options): string
    {
        $format = $options['format'];
        $quality = $options['quality'];
        
        Storage::makeDirectory(dirname($path));
        
        $image->save(
            Storage::path($path),
            $quality,
            $format
        );
        
        return $path;
    }

    /**
     * Generate a responsive image set
     */
    public function generateResponsiveSet(string $path, array $breakpoints, array $options = []): array
    {
        $images = [];
        
        foreach ($breakpoints as $breakpoint => $width) {
            $images[$breakpoint] = $this->optimize($path, array_merge($options, [
                'width' => $width,
            ]));
        }
        
        return $images;
    }

    /**
     * Generate an image placeholder
     */
    public function generatePlaceholder(string $path, string $type = 'blur'): string
    {
        switch ($type) {
            case 'blur':
                return $this->generateBlurPlaceholder($path);
            case 'color':
                return $this->generateColorPlaceholder($path);
            case 'svg':
                return $this->generateSvgPlaceholder($path);
            default:
                throw new \InvalidArgumentException("Unsupported placeholder type: {$type}");
        }
    }

    /**
     * Generate a blurred placeholder
     */
    protected function generateBlurPlaceholder(string $path): string
    {
        return $this->optimize($path, [
            'width' => 20,
            'blur' => 5,
            'quality' => 30,
            'format' => 'webp',
        ]);
    }

    /**
     * Generate a dominant color placeholder
     */
    protected function generateColorPlaceholder(string $path): string
    {
        $image = Image::make(Storage::path($path));
        $color = $image->pickColor(0, 0, 'hex');
        
        return $color;
    }

    /**
     * Generate an SVG placeholder
     */
    protected function generateSvgPlaceholder(string $path): string
    {
        $image = Image::make(Storage::path($path));
        $width = $image->width();
        $height = $image->height();
        
        return view('core::placeholders.image', [
            'width' => $width,
            'height' => $height,
            'color' => $this->generateColorPlaceholder($path),
        ])->render();
    }

    /**
     * Check if an image needs optimization
     */
    public function needsOptimization(string $path): bool
    {
        $image = Image::make(Storage::path($path));
        
        // Check file size
        if ($image->filesize() > $this->config['max_filesize']) {
            return true;
        }
        
        // Check dimensions
        if ($image->width() > $this->config['max_width'] ||
            $image->height() > $this->config['max_height']) {
            return true;
        }
        
        // Check format
        $format = $image->mime();
        if (!in_array($format, $this->config['allowed_formats'])) {
            return true;
        }
        
        return false;
    }

    /**
     * Get image information
     */
    public function getImageInfo(string $path): array
    {
        $image = Image::make(Storage::path($path));
        
        return [
            'width' => $image->width(),
            'height' => $image->height(),
            'ratio' => $image->width() / $image->height(),
            'format' => $image->mime(),
            'filesize' => $image->filesize(),
            'exif' => $image->exif(),
        ];
    }

    /**
     * Clean image cache
     */
    public function cleanCache(int $maxAge = 86400): void
    {
        $files = Storage::files('cache/images');
        
        foreach ($files as $file) {
            $lastModified = Storage::lastModified($file);
            
            if (time() - $lastModified > $maxAge) {
                Storage::delete($file);
            }
        }
    }
} 