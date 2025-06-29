<?php

namespace Modules\ProjectManagement\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Modules\ProjectManagement\Domain\Models\ProjectTemplate;
use Modules\ProjectManagement\Domain\Models\Project;

class ProjectTemplateController extends Controller
{
    public function index()
    {
        return response()->json(ProjectTemplate::all());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string',
            'description' => 'nullable|string',
            'data' => 'required|array',
        ]);
        $template = ProjectTemplate::create($data);
        return response()->json($template, 201);
    }

    public function show(ProjectTemplate $template)
    {
        return response()->json($template);
    }

    public function update(Request $request, ProjectTemplate $template)
    {
        $data = $request->validate([
            'name' => 'sometimes|required|string',
            'description' => 'nullable|string',
            'data' => 'sometimes|required|array',
        ]);
        $template->update($data);
        return response()->json($template);
    }

    public function destroy(ProjectTemplate $template)
    {
        $template->delete();
        return response()->json(['message' => 'Template deleted']);
    }

    public function apply(Request $request, ProjectTemplate $template)
    {
        $data = $request->validate([
            'name' => 'required|string',
            'description' => 'nullable|string',
        ]);
        $projectData = array_merge($template->data, [
            'name' => $data['name'],
            'description' => $data['description'] ?? $template->description,
        ]);
        $project = Project::create($projectData);
        return response()->json($project, 201);
    }
}
