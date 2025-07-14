# Laravel 12 Modular Rental Management System

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/your-org/snd-app/actions)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Tech Stack](https://img.shields.io/badge/laravel-12-red?logo=laravel)](https://laravel.com/) [![React](https://img.shields.io/badge/react-19-blue?logo=react)](https://react.dev/) [![Inertia.js](https://img.shields.io/badge/inertia.js-2.0-purple)](https://inertiajs.com/)

---

## 🚀 Project Overview

A comprehensive, production-ready **Laravel 12 + React** application for rental management, built with a strict modular architecture. Designed for scalability, maintainability, and modern developer experience, this system integrates all business functions for equipment rental, project management, HR, payroll, and more.

---

## 🏢 Business Purpose

This system unifies fragmented rental business operations into a single, modular platform. It streamlines equipment tracking, customer management, employee scheduling, project coordination, payroll, compliance, and reporting. The platform is designed for:
- Rental Managers
- Project Managers
- HR Managers
- Field Employees
- Administrators
- Customers (self-service portal)
- Accountants & Executives

---

## ✨ Key Features

- **Modular Business Logic**: 16+ feature modules (Customer, Employee, Equipment, Rental, Project, Leave, Payroll, Timesheet, Audit, Notifications, Localization, API, Reporting, Settings, Mobile Bridge, Core)
- **Authentication & Authorization**: Laravel Sanctum, Spatie Permission, role-based access
- **Modern UI**: React 19, Shadcn UI, Tailwind CSS, SPA-like experience with Inertia.js
- **Internationalization**: i18next, RTL support, automated translation workflows
- **File Management**: Uploads, validation, PDF/Excel/CSV export, document generation
- **Notifications**: Sonner-powered toast system for user feedback
- **Reporting & Analytics**: Real-time dashboards, exportable reports
- **Mobile-Ready**: PWA support, responsive design
- **Comprehensive API**: RESTful endpoints, third-party integration ready
- **Audit & Compliance**: Activity logging, audit trails

---

## 🏗️ Architecture & Patterns

- **Domain-Driven Modular Design**: Each business domain is a self-contained module under `Modules/`
- **Frontend**: TypeScript, React, Shadcn UI, Tailwind, Vite, Inertia.js
- **Backend**: Laravel 12, PHP 8.2+, modular services, RESTful APIs
- **Database**: MySQL (prod), SQLite (dev), PostgreSQL (optional)
- **Testing**: Pest (PHP), Jest (JS/TS)
- **CI/CD**: GitHub Actions (suggested)

### Directory Structure
```
Modules/
  └── {ModuleName}/
      ├── resources/js/components/
      ├── Http/Controllers/
      ├── Domain/
      ├── Services/
      ├── Database/
      └── ...
resources/js/
  ├── components/
  └── pages/
```

---

## 🛠️ Technology Stack

- **Backend**: Laravel 12, PHP 8.2+, Composer, Sanctum, Spatie (Permission, Media Library, Activity Log)
- **Frontend**: React 19+, TypeScript, Inertia.js, Shadcn UI, Tailwind CSS, Vite, SWC
- **State Management**: TanStack Query, Zustand, React Hook Form, Zod
- **Internationalization**: i18next, react-i18next, i18next-scanner
- **Testing**: Pest, Jest, Testing Library
- **Dev Tools**: ESLint, Prettier, Laravel Pint, Docker (optional)

---

## ⚡ Quick Start

### Prerequisites
- PHP >= 8.2
- Composer >= 2.0
- Node.js >= 18
- npm >= 9
- MySQL 8+ (for production) or SQLite (for development)

### 1. Clone the Repository
```bash
git clone https://github.com/your-org/snd-app.git
cd snd-app
```

### 2. Install Backend Dependencies
```bash
composer install
```

### 3. Install Frontend Dependencies
```bash
npm install
```

### 4. Environment Setup
- Copy `.env.example` to `.env` and configure database/mail settings
- Generate app key:
```bash
php artisan key:generate
```

### 5. Database Setup
- For SQLite (default):
  - Touch `database/database.sqlite`
- For MySQL/PostgreSQL: update `.env` accordingly
- Run migrations & seeders:
```bash
php artisan migrate --seed
```

### 6. Build Assets
```bash
npm run dev   # For development
npm run build # For production
```

### 7. Start the Application
```bash
php artisan serve
```

---

## 🌍 Internationalization
- All translations are managed per module in `public/locales/{ModuleName}/{lang}`
- Use `npm run scan-i18n` to extract keys, `npm run i18n-report` for coverage
- RTL support for Arabic, Hebrew, etc.

---

## 🧩 Contributing

1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

**Coding Standards:**
- PHP: PSR-12, Laravel Pint
- JS/TS: ESLint, Prettier
- Use module structure for all business logic
- Write tests for new features (Pest/Jest)

---

## 📄 License

This project is open-sourced under the [MIT license](LICENSE).

---

## 🙏 Acknowledgements
- [Laravel](https://laravel.com/)
- [React](https://react.dev/)
- [Inertia.js](https://inertiajs.com/)
- [Shadcn UI](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Pest](https://pestphp.com/)
- [Jest](https://jestjs.io/)

---

## 📬 Contact
For questions, issues, or feature requests, please open an issue or contact the maintainers via GitHub. 
