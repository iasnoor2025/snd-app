<?php

namespace Modules\Core\Application\Services;

use Modules\Core\Domain\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class AuthService
{
    /**
     * Authenticate user and return user data with roles and permissions
     */
    public function authenticate(array $credentials): array
    {
        if (!Auth::attempt($credentials)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $user = Auth::user();
        $user->update(['last_login_at' => now()]);

        return $this->getUserData($user);
    }

    /**
     * Get user data with roles and permissions
     */
    public function getUserData(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'is_active' => $user->is_active,
            'last_login_at' => $user->last_login_at,
            'roles' => $user->getRoleNames(),
            'permissions' => $user->getAllPermissions()->pluck('name'),
            'is_admin' => $user->hasRole('admin'),
            'is_manager' => $user->hasRole('manager'),
            'is_employee' => $user->hasRole('employee'),
            'is_customer' => $user->hasRole('customer'),
            'is_hr' => $user->hasRole('hr'),
            'is_accountant' => $user->hasRole('accountant'),
            'is_technician' => $user->hasRole('technician'),
            'is_supervisor' => $user->hasRole('supervisor'),
        ];
    }

    /**
     * Create a new user with specified role
     */
    public function createUser(array $userData, string $role = 'employee'): User
    {
        $user = User::create([
            'name' => $userData['name'],
            'email' => $userData['email'],
            'password' => Hash::make($userData['password']),
            'email_verified_at' => now(),
            'is_active' => $userData['is_active'] ?? true,
        ]);

        $user->assignRole($role);

        return $user;
    }

    /**
     * Update user role
     */
    public function updateUserRole(User $user, string $role): User
    {
        $user->syncRoles([$role]);
        return $user;
    }

    /**
     * Check if user has permission
     */
    public function userHasPermission(User $user, string $permission): bool
    {
        return $user->hasPermissionTo($permission);
    }

    /**
     * Check if user has role
     */
    public function userHasRole(User $user, string $role): bool
    {
        return $user->hasRole($role);
    }

    /**
     * Get all available roles
     */
    public function getAllRoles(): array
    {
        return Role::all()->pluck('name')->toArray();
    }

    /**
     * Get all available permissions
     */
    public function getAllPermissions(): array
    {
        return Permission::all()->pluck('name')->toArray();
    }

    /**
     * Assign permission to user
     */
    public function assignPermissionToUser(User $user, string $permission): void
    {
        $user->givePermissionTo($permission);
    }

    /**
     * Remove permission from user
     */
    public function removePermissionFromUser(User $user, string $permission): void
    {
        $user->revokePermissionTo($permission);
    }

    /**
     * Get users by role
     */
    public function getUsersByRole(string $role): array
    {
        return User::role($role)->get()->toArray();
    }

    /**
     * Deactivate user
     */
    public function deactivateUser(User $user): User
    {
        $user->update(['is_active' => false]);
        return $user;
    }

    /**
     * Activate user
     */
    public function activateUser(User $user): User
    {
        $user->update(['is_active' => true]);
        return $user;
    }

    /**
     * Check if current user can manage another user
     */
    public function canManageUser(User $currentUser, User $targetUser): bool
    {
        // Admin can manage everyone
        if ($currentUser->hasRole('admin')) {
            return true;
        }

        // Manager can manage employees, customers, technicians
        if ($currentUser->hasRole('manager')) {
            return $targetUser->hasAnyRole(['employee', 'customer', 'technician']);
        }

        // HR can manage employees
        if ($currentUser->hasRole('hr')) {
            return $targetUser->hasRole('employee');
        }

        // Supervisor can manage employees and technicians
        if ($currentUser->hasRole('supervisor')) {
            return $targetUser->hasAnyRole(['employee', 'technician']);
        }

        return false;
    }

    /**
     * Get dashboard data based on user role
     */
    public function getDashboardData(User $user): array
    {
        $data = [
            'user' => $this->getUserData($user),
            'stats' => [],
            'recent_activities' => [],
            'notifications' => [],
        ];

        // Add role-specific dashboard data
        if ($user->hasRole('admin')) {
            $data['stats'] = [
                'total_users' => User::count(),
                'active_users' => User::where('is_active', true)->count(),
                'total_roles' => Role::count(),
                'total_permissions' => Permission::count(),
            ];
        }

        if ($user->hasRole('manager')) {
            $data['stats'] = [
                'employees_count' => User::role('employee')->count(),
                'customers_count' => User::role('customer')->count(),
                'technicians_count' => User::role('technician')->count(),
            ];
        }

        return $data;
    }
}