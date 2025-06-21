import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [
        laravel({
            input: [
                'Modules/Reporting/resources/js/app.js',
                'Modules/Reporting/resources/css/app.css',
            ],
            refresh: true,
        }),
        react(),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, '../../resources/js'),
            '@components': path.resolve(__dirname, '../../resources/js/components'),
            '@layouts': path.resolve(__dirname, '../../resources/js/layouts'),
            '@pages': path.resolve(__dirname, '../../resources/js/pages'),
        },
    },
}); 