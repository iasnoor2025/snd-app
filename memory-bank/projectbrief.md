# Project Brief: Laravel 12 Modular Rental Management System

## Project Overview

This is a comprehensive Laravel 12 application with React frontend integrated via Inertia.js, designed as a modular rental management system. The project follows enterprise-level architecture patterns with a focus on scalability, maintainability, and modern development practices.

## Core Requirements

### Backend Architecture

- **Framework**: Laravel 12 with PHP 8.2+
- **Authentication**: Laravel Sanctum for API authentication
- **Authorization**: Spatie Laravel Permission for roles & permissions
- **Media Management**: Spatie Laravel Media Library
- **Activity Logging**: Spatie Laravel Activity Log
- **Modular Structure**: nwidart/laravel-modules for feature-based organization

### Frontend Architecture

- **Framework**: React 19+ with TypeScript
- **Bridge**: Inertia.js for seamless Laravel-React integration
- **UI Components**: Shadcn/ui for consistent design system
- **Styling**: Tailwind CSS with CSS variables
- **Build Tool**: Vite with SWC for fast compilation

### Key Features

1. **Modular Business Logic**:
    - Customer Management
    - Employee Management
    - Equipment Management
    - Rental Management
    - Project Management
    - Leave Management
    - Payroll
    - Timesheet Management
    - Audit Compliance
    - Notifications
    - Localization
    - Mobile Bridge (PWA support)
    - API module
    - Reporting
    - Settings

2. **Internationalization**:
    - Multi-language support with i18next
    - RTL language support
    - Automated translation workflows
    - Translation key management

3. **Development Tools**:
    - ESLint + Prettier for code quality
    - TypeScript for type safety
    - Pest for PHP testing
    - Jest for JavaScript testing
    - Laravel Pint for PHP code styling

## Technical Goals

- **Performance**: Optimized caching, queue management, and asset compilation
- **Security**: Best practices for authentication, authorization, and data protection
- **Scalability**: Modular architecture supporting horizontal scaling
- **Maintainability**: Clean code, comprehensive testing, and documentation
- **Developer Experience**: Modern tooling, hot reloading, and automated workflows

## Success Criteria

- Complete Laravel 12 setup with all required packages
- Functional authentication system with role-based access
- Working React dashboard with Shadcn UI components
- Proper module integration and routing
- Comprehensive documentation and setup instructions
- Production-ready configuration and deployment guidelines
