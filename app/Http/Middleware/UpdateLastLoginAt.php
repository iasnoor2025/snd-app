<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UpdateLastLoginAt
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        if (Auth::check()) {
            $user = Auth::user();
            
            // Update last login time and active status if they haven't been updated in the last minute
            // This prevents multiple updates during the same session
            if (!$user->last_login_at || now()->diffInMinutes($user->last_login_at) > 1) {
                $user->update([
                    'last_login_at' => now(),
                    'is_active' => true
                ]);
            }
        }

        return $next($request);
    }
} 