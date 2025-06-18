<?php

use Illuminate\Support\Facades\Route;
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

// Redirect auth/login to login route with 301 status code
Route::get('auth/login', function () {
    return redirect('/login', 301);
});

require __DIR__.'/health.php';
require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
require __DIR__.'/modules.php';
require __DIR__.'/avatar.php';
require __DIR__.'/employee-avatar.php';
require __DIR__.'/customer-avatar.php';
require __DIR__.'/profile.php';
require base_path('Modules/Payroll/Routes/web.php');

// RTL Test Route
Route::get('/rtl-test', function () {
    return Inertia::render('rtl-test');
})->middleware(['auth']);
