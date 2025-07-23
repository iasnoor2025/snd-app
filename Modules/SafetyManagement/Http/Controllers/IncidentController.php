<?php

namespace Modules\SafetyManagement\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Modules\SafetyManagement\Domain\Models\Incident;

class IncidentController extends Controller
{
    public function index()
    {
        $incidents = Incident::latest()->paginate(20);
        return Inertia::render('SafetyManagement/Incidents/Index', [
            'incidents' => $incidents->items() ?? [],
            'pagination' => [
                'total' => $incidents->total(),
                'per_page' => $incidents->perPage(),
                'current_page' => $incidents->currentPage(),
                'last_page' => $incidents->lastPage(),
            ],
        ]);
    }

    public function create()
    {
        return Inertia::render('SafetyManagement/Incidents/Create');
    }

    public function store(Request $request)
    {
        // Validation and creation logic
    }

    public function show(Incident $incident)
    {
        return Inertia::render('SafetyManagement/Incidents/Show', ['incident' => $incident]);
    }

    public function edit(Incident $incident)
    {
        return Inertia::render('SafetyManagement/Incidents/Edit', ['incident' => $incident]);
    }

    public function update(Request $request, Incident $incident)
    {
        // Validation and update logic
    }

    public function destroy(Incident $incident)
    {
        $incident->delete();
        return redirect()->route('safety.incidents.index');
    }

    public function close(Incident $incident)
    {
        // Custom close logic
    }
}
