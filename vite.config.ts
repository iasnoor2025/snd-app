import { defineConfig, ConfigEnv, UserConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { visualizer } from 'rollup-plugin-visualizer';
import path from 'path';
import compression from 'vite-plugin-compression';
import type { PreRenderedChunk, PreRenderedAsset } from 'rollup';

export default defineConfig(({ command, mode }: ConfigEnv): UserConfig => ({
    plugins: [
        laravel({
            input: [
                'resources/css/app.css',
                'resources/js/app.tsx',
                'Modules/Core/resources/js/app.tsx',
            ],
            ssr: 'resources/js/ssr.tsx',
            refresh: true,
            buildDirectory: 'build',
        }),
        react({
            babel: {
                plugins: [
                    ['@babel/plugin-transform-typescript', { isTSX: true }],
                ],
            },
        }),
        tailwindcss(),
        // Only include visualizer in analyze mode
        mode === 'analyze' && visualizer({
            filename: './stats.html',
            gzipSize: true,
            brotliSize: true,
            open: true,
        }),
        // Add both gzip and brotli compression in production
        command === 'build' && compression({
            algorithm: 'gzip',
            ext: '.gz',
            filter: /\.(js|css|html|svg)$/i,
            threshold: 1024,
        }),
        command === 'build' && compression({
            algorithm: 'brotli',
            ext: '.br',
            filter: /\.(js|css|html|svg)$/i,
            threshold: 1024,
        }),
    ].filter(Boolean),
    build: {
        target: 'esnext',
        outDir: 'public/build',
        assetsDir: 'assets',
        cssCodeSplit: true,
        modulePreload: true,
        cssMinify: true,
        cssTarget: 'esnext',
        dynamicImportVarsOptions: {
            warnOnError: true,
        },
        rollupOptions: {
            output: {
                manualChunks: (id: string) => {
                    // Vendor chunks
                    if (id.includes('node_modules')) {
                        if (id.includes('react') || id.includes('@inertiajs')) {
                            return 'vendor-react';
                        }
                        if (id.includes('@radix-ui')) {
                            return 'vendor-radix';
                        }
                        if (id.includes('tailwind') || id.includes('class-variance-authority')) {
                            return 'vendor-styling';
                        }
                        if (id.includes('lucide-react')) {
                            return 'vendor-icons';
                        }
                        if (id.includes('i18next') || id.includes('react-i18next')) {
                            return 'vendor-i18n';
                        }
                        // Group common utility libraries
                        if (id.includes('lodash') || id.includes('date-fns') || id.includes('uuid')) {
                            return 'vendor-utils';
                        }
                        // Group form-related libraries
                        if (id.includes('react-hook-form') || id.includes('zod') || id.includes('yup')) {
                            return 'vendor-forms';
                        }
                        return 'vendor-other';
                    }
                    
                    // Module chunks with more granular splitting
                    if (id.includes('Modules/Core')) {
                        if (id.includes('/components/ui/')) {
                            return 'core-ui';
                        }
                        if (id.includes('/services/')) {
                            return 'core-services';
                        }
                        if (id.includes('/utils/')) {
                            return 'core-utils';
                        }
                        return 'core';
                    }
                    if (id.includes('Modules/EmployeeManagement')) {
                        if (id.includes('/components/')) {
                            return 'employee-components';
                        }
                        if (id.includes('/services/')) {
                            return 'employee-services';
                        }
                        return 'employee';
                    }
                    if (id.includes('Modules/TimesheetManagement')) {
                        if (id.includes('/components/')) {
                            return 'timesheet-components';
                        }
                        if (id.includes('/services/')) {
                            return 'timesheet-services';
                        }
                        return 'timesheet';
                    }
                    if (id.includes('Modules/LeaveManagement')) {
                        if (id.includes('/components/')) {
                            return 'leave-components';
                        }
                        if (id.includes('/services/')) {
                            return 'leave-services';
                        }
                        return 'leave';
                    }
                    if (id.includes('Modules/RentalManagement')) {
                        if (id.includes('/components/')) {
                            return 'rental-components';
                        }
                        if (id.includes('/services/')) {
                            return 'rental-services';
                        }
                        return 'rental';
                    }
                },
                assetFileNames: (assetInfo: PreRenderedAsset) => {
                    const extType = assetInfo.name?.split('.').at(1) || '';
                    if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
                        return `images/[name].[hash][extname]`;
                    }
                    if (/css/i.test(extType)) {
                        return `css/[name].[hash][extname]`;
                    }
                    return `assets/[name].[hash][extname]`;
                },
                chunkFileNames: 'js/[name].[hash].js',
                entryFileNames: 'js/[name].[hash].js',
            },
        },
        chunkSizeWarningLimit: 1000,
        minify: 'terser',
        terserOptions: {
            compress: {
                drop_console: command === 'build',
                drop_debugger: command === 'build',
                pure_funcs: command === 'build' ? ['console.log'] : [],
                passes: 2,
                unsafe_arrows: true,
                unsafe_methods: true,
                unsafe_proto: true,
            },
            mangle: {
                properties: false,
                toplevel: true,
            },
            format: {
                comments: false,
                ecma: 2020,
            },
        },
        sourcemap: command !== 'build',
        reportCompressedSize: true,
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './resources/js'),
            '@/Core': path.resolve(__dirname, './Modules/Core/resources/js'),
            '@/Core/components': path.resolve(__dirname, './Modules/Core/resources/js/components'),
            '@/Core/components/ui': path.resolve(__dirname, './Modules/Core/resources/js/components/ui'),
            '@/Core/layouts': path.resolve(__dirname, './Modules/Core/resources/js/layouts'),
            '@/Core/services': path.resolve(__dirname, './Modules/Core/resources/js/services'),
            '@/Core/types': path.resolve(__dirname, './Modules/Core/resources/js/types'),
            '@/Core/utils': path.resolve(__dirname, './Modules/Core/resources/js/utils'),
            '@/EmployeeManagement': path.resolve(__dirname, './Modules/EmployeeManagement/resources/js'),
            '@/EmployeeManagement/components': path.resolve(__dirname, './Modules/EmployeeManagement/resources/js/components'),
            '@/EmployeeManagement/components/employees': path.resolve(__dirname, './Modules/EmployeeManagement/resources/js/components/employees'),
            '@/EmployeeManagement/components/employees/timesheets': path.resolve(__dirname, './Modules/EmployeeManagement/resources/js/components/employees/timesheets'),
            '@/EmployeeManagement/pages': path.resolve(__dirname, './Modules/EmployeeManagement/resources/js/pages'),
            '@/EmployeeManagement/services': path.resolve(__dirname, './Modules/EmployeeManagement/resources/js/services'),
            '@/EmployeeManagement/types': path.resolve(__dirname, './Modules/EmployeeManagement/resources/js/types'),
            '@/RentalManagement': path.resolve(__dirname, './Modules/RentalManagement/resources/js'),
            '@/RentalManagement/components': path.resolve(__dirname, './Modules/RentalManagement/resources/js/components'),
            '@/RentalManagement/components/rentals': path.resolve(__dirname, './Modules/RentalManagement/resources/js/components/rentals'),
            '@/RentalManagement/pages': path.resolve(__dirname, './Modules/RentalManagement/resources/js/pages'),
            '@/RentalManagement/services': path.resolve(__dirname, './Modules/RentalManagement/resources/js/services'),
            '@/RentalManagement/types': path.resolve(__dirname, './Modules/RentalManagement/resources/js/types'),
            'ziggy-js': path.resolve(__dirname, './vendor/tightenco/ziggy'),
        },
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.json']
    },
    optimizeDeps: {
        include: [
            '@/Core/components',
            '@/Core/components/ui',
            '@/Core/layouts',
            '@/Core/services',
            '@/Core/types',
            '@/Core/utils',
            '@/EmployeeManagement/components',
            '@/EmployeeManagement/components/employees',
            '@/EmployeeManagement/components/employees/timesheets',
            '@/EmployeeManagement/pages',
            '@/EmployeeManagement/services',
            '@/EmployeeManagement/types',
            '@/RentalManagement/components',
            '@/RentalManagement/components/rentals',
            '@/RentalManagement/pages',
            '@/RentalManagement/services',
            '@/RentalManagement/types',
            'react',
            'react-dom',
            '@inertiajs/react',
            '@radix-ui/react-dialog',
            'class-variance-authority',
            'lucide-react',
            'i18next',
            'react-i18next',
        ],
        exclude: ['@inertiajs/server'],
    },
}));
