# React Translation Rendering Errors

## Error: "Objects are not valid as a React child (found: object with keys {en})"

This error occurs when a translatable field object is rendered directly in JSX instead of being converted to a string first.

### Common Causes

1. **Direct rendering of model translatable fields**
2. **Incorrect translation function usage**
3. **Missing translation extraction in components**

### Examples of Problematic Code

```tsx
// ❌ WRONG - This will cause the error
const MyComponent = ({ item }) => (
  <div>
    <h1>{item.name}</h1> {/* If item.name is {en: "Title", ar: "عنوان"} */}
  </div>
);

// ❌ WRONG - Passing object to toast
toast.success(item.description); // If description is {en: "Success", ar: "نجح"}
```

### Solutions

#### 1. Use the TranslatableText Component

```tsx
import { TranslatableText } from '@/Core';

// ✅ CORRECT
const MyComponent = ({ item }) => (
  <div>
    <h1>
      <TranslatableText>{item.name}</TranslatableText>
    </h1>
  </div>
);
```

#### 2. Use the Translation Hook

```tsx
import { useTranslation } from '@/Core';

// ✅ CORRECT
const MyComponent = ({ item }) => {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t(item.name)}</h1>
    </div>
  );
};
```

#### 3. Use Safe Render Utility

```tsx
import { safeRender } from '@/Core';

// ✅ CORRECT
const MyComponent = ({ item }) => (
  <div>
    <h1>{safeRender(item.name, 'en', 'Untitled')}</h1>
  </div>
);
```

### For Toast Notifications

```tsx
import { toast } from 'sonner';
import { useTranslation } from '@/Core';

// ✅ CORRECT
const MyComponent = ({ item }) => {
  const { t } = useTranslation();
  
  const handleSave = () => {
    // Convert translatable object to string before passing to toast
    toast.success(t(item.successMessage) || 'Saved successfully');
  };
  
  return <button onClick={handleSave}>Save</button>;
};
```

### Debug Mode

In development, you can use debug utilities to identify potential issues:

```tsx
import { debugTranslationObject, isTranslatableObject } from '@/Core';

// Check if a value might cause rendering issues
if (isTranslatableObject(someValue)) {
  debugTranslationObject(someValue, 'MyComponent');
}
```

### Prevention Tips

1. **Always use translation functions** when rendering model data that might be translatable
2. **Use TypeScript** to catch these issues at compile time
3. **Test with different locales** to ensure objects are properly converted
4. **Use the TranslatableText component** as a safe wrapper for any potentially translatable content
5. **Never pass objects directly to toast notifications** - always convert to strings first

### Quick Fix Checklist

When you see this error:

- [ ] Identify which component is trying to render the object
- [ ] Find the specific JSX element causing the issue
- [ ] Check if the data is a translatable field (object with locale keys like `{en: "text"}`)
- [ ] Replace direct rendering with `<TranslatableText>` or `t()` function
- [ ] Test the fix with different locales
- [ ] Ensure toast notifications use string values, not objects

### TypeScript Prevention

Define proper types for your components to catch these issues early:

```tsx
interface ItemProps {
  item: {
    name: string | Record<string, string>; // Explicitly type translatable fields
    description: string | Record<string, string>;
  };
}

const MyComponent: React.FC<ItemProps> = ({ item }) => {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t(item.name)}</h1>
      <p>{t(item.description)}</p>
    </div>
  );
};
``` 