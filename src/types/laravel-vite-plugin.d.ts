declare module 'laravel-vite-plugin' {
    import { Plugin } from 'vite';

    interface LaravelPluginOptions {
        input: string | string[];
        publicDirectory?: string;
        buildDirectory?: string;
        ssr?: string | boolean;
        refresh?: boolean | string[];
    }

    function laravel(options: LaravelPluginOptions): Plugin;
    export = laravel;
} 