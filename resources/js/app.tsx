// Main app entry point - imports from Core module for centralized resource management
import '../../Modules/Core/resources/js/app';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { type Page, router } from '@inertiajs/core';
import { createInertiaApp } from '@inertiajs/react';
import Toast from '../../Modules/Core/resources/js/components/Toast';

interface SetupProps {
  el: HTMLElement;
  App: React.ComponentType<any>;
  props: Record<string, any>;
}

interface PageModule {
  default: Page;
}

createInertiaApp({
  resolve: async (name: string) => {
    console.log('Resolving page:', name);
    
    // Try to resolve from main app pages first
    const mainPages = import.meta.glob<PageModule>('./Pages/**/*.tsx');
    const mainPagePath = `./Pages/${name}.tsx`;
    if (mainPages[mainPagePath]) {
      return (await mainPages[mainPagePath]()).default;
    }

    // If not found in main app, try to resolve from modules
    const moduleMatch = name.match(/^([^/]+)\/(.+)$/);
    if (moduleMatch) {
      const [, moduleName, pagePath] = moduleMatch;
      try {
        // First try the exact path
        const modulePath = `../../Modules/${moduleName}/resources/js/pages/${pagePath}.tsx`;
        const modulePages = import.meta.glob<PageModule>('../../Modules/*/resources/js/pages/**/*.tsx', { eager: false });
        
        if (modulePages[modulePath]) {
          return (await modulePages[modulePath]()).default;
        }

        // If not found, try with proper casing (e.g., 'employees/index' -> 'Employees/Index')
        const properCasePath = pagePath
          .split('/')
          .map(part => part.charAt(0).toUpperCase() + part.slice(1))
          .join('/');
        const properCaseModulePath = `../../Modules/${moduleName}/resources/js/pages/${properCasePath}.tsx`;
        
        if (modulePages[properCaseModulePath]) {
          return (await modulePages[properCaseModulePath]()).default;
        }

        throw new Error(`Page not found: ${name} (tried ${modulePath} and ${properCaseModulePath})`);
      } catch (error) {
        console.error('Error loading module page:', error);
        throw new Error(`Failed to load page: ${name}`);
      }
    }

    throw new Error(`Page not found: ${name}`);
  },
  setup({ el, App, props }: SetupProps) {
    const root = createRoot(el);
    root.render(
      <React.StrictMode>
        <App {...props} />
        <Toast />
      </React.StrictMode>
    );
  },
});

