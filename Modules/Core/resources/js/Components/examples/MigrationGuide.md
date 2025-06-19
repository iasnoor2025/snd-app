# Migration Guide: From getTranslation to react-i18next

This guide explains how to migrate from the custom `getTranslation` utility to the industry-standard `react-i18next` library in your application.

## Setup Overview

The migration has been set up with the following components:

1. **Translation JSON files** in `public/locales/[lang]/[namespace].json`
   - `common.json` - General UI terms
   - `employees.json` - Employee-specific terms

2. **i18n Configuration** in `resources/js/i18n.js`
   - Configured with English and Arabic support
   - Using HTTP backend to load translations
   - Browser language detection

3. **Example Components**
   - `TranslationExample.tsx` - Basic usage examples
   - `EmployeeDetailsExample.tsx` - Migration example for employee details

## Migration Steps

### 1. Import the useTranslation hook

Replace:
```typescript
import { getTranslation } from '@/utils/translation';
```

With:
```typescript
import { useTranslation } from 'react-i18next';
```

### 2. Initialize the hook in your component

Add this inside your component:
```typescript
// Use the useTranslation hook to access translation functions
const { t } = useTranslation(['common', 'employees']);

// For RTL support
const { i18n } = useTranslation();
const isRTL = i18n.dir() === 'rtl';
```

### 3. Replace getTranslation calls with t function

Replace:
```typescript
<dt className="text-sm font-medium">Full Name</dt>
```

With:
```typescript
<dt className="text-sm font-medium">{t('employees:full_name')}</dt>
```

Note the namespace prefix (`employees:`) which specifies which translation file to use.

### 4. Handle RTL text direction

Add RTL support to your components:
```typescript
<div className={`space-y-4 ${isRTL ? 'text-right' : 'text-left'}`}>
```

### 5. Language Switching

To allow users to change languages:
```typescript
<button onClick={() => i18n.changeLanguage('en')}>English</button>
<button onClick={() => i18n.changeLanguage('ar')}>العربية</button>
```

## Best Practices

1. **Organize translations by namespace**
   - `common` - General UI terms (buttons, labels, etc.)
   - `employees` - Employee-specific terms
   - Add more namespaces as needed for different modules

2. **Use translation keys consistently**
   - Follow a hierarchical structure (e.g., `section.subsection.element`)
   - Keep keys in English and lowercase with underscores
   - Be descriptive but concise

3. **Handle pluralization**
   - Use the count parameter: `t('key', { count: items.length })`
   - Define plural forms in translation files

4. **Handle interpolation**
   - Pass variables: `t('welcome', { name: user.name })`
   - In translation file: `"welcome": "Welcome, {{name}}!"`

## Example: Before and After

### Before (with getTranslation)
```tsx
<div className="flex justify-between border-b pb-2">
  <dt className="text-sm font-medium">Iqama Number</dt>
  <dd className="text-sm">{employee.iqama_number}</dd>
</div>
```

### After (with react-i18next)
```tsx
<div className="flex justify-between border-b pb-2">
  <dt className="text-sm font-medium">{t('employees:iqama_number')}</dt>
  <dd className="text-sm">{employee.iqama_number}</dd>
</div>
```

## Additional Resources

- [react-i18next Documentation](https://react.i18next.com/)
- [i18next Documentation](https://www.i18next.com/)
- Example components in this project:
  - `TranslationExample.tsx`
  - `EmployeeDetailsExample.tsx`
