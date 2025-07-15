# Core Module - Centralized Resource Hub

The Core module serves as the centralized resource hub for the entire application, providing shared components, utilities, types, and services that can be reused across all modules.

## Overview

All shared resources have been moved to the Core module to:

- **Eliminate Duplication**: Prevent code duplication across modules
- **Ensure Consistency**: Maintain consistent UI/UX across the application
- **Simplify Maintenance**: Centralized updates and bug fixes
- **Improve Performance**: Better bundling and tree-shaking
- **Enhance Reusability**: Easy import and reuse of components

## Resource Structure

```
Modules/Core/resources/
├── js/
│   ├── components/        # Shared UI components
│   │   ├── ui/           # Base UI components (Shadcn)
│   │   ├── shared/       # Application-specific shared components
│   │   ├── auth/         # Authentication components
│   │   ├── navigation/   # Navigation components
│   │   └── index.ts      # Component exports
│   ├── layouts/          # Shared layout components
│   │   ├── app/          # Application layouts
│   │   ├── auth/         # Authentication layouts
│   │   └── index.ts      # Layout exports
│   ├── hooks/            # Custom React hooks
│   │   └── index.ts      # Hook exports
│   ├── utils/            # Utility functions
│   │   └── index.ts      # Utility exports
│   ├── types/            # TypeScript type definitions
│   │   └── index.ts      # Type exports
│   ├── services/         # API and business logic services
│   │   └── index.ts      # Service exports
│   ├── lib/              # Third-party library configurations
│   │   └── index.ts      # Library exports
│   ├── i18n/             # Internationalization resources
│   ├── app.tsx           # Main application entry point
│   ├── bootstrap.js      # Application bootstrap
│   ├── i18n.js           # Internationalization setup
│   └── index.ts          # Main exports file
├── css/
│   └── app.css           # Main application styles
├── lang/                 # Shared language files
└── views/                # Shared Blade templates
```

## Usage Examples

### Using Shared Components

```tsx
// In any module's component file
import { Button, Card, Modal, DataTable, AuthenticatedLayout, AppSidebar } from '@/../../Modules/Core/resources/js/components';

// Or use the main index
import { Button, Card, Modal } from '@/../../Modules/Core/resources/js';

export default function MyComponent() {
    return (
        <AuthenticatedLayout>
            <Card>
                <Button variant="primary">Click me</Button>
            </Card>
        </AuthenticatedLayout>
    );
}
```

### Using Shared Hooks

```tsx
// In any module's component file
import { useAuth, usePermissions, useApi, useLocalStorage } from '@/../../Modules/Core/resources/js/hooks';

export default function MyComponent() {
    const { user } = useAuth();
    const { can } = usePermissions();
    const { data, loading } = useApi('/api/data');

    if (!can('view-data')) {
        return <div>Access denied</div>;
    }

    return <div>{data?.message}</div>;
}
```

### Using Shared Utilities

```tsx
// In any module's component file
import { cn, formatDate, formatCurrency, validateEmail } from '@/../../Modules/Core/resources/js/utils';

export default function MyComponent({ className, date, amount }) {
    return (
        <div className={cn('base-class', className)}>
            <p>Date: {formatDate(date)}</p>
            <p>Amount: {formatCurrency(amount)}</p>
        </div>
    );
}
```

### Using Shared Types

```tsx
// In any module's TypeScript file
import type { User, ApiResponse, PageProps, FormData } from '@/../../Modules/Core/resources/js/types';

interface MyComponentProps {
    user: User;
    response: ApiResponse<FormData>;
}

export default function MyComponent({ user, response }: MyComponentProps) {
    // Component implementation
}
```

### Using Shared Services

```tsx
// In any module's component file
import {
  authService,
  apiService,
  notificationService
} from '@/../../Modules/Core/resources/js/services';

export default function MyComponent() {
  const handleLogin = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      notificationService.success('Login successful');
    } catch (error) {
      notificationService.error('Login failed');
    }
  };

  return (
    // Component JSX
  );
}
```

### Using Shared Layouts

```tsx
// In module page files
import { AuthenticatedLayout } from '@/../../Modules/Core/resources/js/layouts';

export default function ModulePage({ auth, children }) {
    return (
        <AuthenticatedLayout user={auth.user}>
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">{children}</div>
            </div>
        </AuthenticatedLayout>
    );
}
```

## Best Practices

### 1. Import Patterns

```tsx
// ✅ Preferred: Use specific imports
import { Button, Card } from '@/../../Modules/Core/resources/js/components';

// ✅ Alternative: Use main index for commonly used items
import { Button, Card, useAuth } from '@/../../Modules/Core/resources/js';

// ❌ Avoid: Wildcard imports (poor tree-shaking)
import * as Core from '@/../../Modules/Core/resources/js';
```

### 2. Component Extension

```tsx
// ✅ Extend shared components when needed
import { Button } from '@/../../Modules/Core/resources/js/components';

export const ModuleSpecificButton = ({ children, ...props }) => {
    return (
        <Button className="module-specific-styling" {...props}>
            {children}
        </Button>
    );
};
```

### 3. Type Augmentation

```tsx
// ✅ Extend shared types in module-specific type files
import type { BaseUser } from '@/../../Modules/Core/resources/js/types';

export interface ModuleUser extends BaseUser {
    moduleSpecificField: string;
}
```

## Migration Notes

### What Was Moved

1. **All UI Components**: From `resources/js/components/` to `Modules/Core/resources/js/components/`
2. **All Layouts**: From `resources/js/layouts/` to `Modules/Core/resources/js/layouts/`
3. **All Hooks**: From `resources/js/hooks/` to `Modules/Core/resources/js/hooks/`
4. **All Utilities**: From `resources/js/utils/` to `Modules/Core/resources/js/utils/`
5. **All Types**: From `resources/js/types/` to `Modules/Core/resources/js/types/`
6. **All Services**: From `resources/js/services/` to `Modules/Core/resources/js/services/`
7. **Core Files**: `app.tsx`, `bootstrap.js`, `i18n.js`, etc.
8. **Styles**: From `resources/css/` to `Modules/Core/resources/css/`
9. **Language Files**: From `resources/lang/` to `Modules/Core/resources/lang/`

### Main App Integration

The main application resources now serve as simple re-exports:

```tsx
// resources/js/app.tsx
import '../../Modules/Core/resources/js/app';

// resources/css/app.css
@import "../../Modules/Core/resources/css/app.css";
```

This maintains Laravel's expected structure while leveraging the centralized resources.

## Adding New Shared Resources

### Adding a New Component

1. Create the component in `Modules/Core/resources/js/components/`
2. Export it from `Modules/Core/resources/js/components/index.ts`
3. The component is now available for all modules

### Adding a New Hook

1. Create the hook in `Modules/Core/resources/js/hooks/`
2. Export it from `Modules/Core/resources/js/hooks/index.ts`
3. The hook is now available for all modules

### Adding a New Utility

1. Create the utility in `Modules/Core/resources/js/utils/`
2. Export it from `Modules/Core/resources/js/utils/index.ts`
3. The utility is now available for all modules

## Benefits Achieved

✅ **Centralized Management**: All shared resources in one location  
✅ **Reduced Duplication**: No more duplicate components across modules  
✅ **Consistent Styling**: Uniform UI/UX across the application  
✅ **Easy Maintenance**: Update once, apply everywhere  
✅ **Better Performance**: Improved bundling and code splitting  
✅ **Type Safety**: Shared TypeScript types ensure consistency  
✅ **Simplified Imports**: Clear import paths for shared resources  
✅ **Modular Architecture**: Clean separation of concerns

## Next Steps

1. **Create Module Templates**: Generate boilerplate for new modules with Core imports
2. **Documentation**: Document all shared components and their APIs
3. **Testing**: Implement comprehensive tests for shared resources
4. **Performance Monitoring**: Monitor bundle sizes and loading times
5. **Developer Tools**: Create tools to help developers use shared resources

## Support

For questions about using shared resources from the Core module, refer to:

- Component documentation in `Modules/Core/resources/js/components/`
- Hook documentation in `Modules/Core/resources/js/hooks/`
- Utility documentation in `Modules/Core/resources/js/utils/`
- This README file

The Core module is the foundation of our modular architecture, enabling rapid development while maintaining consistency and quality across the entire application.
