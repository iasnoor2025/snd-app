# Authentication Flows Documentation

This document details the authentication flows and security mechanisms implemented in the Laravel 12 Rental Management System.

## Overview

The system implements a robust authentication system using Laravel Sanctum for API authentication and session-based authentication for web interfaces. The authentication system supports:

- Token-based API authentication
- Session-based web authentication
- Role-based access control (RBAC)
- Multi-factor authentication (MFA)
- OAuth2 social authentication
- API key authentication for service accounts

## Authentication Methods

### 1. Token-based Authentication (API)

Used for API access and mobile applications. Implements Laravel Sanctum for secure token management.

#### Token Generation

```php
// API Login Controller
public function login(Request $request)
{
    $credentials = $request->validate([
        'email' => 'required|email',
        'password' => 'required',
    ]);

    if (!Auth::attempt($credentials)) {
        return response()->json([
            'status' => 'error',
            'message' => 'Invalid credentials',
        ], 401);
    }

    $user = Auth::user();
    $token = $user->createToken('api-token')->plainTextToken;

    return response()->json([
        'status' => 'success',
        'token' => $token,
        'user' => $user->load('roles', 'permissions'),
    ]);
}
```

#### Token Usage

```http
GET /api/rentals
Authorization: Bearer {token}
Accept: application/json
```

### 2. Session Authentication (Web)

Used for web interface access. Implements Laravel's built-in session authentication with CSRF protection.

#### Login Process

```php
// Web Login Controller
public function login(Request $request)
{
    $credentials = $request->validate([
        'email' => 'required|email',
        'password' => 'required',
    ]);

    if (Auth::attempt($credentials, $request->remember)) {
        $request->session()->regenerate();

        return redirect()->intended('dashboard');
    }

    return back()->withErrors([
        'email' => 'Invalid credentials',
    ]);
}
```

#### Session Security

- CSRF Protection
- Session Encryption
- Secure Cookie Handling
- Session Fixation Protection

### 3. Multi-factor Authentication (MFA)

Optional two-factor authentication for enhanced security.

#### MFA Setup

```php
// MFA Controller
public function setupMFA(Request $request)
{
    $user = Auth::user();

    if (!$user->two_factor_secret) {
        $user->two_factor_secret = $this->generateSecretKey();
        $user->save();
    }

    return response()->json([
        'qr_code' => $this->generateQRCode($user->two_factor_secret),
        'secret_key' => $user->two_factor_secret,
    ]);
}
```

#### MFA Verification

```php
// MFA Verification
public function verifyMFA(Request $request)
{
    $request->validate([
        'code' => 'required|digits:6',
    ]);

    $user = Auth::user();

    if (!$this->verifyTOTP($user->two_factor_secret, $request->code)) {
        return response()->json([
            'status' => 'error',
            'message' => 'Invalid authentication code',
        ], 401);
    }

    $request->session()->put('mfa_verified', true);

    return response()->json([
        'status' => 'success',
        'message' => 'MFA verification successful',
    ]);
}
```

### 4. OAuth2 Social Authentication

Support for social login providers (Google, Microsoft, etc.).

#### Provider Configuration

```php
// config/services.php
return [
    'google' => [
        'client_id' => env('GOOGLE_CLIENT_ID'),
        'client_secret' => env('GOOGLE_CLIENT_SECRET'),
        'redirect' => env('GOOGLE_REDIRECT_URI'),
    ],
    'microsoft' => [
        'client_id' => env('MICROSOFT_CLIENT_ID'),
        'client_secret' => env('MICROSOFT_CLIENT_SECRET'),
        'redirect' => env('MICROSOFT_REDIRECT_URI'),
    ],
];
```

#### Social Login Implementation

```php
// Social Auth Controller
public function handleProviderCallback(Request $request, $provider)
{
    try {
        $socialUser = Socialite::driver($provider)->user();

        $user = User::updateOrCreate(
            ['email' => $socialUser->email],
            [
                'name' => $socialUser->name,
                'provider' => $provider,
                'provider_id' => $socialUser->id,
            ]
        );

        Auth::login($user);

        return redirect()->intended('dashboard');
    } catch (\Exception $e) {
        return redirect()->route('login')
            ->withErrors(['error' => 'Social authentication failed']);
    }
}
```

## Role-Based Access Control (RBAC)

### Role Configuration

```php
// Database Structure
Schema::create('roles', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->string('guard_name');
    $table->timestamps();
});

Schema::create('permissions', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->string('guard_name');
    $table->timestamps();
});

Schema::create('role_has_permissions', function (Blueprint $table) {
    $table->foreignId('permission_id')->constrained()->onDelete('cascade');
    $table->foreignId('role_id')->constrained()->onDelete('cascade');
    $table->primary(['permission_id', 'role_id']);
});
```

### Permission Checking

```php
// In Controllers/Middleware
if ($user->hasPermissionTo('rentals.approve')) {
    // Process rental approval
}

// In Blade Templates
@can('rentals.approve')
    <button>Approve Rental</button>
@endcan

// In API Resources
public function toArray($request)
{
    return [
        'id' => $this->id,
        'can_approve' => $request->user()->can('rentals.approve'),
    ];
}
```

## Security Best Practices

### 1. Password Policies

```php
// Password Validation Rules
'password' => [
    'required',
    'min:12',
    'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/',
    'confirmed',
]
```

### 2. Rate Limiting

```php
// Rate Limiting Middleware
protected function configureRateLimiting()
{
    RateLimiter::for('api', function (Request $request) {
        return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
    });

    RateLimiter::for('login', function (Request $request) {
        return Limit::perMinute(5)->by($request->ip());
    });
}
```

### 3. Session Security

```php
// Session Configuration
return [
    'driver' => env('SESSION_DRIVER', 'file'),
    'lifetime' => env('SESSION_LIFETIME', 120),
    'expire_on_close' => false,
    'encrypt' => true,
    'secure' => env('SESSION_SECURE_COOKIE', true),
    'same_site' => 'lax',
];
```

### 4. API Security Headers

```php
// Security Middleware
public function handle($request, Closure $next)
{
    $response = $next($request);

    $response->headers->set('X-Content-Type-Options', 'nosniff');
    $response->headers->set('X-Frame-Options', 'DENY');
    $response->headers->set('X-XSS-Protection', '1; mode=block');
    $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

    return $response;
}
```

## Error Handling

### Authentication Errors

```php
// Exception Handler
protected function unauthenticated($request, AuthenticationException $exception)
{
    if ($request->expectsJson()) {
        return response()->json([
            'status' => 'error',
            'message' => 'Unauthenticated',
            'error_code' => 'E401',
        ], 401);
    }

    return redirect()->guest(route('login'));
}
```

### Authorization Errors

```php
// Exception Handler
protected function unauthorized($request, AuthorizationException $exception)
{
    if ($request->expectsJson()) {
        return response()->json([
            'status' => 'error',
            'message' => 'Unauthorized action',
            'error_code' => 'E403',
        ], 403);
    }

    return redirect()->back()->with('error', 'Unauthorized action');
}
```

## Audit Logging

### Authentication Events

```php
// Audit Log Service
public function logAuthEvent($user, $event, $details = [])
{
    Activity::create([
        'log_name' => 'authentication',
        'description' => $event,
        'subject_type' => get_class($user),
        'subject_id' => $user->id,
        'causer_type' => get_class($user),
        'causer_id' => $user->id,
        'properties' => $details,
    ]);
}
```

### Usage Example

```php
// In Authentication Controller
public function login(Request $request)
{
    // ... authentication logic ...

    $this->auditLog->logAuthEvent($user, 'login', [
        'ip' => $request->ip(),
        'user_agent' => $request->userAgent(),
    ]);
}
```

## Security Recommendations

1. **Password Management**
    - Enforce strong password policies
    - Implement password expiration
    - Store password history to prevent reuse
    - Use secure password reset flows

2. **Session Management**
    - Implement session timeout
    - Enforce single session per user
    - Secure session storage
    - Implement remember-me functionality securely

3. **API Security**
    - Use token expiration
    - Implement token refresh mechanism
    - Rate limit API endpoints
    - Validate all input data

4. **Access Control**
    - Implement principle of least privilege
    - Regular permission audits
    - Role-based menu visibility
    - Dynamic permission checking

5. **Monitoring and Logging**
    - Log all authentication attempts
    - Monitor for suspicious activities
    - Implement alerting system
    - Regular security audits

## Testing Authentication

### Feature Tests

```php
// Authentication Test
public function test_user_can_login()
{
    $user = User::factory()->create([
        'email' => 'test@example.com',
        'password' => Hash::make('password'),
    ]);

    $response = $this->postJson('/api/auth/login', [
        'email' => 'test@example.com',
        'password' => 'password',
    ]);

    $response->assertStatus(200)
        ->assertJsonStructure([
            'status',
            'token',
            'user' => [
                'id',
                'email',
                'roles',
            ],
        ]);
}
```

### Permission Tests

```php
// Permission Test
public function test_user_cannot_access_protected_route()
{
    $user = User::factory()->create();

    $response = $this->actingAs($user)
        ->getJson('/api/admin/settings');

    $response->assertStatus(403);
}
```

## Troubleshooting Guide

### Common Issues

1. **Token Expired**
    - Check token expiration time
    - Implement token refresh
    - Verify server time synchronization

2. **Permission Denied**
    - Check user roles and permissions
    - Verify permission assignments
    - Check middleware configuration

3. **Session Issues**
    - Clear session data
    - Verify session configuration
    - Check for session conflicts

4. **MFA Problems**
    - Verify time synchronization
    - Check secret key storage
    - Validate TOTP implementation

## Support and Resources

- Documentation: https://docs.example.com/auth
- Security Issues: security@example.com
- API Support: api-support@example.com
- Status Page: https://status.example.com
