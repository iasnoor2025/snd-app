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
            'ziggy-js': resolve(__dirname, 'vendor/tightenco/ziggy'),
            '@': resolve(__dirname, './'),
            '@/Modules/Core/resources/js': resolve(__dirname, 'Modules/Core/resources/js'),
            '@/Modules/Reporting/resources/js': resolve(__dirname, 'Modules/Reporting/resources/js'),
            '@/Modules/CustomerManagement/resources/js': resolve(__dirname, 'Modules/CustomerManagement/resources/js'),
            '@/Modules/EmployeeManagement/resources/js': resolve(__dirname, 'Modules/EmployeeManagement/resources/js'),
            '@/Modules/EquipmentManagement/resources/js': resolve(__dirname, 'Modules/EquipmentManagement/resources/js'),
            '@/Modules/LeaveManagement/resources/js': resolve(__dirname, 'Modules/LeaveManagement/resources/js'),
            '@/Modules/ProjectManagement/resources/js': resolve(__dirname, 'Modules/ProjectManagement/resources/js'),
            '@/Modules/RentalManagement/resources/js': resolve(__dirname, 'Modules/RentalManagement/resources/js'),
            '@/Modules/TimesheetManagement/resources/js': resolve(__dirname, 'Modules/TimesheetManagement/resources/js'),
        },
    },
});
