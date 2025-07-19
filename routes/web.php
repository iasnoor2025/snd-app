<?php
use Inertia\Inertia;
use Modules\Core\Http\Controllers\UserController;
use Modules\Core\Http\Controllers\RoleController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        $user = auth()->user();
        $user->load('roles.permissions');

        return Inertia::render('Dashboard', [
            'auth' => [
                'user' => $user,
                'permissions' => $user->getAllPermissions()->pluck('name'),
                'roles' => $user->roles->pluck('name'),
            ]
        ]);
    })->name('dashboard');
});

// Translation files route - serve directly from modules
Route::get('/locales/{module}/{locale}/{namespace}.json', function ($module, $locale, $namespace) {
    $filePath = base_path("Modules/{$module}/resources/lang/{$locale}/{$namespace}.json");

    if (!file_exists($filePath)) {
        abort(404, 'Translation file not found');
    }

    return response()->file($filePath, [
        'Content-Type' => 'application/json',
        'Cache-Control' => 'public, max-age=3600'
    ]);
})->name('locales');

// Debug route to test page resolution
Route::get('/debug-pages', function () {
    $modulePages = [
        'Users/Index' => './Modules/Core/resources/js/Pages/Users/Index.tsx',
        'Users/Create' => './Modules/Core/resources/js/Pages/Users/Create.tsx',
        'Users/Edit' => './Modules/Core/resources/js/Pages/Users/Edit.tsx',
        'Users/Show' => './Modules/Core/resources/js/Pages/Users/Show.tsx',
        'Roles/Index' => './Modules/Core/resources/js/Pages/Roles/Index.tsx',
        'Roles/Create' => './Modules/Core/resources/js/Pages/Roles/Create.tsx',
        'Roles/Edit' => './Modules/Core/resources/js/Pages/Roles/Edit.tsx',
        'Roles/Show' => './Modules/Core/resources/js/Pages/Roles/Show.tsx',
        'Roles/UserRoles' => './Modules/Core/resources/js/Pages/Roles/UserRoles.tsx',
    ];

    $existingPages = [];
    foreach ($modulePages as $name => $path) {
        $fullPath = base_path($path);
        $existingPages[$name] = [
            'path' => $path,
            'exists' => file_exists($fullPath),
            'full_path' => $fullPath
        ];
    }

    return response()->json([
        'pages' => $existingPages,
        'user' => auth()->user()->name,
        'permissions' => auth()->user()->getAllPermissions()->pluck('name'),
        'roles' => auth()->user()->roles->pluck('name')
    ]);
})->middleware('auth');

// Translation test route
Route::get('/translation-test', function () {
    return Inertia::render('TranslationTest');
})->name('translation.test');

// Use lowercase role names for Spatie permission middleware (case-sensitive)
Route::middleware(['auth', 'role:admin'])->group(function () {
    // User and role management routes are handled by Core module
// See Modules/Core/Routes/web.php for detailed routes
});

Route::get('/modules_statuses.json', function () {
    $path = base_path('modules_statuses.json');
    if (!file_exists($path)) {
        abort(404, 'modules_statuses.json not found');
    }
    return response()->file($path, [
        'Content-Type' => 'application/json'
    ]);
});

Route::get('/whoami', function () {
    return [
        'user' => auth()->user(),
        'permissions' => auth()->user()?->getAllPermissions()->pluck('name'),
    ];
});

Route::redirect('/roles', '/settings/roles');
Route::redirect('/reports', '/reporting');

// Redirect auth/login to login route with 301 status code
Route::get('auth/login', function () {
    return redirect('/login', 301);
});

require __DIR__.'/health.php';
require __DIR__.'/settings.php';
require __DIR__.'/auth.php';

// Temporary debug route
Route::get('/debug-permissions', function() {
    $user = auth()->user();
    if (!$user) {
        return response()->json(['error' => 'Not authenticated'], 401);
    }

    return response()->json([
        'user_id' => $user->id,
        'user_email' => $user->email,
        'roles' => $user->roles->pluck('name'),
        'permissions' => $user->getAllPermissions()->pluck('name'),
        'has_timesheets_approve' => $user->can('timesheets.approve'),
        'is_admin' => $user->hasRole('admin'),
        'is_hr' => $user->hasRole('hr'),
    ]);
})->middleware(['auth']);
require __DIR__.'/modules.php';
require __DIR__.'/avatar.php';
require __DIR__.'/employee-avatar.php';
require __DIR__.'/customer-avatar.php';
require __DIR__.'/profile.php';
// require base_path('Modules/PayrollManagement/Routes/web.php');


// RTL Test Route
Route::get('/rtl-test', function () {
    return Inertia::render('rtl-test');
})->middleware(['auth']);

// Public equipment dropdown for frontend (bypasses Sanctum and API middleware)
Route::get('/api/v1/equipment', function () {
    $equipment = \Modules\EquipmentManagement\Domain\Models\Equipment::where('status', 'available')
        ->select('id', 'name', 'model', 'door_number', 'daily_rate')
        ->orderBy('name')
        ->get();
    return response()->json($equipment);
});

// Employee ERPNext sync (admin only)
Route::post('/employees/sync-erpnext', [\Modules\EmployeeManagement\Http\Controllers\EmployeeController::class, 'syncToERPNext'])->middleware('auth');

// All EmployeeAdvance routes are deprecated. Use PayrollManagement advance routes instead.
// Advance-related routes are now handled in Modules/PayrollManagement/Routes/web.php and api.php

// Debug endpoint for session/cookie/csrf debugging
Route::get('/debug/session-debug', function (\Illuminate\Http\Request $request) {
    return response()->json([
        'session_id' => session_id(),
        'session_status' => session_status() == PHP_SESSION_ACTIVE ? 'active' : 'not active',
        'all_session' => $request->session()->all(),
        'cookies' => $request->cookies->all(),
        'headers' => $request->headers->all(),
        'user' => $request->user(),
    ]);
});

// Test route for payroll generation - bypass all middleware
Route::post('/test-payroll-generate', function (Illuminate\Http\Request $request) {
    \Log::info('Test payroll route reached', [
        'headers' => $request->headers->all(),
        'user' => auth()->user() ? auth()->user()->id : 'not logged in'
    ]);

    // Return proper Inertia response
    return back()->with('success', 'Test payroll generation successful');
});
