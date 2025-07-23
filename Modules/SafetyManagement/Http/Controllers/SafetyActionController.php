<?php

namespace Modules\SafetyManagement\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Modules\SafetyManagement\Domain\Models\SafetyAction;

class SafetyActionController extends Controller
{
    public function index()
    {
        $actions = SafetyAction::latest()->paginate(20);
        return Inertia::render('Safety/SafetyActions/Index', [
            'actions' => $actions->items() ?? [],
            'pagination' => [
                'total' => $actions->total(),
                'per_page' => $actions->perPage(),
                'current_page' => $actions->currentPage(),
                'last_page' => $actions->lastPage(),
            ],
        ]);
    }

    public function create()
    {
        return Inertia::render('Safety/SafetyActions/Create');
    }

    public function store(Request $request)
    {
        // Validation and creation logic
    }

    public function show(SafetyAction $safetyAction)
    {
        return Inertia::render('Safety/SafetyActions/Show', ['safetyAction' => $safetyAction]);
    }

    public function edit(SafetyAction $safetyAction)
    {
        return Inertia::render('Safety/SafetyActions/Edit', ['safetyAction' => $safetyAction]);
    }

    public function update(Request $request, SafetyAction $safetyAction)
    {
        // Validation and update logic
    }

    public function destroy(SafetyAction $safetyAction)
    {
        $safetyAction->delete();
        return redirect()->route('safety.safety-actions.index');
    }
}
