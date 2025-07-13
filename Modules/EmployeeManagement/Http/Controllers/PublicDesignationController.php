<?php

namespace Modules\EmployeeManagement\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Routing\Controller;
use Modules\EmployeeManagement\Domain\Models\Designation;

class PublicDesignationController extends Controller
{
    public function index(): Response
    {
        $designations = Designation::where('is_active', true)->orderBy('name')->get();
        return response($designations);
    }

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

    public function update(Request $request, $id): Response
    {
        $designation = Designation::findOrFail($id);
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:designations,name,' . $designation->id,
            'description' => 'nullable|string|max:1000',
            'is_active' => 'boolean',
            'department_id' => 'nullable|integer|exists:departments,id',
        ]);
        $designation->update($validated);
        return response($designation);
    }

    public function destroy($id): Response
    {
        $designation = Designation::findOrFail($id);
        $designation->delete();
        return response(null, 204);
    }
}
