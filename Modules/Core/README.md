# Core Module Standards

## Module Structure
```
Modules/
├── Core/
│   ├── Config/
│   ├── Database/
│   │   ├── Migrations/
│   │   └── Seeders/
│   ├── Http/
│   │   ├── Controllers/
│   │   ├── Middleware/
│   │   └── Requests/
│   ├── Providers/
│   ├── Repositories/
│   ├── Resources/
│   │   ├── js/
│   │   │   └── Components/
│   │   │       ├── Common/
│   │   │       ├── Layout/
│   │   │       └── Module/
│   │   ├── lang/
│   │   └── views/
│   ├── Routes/
│   ├── Services/
│   └── composer.json
```

## Module Standards

### 1. Service Layer
- All business logic must be implemented in Services
- Services should extend `BaseService`
- Services should be registered in the module's ServiceProvider
- Services should use Repositories for data access

### 2. Repository Layer
- All data access must be implemented in Repositories
- Repositories should extend `BaseRepository`
- Repositories should implement their respective interfaces
- Repositories should be registered in the module's ServiceProvider

### 3. Controller Layer
- Controllers should be thin and delegate to Services
- Controllers should use dependency injection
- Controllers should return proper responses
- Controllers should validate input using Form Requests

### 4. Module Communication
- Modules should communicate through Services
- Cross-module dependencies should be declared in composer.json
- Events should be used for loose coupling
- Shared functionality should be in Core module

### 5. Testing
- Each module should have its own tests
- Tests should be organized by feature
- Tests should use proper test data
- Tests should mock external dependencies

### 6. Documentation
- Each module should have a README.md
- Complex logic should be documented
- API endpoints should be documented
- Dependencies should be documented

## Legacy Code Migration

### Migration Process
1. Create new module structure
2. Copy relevant code
3. Refactor to follow standards
4. Update dependencies
5. Add tests
6. Document changes

### Migration Guidelines
- Maintain backward compatibility
- Use feature flags if needed
- Document all changes
- Test thoroughly
- Update documentation

## Security Guidelines
- Use proper authentication
- Implement authorization
- Validate all input
- Sanitize all output
- Use proper encryption
- Follow security best practices

## Performance Guidelines
- Use proper caching
- Optimize queries
- Use eager loading
- Implement proper indexing
- Monitor performance

## Deployment Guidelines
- Follow semantic versioning
- Document breaking changes
- Test in staging
- Monitor after deployment
- Have rollback plan 

## Shared Components

### Common Components
Common components are reusable UI elements that can be used across all modules.

#### Button
A flexible button component that extends shadcn/ui's button with additional features.

```tsx
import { Button } from "@/Modules/Core/Resources/js/Components/Common/Button";

// Basic usage
<Button>Click me</Button>

// With loading state
<Button isLoading>Loading...</Button>

// With icons
<Button leftIcon={<PlusIcon />}>Add Item</Button>
<Button rightIcon={<ArrowIcon />}>Next</Button>

// With variants
<Button variant="destructive">Delete</Button>
<Button variant="outline">Cancel</Button>

// With sizes
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
```

Props:
- `isLoading?: boolean` - Shows loading spinner and disables button
- `leftIcon?: React.ReactNode` - Icon to show before text
- `rightIcon?: React.ReactNode` - Icon to show after text
- `variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"` - Button style variant
- `size?: "default" | "sm" | "lg" | "icon"` - Button size
- All standard button HTML attributes are supported

#### Input
A flexible input component that extends shadcn/ui's input with additional features.

```tsx
import { Input } from "@/Modules/Core/Resources/js/Components/Common/Input";
import { SearchIcon } from "lucide-react";

// Basic usage
<Input placeholder="Enter text" />

// With label
<Input label="Username" />

// With helper text
<Input helperText="This is a helper text" />

// With error message
<Input error="This field is required" />

// With tooltip
<Input 
  label="Password" 
  tooltip="Must be at least 8 characters" 
/>

// With icons
<Input 
  leftIcon={<SearchIcon className="h-4 w-4" />} 
  placeholder="Search..." 
/>
<Input 
  rightIcon={<SearchIcon className="h-4 w-4" />} 
  placeholder="Search..." 
/>

// With custom className
<Input className="custom-class" />

// Disabled state
<Input disabled />
```

Props:
- `label?: string` - Label text for the input
- `error?: string` - Error message to display
- `helperText?: string` - Helper text to display below the input
- `tooltip?: string` - Tooltip text to show on hover
- `leftIcon?: React.ReactNode` - Icon to show before input
- `rightIcon?: React.ReactNode` - Icon to show after input
- All standard input HTML attributes are supported

#### Select
A flexible select component that extends shadcn/ui's select with additional features.

```tsx
import { Select } from "@/Modules/Core/Resources/js/Components/Common/Select";

const options = [
  { value: "1", label: "Option 1" },
  { value: "2", label: "Option 2" },
  { value: "3", label: "Option 3", disabled: true },
];

// Basic usage
<Select options={options} />

// With label
<Select label="Category" options={options} />

// With helper text
<Select helperText="Select a category" options={options} />

// With error message
<Select error="This field is required" options={options} />

// With tooltip
<Select 
  label="Category" 
  tooltip="Select a category from the list" 
  options={options} 
/>

// With custom placeholder
<Select placeholder="Choose an option" options={options} />

// With value and onChange
<Select 
  value="1" 
  onChange={(value) => console.log(value)} 
  options={options} 
/>

// Disabled state
<Select disabled options={options} />
```

Props:
- `options: SelectOption[]` - Array of options to display
  ```tsx
  interface SelectOption {
    value: string;
    label: string;
    disabled?: boolean;
  }
  ```
- `label?: string` - Label text for the select
- `error?: string` - Error message to display
- `helperText?: string` - Helper text to display below the select
- `tooltip?: string` - Tooltip text to show on hover
- `value?: string` - Current selected value
- `onChange?: (value: string) => void` - Callback when selection changes
- `placeholder?: string` - Placeholder text when no option is selected
- All standard select HTML attributes are supported (except onChange)

#### Card
A flexible card component that extends shadcn/ui's card with additional features.

```tsx
import { Card } from "@/Modules/Core/Resources/js/Components/Common/Card";
import { Button } from "@/Modules/Core/Resources/js/Components/Common/Button";

// Basic usage
<Card>
  <p>Card content</p>
</Card>

// With title and description
<Card 
  title="Card Title" 
  description="Card description"
>
  <p>Card content</p>
</Card>

// With header actions
<Card 
  title="Card Title"
  headerActions={<Button>Action</Button>}
>
  <p>Card content</p>
</Card>

// With footer
<Card 
  footer={<Button>Footer Action</Button>}
>
  <p>Card content</p>
</Card>

// With loading state
<Card isLoading>
  <p>Card content</p>
</Card>

// With variants
<Card variant="bordered">
  <p>Card content</p>
</Card>

<Card variant="elevated">
  <p>Card content</p>
</Card>

// With custom className
<Card className="custom-class">
  <p>Card content</p>
</Card>
```

Props:
- `title?: string` - Card title
- `description?: string` - Card description
- `footer?: React.ReactNode` - Footer content
- `headerActions?: React.ReactNode` - Actions to show in the header
- `isLoading?: boolean` - Shows loading spinner and disables interaction
- `variant?: "default" | "bordered" | "elevated"` - Card style variant
- All standard div HTML attributes are supported

#### Modal
A flexible modal component that extends shadcn/ui's dialog with additional features.

```tsx
import { Modal } from "@/Modules/Core/Resources/js/Components/Common/Modal";
import { Button } from "@/Modules/Core/Resources/js/Components/Common/Button";

// Basic usage
<Modal isOpen onClose={() => setIsOpen(false)}>
  <p>Modal content</p>
</Modal>

// With title and description
<Modal 
  isOpen 
  title="Modal Title" 
  description="Modal description"
  onClose={() => setIsOpen(false)}
>
  <p>Modal content</p>
</Modal>

// With footer
<Modal 
  isOpen
  footer={<Button>Footer Action</Button>}
  onClose={() => setIsOpen(false)}
>
  <p>Modal content</p>
</Modal>

// With loading state
<Modal 
  isOpen 
  isLoading
  onClose={() => setIsOpen(false)}
>
  <p>Modal content</p>
</Modal>

// With different sizes
<Modal 
  isOpen 
  size="sm"
  onClose={() => setIsOpen(false)}
>
  <p>Small modal</p>
</Modal>

<Modal 
  isOpen 
  size="lg"
  onClose={() => setIsOpen(false)}
>
  <p>Large modal</p>
</Modal>

// Without close button
<Modal 
  isOpen 
  showCloseButton={false}
  onClose={() => setIsOpen(false)}
>
  <p>Modal content</p>
</Modal>

// Prevent closing on outside click
<Modal 
  isOpen 
  closeOnOutsideClick={false}
  onClose={() => setIsOpen(false)}
>
  <p>Modal content</p>
</Modal>
```

Props:
- `isOpen: boolean` - Controls modal visibility
- `onClose: () => void` - Callback when modal is closed
- `title?: string` - Modal title
- `description?: string` - Modal description
- `footer?: React.ReactNode` - Footer content
- `size?: "sm" | "md" | "lg" | "xl" | "full"` - Modal size
- `showCloseButton?: boolean` - Show/hide close button
- `closeOnOutsideClick?: boolean` - Allow closing on outside click
- `isLoading?: boolean` - Shows loading spinner and disables interaction
- All standard div HTML attributes are supported

#### Table
A flexible table component that extends shadcn/ui's table with additional features.

```tsx
import { Table } from "@/Modules/Core/Resources/js/Components/Common/Table";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

// Basic usage
const columns = [
  {
    key: "name",
    header: "Name",
    accessor: (user: User) => user.name,
  },
  {
    key: "email",
    header: "Email",
    accessor: (user: User) => user.email,
  },
  {
    key: "role",
    header: "Role",
    accessor: (user: User) => user.role,
  },
];

<Table data={users} columns={columns} />

// With sorting
const sortableColumns = [
  {
    key: "name",
    header: "Name",
    accessor: (user: User) => user.name,
    sortable: true,
  },
  {
    key: "email",
    header: "Email",
    accessor: (user: User) => user.email,
    sortable: true,
  },
];

<Table
  data={users}
  columns={sortableColumns}
  onSort={(key, direction) => handleSort(key, direction)}
  sortKey={currentSortKey}
  sortDirection={currentSortDirection}
/>

// With loading state
<Table
  data={users}
  columns={columns}
  isLoading
/>

// With custom empty message
<Table
  data={[]}
  columns={columns}
  emptyMessage="No users found"
/>

// With row click handler
<Table
  data={users}
  columns={columns}
  onRowClick={(user) => handleUserClick(user)}
/>

// With custom styling
<Table
  data={users}
  columns={columns}
  className="custom-table"
  rowClassName="custom-row"
/>

// With dynamic row styling
<Table
  data={users}
  columns={columns}
  rowClassName={(user) => `row-${user.role}`}
/>
```

Props:
- `data: T[]` - Array of data items to display
- `columns: Column<T>[]` - Column definitions
  - `key: string` - Unique identifier for the column
  - `header: string` - Column header text
  - `accessor: (item: T) => React.ReactNode` - Function to get cell content
  - `sortable?: boolean` - Whether the column can be sorted
  - `className?: string` - Custom class name for the column
- `isLoading?: boolean` - Shows loading spinner
- `emptyMessage?: string` - Custom message when no data is available
- `onSort?: (key: string, direction: "asc" | "desc") => void` - Sort handler
- `sortKey?: string` - Currently sorted column key
- `sortDirection?: "asc" | "desc"` - Current sort direction
- `rowClassName?: string | ((item: T) => string)` - Custom class name for rows
- `onRowClick?: (item: T) => void` - Row click handler
- All standard table HTML attributes are supported

#### AppLayout
A flexible layout component that provides a consistent application structure with navigation, header, and content areas.

```tsx
import { AppLayout } from "@/Modules/Core/Resources/js/Components/Layout/AppLayout";

// Basic usage
<AppLayout>
  <div>Page content</div>
</AppLayout>

// With title
<AppLayout title="Dashboard">
  <div>Dashboard content</div>
</AppLayout>

// With custom header
<AppLayout 
  header={<h1>Custom Header</h1>}
>
  <div>Page content</div>
</AppLayout>
```

Props:
- `title?: string` - Page title (defaults to 'Core Module')
- `header?: React.ReactNode` - Custom header content
- `children: React.ReactNode` - Main content of the page

### Testing Standards

#### Unit Tests
- Each component should have a corresponding test file
- Test file should be named `{ComponentName}.test.tsx`
- Tests should cover all props and interactions
- Use React Testing Library for component tests
- Mock external dependencies

Example:
```tsx
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders with default props', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(<Button isLoading>Loading</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });
});
```

#### Integration Tests
- Test component interactions
- Test form submissions
- Test API calls
- Test error handling
- Test loading states

Example:
```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Form } from './Form';

describe('Form', () => {
  it('submits form data', async () => {
    const onSubmit = jest.fn();
    render(<Form onSubmit={onSubmit} />);
    
    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'John Doe' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    
    expect(onSubmit).toHaveBeenCalledWith({
      name: 'John Doe'
    });
  });
});
```

### API Documentation Standards

#### Endpoint Documentation
Each API endpoint should be documented with:
- HTTP method
- URL
- Request parameters
- Request body schema
- Response schema
- Error responses
- Authentication requirements
- Rate limiting
- Example requests/responses

Example:
```markdown
## Create User

Creates a new user in the system.

**Method:** POST  
**URL:** `/api/users`

**Authentication:** Required  
**Rate Limit:** 100 requests per hour

**Request Body:**
```json
{
  "name": "string",
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "id": "string",
  "name": "string",
  "email": "string",
  "created_at": "string"
}
```

**Error Responses:**
- 400 Bad Request - Invalid input
- 401 Unauthorized - Missing authentication
- 403 Forbidden - Insufficient permissions
- 409 Conflict - Email already exists
```

#### API Versioning
- Use semantic versioning for APIs
- Document breaking changes
- Maintain backward compatibility
- Use proper version headers
- Document deprecation notices

#### Security
- Document authentication methods
- List required permissions
- Document rate limiting
- Explain security measures
- List known vulnerabilities

#### Error Handling
- Document error codes
- Provide error messages
- Explain error resolution
- List common errors
- Document retry strategies
