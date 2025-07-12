<?php

namespace Modules\SafetyManagement\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Modules\SafetyManagement\Domain\Models\Inspection;

class InspectionController extends Controller
{
    public function index()
    {
        $inspections = Inspection::latest()->paginate(20);
        return Inertia::render('Safety/Inspections/Index', ['inspections' => $inspections]);
    }

    public function create()
    {
        return Inertia::render('Safety/Inspections/Create');
    }

    public function store(Request $request)
    {
        // Validation and creation logic
    }

    public function show(Inspection $inspection)
    {
        return Inertia::render('Safety/Inspections/Show', ['inspection' => $inspection]);
    }

    public function edit(Inspection $inspection)
    {
        return Inertia::render('Safety/Inspections/Edit', ['inspection' => $inspection]);
    }

    public function update(Request $request, Inspection $inspection)
    {
        // Validation and update logic
    }

    public function destroy(Inspection $inspection)
    {
        $inspection->delete();
        return redirect()->route('safety.inspections.index');
    }

    public function complete(Inspection $inspection)
    {
        // Custom complete logic
    }
}
