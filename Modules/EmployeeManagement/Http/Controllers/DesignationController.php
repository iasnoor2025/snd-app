<?php

namespace Modules\EmployeeManagement\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Routing\Controller;
use Modules\EmployeeManagement\Domain\Models\Designation;
use Illuminate\Support\Facades\Log;

class DesignationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $designations = Designation::query();
        if ($request->has('active')) {
            $designations->where('is_active', $request->boolean('active'));
        }
        $result = $designations->orderBy('name')->get();
        return response($result);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): Response
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:designations,name',
            'description' => 'nullable|string|max:1000',
            'is_active' => 'boolean',
            'department_id' => 'nullable|integer|exists:departments,id',
        ]);
        $designation = Designation::create([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
            'department_id' => $validated['department_id'] ?? null,
        ]);
        return response($designation, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Designation $designation): Response
    {
        return response($designation);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Designation $designation): Response
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:designations,name,' . $designation->id,
            'description' => 'nullable|string|max:1000',
            'is_active' => 'boolean',
            'department_id' => 'nullable|integer|exists:departments,id',
        ]);
        $designation->update($validated);
        return response($designation);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Designation $designation): Response
    {
        $designation->delete();
        return response(null, 204);
    }
}
