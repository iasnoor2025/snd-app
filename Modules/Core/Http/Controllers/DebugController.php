<?php
namespace Modules\Core\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Log;

class DebugController extends Controller
{
    /**
     * Debug CSRF token issues
     */
    public function csrfDebug(Request $request)
    {
        // Log the request for debugging
        Log::debug('CSRF Debug Request', [
            'headers' => $request->headers->all(),
            'cookies' => $request->cookies->all(),
            'session_active' => session_status() == PHP_SESSION_ACTIVE,
            'session_id' => session_id(),
            'has_session' => $request->hasSession(),
            'session_token' => Session::has('_token') ? Session::get('_token') : null,
        ]);

        // Force start the session if not already started
        if (!$request->session()->isStarted()) {
            $request->session()->start();
        }

        // Generate a fresh token if needed
        if (!Session::has('_token')) {
            Session::regenerateToken();
        }

        // Don't apply CSRF protection to this route (for debugging)
        $response = [
            'session_status' => session_status() == PHP_SESSION_ACTIVE ? 'active' : 'not active',
            'has_session_id' => session_id() ? true : false,
            'session_id' => session_id(),
            'csrf_token' => csrf_token(),
            'token_matches' => $request->has('_token') ? ($request->_token === csrf_token() ? 'yes' : 'no') : 'no token provided',
            'token_in_session' => Session::has('_token'),
            'session_token' => Session::has('_token') ? Session::get('_token') : null,
            'cookies' => $request->cookies->all(),
            'headers' => $request->headers->all(),
        ];

        return response()->json($response);
    }

    /**
     * Debug login attempt
     */
    public function loginDebug(Request $request)
    {
        // Force start the session if not already started
        if (!$request->session()->isStarted()) {
            $request->session()->start();
        }

        // Generate a fresh token if needed
        if (!Session::has('_token')) {
            Session::regenerateToken();
        }

        // Show us what data is coming through on login attempts
        $data = $request->all();

        // Remove password from the log but keep a mask
        if (isset($data['password'])) {
            $data['password'] = str_repeat('*', strlen($data['password']));
        }

        // Log the login attempt
        Log::debug('Login Debug', [
            'request_data' => $data,
            'headers' => $request->headers->all(),
            'cookies' => $request->cookies->all(),
            'session_token' => csrf_token(),
        ]);

        $response = [
            'request_data' => $data,
            'headers' => $request->headers->all(),
            'cookies' => $request->cookies->all(),
            'session_token' => csrf_token(),
            'xsrf_token_cookie' => $request->cookie('XSRF-TOKEN'),
            'token_matches' => $request->has('_token')
                ? ($request->_token === csrf_token() ? 'yes' : 'no')
                : 'no token provided',
        ];

        return response()->json($response);
    }

    /**
     * Get a CSRF token
     */
    public function getCsrfToken(Request $request)
    {
        // Force start the session if not already started
        if (!$request->session()->isStarted()) {
            $request->session()->start();
        }

        // Generate a fresh token if needed
        if (!Session::has('_token')) {
            Session::regenerateToken();
        }

        // Generate a fresh token
        $token = csrf_token();

        // Log token generation
        Log::debug('Generated CSRF Token', [
            'token' => $token,
            'session_id' => session_id(),
            'cookies' => $request->cookies->all(),
        ]);

        return response()->json([
            'token' => $token
        ]);
    }

    /**
     * List available routes
     */
    public function routes()
    {
        $routes = [];

        foreach (Route::getRoutes() as $route) {
            $routes[] = [
                'methods' => $route->methods(),
                'uri' => $route->uri(),
                'name' => $route->getName(),
                'action' => $route->getActionName(),
                'middleware' => $route->middleware(),
            ];
        }

        return response()->json($routes);
    }
}
