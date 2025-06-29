<?php

namespace Modules\ProjectManagement\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Modules\ProjectManagement\Domain\Models\Project;
use Modules\ProjectManagement\Domain\Models\ProjectDocument;
use Modules\ProjectManagement\Domain\Models\ProjectDocumentVersion;

class ProjectDocumentController extends Controller
{
    public function index(Project $project)
    {
        return response()->json($project->documents()->with('user', 'versions.user')->get());
    }

    public function store(Request $request, Project $project)
    {
        $request->validate([
            'name' => 'required|string',
            'file' => 'required|file',
        ]);
        $file = $request->file('file');
        $path = $file->store('project_documents');
        $document = $project->documents()->create([
            'user_id' => Auth::id(),
            'name' => $request->name,
            'file_path' => $path,
            'version' => 1,
        ]);
        ProjectDocumentVersion::create([
            'document_id' => $document->id,
            'user_id' => Auth::id(),
            'file_path' => $path,
            'version' => 1,
        ]);
        return response()->json($document->load('user', 'versions.user'), 201);
    }

    public function show(Project $project, ProjectDocument $document)
    {
        if ($document->project_id !== $project->id) abort(404);
        return response()->json($document->load('user', 'versions.user'));
    }

    public function download(Project $project, ProjectDocument $document)
    {
        if ($document->project_id !== $project->id) abort(404);
        return Storage::download($document->file_path, $document->name);
    }

    public function addVersion(Request $request, Project $project, ProjectDocument $document)
    {
        if ($document->project_id !== $project->id) abort(404);
        $request->validate([
            'file' => 'required|file',
        ]);
        $file = $request->file('file');
        $version = $document->versions()->max('version') + 1;
        $path = $file->store('project_documents');
        $document->update([
            'file_path' => $path,
            'version' => $version,
        ]);
        ProjectDocumentVersion::create([
            'document_id' => $document->id,
            'user_id' => Auth::id(),
            'file_path' => $path,
            'version' => $version,
        ]);
        return response()->json($document->load('user', 'versions.user'));
    }
}
