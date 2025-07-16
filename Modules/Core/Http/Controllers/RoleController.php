<?php

namespace Modules\Core\Http\Controllers;

use Modules\Core\Domain\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class RoleController extends Controller
{
    /**
     * Display a listing of the roles.
     */
    public function index()
    {
        if (!auth()->user()->can('roles.view')) {
            abort(403, 'Unauthorized');
        }

        $roles = \Spatie\Permission\Models\Role::with('permissions')->withCount('users')->get();

        return \Inertia\Inertia::render('Roles/Index', [
            'roles' => $roles,
        ]);
    }

    /**
     * Show the form for creating a new role.
     */
    public function create()
    {
        if (!auth()->user()->can('roles.create')) {
            abort(403, 'Unauthorized');
        }

        $permissions = Permission::all()->groupBy(function ($permission) {
            return explode('.', $permission->name)[0];
        });

        return Inertia::render('Roles/Create', [
            'permissions' => $permissions,
        ]);
    }

    /**
     * Store a newly created role in storage.
     */
    public function store(Request $request)
    {
        if (!auth()->user()->can('roles.create')) {
            abort(403, 'Unauthorized');
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:roles,name'],
            'display_name' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'permissions' => ['required', 'array'],
            'permissions.*' => ['exists:permissions,id']
        ]);

        DB::transaction(function () use ($validated) {
            $role = Role::create([
                'name' => $validated['name'],
                'display_name' => $validated['display_name'] ?? null,
                'description' => $validated['description'] ?? null
            ]);
            $role->syncPermissions($validated['permissions']);
        });

        return redirect()->route('roles.index')
            ->with('success', 'Role created successfully.');
    }

    /**
     * Display the specified role.
     */
    public function show(Role $role)
    {
        if (!auth()->user()->can('roles.view')) {
            abort(403, 'Unauthorized');
        }

        $role->load('permissions');

        return Inertia::render('Roles/Show', [
            'role' => $role,
        ]);
    }

    /**
     * Show the form for editing the specified role.
     */
    public function edit(Role $role)
    {
        if (!auth()->user()->can('roles.edit')) {
            abort(403, 'Unauthorized');
        }

        $role->load('permissions');

        $permissions = Permission::all()->groupBy(function ($permission) {
            return explode('.', $permission->name)[0];
        });

        return Inertia::render('Roles/Edit', [
            'role' => $role,
            'permissions' => $permissions,
            'selectedPermissions' => $role->permissions->pluck('id'),
        ]);
    }

    /**
     * Update the specified role in storage.
     */
    public function update(Request $request, Role $role)
    {
        if (!auth()->user()->can('roles.edit')) {
            abort(403, 'Unauthorized');
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('roles', 'name')->ignore($role->id)],
            'display_name' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'permissions' => ['required', 'array'],
            'permissions.*' => ['exists:permissions,id']
        ]);

        DB::transaction(function () use ($role, $validated) {
            $role->update([
                'name' => $validated['name'],
                'display_name' => $validated['display_name'] ?? null,
                'description' => $validated['description'] ?? null
            ]);
            $role->syncPermissions($validated['permissions']);
        });

        return redirect()->route('roles.index')
            ->with('success', 'Role updated successfully.');
    }

    /**
     * Remove the specified role from storage.
     */
    public function destroy(Role $role)
    {
        if (!auth()->user()->can('roles.delete')) {
            abort(403, 'Unauthorized');
        }

        // Check if role is being used by any users
        $usersWithRole = User::role($role->name)->count();

        if ($usersWithRole > 0) {
            return redirect()->route('roles.index')
                ->with('error', 'Cannot delete role because it is assigned to users.');
        }

        $role->delete();

        return redirect()->route('roles.index')
            ->with('success', 'Role deleted successfully.');
    }

    /**
     * Display a listing of users with their roles.
     */
    public function userRoles()
    {
        if (!auth()->user()->can('roles.view')) {
            abort(403, 'Unauthorized');
        }

        $users = User::with('roles', 'permissions')->get();
        $roles = Role::all();

        return Inertia::render('Roles/UserRoles', [
            'users' => $users,
            'roles' => $roles,
        ]);
    }

    /**
     * Update roles for a specific user.
     */
    public function updateUserRoles(Request $request, User $user)
    {
        if (!auth()->user()->can('roles.edit')) {
            abort(403, 'Unauthorized');
        }

        $validated = $request->validate([
            'roles' => ['required', 'array'],
            'roles.*' => ['exists:roles,id']
        ]);

        $user->syncRoles($validated['roles']);

        return redirect()->route('roles.user-roles')
            ->with('success', 'User roles updated successfully.');
    }
}




