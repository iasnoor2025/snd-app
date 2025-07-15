import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        outDir: '../../public/build-employeemanagement',
        emptyOutDir: true,
        manifest: true,
    },
    plugins: [
        laravel({
            publicDirectory: '../../public',
            buildDirectory: 'build-employeemanagement',
            input: [
                __dirname + '/resources/assets/sass/app.scss',
                __dirname + '/resources/assets/js/app.js',
                __dirname + '/resources/js/pages/Employees/Index.tsx',
                __dirname + '/resources/js/pages/Employees/Create.tsx',
                __dirname + '/resources/js/pages/Employees/Show.tsx',
                __dirname + '/resources/js/pages/Employees/Documents.tsx',
                __dirname + '/resources/js/pages/Employees/TimesheetHistory.tsx',
                __dirname + '/resources/js/pages/Employees/PerformanceReviews.tsx',
                __dirname + '/resources/js/pages/Employees/PerformanceManagement.tsx',
                __dirname + '/resources/js/pages/Employees/SalaryHistory.tsx',
                __dirname + '/resources/js/pages/Employees/LeaveHistory.tsx',
                __dirname + '/resources/js/pages/Employees/PerformanceReviews.tsx',
                __dirname + '/resources/js/pages/Employees/PerformanceManagement.tsx',
                __dirname + '/resources/js/pages/Employees/SalaryHistory.tsx',
                __dirname + '/resources/js/pages/Employees/LeaveHistory.tsx',
            ],
            refresh: true,
        }),
        react(),
    ],
    resolve: {
        alias: {
            '@': resolve(__dirname, '../../resources/js'),
            '@employeemanagement': resolve(__dirname, 'resources/js'),
            '@components': resolve(__dirname, '../../resources/js/components'),
            '@hooks': resolve(__dirname, '../../resources/js/hooks'),
            '@layouts': resolve(__dirname, '../../resources/js/layouts'),
        },
    },
});

// Export paths for module loader to find
export const paths = [
    'Modules/EmployeeManagement/resources/assets/sass/app.scss',
    'Modules/EmployeeManagement/resources/assets/js/app.js',
    'Modules/EmployeeManagement/resources/js/pages/Employees/Index.tsx',
    'Modules/EmployeeManagement/resources/js/pages/Employees/Create.tsx',
    'Modules/EmployeeManagement/resources/js/pages/Employees/Show.tsx',
    'Modules/EmployeeManagement/resources/js/pages/Employees/Documents.tsx',
    'Modules/EmployeeManagement/resources/js/pages/Employees/TimesheetHistory.tsx',
    'Modules/EmployeeManagement/resources/js/pages/Employees/PerformanceReviews.tsx',
    'Modules/EmployeeManagement/resources/js/pages/Employees/PerformanceManagement.tsx',
    'Modules/EmployeeManagement/resources/js/pages/Employees/SalaryHistory.tsx',
    'Modules/EmployeeManagement/resources/js/pages/Employees/LeaveHistory.tsx',
];

// Scen all resources for assets file. Return array
//function getFilePaths(dir) {
//    const filePaths = [];
//
//    function walkDirectory(currentPath) {
//        const files = readdirSync(currentPath);
//        for (const file of files) {
//            const filePath = join(currentPath, file);
//            const stats = statSync(filePath);
//            if (stats.isFile() && !file.startsWith('.')) {
//                const relativePath = 'Modules/EmployeeManagement/'+relative(__dirname, filePath);
//                filePaths.push(relativePath);
//            } else if (stats.isDirectory()) {
//                walkDirectory(filePath);
//            }
//        }
//    }
//
//    walkDirectory(dir);
//    return filePaths;
//}

//const __filename = fileURLToPath(import.meta.url);
//const __dirname = dirname(__filename);

//const assetsDir = join(__dirname, 'resources/assets');
//export const paths = getFilePaths(assetsDir);

//export const paths = [
//    'Modules/EmployeeManagement/resources/assets/sass/app.scss',
//    'Modules/EmployeeManagement/resources/assets/js/app.js',
//];
