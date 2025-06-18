<?php

namespace Modules\Core\Http\Controllers;

use Modules\Core\Domain\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    /**
     * Display a listing of the users.
     */
    public function index()
    {
        $users = User::with('roles')->get();
        $roles = Role::all();

        return Inertia::render('Users/Index', [
            'users' => $users,
            'roles' => $roles,
        ]);
    }

    /**
     * Show the form for creating a new user.
     */
    public function create()
    {
        $roles = Role::all();
        $permissions = \Spatie\Permission\Models\Permission::all();

        return Inertia::render('Users/Create', [
            'roles' => $roles,
            'permissions' => $permissions,
        ]);
    }

    /**
     * Store a newly created user in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'roles' => 'nullable|array',
            'permissions' => 'nullable|array',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        // Assign roles if provided
        if ($request->has('roles') && !empty($request->roles)) {
            $roles = Role::whereIn('id', $request->roles)->get();
            $user->syncRoles($roles);
        } else {
            // Assign default employee role if no roles provided
            $employeeRole = Role::where('name', 'employee')->first();
            if ($employeeRole) {
                $user->assignRole($employeeRole);
            }
        }

        // Assign direct permissions if provided
        if ($request->has('permissions') && !empty($request->permissions)) {
            $permissions = \Spatie\Permission\Models\Permission::whereIn('id', $request->permissions)->get();
            $user->syncPermissions($permissions);
        }

        return redirect()->route('users.show', $user)
            ->with('success', 'User created successfully.');
    }

    /**
     * Display the specified user.
     */
    public function show(User $user)
    {
        $user->load('roles', 'permissions');

        return Inertia::render('Users/Show', [
            'user' => $user,
        ]);
    }

    /**
     * Show the form for editing the specified user.
     */
    public function edit(User $user)
    {
        $user->load('roles', 'permissions');
        $roles = Role::all();
        $directPermissions = $user->getDirectPermissions();
        $allPermissions = \Spatie\Permission\Models\Permission::all();

        return Inertia::render('Users/Edit', [
            'user' => $user,
            'roles' => $roles,
            'directPermissions' => $directPermissions,
            'allPermissions' => $allPermissions,
        ]);
    }

    /**
     * Update the specified user in storage.
     */
    public function update(Request $request, User $user)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'password' => ['nullable', 'confirmed', Rules\Password::defaults()],
            'roles' => 'nullable|array',
            'permissions' => 'nullable|array',
        ]);

        $user->update([
            'name' => $request->name,
            'email' => $request->email,
        ]);

        // Update password if provided
        if ($request->filled('password')) {
            $user->update([
                'password' => Hash::make($request->password)
            ]);
        }

        // Sync roles
        if ($request->has('roles')) {
            $roles = Role::whereIn('id', $request->roles)->get();
            $user->syncRoles($roles);
        } else {
            // Assign default employee role if no roles provided
            $employeeRole = Role::where('name', 'employee')->first();
            if ($employeeRole) {
                $user->syncRoles([$employeeRole]);
            }
        }

        // Sync direct permissions
        if ($request->has('permissions')) {
            $permissions = \Spatie\Permission\Models\Permission::whereIn('id', $request->permissions)->get();
            $user->syncPermissions($permissions);
        }

        return redirect()->route('users.show', $user)
            ->with('success', 'User updated successfully.');
    }

    /**
     * Remove the specified user from storage.
     */
    public function destroy(User $user)
    {
        // Prevent deleting your own account
        if (auth()->id() === $user->id) {
            return redirect()->route('users.index')
                ->with('error', 'You cannot delete your own account.');
        }

        $user->delete();

        return redirect()->route('users.index')
            ->with('success', 'User deleted successfully.');
    }

    /**
     * Bulk delete multiple users.
     */
    public function bulkDestroy(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:users,id'
        ]);

        // Prevent deleting your own account
        $ids = array_filter($request->ids, function($id) {
            return $id != auth()->id();
        });

        if (empty($ids)) {
            return redirect()->route('users.index')
                ->with('error', 'You cannot delete your own account.');
        }

        User::whereIn('id', $ids)->delete();

        return redirect()->route('users.index')
            ->with('success', count($ids) . ' users deleted successfully.');
    }
}


