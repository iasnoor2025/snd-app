# Coding Standards - Laravel 12 Rental Management System

## Overview

This document outlines the coding standards and best practices for the Laravel 12 Rental Management System. Following these standards ensures consistency, maintainability, and quality across the codebase.

## Table of Contents

1. [General Guidelines](#general-guidelines)
2. [PHP Standards](#php-standards)
3. [TypeScript/React Standards](#typescript-react-standards)
4. [Database Standards](#database-standards)
5. [Testing Standards](#testing-standards)
6. [Documentation Standards](#documentation-standards)

## General Guidelines

### Project Structure

1. **Module Organization**
   - Place modules in `Modules/` directory
   - Follow Domain-Driven Design principles
   - Use PascalCase for module names
   - Maintain consistent module structure

2. **Resource Organization**
   - Place global components in `resources/js/components/`
   - Module-specific components in `Modules/{ModuleName}/resources/js/components/`
   - Use Shadcn UI components for consistency
   - Follow component composition pattern

### Naming Conventions

1. **File Naming**
   - PHP files: PascalCase (e.g., `CustomerController.php`)
   - TypeScript/React files: PascalCase for components (e.g., `RentalForm.tsx`)
   - Configuration files: kebab-case (e.g., `webpack.config.js`)
   - Database migrations: snake_case (e.g., `create_customers_table.php`)

2. **Class Naming**
   - Controllers: PascalCase, suffixed with `Controller`
   - Models: PascalCase singular
   - Interfaces: PascalCase, prefixed with `I`
   - Traits: PascalCase, suffixed with `Trait`

### Version Control

1. **Branch Naming**
   - Feature branches: `feature/feature-name`
   - Bug fixes: `fix/bug-description`
   - Hotfixes: `hotfix/issue-description`
   - Releases: `release/version-number`

2. **Commit Messages**
   ```
   type(scope): description

   [optional body]

   [optional footer]
   ```
   Types:
   - feat: New feature
   - fix: Bug fix
   - docs: Documentation
   - style: Code style changes
   - refactor: Code refactoring
   - test: Test changes
   - chore: Build/maintenance

## PHP Standards

### Code Style

1. **PSR-12 Compliance**
   - Use PSR-12 coding standard
   - Use Laravel Pint for formatting
   - Maintain consistent indentation
   - Follow Laravel conventions

2. **Type Declarations**
   ```php
   public function processRental(
       RentalRequest $request,
       int $customerId
   ): RentalResponse {
       // Implementation
   }
   ```

### Class Organization

1. **Class Structure**
   ```php
   class RentalService
   {
       // Constants
       private const STATUS_ACTIVE = 'active';

       // Properties
       private RentalRepository $repository;

       // Constructor
       public function __construct(RentalRepository $repository)
       {
           $this->repository = $repository;
       }

       // Public methods
       public function createRental(array $data): Rental
       {
           // Implementation
       }

       // Protected methods
       protected function validateRental(array $data): bool
       {
           // Implementation
       }

       // Private methods
       private function processRentalData(array $data): array
       {
           // Implementation
       }
   }
   ```

2. **Dependency Injection**
   ```php
   class RentalController
   {
       public function __construct(
           private readonly RentalService $rentalService,
           private readonly CustomerService $customerService
       ) {}
   }
   ```

### Documentation

1. **PHPDoc Blocks**
   ```php
   /**
    * Process a new rental request.
    *
    * @param RentalRequest $request The rental request data
    * @param int $customerId The customer ID
    * @return RentalResponse The processed rental response
    * @throws RentalException When rental processing fails
    */
   public function processRental(
       RentalRequest $request,
       int $customerId
   ): RentalResponse
   ```

2. **Code Comments**
   ```php
   // Good: Explains complex logic
   // Calculate pro-rated amount based on rental duration
   $proRatedAmount = $this->calculateProRatedAmount($duration, $baseRate);

   // Bad: States the obvious
   // Get customer
   $customer = Customer::find($id);
   ```

## TypeScript/React Standards

### Code Style

1. **TypeScript Configuration**
   ```json
   {
     "compilerOptions": {
       "target": "ES2020",
       "lib": ["DOM", "DOM.Iterable", "ESNext"],
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
       "noFallthroughCasesInSwitch": true
     }
   }
   ```

2. **ESLint Configuration**
   ```json
   {
     "extends": [
       "eslint:recommended",
       "plugin:@typescript-eslint/recommended",
       "plugin:react-hooks/recommended"
     ],
     "parser": "@typescript-eslint/parser",
     "plugins": ["@typescript-eslint", "react-refresh"],
     "rules": {
       "react-refresh/only-export-components": [
         "warn",
         { "allowConstantExport": true }
       ]
     }
   }
   ```

### Component Structure

1. **Functional Components**
   ```tsx
   interface RentalFormProps {
     customerId: number;
     onSubmit: (data: RentalFormData) => Promise<void>;
   }

   export const RentalForm: React.FC<RentalFormProps> = ({
     customerId,
     onSubmit
   }) => {
     // Implementation
   };
   ```

2. **Custom Hooks**
   ```tsx
   export const useRental = (rentalId: number) => {
     const [rental, setRental] = useState<Rental | null>(null);
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState<Error | null>(null);

     useEffect(() => {
       // Implementation
     }, [rentalId]);

     return { rental, loading, error };
   };
   ```

### State Management

1. **Local State**
   ```tsx
   const [formData, setFormData] = useState<RentalFormData>({
     startDate: new Date(),
     endDate: new Date(),
     equipmentId: '',
     quantity: 1
   });
   ```

2. **Context API**
   ```tsx
   const RentalContext = createContext<RentalContextType | null>(null);

   export const RentalProvider: React.FC<PropsWithChildren> = ({ children }) => {
     // Implementation
   };
   ```

## Database Standards

### Table Design

1. **Naming Conventions**
   - Tables: plural, snake_case (e.g., `rental_items`)
   - Columns: singular, snake_case (e.g., `first_name`)
   - Foreign keys: singular, suffixed with `_id` (e.g., `customer_id`)
   - Indexes: descriptive prefix (e.g., `idx_rentals_status`)

2. **Column Types**
   ```php
   public function up(): void
   {
       Schema::create('rentals', function (Blueprint $table) {
           $table->id();
           $table->foreignId('customer_id')->constrained();
           $table->string('status', 20);
           $table->decimal('total_amount', 10, 2);
           $table->timestamp('start_date');
           $table->timestamp('end_date');
           $table->timestamps();
           $table->softDeletes();
       });
   }
   ```

### Relationships

1. **Eloquent Relationships**
   ```php
   class Rental extends Model
   {
       public function customer(): BelongsTo
       {
           return $this->belongsTo(Customer::class);
       }

       public function items(): HasMany
       {
           return $this->hasMany(RentalItem::class);
       }
   }
   ```

2. **Foreign Keys**
   ```php
   $table->foreign('customer_id')
         ->references('id')
         ->on('customers')
         ->onDelete('restrict');
   ```

## Testing Standards

### Unit Tests

1. **Test Structure**
   ```php
   class RentalServiceTest extends TestCase
   {
       private RentalService $service;
       private MockObject $repository;

       protected function setUp(): void
       {
           parent::setUp();
           $this->repository = $this->createMock(RentalRepository::class);
           $this->service = new RentalService($this->repository);
       }

       public function test_creates_rental_successfully(): void
       {
           // Arrange
           $data = ['customer_id' => 1];

           // Act
           $result = $this->service->createRental($data);

           // Assert
           $this->assertInstanceOf(Rental::class, $result);
       }
   }
   ```

2. **Test Naming**
   ```php
   public function test_validates_rental_data(): void
   public function test_throws_exception_for_invalid_dates(): void
   public function test_calculates_total_amount_correctly(): void
   ```

### Feature Tests

1. **HTTP Tests**
   ```php
   class RentalControllerTest extends TestCase
   {
       public function test_creates_rental_through_api(): void
       {
           $response = $this->postJson('/api/rentals', [
               'customer_id' => 1,
               'items' => [
                   ['equipment_id' => 1, 'quantity' => 2]
               ]
           ]);

           $response->assertStatus(201)
                   ->assertJsonStructure(['id', 'status']);
       }
   }
   ```

2. **Database Tests**
   ```php
   public function test_stores_rental_in_database(): void
   {
       $this->post('/rentals', $data);

       $this->assertDatabaseHas('rentals', [
           'customer_id' => $data['customer_id']
       ]);
   }
   ```

## Documentation Standards

### Code Documentation

1. **Class Documentation**
   ```php
   /**
    * Handles rental-related business logic.
    *
    * This service is responsible for processing rental requests,
    * managing rental status, and handling rental-related calculations.
    *
    * @package App\Services
    */
   class RentalService
   ```

2. **Method Documentation**
   ```php
   /**
    * Creates a new rental with the given data.
    *
    * This method validates the rental data, checks equipment availability,
    * and creates a new rental record in the database.
    *
    * @param array $data The rental data
    * @return Rental The created rental
    * @throws RentalValidationException When validation fails
    * @throws EquipmentUnavailableException When equipment is not available
    */
   public function createRental(array $data): Rental
   ```

### API Documentation

1. **Route Documentation**
   ```php
   /**
    * @OA\Post(
    *     path="/api/rentals",
    *     summary="Create a new rental",
    *     @OA\RequestBody(
    *         required=true,
    *         @OA\JsonContent(ref="#/components/schemas/RentalRequest")
    *     ),
    *     @OA\Response(
    *         response=201,
    *         description="Rental created successfully",
    *         @OA\JsonContent(ref="#/components/schemas/Rental")
    *     )
    * )
    */
   public function store(RentalRequest $request)
   ```

2. **Model Documentation**
   ```php
   /**
    * @OA\Schema(
    *     schema="Rental",
    *     required={"customer_id", "start_date", "end_date"},
    *     @OA\Property(property="id", type="integer"),
    *     @OA\Property(property="customer_id", type="integer"),
    *     @OA\Property(property="status", type="string"),
    *     @OA\Property(property="start_date", type="string", format="date-time"),
    *     @OA\Property(property="end_date", type="string", format="date-time")
    * )
    */
   class Rental extends Model
   ```

### README Documentation

1. **Project README**
   ```markdown
   # Project Name

   Brief description of the project.

   ## Requirements

   List of requirements and dependencies.

   ## Installation

   Step-by-step installation instructions.

   ## Usage

   Examples and usage instructions.

   ## Contributing

   Guidelines for contributing to the project.

   ## License

   Project license information.
   ```

2. **Module README**
   ```markdown
   # Module Name

   Description of the module's purpose and functionality.

   ## Features

   List of module features.

   ## Configuration

   Module configuration instructions.

   ## API

   Module API documentation.

   ## Examples

   Usage examples.
   ``` 