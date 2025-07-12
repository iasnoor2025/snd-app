<?php

namespace Modules\SafetyManagement\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Modules\SafetyManagement\Domain\Models\PpeCheck;

class PpeCheckController extends Controller
{
    public function index()
    {
        $ppeChecks = PpeCheck::latest()->paginate(20);
        return Inertia::render('Safety/PpeChecks/Index', ['ppeChecks' => $ppeChecks]);
    }

    public function create()
    {
        return Inertia::render('Safety/PpeChecks/Create');
    }

    public function store(Request $request)
    {
        // Validation and creation logic
    }

    public function show(PpeCheck $ppeCheck)
    {
        return Inertia::render('Safety/PpeChecks/Show', ['ppeCheck' => $ppeCheck]);
    }

    public function edit(PpeCheck $ppeCheck)
    {
        return Inertia::render('Safety/PpeChecks/Edit', ['ppeCheck' => $ppeCheck]);
    }

    public function update(Request $request, PpeCheck $ppeCheck)
    {
        // Validation and update logic
    }

    public function destroy(PpeCheck $ppeCheck)
    {
        $ppeCheck->delete();
        return redirect()->route('safety.ppe-checks.index');
    }
}
