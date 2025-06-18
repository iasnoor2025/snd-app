# System Patterns: Laravel 12 Modular Architecture

## Architectural Overview

This application follows a **Modular Monolith** architecture pattern, combining the benefits of microservices modularity with the simplicity of monolithic deployment. Each business domain is encapsulated in its own module while sharing common infrastructure.

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Layer (React)                   │
├─────────────────────────────────────────────────────────────┤
│                   Inertia.js Bridge                        │
├─────────────────────────────────────────────────────────────┤
│                   Laravel Core                              │
├─────────────────────────────────────────────────────────────┤
│  Module 1  │  Module 2  │  Module 3  │  ...  │  Module N   │
│ Customer   │ Employee   │Equipment   │       │   Settings  │
│Management  │Management  │Management  │       │             │
└─────────────────────────────────────────────────────────────┘
```

## Module Structure Pattern

Each module follows a consistent **Domain-Driven Design (DDD)** structure:

```
Modules/[ModuleName]/
├── Actions/           # Command/Action classes
├── Config/           # Module-specific configuration
├── Database/         # Migrations, seeders, factories
├── Domain/          # Core business logic
│   ├── Models/       # Eloquent models
│   ├── Entities/     # Domain entities
│   └── ValueObjects/ # Value objects
├── Events/          # Domain events
├── Http/            # Controllers, requests, resources
│   ├── Controllers/
│   ├── Requests/
│   └── Resources/
├── Jobs/            # Queue jobs
├── Listeners/       # Event listeners
├── Notifications/   # Notification classes
├── Observers/       # Model observers
├── Policies/        # Authorization policies
├── Providers/       # Service providers
├── Queries/         # Query builders
├── Repositories/    # Data access layer
├── Routes/          # Module routes
├── Services/        # Business services
├── Tests/           # Module tests
└── resources/       # Views, translations
    ├── js/          # React components
    ├── lang/        # Translations
    └── views/       # Blade templates (if needed)
```

## Key Design Patterns

### 1. **Repository Pattern**
```php
// Interface
interface CustomerRepositoryInterface
{
    public function findById(int $id): ?Customer;
    public function create(array $data): Customer;
    public function update(Customer $customer, array $data): Customer;
}

// Implementation
class EloquentCustomerRepository implements CustomerRepositoryInterface
{
    // Implementation details
}
```

### 2. **Action Pattern**
```php
class CreateCustomerAction
{
    public function __construct(
        private CustomerRepositoryInterface $repository,
        private CustomerValidator $validator
    ) {}
    
    public function execute(array $data): Customer
    {
        $this->validator->validate($data);
        return $this->repository->create($data);
    }
}
```

### 3. **Event-Driven Architecture**
```php
// Event
class CustomerCreated
{
    public function __construct(public Customer $customer) {}
}

// Listener
class SendWelcomeEmail
{
    public function handle(CustomerCreated $event): void
    {
        // Send welcome email
    }
}
```

### 4. **Service Layer Pattern**
```php
class CustomerService
{
    public function __construct(
        private CreateCustomerAction $createAction,
        private UpdateCustomerAction $updateAction
    ) {}
    
    public function createCustomer(array $data): Customer
    {
        return $this->createAction->execute($data);
    }
}
```

## Frontend Architecture Patterns

### 1. **Component Composition**
```typescript
// Base layout component
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className="min-h-screen bg-background">
            <Header />
            <Sidebar />
            <main>{children}</main>
        </div>
    );
};

// Page component
const CustomerList: React.FC = () => {
    return (
        <AppLayout>
            <CustomerTable />
            <CustomerFilters />
        </AppLayout>
    );
};
```

### 2. **Custom Hooks Pattern**
```typescript
// Data fetching hook
const useCustomers = () => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        fetchCustomers().then(setCustomers).finally(() => setLoading(false));
    }, []);
    
    return { customers, loading };
};
```

### 3. **Form Management Pattern**
```typescript
// Using react-hook-form with Zod validation
const CustomerForm: React.FC = () => {
    const form = useForm<CustomerFormData>({
        resolver: zodResolver(customerSchema),
    });
    
    const onSubmit = (data: CustomerFormData) => {
        router.post('/customers', data);
    };
    
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                {/* Form fields */}
            </form>
        </Form>
    );
};
```

## Data Flow Patterns

### 1. **Request/Response Flow**
```
React Component → Inertia.js → Laravel Route → Controller → Service → Action → Repository → Database
                                     ↓
React Component ← Inertia.js ← JSON Response ← Controller ← Service ← Action ← Repository
```

### 2. **Event Flow**
```
User Action → Controller → Service → Action → Event Dispatch → Listeners → Side Effects
```

## Security Patterns

### 1. **Authorization Pattern**
```php
// Policy-based authorization
class CustomerPolicy
{
    public function view(User $user, Customer $customer): bool
    {
        return $user->can('view-customers') || $user->id === $customer->user_id;
    }
}

// Controller usage
class CustomerController
{
    public function show(Customer $customer)
    {
        $this->authorize('view', $customer);
        return Inertia::render('Customers/Show', compact('customer'));
    }
}
```

### 2. **Input Validation Pattern**
```php
class CreateCustomerRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:customers',
            'phone' => 'required|string|regex:/^[0-9+\-\s]+$/',
        ];
    }
}
```

## Caching Patterns

### 1. **Repository Caching**
```php
class CachedCustomerRepository implements CustomerRepositoryInterface
{
    public function __construct(
        private CustomerRepositoryInterface $repository,
        private CacheManager $cache
    ) {}
    
    public function findById(int $id): ?Customer
    {
        return $this->cache->remember(
            "customer.{$id}",
            3600,
            fn() => $this->repository->findById($id)
        );
    }
}
```

### 2. **Query Result Caching**
```php
class CustomerService
{
    public function getActiveCustomers(): Collection
    {
        return Cache::tags(['customers'])
            ->remember('customers.active', 1800, function () {
                return Customer::where('status', 'active')->get();
            });
    }
}
```

## Testing Patterns

### 1. **Feature Testing**
```php
class CustomerManagementTest extends TestCase
{
    use RefreshDatabase;
    
    public function test_user_can_create_customer(): void
    {
        $user = User::factory()->create();
        $customerData = Customer::factory()->make()->toArray();
        
        $this->actingAs($user)
            ->post('/customers', $customerData)
            ->assertRedirect('/customers')
            ->assertSessionHas('success');
            
        $this->assertDatabaseHas('customers', $customerData);
    }
}
```

### 2. **Unit Testing**
```php
class CreateCustomerActionTest extends TestCase
{
    public function test_creates_customer_with_valid_data(): void
    {
        $repository = Mockery::mock(CustomerRepositoryInterface::class);
        $validator = Mockery::mock(CustomerValidator::class);
        
        $action = new CreateCustomerAction($repository, $validator);
        
        $data = ['name' => 'John Doe', 'email' => 'john@example.com'];
        $customer = new Customer($data);
        
        $validator->shouldReceive('validate')->with($data)->once();
        $repository->shouldReceive('create')->with($data)->andReturn($customer);
        
        $result = $action->execute($data);
        
        $this->assertInstanceOf(Customer::class, $result);
    }
}
```

## Performance Patterns

### 1. **Eager Loading**
```php
class CustomerRepository
{
    public function getCustomersWithRelations(): Collection
    {
        return Customer::with(['projects', 'rentals', 'user'])
            ->orderBy('created_at', 'desc')
            ->get();
    }
}
```

### 2. **Database Optimization**
```php
// Use database indexes
Schema::table('customers', function (Blueprint $table) {
    $table->index(['status', 'created_at']);
    $table->index('email');
});

// Use database transactions for consistency
DB::transaction(function () {
    $customer = Customer::create($customerData);
    $customer->projects()->create($projectData);
    event(new CustomerCreated($customer));
});
```

This modular architecture ensures maintainability, testability, and scalability while providing clear separation of concerns and consistent patterns across all modules.