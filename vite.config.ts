import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            ssr: 'resources/js/ssr.tsx',
            refresh: true,
        }),
        react(),
        tailwindcss(),
    ],
    esbuild: {
        jsx: 'automatic',
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, './resources/js'),
            '@/Core': resolve(__dirname, './Modules/Core/resources/js'),
            '@/Core/components': resolve(__dirname, './Modules/Core/resources/js/components'),
            '@/Core/components/ui': resolve(__dirname, './Modules/Core/resources/js/components/ui'),
            '@/Core/layouts': resolve(__dirname, './Modules/Core/resources/js/layouts'),
            '@/Core/layouts/AppLayout': resolve(__dirname, './Modules/Core/resources/js/layouts/AppLayout'),
            '@/Core/layouts/AuthenticatedLayout': resolve(__dirname, './Modules/Core/resources/js/layouts/AuthenticatedLayout'),
            '@/Core/layouts/GuestLayout': resolve(__dirname, './Modules/Core/resources/js/layouts/GuestLayout'),
            '@/Core/layouts/auth-layout': resolve(__dirname, './Modules/Core/resources/js/layouts/auth-layout'),
            'ziggy-js': resolve(__dirname, './vendor/tightenco/ziggy')
        },
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.json']
    },
    optimizeDeps: {
        include: [
            '@/Core/components',
            '@/Core/components/ui',
            '@/Core/layouts'
        ]
    }
});
