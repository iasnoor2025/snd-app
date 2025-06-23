import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import { readdirSync, statSync } from 'fs';
import { join,relative,dirname } from 'path';
import { fileURLToPath } from 'url';
import { resolve } from 'path';

export default defineConfig({
    build: {
        outDir: '../../public/build-rental',
        emptyOutDir: true,
        manifest: true,
    },
    plugins: [
        laravel({
            publicDirectory: '../../public',
            buildDirectory: 'build-rental',
            input: [
                __dirname + '/resources/js/app.tsx',
                __dirname + '/resources/js/pages/**/*.tsx',
            ],
            refresh: true,
        }),
        react(),
    ],
    resolve: {
        alias: {
            '@': resolve(__dirname, '../../resources/js'),
            '@/Core': resolve(__dirname, '../Core/resources/js'),
            '@/Core/components': resolve(__dirname, '../Core/resources/js/components'),
            '@/Core/components/ui': resolve(__dirname, '../Core/resources/js/components/ui'),
            '@/Core/layouts': resolve(__dirname, '../Core/resources/js/layouts'),
            '@/Core/layouts/AppLayout': resolve(__dirname, '../Core/resources/js/layouts/AppLayout'),
        },
    },
});
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
//                const relativePath = 'Modules/Rental/'+relative(__dirname, filePath);
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
//    'Modules/Rental/resources/assets/sass/app.scss',
//    'Modules/Rental/resources/assets/js/app.js',
//];
