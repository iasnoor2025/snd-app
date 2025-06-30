<?php

// Temporary debug route - add this to web.php
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
