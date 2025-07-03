<?php

namespace Modules\ProjectManagement\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Routing\Controller;
use Modules\ProjectManagement\Models\ProjectResource;

class ProjectResourceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index($projectId): Response
    {
        $resources = ProjectResource::where('project_id', $projectId)->get();
        return response($resources);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, $projectId): Response
    {
        $data = $request->validate([
            // Add your validation rules here
        ]);
        $data['project_id'] = $projectId;
        $resource = ProjectResource::create($data);
        return response($resource, 201);
    }
}
