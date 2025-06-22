# Module-Based Translation System

This document outlines the module-based translation system used in the Laravel 12 Rental Management System.

## Overview

All translations are organized by module, following the Domain-Driven Design principles. This means that each module is responsible for its own translations, and there are no global translations in the main app.

## Directory Structure

Translations are stored in two places:

1. **Module PHP Translations**: `Modules/{ModuleName}/resources/lang/{locale}/{file}.php` (Legacy approach, being phased out)
2. **Module JSON Translations**: `public/locales/{ModuleName}/{locale}/{file}.json` (Preferred approach)

The first is used for backend translations, while the second is used for frontend translations via i18next.

## Usage

### Backend (PHP)

When using translations in PHP code, always use the module prefix:

```php
// CORRECT
__('ModuleName::file.key');
trans('ModuleName::file.key');

// INCORRECT - DO NOT USE
__('file.key');
trans('file.key');
```

### Frontend (JavaScript/TypeScript)

When using translations in JavaScript/TypeScript code, always use namespaced keys:

```typescript
// CORRECT
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t } = useTranslation(['common', 'employees']);
  
  return (
    <div>
      <h1>{t('common:dashboard')}</h1>
      <p>{t('employees:employee_details')}</p>
    </div>
  );
};

// INCORRECT - DO NOT USE
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('dashboard')}</h1>
      <p>{t('employee_details')}</p>
    </div>
  );
};
```

## Module Namespace Mapping

The system automatically maps namespaces to modules. Here's the default mapping:

```javascript
const moduleMap = {
  common: 'Core',
  core: 'Core',
  employees: 'EmployeeManagement',
  employee: 'EmployeeManagement',
  projects: 'ProjectManagement',
  project: 'ProjectManagement',
  equipment: 'EquipmentManagement',
  rentals: 'RentalManagement',
  rental: 'RentalManagement',
  timesheet: 'TimesheetManagement',
  timesheets: 'TimesheetManagement',
  payrolls: 'Payroll',
  payroll: 'Payroll',
  mobile: 'MobileBridge',
  analytics: 'Analytics',
  booking: 'Core',
  customer: 'CustomerManagement',
  customers: 'CustomerManagement',
  leave: 'LeaveManagement',
  leaves: 'LeaveManagement',
  // ... and more
};
```

## Adding New Translations

### Backend (PHP)

1. Create a new PHP file in `Modules/{ModuleName}/resources/lang/{locale}/{file}.php`
2. Add your translations as a PHP array

Example:

```php
// Modules/CustomerManagement/resources/lang/en/customers.php
return [
    'customer_details' => 'Customer Details',
    'customer_name' => 'Customer Name',
    'contact_person' => 'Contact Person',
    // ... more translations
];
```

### Frontend (JSON)

1. Create a new JSON file in `public/locales/{ModuleName}/{locale}/{file}.json`
2. Add your translations as a JSON object

Example:

```json
// public/locales/CustomerManagement/en/customers.json
{
  "customer_details": "Customer Details",
  "customer_name": "Customer Name",
  "contact_person": "Contact Person"
}
```

## Handling Translatable Models

For models with translatable fields (using Spatie's Laravel Translatable), use the `TranslatableText` component or the `t()` function from the `useTranslation` hook to render the field:

```tsx
import { TranslatableText } from '@/Core';
import { useTranslation } from '@/Core';

const CustomerDetails = ({ customer }) => {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1><TranslatableText>{customer.name}</TranslatableText></h1>
      <p>{t(customer.description)}</p>
    </div>
  );
};
```

## Handling Toast Notifications

When using toast notifications with translatable content, always convert the translatable object to a string first:

```tsx
import { toast } from 'sonner';
import { useTranslation } from '@/Core';

const SaveButton = ({ successMessage }) => {
  const { t } = useTranslation();
  
  const handleSave = () => {
    // CORRECT
    toast.success(t(successMessage));
    
    // INCORRECT - DO NOT USE
    // toast.success(successMessage);
  };
  
  return <button onClick={handleSave}>Save</button>;
};
```

## Helper Functions

The application includes helper functions to safely access module paths:

### safe_module_path

```php
safe_module_path($name, $path = '')
```

This function is a fallback for when the `module_path` function fails. It tries to use the original `module_path` function first, and if it fails, it falls back to a direct path construction.

## Migration Scripts

The following scripts are available to help with the migration to module-based translations:

1. `php migrate-translations.php` - Migrates translations from the main app to modules
2. `php check-translation-usage.php` - Checks for code using the old translation system
3. `php check-translation-issues.php` - Checks for inconsistencies between PHP and JSON translations
4. `php check-module-translations.php` - Checks if all modules have their own translation files
5. `php generate-missing-translations.php` - Generates missing translation files
6. `php remove-main-app-translations.php` - Removes the main app translation files after ensuring they're migrated to modules

## Best Practices

1. Always use the module prefix for backend translations
2. Always use namespaced keys for frontend translations
3. Keep translations organized by module
4. Use the `TranslatableText` component for rendering translatable model fields
5. Convert translatable objects to strings before passing them to toast notifications
6. Use the `safe_module_path` function when accessing module paths to avoid errors 