# Tech Context: Laravel 12 with React & Inertia.js

## Technology Stack

### Backend Technologies

#### Core Framework

- **Laravel 12**: Latest version with PHP 8.2+ support
- **PHP 8.2+**: Modern PHP with improved performance and type system
- **Composer**: Dependency management and autoloading

#### Key Laravel Packages

```json
{
    "inertiajs/inertia-laravel": "^2.0", // SPA-like experience
    "laravel/sanctum": "^4.1", // API authentication
    "nwidart/laravel-modules": "^12.0", // Modular architecture
    "spatie/laravel-permission": "^6.18", // Roles & permissions
    "spatie/laravel-medialibrary": "^11.12", // Media management
    "spatie/laravel-activitylog": "^4.10", // Audit logging
    "spatie/laravel-translatable": "^6.11", // Model translations
    "tightenco/ziggy": "^2.4", // Route generation for JS
    "barryvdh/laravel-dompdf": "^3.1", // PDF generation
    "maatwebsite/excel": "^1.1", // Excel import/export
    "minishlink/web-push": "^9.0", // Push notifications
    "laravolt/avatar": "^6.2" // Avatar generation
}
```

#### Development Tools

```json
{
    "laravel/pail": "^1.2.2", // Log viewer
    "laravel/pint": "^1.18", // Code formatting
    "laravel/sail": "^1.41", // Docker development
    "pestphp/pest": "^3.8", // Testing framework
    "pestphp/pest-plugin-laravel": "^3.2" // Laravel-specific tests
}
```

#### Authentication & Authorization Implementation

```php
// Custom AuthController with comprehensive auth flow
class AuthController extends Controller {
    // Registration, login, logout, profile management
    // Role assignment during registration
    // API endpoints for user data and permissions
}

// UserPolicy with role-based authorization
class UserPolicy {
    // 6 role types: admin, manager, employee, HR, accountant, technician
    // Module-specific permission methods
    // Granular access control for all business functions
}

// AuthServiceProvider with authorization gates
class AuthServiceProvider extends ServiceProvider {
    // Module-specific gates (manage-roles, view-admin-dashboard, etc.)
    // Gate::before hook for admin super-user access
    // Policy registration for User model
}
```

### Frontend Technologies

#### Core Framework

- **React 19+**: Latest React with concurrent features
- **TypeScript**: Type safety and better developer experience
- **Inertia.js**: Server-side routing with client-side navigation

#### UI & Styling

```json
{
    "@radix-ui/react-*": "Latest", // Headless UI primitives
    "tailwindcss": "^3.4.0", // Utility-first CSS
    "shadcn/ui": "Latest", // Pre-built components
    "lucide-react": "Latest", // Icon library
    "class-variance-authority": "Latest", // Component variants
    "clsx": "Latest", // Conditional classes
    "tailwind-merge": "Latest" // Tailwind class merging
}
```

#### Form Management

```json
{
    "react-hook-form": "^7.48.0", // Form state management
    "@hookform/resolvers": "^5.0.1", // Form validation resolvers
    "zod": "^3.22.0" // Schema validation
}
```

#### State Management

```json
{
    "@tanstack/react-query": "^5.0.0", // Server state management
    "zustand": "^4.4.0" // Client state management
}
```

#### Development Tools

```json
{
    "@vitejs/plugin-react-swc": "^3.10.1", // Fast React compilation
    "vite": "^6.3.5", // Build tool
    "typescript": "^5.3.0", // TypeScript compiler
    "eslint": "^9.17.0", // Code linting
    "prettier": "^3.4.2", // Code formatting
    "@testing-library/react": "^16.3.0", // React testing utilities
    "jest": "^29.7.0" // JavaScript testing
}
```

### Database & Storage

#### Database Options

- **SQLite**: Default for development (configured in .env.example)
- **MySQL 8.0+**: Recommended for production
- **PostgreSQL**: Alternative production option

#### Storage Solutions

- **Local Storage**: Default file storage
- **S3 Compatible**: For production file storage
- **Redis**: Caching and session storage (optional)

### Internationalization

#### i18n Stack

```json
{
    "i18next": "^23.7.0", // Core i18n library
    "react-i18next": "^14.0.0", // React integration
    "i18next-browser-languagedetector": "^7.2.0", // Language detection
    "i18next-scanner": "^4.6.0" // Translation key extraction
}
```

#### Translation Workflow

- Automated key extraction from source code
- Translation suggestion system
- Missing translation detection
- RTL language support

## Development Environment Setup

### System Requirements

```bash
# Required software
PHP >= 8.2
Composer >= 2.0
Node.js >= 18.0
npm >= 9.0

# Optional but recommended
Docker & Docker Compose (for Laravel Sail)
Redis (for caching and queues)
```

### Environment Configuration

#### Database Setup (SQLite - Default)

```env
DB_CONNECTION=postsqlite
# Other DB_ variables commented out
```

#### Database Setup (MySQL - Production)

```env
DB_CONNECTION=  # mysql, pgsql, sqlite
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=rental_management
DB_USERNAME=root
DB_PASSWORD=password
```

#### Caching Configuration

```env
CACHE_STORE=database  # or redis for production
SESSION_DRIVER=database
QUEUE_CONNECTION=database  # or redis for production
```

#### Mail Configuration

```env
MAIL_MAILER=log  # Development
# MAIL_MAILER=smtp  # Production
# MAIL_HOST=smtp.mailtrap.io
# MAIL_PORT=2525
# MAIL_USERNAME=null
# MAIL_PASSWORD=null
```

### Build Configuration

#### Vite Configuration

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react-swc';

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
            '@': '/resources/js',
        },
    },
});
```

#### TypeScript Configuration

```json
{
    "compilerOptions": {
        "target": "ES2020",
        "lib": ["ES2020", "DOM", "DOM.Iterable"],
        "module": "ESNext",
        "skipLibCheck": true,
        "moduleResolution": "bundler",
        "allowImportingTsExtensions": true,
        "resolveJsonModule": true,
        "isolatedModules": true,
        "noEmit": true,
        "jsx": "react-jsx",
        "strict": true,
        "noUnusedLocals": true,
        "noUnusedParameters": true,
        "noFallthroughCasesInSwitch": true,
        "baseUrl": ".",
        "paths": {
            "@/*": ["./resources/js/*"]
        }
    }
}
```

#### Tailwind Configuration

```javascript
// tailwind.config.js
module.exports = {
    darkMode: ['class'],
    content: ['./resources/**/*.blade.php', './resources/**/*.js', './resources/**/*.tsx', './Modules/**/resources/**/*.{js,tsx}'],
    theme: {
        extend: {
            colors: {
                border: 'hsl(var(--border))',
                input: 'hsl(var(--input))',
                ring: 'hsl(var(--ring))',
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                // ... other Shadcn colors
            },
        },
    },
    plugins: [require('tailwindcss-animate')],
};
```

### Module Development

#### Module Creation Command

```bash
php artisan module:make ModuleName
```

#### Module Structure

```
Modules/ModuleName/
├── module.json          # Module configuration
├── composer.json        # Module dependencies
├── package.json         # Frontend dependencies (if needed)
├── vite.config.js       # Module-specific Vite config
└── [standard Laravel structure]
```

#### Module Registration

```json
// modules_statuses.json
{
    "Core": true,
    "CustomerManagement": true,
    "EmployeeManagement": true,
    "EquipmentManagement": true
    // ... other modules
}
```

### Performance Optimization

#### Laravel Optimizations

```bash
# Production optimizations
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache
```

#### Frontend Optimizations

```bash
# Production build
npm run build

# Build with SSR support
npm run build:ssr
```

### Testing Setup

#### PHP Testing (Pest)

```php
// pest.php
uses(Tests\TestCase::class)->in('Feature');
uses(Tests\TestCase::class)->in('Unit');
```

#### JavaScript Testing (Jest)

```javascript
// jest.config.js
module.exports = {
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/resources/js/setupTests.ts'],
    moduleNameMapping: {
        '^@/(.*)$': '<rootDir>/resources/js/$1',
    },
};
```

### Deployment Considerations

#### Production Environment

- **Web Server**: Nginx or Apache with PHP-FPM
- **Process Manager**: Supervisor for queue workers
- **Caching**: Redis for sessions, cache, and queues
- **File Storage**: S3 or compatible object storage
- **CDN**: CloudFlare or AWS CloudFront for static assets

#### Security Headers

```php
// config/cors.php - CORS configuration
// config/sanctum.php - API authentication
// Middleware for security headers
```

#### Monitoring

- **Application Monitoring**: Laravel Telescope (development)
- **Error Tracking**: Sentry or Bugsnag
- **Performance Monitoring**: New Relic or DataDog
- **Log Management**: ELK Stack or similar

This technology stack provides a modern, scalable foundation for the rental management system with excellent developer experience and production-ready capabilities.
