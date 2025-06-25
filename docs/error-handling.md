# Error Handling Documentation

This document details the error handling mechanisms and best practices implemented in the Laravel 12 Rental Management System.

## Overview

The system implements a comprehensive error handling strategy that includes:

- Standardized error responses
- Detailed logging
- User-friendly error messages
- Validation error handling
- Exception handling
- Error monitoring and reporting

## Error Response Format

### Standard Error Response
```json
{
    "status": "error",
    "message": "Human-readable error message",
    "error_code": "E4XX",
    "details": {
        // Additional error context
    }
}
```

### Validation Error Response
```json
{
    "status": "error",
    "message": "Validation failed",
    "error_code": "E422",
    "errors": {
        "field_name": [
            "Error message 1",
            "Error message 2"
        ]
    }
}
```

## Exception Handling

### Custom Exception Handler
```php
// app/Exceptions/Handler.php
namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Throwable;

class Handler extends ExceptionHandler
{
    protected $dontReport = [
        // Exceptions that should not be logged
    ];

    public function register()
    {
        $this->reportable(function (Throwable $e) {
            if (app()->bound('sentry')) {
                app('sentry')->captureException($e);
            }
        });

        $this->renderable(function (Throwable $e, $request) {
            if ($request->expectsJson()) {
                return $this->handleApiException($e, $request);
            }
        });
    }

    private function handleApiException(Throwable $e, $request)
    {
        $error = [
            'status' => 'error',
            'message' => $e->getMessage(),
            'error_code' => $this->getErrorCode($e),
        ];

        if (config('app.debug')) {
            $error['debug'] = [
                'exception' => get_class($e),
                'trace' => $e->getTrace(),
            ];
        }

        return response()->json($error, $this->getHttpStatusCode($e));
    }
}
```

### Custom Exceptions
```php
// app/Exceptions/RentalException.php
namespace App\Exceptions;

class RentalException extends \Exception
{
    protected $errorCode = 'E4001';
    protected $httpStatusCode = 400;

    public function __construct($message = null, $code = 0, \Throwable $previous = null)
    {
        parent::__construct(
            $message ?? 'An error occurred with the rental',
            $code,
            $previous
        );
    }

    public function getErrorCode()
    {
        return $this->errorCode;
    }

    public function getHttpStatusCode()
    {
        return $this->httpStatusCode;
    }
}
```

## Validation

### Request Validation
```php
// app/Http/Requests/CreateRentalRequest.php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateRentalRequest extends FormRequest
{
    public function rules()
    {
        return [
            'customer_id' => 'required|exists:customers,id',
            'equipment_id' => 'required|exists:equipment,id',
            'start_date' => 'required|date|after:today',
            'end_date' => 'required|date|after:start_date',
            'purpose' => 'required|string|max:500',
        ];
    }

    public function messages()
    {
        return [
            'customer_id.required' => 'Please select a customer',
            'equipment_id.required' => 'Please select equipment to rent',
            'start_date.after' => 'Start date must be in the future',
            'end_date.after' => 'End date must be after start date',
        ];
    }
}
```

### Controller Implementation
```php
// app/Http/Controllers/RentalController.php
public function store(CreateRentalRequest $request)
{
    try {
        $rental = $this->rentalService->create($request->validated());

        return response()->json([
            'status' => 'success',
            'data' => $rental,
        ]);
    } catch (RentalException $e) {
        return response()->json([
            'status' => 'error',
            'message' => $e->getMessage(),
            'error_code' => $e->getErrorCode(),
        ], $e->getHttpStatusCode());
    }
}
```

## Error Logging

### Logging Configuration
```php
// config/logging.php
return [
    'channels' => [
        'stack' => [
            'driver' => 'stack',
            'channels' => ['daily', 'slack'],
        ],
        'daily' => [
            'driver' => 'daily',
            'path' => storage_path('logs/laravel.log'),
            'level' => env('LOG_LEVEL', 'debug'),
            'days' => 14,
        ],
        'slack' => [
            'driver' => 'slack',
            'url' => env('LOG_SLACK_WEBHOOK_URL'),
            'username' => 'Laravel Log',
            'emoji' => ':boom:',
            'level' => env('LOG_LEVEL', 'critical'),
        ],
    ],
];
```

### Logging Service
```php
// app/Services/LoggingService.php
namespace App\Services;

use Illuminate\Support\Facades\Log;

class LoggingService
{
    public function logError($error, array $context = [])
    {
        $logContext = array_merge([
            'error_code' => $error->getCode(),
            'file' => $error->getFile(),
            'line' => $error->getLine(),
        ], $context);

        Log::error($error->getMessage(), $logContext);
    }

    public function logWarning($message, array $context = [])
    {
        Log::warning($message, $context);
    }

    public function logInfo($message, array $context = [])
    {
        Log::info($message, $context);
    }
}
```

## Error Monitoring

### Sentry Integration
```php
// config/sentry.php
return [
    'dsn' => env('SENTRY_LARAVEL_DSN'),
    'traces_sample_rate' => env('SENTRY_TRACES_SAMPLE_RATE', 0.1),
    'send_default_pii' => false,
    'breadcrumbs' => [
        'logs' => true,
        'sql_queries' => true,
        'sql_bindings' => true,
        'queue_info' => true,
        'command_info' => true,
    ],
];
```

### Error Tracking Middleware
```php
// app/Http/Middleware/TrackErrors.php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class TrackErrors
{
    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);

        if ($response->getStatusCode() >= 400) {
            $this->trackError($request, $response);
        }

        return $response;
    }

    private function trackError($request, $response)
    {
        if (app()->bound('sentry')) {
            \Sentry\configureScope(function (\Sentry\State\Scope $scope) use ($request, $response) {
                $scope->setExtra('url', $request->fullUrl());
                $scope->setExtra('method', $request->method());
                $scope->setExtra('status_code', $response->getStatusCode());
            });
        }
    }
}
```

## Error Codes

### System Error Codes
```php
// app/Constants/ErrorCodes.php
namespace App\Constants;

class ErrorCodes
{
    // Authentication Errors (E1XXX)
    const INVALID_CREDENTIALS = 'E1001';
    const TOKEN_EXPIRED = 'E1002';
    const INVALID_TOKEN = 'E1003';
    const MFA_REQUIRED = 'E1004';

    // Authorization Errors (E2XXX)
    const UNAUTHORIZED = 'E2001';
    const INSUFFICIENT_PERMISSIONS = 'E2002';
    const ROLE_REQUIRED = 'E2003';

    // Validation Errors (E3XXX)
    const VALIDATION_FAILED = 'E3001';
    const INVALID_INPUT = 'E3002';
    const MISSING_REQUIRED = 'E3003';

    // Business Logic Errors (E4XXX)
    const RENTAL_NOT_AVAILABLE = 'E4001';
    const EQUIPMENT_IN_USE = 'E4002';
    const CUSTOMER_BLOCKED = 'E4003';
    const INSUFFICIENT_FUNDS = 'E4004';

    // System Errors (E5XXX)
    const SYSTEM_ERROR = 'E5001';
    const DATABASE_ERROR = 'E5002';
    const EXTERNAL_SERVICE_ERROR = 'E5003';
}
```

## Error Pages

### Custom Error Views
```php
// resources/views/errors/404.blade.php
@extends('layouts.error')

@section('title', 'Page Not Found')

@section('content')
<div class="error-container">
    <h1>404 - Page Not Found</h1>
    <p>The page you are looking for could not be found.</p>
    <a href="{{ route('home') }}" class="btn btn-primary">
        Return to Home
    </a>
</div>
@endsection
```

### Error Layout
```php
// resources/views/layouts/error.blade.php
<!DOCTYPE html>
<html>
<head>
    <title>@yield('title') - {{ config('app.name') }}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="{{ asset('css/app.css') }}" rel="stylesheet">
</head>
<body>
    <div class="error-page">
        @yield('content')
    </div>
</body>
</html>
```

## Client-Side Error Handling

### API Error Interceptor
```typescript
// resources/js/services/api.ts
import axios from 'axios';
import { toast } from 'sonner';

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

api.interceptors.response.use(
    response => response,
    error => {
        const { response } = error;
        
        if (response?.data?.message) {
            toast.error(response.data.message);
        }

        if (response?.status === 401) {
            // Handle authentication error
            window.location.href = '/login';
        }

        if (response?.status === 403) {
            // Handle authorization error
            toast.error('You do not have permission to perform this action');
        }

        if (response?.status === 422) {
            // Handle validation errors
            const errors = response.data.errors;
            Object.values(errors).forEach((messages: string[]) => {
                messages.forEach(message => toast.error(message));
            });
        }

        return Promise.reject(error);
    }
);

export default api;
```

## Testing Error Handling

### Feature Tests
```php
// tests/Feature/ErrorHandlingTest.php
namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Exceptions\RentalException;

class ErrorHandlingTest extends TestCase
{
    public function test_handles_validation_errors()
    {
        $response = $this->postJson('/api/rentals', []);

        $response->assertStatus(422)
            ->assertJsonStructure([
                'status',
                'message',
                'error_code',
                'errors' => [
                    'customer_id',
                    'equipment_id',
                    'start_date',
                    'end_date',
                ],
            ]);
    }

    public function test_handles_custom_exceptions()
    {
        $user = User::factory()->create();
        
        $this->actingAs($user)
            ->postJson('/api/rentals/1/approve')
            ->assertStatus(400)
            ->assertJson([
                'status' => 'error',
                'error_code' => 'E4001',
            ]);
    }
}
```

## Best Practices

1. **Consistent Error Format**
   - Use standardized error response format
   - Include error codes for all errors
   - Provide helpful error messages
   - Include debug information in development

2. **Proper Error Logging**
   - Log all errors with context
   - Use appropriate log levels
   - Implement log rotation
   - Monitor error logs

3. **Security Considerations**
   - Hide sensitive information
   - Sanitize error messages
   - Log security-related errors
   - Implement rate limiting

4. **User Experience**
   - Show user-friendly messages
   - Provide clear error feedback
   - Implement proper error recovery
   - Guide users to solutions

## Support and Debugging

### Error Reporting Tools
- Sentry for error tracking
- Slack notifications for critical errors
- Email notifications for system errors
- Daily error reports

### Debugging Tools
- Laravel Telescope
- Laravel Debug Bar
- Custom debug endpoints
- Error log viewers

## Error Resolution Guide

1. **Authentication Errors**
   - Check token validity
   - Verify credentials
   - Check session state
   - Validate MFA setup

2. **Authorization Errors**
   - Check user permissions
   - Verify role assignments
   - Check access policies
   - Review middleware

3. **Validation Errors**
   - Check input data
   - Verify validation rules
   - Review form submissions
   - Check client-side validation

4. **System Errors**
   - Check server logs
   - Review error context
   - Check external services
   - Monitor system resources 