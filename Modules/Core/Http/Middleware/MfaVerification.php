<?php

namespace Modules\Core\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class MfaVerification
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::user();

        if (!$user || !$user->hasMfaEnabled()) {
            return $next($request);
        }

        if ($user->requiresMfaVerification()) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'MFA verification required',
                    'requires_mfa' => true
                ], 403);
            }

            return redirect()->route('mfa.verify');
        }

        return $next($request);
    }
} 