// Temporary build script with minimal app approach
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
    const pages = {
      'Dashboard': () => import('./Pages/Dashboard'),
      'Auth/Login': () => import('./Pages/Auth/Login'),
      'Welcome': () => import('./Pages/Welcome'),
    };
    return pages[name]();
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
    rollupOptions: {
      onwarn(warning, warn) {
        // Skip certain warnings
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE') return;
        if (warning.code === 'CIRCULAR_DEPENDENCY') return;
        warn(warning);
      },
    },
  },
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
  },
});
`;

// Create a minimal Welcome.tsx page
const welcomePagePath = path.join(__dirname, 'resources/js/Pages/Welcome.tsx');
const welcomePageBackupPath = path.join(__dirname, 'resources/js/Pages/Welcome.tsx.bak');

if (fs.existsSync(welcomePagePath)) {
    fs.copyFileSync(welcomePagePath, welcomePageBackupPath);
}

const minimalWelcomePage = `import React from 'react';

export default function Welcome() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Welcome to Laravel with Inertia.js</h1>
      <p className="mt-4">This is a minimal page for testing the build process.</p>
    </div>
  );
}
`;

// Write temporary files
console.log('Creating temporary files for build...');
fs.writeFileSync(appTsxPath, minimalAppTsx);
fs.writeFileSync(viteConfigPath, minimalViteConfig);
fs.writeFileSync(welcomePagePath, minimalWelcomePage);

// Create Pages directory if it doesn't exist
const pagesDir = path.join(__dirname, 'resources/js/Pages');
if (!fs.existsSync(pagesDir)) {
    fs.mkdirSync(pagesDir, { recursive: true });
}

// Create Auth directory if it doesn't exist
const authDir = path.join(__dirname, 'resources/js/Pages/Auth');
if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
}

// Create minimal Login page
const loginPagePath = path.join(__dirname, 'resources/js/Pages/Auth/Login.tsx');
const loginPageBackupPath = path.join(__dirname, 'resources/js/Pages/Auth/Login.tsx.bak');

if (fs.existsSync(loginPagePath)) {
    fs.copyFileSync(loginPagePath, loginPageBackupPath);
}

const minimalLoginPage = `import React from 'react';

export default function Login() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Login</h1>
      <p className="mt-4">This is a minimal login page for testing the build process.</p>
    </div>
  );
}
`;

fs.writeFileSync(loginPagePath, minimalLoginPage);

// Create minimal Dashboard page
const dashboardPagePath = path.join(__dirname, 'resources/js/Pages/Dashboard.tsx');
const dashboardPageBackupPath = path.join(__dirname, 'resources/js/Pages/Dashboard.tsx.bak');

if (fs.existsSync(dashboardPagePath)) {
    fs.copyFileSync(dashboardPagePath, dashboardPageBackupPath);
}

const minimalDashboardPage = `import React from 'react';

export default function Dashboard() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="mt-4">This is a minimal dashboard page for testing the build process.</p>
    </div>
  );
}
`;

fs.writeFileSync(dashboardPagePath, minimalDashboardPage);

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
    if (fs.existsSync(welcomePageBackupPath)) {
        fs.copyFileSync(welcomePageBackupPath, welcomePagePath);
        fs.unlinkSync(welcomePageBackupPath);
    }
    if (fs.existsSync(loginPageBackupPath)) {
        fs.copyFileSync(loginPageBackupPath, loginPagePath);
        fs.unlinkSync(loginPageBackupPath);
    }
    if (fs.existsSync(dashboardPageBackupPath)) {
        fs.copyFileSync(dashboardPageBackupPath, dashboardPagePath);
        fs.unlinkSync(dashboardPageBackupPath);
    }
}
