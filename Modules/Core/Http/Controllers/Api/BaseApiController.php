<?php

namespace Modules\Core\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class BaseApiController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return view('Core::index');
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return view('Core::create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        return view('Core::show');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($id)
    {
        return view('Core::edit');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        //
    }

    /**
     * Get system information.
     */
    public function systemInfo()
    {
        return response()->json([
            'data' => [
                'app_name' => config('app.name'),
                'app_version' => config('app.version', '1.0.0'),
                'laravel_version' => app()->version(),
                'php_version' => PHP_VERSION,
                'environment' => config('app.env'),
                'timezone' => config('app.timezone'),
                'locale' => config('app.locale'),
            ]
        ]);
    }

    /**
     * Get system statistics.
     */
    public function systemStats()
    {
        return response()->json([
            'data' => [
                'users_count' => \Modules\Core\Domain\Models\User::count(),
                'active_sessions' => \DB::table('sessions')->count(),
                'memory_usage' => memory_get_usage(true),
                'memory_peak' => memory_get_peak_usage(true),
                'uptime' => uptime(),
            ]
        ]);
    }
}

