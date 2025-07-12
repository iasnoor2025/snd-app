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
        return Inertia::render('Safety/Incidents/Index', ['incidents' => $incidents]);
    }

    public function create()
    {
        return Inertia::render('Safety/Incidents/Create');
    }

    public function store(Request $request)
    {
        // Validation and creation logic
    }

    public function show(Incident $incident)
    {
        return Inertia::render('Safety/Incidents/Show', ['incident' => $incident]);
    }

    public function edit(Incident $incident)
    {
        return Inertia::render('Safety/Incidents/Edit', ['incident' => $incident]);
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
