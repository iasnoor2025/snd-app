# Development Setup Guide - Laravel 12 Rental Management System

## Overview

This guide provides step-by-step instructions for setting up the development environment for the Laravel 12 Rental Management System. Follow these instructions carefully to ensure a proper setup.

## System Requirements

### Software Requirements

1. **Core Requirements**
    - PHP 8.2 or higher
    - Node.js 18.x or higher
    - MySQL 8.0 or higher
    - Composer 2.x
    - Git

2. **Optional Tools**
    - Docker Desktop
    - Visual Studio Code
    - TablePlus/MySQL Workbench
    - Postman/Insomnia

### Development Environment

1. **PHP Extensions**

    ```bash
    # Ubuntu/Debian
    sudo apt-get install php8.2-cli php8.2-fpm php8.2-mysql php8.2-xml php8.2-curl php8.2-mbstring php8.2-zip php8.2-gd php8.2-intl

    # macOS (using Homebrew)
    brew install php@8.2
    brew install mysql@8.0
    ```

2. **Node.js Setup**
    ```bash
    # Using nvm (recommended)
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
    nvm install 18
    nvm use 18
    ```

## Installation Steps

### 1. Clone Repository

```bash
# Clone the repository
git clone https://github.com/your-org/rental-management.git
cd rental-management

# Install PHP dependencies
composer install

# Install Node.js dependencies
npm install
```

### 2. Environment Setup

```bash
# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Configure environment variables
# Edit .env file with your database credentials and other settings
```

### 3. Database Setup

```bash
# Create database
mysql -u root -p
CREATE DATABASE rental_management;
exit

# Run migrations and seeders
php artisan migrate --seed

# Generate test data (optional)
php artisan db:seed --class=TestDataSeeder
```

### 4. Storage Setup

```bash
# Set up storage symlinks
php artisan storage:link

# Set proper permissions
chmod -R 775 storage bootstrap/cache
```

### 5. Frontend Setup

```bash
# Build assets for development
npm run dev

# Build assets for production
npm run build
```

## Module Setup

### 1. Create New Module

```bash
# Generate new module
php artisan module:make ModuleName

# Generate module components
php artisan module:make-controller ModuleName ModuleNameController
php artisan module:make-model ModuleName ModuleName
php artisan module:make-migration create_module_table ModuleName
```

### 2. Module Configuration

```php
// config/modules.php
return [
    'namespace' => 'Modules',
    'paths' => [
        'modules' => base_path('Modules'),
        'assets' => public_path('modules'),
        'migration' => base_path('database/migrations'),
        'generator' => [
            'config' => ['path' => 'Config', 'generate' => true],
            'command' => ['path' => 'Console', 'generate' => true],
            'migration' => ['path' => 'Database/Migrations', 'generate' => true],
            'seeder' => ['path' => 'Database/Seeders', 'generate' => true],
            'factory' => ['path' => 'Database/factories', 'generate' => true],
            'model' => ['path' => 'Entities', 'generate' => true],
            'routes' => ['path' => 'Routes', 'generate' => true],
            'controller' => ['path' => 'Http/Controllers', 'generate' => true],
            'filter' => ['path' => 'Http/Middleware', 'generate' => true],
            'request' => ['path' => 'Http/Requests', 'generate' => true],
            'provider' => ['path' => 'Providers', 'generate' => true],
            'assets' => ['path' => 'Resources/assets', 'generate' => true],
            'lang' => ['path' => 'Resources/lang', 'generate' => true],
            'views' => ['path' => 'Resources/views', 'generate' => true],
            'test' => ['path' => 'Tests/Unit', 'generate' => true],
            'test-feature' => ['path' => 'Tests/Feature', 'generate' => true],
            'repository' => ['path' => 'Repositories', 'generate' => true],
            'event' => ['path' => 'Events', 'generate' => true],
            'listener' => ['path' => 'Listeners', 'generate' => true],
            'policies' => ['path' => 'Policies', 'generate' => true],
            'rules' => ['path' => 'Rules', 'generate' => true],
            'jobs' => ['path' => 'Jobs', 'generate' => true],
            'emails' => ['path' => 'Emails', 'generate' => true],
            'notifications' => ['path' => 'Notifications', 'generate' => true],
            'resource' => ['path' => 'Transformers', 'generate' => true],
        ],
    ],
];
```

## Development Workflow

### 1. Git Workflow

```bash
# Create feature branch
git checkout -b feature/feature-name

# Make changes and commit
git add .
git commit -m "feat: add feature description"

# Push changes
git push origin feature/feature-name

# Create pull request
# Use GitHub UI to create PR
```

### 2. Testing

```bash
# Run all tests
php artisan test

# Run specific test
php artisan test --filter=TestName

# Run tests with coverage
php artisan test --coverage

# Run parallel testing
php artisan test --parallel
```

### 3. Code Style

```bash
# Format PHP code
./vendor/bin/pint

# Format JavaScript/TypeScript code
npm run format

# Lint JavaScript/TypeScript code
npm run lint

# Type check TypeScript code
npm run type-check
```

## Troubleshooting

### Common Issues

1. **Composer Issues**

    ```bash
    # Clear composer cache
    composer clear-cache

    # Update composer
    composer self-update

    # Reinstall dependencies
    rm -rf vendor composer.lock
    composer install
    ```

2. **Node.js Issues**

    ```bash
    # Clear npm cache
    npm cache clean --force

    # Reinstall dependencies
    rm -rf node_modules package-lock.json
    npm install
    ```

3. **Laravel Issues**

    ```bash
    # Clear application cache
    php artisan cache:clear
    php artisan config:clear
    php artisan route:clear
    php artisan view:clear

    # Optimize application
    php artisan optimize
    ```

### Support Resources

1. **Documentation**
    - Laravel Documentation
    - Module Documentation
    - API Documentation
    - Testing Documentation

2. **Contact Information**
    - Development Team
    - DevOps Team
    - Project Managers
    - Technical Support

## Best Practices

### Code Standards

1. **PHP Code Style**
    - Follow PSR-12
    - Use type hints
    - Document classes and methods
    - Follow SOLID principles

2. **JavaScript/TypeScript Style**
    - Use ESLint configuration
    - Follow Prettier rules
    - Use TypeScript interfaces
    - Follow component patterns

### Security

1. **Development Security**
    - Use environment variables
    - Secure API endpoints
    - Validate user input
    - Follow OWASP guidelines

2. **Data Protection**
    - Use encryption
    - Secure sensitive data
    - Follow privacy guidelines
    - Implement access control

## Deployment

### Local Development

1. **Development Server**

    ```bash
    # Start Laravel server
    php artisan serve

    # Start Vite development server
    npm run dev
    ```

2. **Docker Development**

    ```bash
    # Build containers
    docker-compose build

    # Start services
    docker-compose up -d

    # Stop services
    docker-compose down
    ```

### Staging/Production

1. **Build Process**

    ```bash
    # Build assets
    npm run build

    # Optimize Laravel
    php artisan optimize
    php artisan route:cache
    php artisan config:cache
    php artisan view:cache
    ```

2. **Deployment Commands**
    ```bash
    # Deploy script
    php artisan down
    git pull origin main
    composer install --no-dev
    npm ci
    npm run build
    php artisan migrate --force
    php artisan optimize
    php artisan up
    ```

## Additional Resources

### Learning Resources

1. **Documentation**
    - Laravel Documentation
    - TypeScript Documentation
    - React Documentation
    - Testing Documentation

2. **Community Resources**
    - Laravel Forums
    - GitHub Discussions
    - Stack Overflow
    - Discord Channels

### Tools and Extensions

1. **VS Code Extensions**
    - Laravel Extension Pack
    - PHP Intelephense
    - ESLint
    - Prettier
    - GitLens

2. **Development Tools**
    - Laravel Telescope
    - Laravel Debug Bar
    - React Developer Tools
    - Redux DevTools
