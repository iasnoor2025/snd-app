// Temporary build script to bypass module loading issues
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Create backup paths
const appTsxPath = path.join(__dirname, 'resources/js/app.tsx');
const appTsxBackupPath = path.join(__dirname, 'resources/js/app.tsx.bak');
const viteConfigPath = path.join(__dirname, 'vite.config.ts');
const viteConfigBackupPath = path.join(__dirname, 'vite.config.ts.bak');

// Backup original files
console.log('Backing up original files...');
if (fs.existsSync(appTsxPath)) {
  fs.copyFileSync(appTsxPath, appTsxBackupPath);
}
if (fs.existsSync(viteConfigPath)) {
  fs.copyFileSync(viteConfigPath, viteConfigBackupPath);
}

// Create a minimal app.tsx
const minimalAppTsx = `import './bootstrap';
import '../css/app.css';

import React from 'react';
import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';

const appName = 'Laravel';

createInertiaApp({
  title: (title) => \`\${title} - \${appName}\`,
  resolve: (name) => {
    // This is a simplified resolver that doesn't use dynamic imports
    return import('./pages/' + name);
  },
  setup({ el, App, props }) {
    createRoot(el).render(<App {...props} />);
  },
});
`;

// Create a minimal vite.config.ts
const minimalViteConfig = `import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    laravel({
      input: ['resources/css/app.css', 'resources/js/app.tsx'],
      refresh: true,
    }),
    react(),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'resources/js'),
    },
  },
  build: {
    sourcemap: false,
    minify: 'esbuild',
  },
});
`;

// Write temporary files
console.log('Creating temporary files for build...');
fs.writeFileSync(appTsxPath, minimalAppTsx);
fs.writeFileSync(viteConfigPath, minimalViteConfig);

try {
  // Run the build command
  console.log('Running build command with simplified files...');
  execSync('npx vite build', { stdio: 'inherit' });
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error.message);
} finally {
  // Restore original files
  console.log('Restoring original files...');
  if (fs.existsSync(appTsxBackupPath)) {
    fs.copyFileSync(appTsxBackupPath, appTsxPath);
    fs.unlinkSync(appTsxBackupPath);
  }
  if (fs.existsSync(viteConfigBackupPath)) {
    fs.copyFileSync(viteConfigBackupPath, viteConfigPath);
    fs.unlinkSync(viteConfigBackupPath);
  }
}

// Create a temporary vite config that skips TypeScript checking
const tempViteConfigPath = path.join(__dirname, 'vite.config.temp.js');
const viteConfigContent = `
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    laravel({
      input: ['resources/css/app.css', 'resources/js/app.tsx'],
      refresh: true,
    }),
    react(),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'resources/js'),
    },
  },
  build: {
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      onwarn(warning, warn) {
        // Skip certain warnings
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE') {
          return;
        }
        if (warning.code === 'CIRCULAR_DEPENDENCY') {
          return;
        }
        warn(warning);
      },
    },
  },
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
  },
});
`;

console.log('Creating temporary vite config...');
fs.writeFileSync(tempViteConfigPath, viteConfigContent);

try {
  // Run the build command with the temporary config
  console.log('Running build command with temporary config...');
  execSync('npx vite build --config vite.config.temp.js', { stdio: 'inherit' });
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error.message);
} finally {
  // Clean up the temporary config file
  console.log('Cleaning up temporary files...');
  if (fs.existsSync(tempViteConfigPath)) {
    fs.unlinkSync(tempViteConfigPath);
  }
}

// Backup the modules_statuses.json file
const modulesStatusesPath = path.join(__dirname, 'modules_statuses.json');
const backupPath = path.join(__dirname, 'modules_statuses.json.bak');

if (fs.existsSync(modulesStatusesPath)) {
  console.log('Backing up modules_statuses.json...');
  fs.copyFileSync(modulesStatusesPath, backupPath);

  // Create a temporary modules_statuses.json with only essential modules
  const tempModulesStatuses = {};
  console.log('Creating temporary modules_statuses.json with minimal modules...');
  fs.writeFileSync(modulesStatusesPath, JSON.stringify(tempModulesStatuses, null, 4));

  try {
    // Run the build command
    console.log('Running build command...');
    execSync('npx vite build', { stdio: 'inherit' });
    console.log('Build completed successfully!');
  } catch (error) {
    console.error('Build failed:', error.message);
  } finally {
    // Restore the original modules_statuses.json
    console.log('Restoring original modules_statuses.json...');
    fs.copyFileSync(backupPath, modulesStatusesPath);
    fs.unlinkSync(backupPath);
  }
} else {
  console.error('modules_statuses.json not found!');
}
