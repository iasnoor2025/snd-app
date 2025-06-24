import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';

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
    build: {
        target: 'esnext',
    },
    resolve: {
        alias: {
            '@': '/resources/js',
            '@/Core': '/Modules/Core/resources/js',
            '@/Core/components': '/Modules/Core/resources/js/components',
            '@/Core/components/ui': '/Modules/Core/resources/js/components/ui',
            '@/Core/layouts': '/Modules/Core/resources/js/layouts',
            '@/Core/services': '/Modules/Core/resources/js/services',
            '@/Core/types': '/Modules/Core/resources/js/types',
            '@/Core/utils': '/Modules/Core/resources/js/utils',
            '@/EmployeeManagement': '/Modules/EmployeeManagement/resources/js',
            '@/EmployeeManagement/components': '/Modules/EmployeeManagement/resources/js/components',
            '@/EmployeeManagement/pages': '/Modules/EmployeeManagement/resources/js/pages',
            '@/EmployeeManagement/services': '/Modules/EmployeeManagement/resources/js/services',
            '@/EmployeeManagement/types': '/Modules/EmployeeManagement/resources/js/types',
            '@/EquipmentManagement': '/Modules/EquipmentManagement/resources/js',
            '@/EquipmentManagement/pages': '/Modules/EquipmentManagement/resources/js/pages',
            '@/RentalManagement': '/Modules/RentalManagement/resources/js',
            '@/RentalManagement/pages': '/Modules/RentalManagement/resources/js/pages',
            '@/TimesheetManagement': '/Modules/TimesheetManagement/resources/js',
            '@/TimesheetManagement/pages': '/Modules/TimesheetManagement/resources/js/pages',
            '@/Settings': '/Modules/Settings/resources/js',
            '@/Settings/pages': '/Modules/Settings/resources/js/pages',
            'ziggy-js': '/vendor/tightenco/ziggy',
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
            '@/EmployeeManagement/pages',
            '@/EmployeeManagement/services',
            '@/EmployeeManagement/types',
            '@/EquipmentManagement/pages',
            '@/RentalManagement/pages',
            '@/TimesheetManagement/pages',
            '@/Settings/pages'
        ]
    }
});
