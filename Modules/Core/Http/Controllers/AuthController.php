<?php

namespace Modules\Core\Http\Controllers;

use App\Http\Controllers\Controller;
use Modules\Core\Application\Services\AuthService;
use Modules\Core\Domain\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class AuthController extends Controller
{
    protected AuthService $authService;

    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
    }

    /**
     * Show the login form
     */
    public function showLogin(): Response
    {
        return Inertia::render('Auth/Login');
    }

    /**
     * Handle login request
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        try {
            $userData = $this->authService->authenticate([
                'email' => $request->email,
                'password' => $request->password,
                'is_active' => true, // Only allow active users to login
            ]);

            $request->session()->regenerate();

            return redirect()->intended(route('dashboard'))->with('success', 'Welcome back!');
        } catch (ValidationException $e) {
            return back()->withErrors($e->errors());
        }
    }

    /**
     * Show the registration form
     */
    public function showRegister(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle registration request
     */
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = $this->authService->createUser([
            'name' => $request->name,
            'email' => $request->email,
            'password' => $request->password,
        ], 'customer'); // Default role for registration

        Auth::login($user);

        return redirect()->route('dashboard')->with('success', 'Registration successful!');
    }

    /**
     * Handle logout request
     */
    public function logout(Request $request)
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login')->with('success', 'You have been logged out.');
    }

    /**
     * Show the dashboard
     */
    public function dashboard(): Response
    {
        $user = Auth::user();
        $dashboardData = $this->authService->getDashboardData($user);

        return Inertia::render('Dashboard', [
            'dashboardData' => $dashboardData,
        ]);
    }

    /**
     * Get current user data (API endpoint)
     */
    public function me(Request $request)
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        return response()->json([
            'user' => $this->authService->getUserData($user),
        ]);
    }

    /**
     * Update user profile
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'locale' => 'nullable|string|in:en,ar',
        ]);

        $user->update([
            'name' => $request->name,
            'email' => $request->email,
            'locale' => $request->locale ?? 'en',
        ]);

        return back()->with('success', 'Profile updated successfully!');
    }

    /**
     * Change password
     */
    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return back()->withErrors(['current_password' => 'Current password is incorrect.']);
        }

        $user->update([
            'password' => Hash::make($request->password),
            'password_changed_at' => now(),
        ]);

        return back()->with('success', 'Password changed successfully!');
    }

    /**
     * Show user management page (Admin only)
     */
    public function userManagement(): Response
    {
        $this->authorize('viewAny', User::class);

        $users = User::with('roles')->paginate(15);
        $roles = $this->authService->getAllRoles();

        return Inertia::render('Admin/UserManagement', [
            'users' => $users,
            'roles' => $roles,
        ]);
    }

    /**
     * Update user role (Admin/Manager only)
     */
    public function updateUserRole(Request $request, User $user)
    {
        $currentUser = $request->user();
        
        if (!$this->authService->canManageUser($currentUser, $user)) {
            abort(403, 'Unauthorized to manage this user.');
        }

        $request->validate([
            'role' => 'required|string|exists:roles,name',
        ]);

        $this->authService->updateUserRole($user, $request->role);

        return back()->with('success', 'User role updated successfully!');
    }

    /**
     * Toggle user active status (Admin/Manager only)
     */
    public function toggleUserStatus(Request $request, User $user)
    {
        $currentUser = $request->user();
        
        if (!$this->authService->canManageUser($currentUser, $user)) {
            abort(403, 'Unauthorized to manage this user.');
        }

        if ($user->is_active) {
            $this->authService->deactivateUser($user);
            $message = 'User deactivated successfully!';
        } else {
            $this->authService->activateUser($user);
            $message = 'User activated successfully!';
        }

        return back()->with('success', $message);
    }

    /**
     * Show role management page (Admin only)
     */
    public function roleManagement(): Response
    {
        $this->authorize('manage-roles');

        $roles = Role::with('permissions')->get();
        $permissions = $this->authService->getAllPermissions();

        return Inertia::render('Admin/RoleManagement', [
            'roles' => $roles,
            'permissions' => $permissions,
        ]);
    }
}