import { defineConfig, type UserConfig, type ConfigEnv } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import compression from 'vite-plugin-compression';
import { visualizer } from 'rollup-plugin-visualizer';

// Detect build target via env (use: npm run build:client or npm run build:ssr)
const BUILD_TARGET = process.env.BUILD_TARGET || 'client';

export default defineConfig(({ command, mode }: ConfigEnv): UserConfig => {
  // Pick output dir and ssr setting based on target
  const isSSR = BUILD_TARGET === 'ssr';
  const outDir = isSSR ? 'public/build-ssr' : 'public/build-client';

  return {
    plugins: [
      laravel({
        input: [
          'resources/css/app.css',
          'resources/js/app.tsx',
          'Modules/Core/resources/js/app.tsx',
          'Modules/EquipmentManagement/resources/js/app.tsx',
        ],
        ...(isSSR && {
          ssr: 'Modules/Core/resources/js/ssr.tsx',
        }),
        refresh: true,
        buildDirectory: outDir.replace(/^public\//, ''),
      }),
      react({
        babel: {
          plugins: [['@babel/plugin-transform-typescript', { isTSX: true }]],
        },
      }),
      tailwindcss(),
      mode === 'analyze' &&
        visualizer({
          filename: './stats.html',
          gzipSize: true,
          brotliSize: true,
          open: true,
        }),
      command === 'build' &&
        compression({
          algorithm: 'gzip',
          ext: '.gz',
          filter: /\.(js|css|html|svg)$/i,
          threshold: 1024,
        }),
      command === 'build' &&
        compression({
          algorithm: 'brotliCompress',
          ext: '.br',
          filter: /\.(js|css|html|svg)$/i,
          threshold: 1024,
        }),
    ].filter(Boolean),

    build: {
      target: 'esnext',
      outDir,
      assetsDir: 'assets',
      manifest: !isSSR, // manifest.json only for client
      cssCodeSplit: true,
      modulePreload: true,
      cssTarget: 'esnext',
      dynamicImportVarsOptions: {
        warnOnError: true,
      },
      rollupOptions: {
        output: {
          manualChunks: (id: string) => {
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('@inertiajs')) return 'vendor-react';
              if (id.includes('@radix-ui')) return 'vendor-radix';
              return 'vendor-other';
            }
          },
          assetFileNames: (assetInfo) => {
            const ext = assetInfo.name?.split('.').at(1) || '';
            if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
              return `images/[name].[hash][extname]`;
            }
            if (/css/i.test(ext)) {
              return `css/[name].[hash][extname]`;
            }
            return `assets/[name].[hash][extname]`;
          },
          chunkFileNames: 'js/[name].[hash].js',
          entryFileNames: 'js/[name].[hash].js',
        },
      },
      chunkSizeWarningLimit: 2000,
      minify: 'esbuild',
      sourcemap: false,
      reportCompressedSize: false,
    },

    resolve: {
      alias: {
        '@/Core': path.resolve(__dirname, 'Modules/Core/resources/js'),
        '@/Core/Components': path.resolve(__dirname, 'Modules/Core/resources/js/Components'),
        '@/Core/Components/ui': path.resolve(__dirname, 'Modules/Core/resources/js/Components/ui'),
        '@/Core/layouts': path.resolve(__dirname, 'Modules/Core/resources/js/layouts'),
        '@/Core/services': path.resolve(__dirname, 'Modules/Core/resources/js/services'),
        '@/Core/types': path.resolve(__dirname, 'Modules/Core/resources/js/types'),
        '@/Core/utils': path.resolve(__dirname, 'Modules/Core/resources/js/utils'),
        '@/EmployeeManagement': path.resolve(__dirname, 'Modules/EmployeeManagement/resources/js'),
        '@/ProjectManagement': path.resolve(__dirname, 'Modules/ProjectManagement/resources/js'),
        '@/RentalManagement': path.resolve(__dirname, 'Modules/RentalManagement/resources/js'),
        '@/EquipmentManagement': path.resolve(__dirname, 'Modules/EquipmentManagement/resources/js'),
        '@CoreUI': path.resolve(__dirname, 'Modules/Core/resources/js/Components/ui/index.ts'),
        'ziggy-js': path.resolve(__dirname, 'vendor/tightenco/ziggy/dist/index.esm.js'),
      },
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    },

    optimizeDeps: {
      include: [
        '@/Core',
        '@/Core/Components',
        '@/Core/Components/ui',
        '@/Core/layouts',
        '@/Core/services',
        '@/Core/types',
        '@/Core/utils',
        '@/EmployeeManagement',
        '@/ProjectManagement',
        '@/RentalManagement',
        '@/EquipmentManagement',
        'react',
        'react-dom',
        '@inertiajs/react',
        '@radix-ui/react-dialog',
        'class-variance-authority',
        'ziggy-js',
      ],
      exclude: ['@inertiajs/server'],
    },

    ssr: {
      noExternal: [
        '@/Core',
        '@/Core/Components',
        '@/Core/Components/ui',
        '@/Core/layouts',
        '@/Core/services',
        '@/Core/types',
        '@/Core/utils',
        '@/EmployeeManagement',
        '@/ProjectManagement',
        '@/RentalManagement',
        '@/EquipmentManagement',
        'ziggy-js',
      ],
    },
  };
});
