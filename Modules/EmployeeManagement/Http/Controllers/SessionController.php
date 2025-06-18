<?php
namespace Modules\EmployeeManagement\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;

class SessionController extends Controller
{
    public function __construct()
    {
        $this->middleware('web');
    }

    public function getSession()
    {
        if (!Auth::check()) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        return response()->json([
            'user' => Auth::user(),
            'session_id' => Session::getId()
        ]);
    }

    public function refreshSession()
    {
        if (!Auth::check()) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        // Regenerate session ID
        Session::regenerate(true);

        return response()->json([
            'message' => 'Session refreshed successfully',
            'session_id' => Session::getId()
        ]);
    }
}


