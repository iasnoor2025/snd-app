<?php

namespace Modules\API\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ApiDocsController extends Controller
{
    /**
     * Display the API documentation index.
     */
    public function index()
    {
        return Inertia::render('API/Documentation/Index', [
            'title' => 'API Documentation',
            'modules' => $this->getApiModules(),
        ]);
    }

    /**
     * Return API documentation as JSON.
     */
    public function json()
    {
        return response()->json([
            'openapi' => '3.0.0',
            'info' => [
                'title' => 'Rental Management API',
                'version' => '1.0.0',
                'description' => 'API for the Rental Management System',
            ],
            'paths' => $this->getApiPaths(),
        ]);
    }

    /**
     * Return OpenAPI specification.
     */
    public function openapi()
    {
        return response()->json([
            'openapi' => '3.0.0',
            'info' => [
                'title' => 'Rental Management API',
                'version' => '1.0.0',
                'description' => 'OpenAPI specification for the Rental Management System',
            ],
            'servers' => [
                ['url' => url('/api'), 'description' => 'Production server'],
            ],
            'paths' => $this->getApiPaths(),
        ]);
    }

    /**
     * Display documentation for a specific endpoint.
     */
    public function endpoint($module, $endpoint)
    {
        return Inertia::render('API/Documentation/Endpoint', [
            'module' => $module,
            'endpoint' => $endpoint,
            'documentation' => $this->getEndpointDocumentation($module, $endpoint),
        ]);
    }

    /**
     * Test API endpoint.
     */
    public function test(Request $request)
    {
        return response()->json([
            'success' => true,
            'message' => 'Test endpoint working',
            'data' => $request->all(),
        ]);
    }

    /**
     * Get available API modules.
     */
    private function getApiModules()
    {
        return [
            'rentals' => 'Rental Management',
            'equipment' => 'Equipment Management',
            'customers' => 'Customer Management',
            'employees' => 'Employee Management',
            'projects' => 'Project Management',
        ];
    }

    /**
     * Get API paths for documentation.
     */
    private function getApiPaths()
    {
        return [
            '/api/rentals' => [
                'get' => [
                    'summary' => 'List rentals',
                    'description' => 'Retrieve a list of all rentals',
                ],
            ],
            '/api/equipment' => [
                'get' => [
                    'summary' => 'List equipment',
                    'description' => 'Retrieve a list of all equipment',
                ],
            ],
        ];
    }

    /**
     * Get documentation for a specific endpoint.
     */
    private function getEndpointDocumentation($module, $endpoint)
    {
        return [
            'module' => $module,
            'endpoint' => $endpoint,
            'method' => 'GET',
            'description' => "Documentation for {$module} {$endpoint} endpoint",
            'parameters' => [],
            'responses' => [
                '200' => 'Success',
                '404' => 'Not Found',
            ],
        ];
    }
}
