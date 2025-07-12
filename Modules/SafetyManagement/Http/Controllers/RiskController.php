<?php

namespace Modules\SafetyManagement\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Modules\SafetyManagement\Domain\Models\Risk;

class RiskController extends Controller
{
    public function index()
    {
        $risks = Risk::latest()->paginate(20);
        return Inertia::render('Safety/Risks/Index', ['risks' => $risks]);
    }

    public function create()
    {
        return Inertia::render('Safety/Risks/Create');
    }

    public function store(Request $request)
    {
        // Validation and creation logic
    }

    public function show(Risk $risk)
    {
        return Inertia::render('Safety/Risks/Show', ['risk' => $risk]);
    }

    public function edit(Risk $risk)
    {
        return Inertia::render('Safety/Risks/Edit', ['risk' => $risk]);
    }

    public function update(Request $request, Risk $risk)
    {
        // Validation and update logic
    }

    public function destroy(Risk $risk)
    {
        $risk->delete();
        return redirect()->route('safety.risks.index');
    }
}
