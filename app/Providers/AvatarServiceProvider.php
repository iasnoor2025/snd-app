<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Laravolt\Avatar\Avatar;
use Illuminate\Support\Facades\Config;

class AvatarServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        $this->app->singleton('laravolt.avatar', function () {
            return new Avatar(Config::get('laravolt.avatar'));
        });
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        $this->publishes([
            __DIR__.'/../../vendor/laravolt/avatar/config/config.php' => config_path('laravolt/avatar.php'),
        ], 'laravolt-avatar-config');

        // Set default configuration
        $this->mergeConfigFrom(
            __DIR__.'/../../vendor/laravolt/avatar/config/config.php', 'laravolt.avatar'
        );

        // Customize default configuration
        Config::set('laravolt.avatar.driver', 'gd'); // Use GD library
        Config::set('laravolt.avatar.theme', 'colorful'); // Use colorful theme
        Config::set('laravolt.avatar.shape', 'circle'); // Use circle shape
        Config::set('laravolt.avatar.width', 100); // Default width
        Config::set('laravolt.avatar.height', 100); // Default height
        Config::set('laravolt.avatar.chars', 2); // Use 2 characters for initials
        Config::set('laravolt.avatar.fontSize', 48); // Font size
        Config::set('laravolt.avatar.fontFamily', null); // Use default font
        Config::set('laravolt.avatar.foregrounds', [
            '#FFFFFF'
        ]);
        Config::set('laravolt.avatar.backgrounds', [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
            '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
            '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D2B4DE'
        ]);
        Config::set('laravolt.avatar.border.size', 0); // No border
        Config::set('laravolt.avatar.border.color', 'background'); // Border color same as background
    }
}
