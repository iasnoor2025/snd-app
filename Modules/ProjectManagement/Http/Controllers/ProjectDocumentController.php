<?php

namespace Modules\ProjectManagement\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Modules\ProjectManagement\Domain\Models\Project;
use Modules\ProjectManagement\Domain\Models\ProjectDocument;
use Modules\ProjectManagement\Services\ProjectDocumentService;

class ProjectDocumentController extends Controller
{
    protected ProjectDocumentService $documentService;

    public function __construct(ProjectDocumentService $documentService)
    {
        $this->documentService = $documentService;
    }

    /**
     * Store a newly created document in storage.
     */
    public function store(Request $request, Project $project)
    {
        $request->validate([
            'file' => 'required|file|max:102400', // 100MB max
            'name' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'category' => 'required|string|in:contract,proposal,report,specification,other',
            'is_shared' => 'nullable|boolean',
            'metadata' => 'nullable|array',
            'shared_with' => 'nullable|array',
            'shared_with.*' => 'exists:users,id'
        ]);

        $document = $this->documentService->store($project, $request->file('file'), $request->all());

        if ($request->has('shared_with')) {
            $this->documentService->share($document, $request->input('shared_with'));
        }

        return response()->json([
            'message' => 'Document uploaded successfully',
            'data' => $document->load(['uploader', 'sharedWith'])
        ], Response::HTTP_CREATED);
    }

    /**
     * Update the specified document in storage.
     */
    public function update(Request $request, ProjectDocument $document)
    {
        $this->authorize('update', $document);

        $request->validate([
            'name' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'category' => 'nullable|string|in:contract,proposal,report,specification,other',
            'is_shared' => 'nullable|boolean',
            'metadata' => 'nullable|array',
            'shared_with' => 'nullable|array',
            'shared_with.*' => 'exists:users,id'
        ]);

        $document = $this->documentService->update($document, $request->all());

        if ($request->has('shared_with')) {
            $this->documentService->share($document, $request->input('shared_with'));
        }

        return response()->json([
            'message' => 'Document updated successfully',
            'data' => $document->load(['uploader', 'sharedWith'])
        ]);
    }

    /**
     * Remove the specified document from storage.
     */
    public function destroy(ProjectDocument $document)
    {
        $this->authorize('delete', $document);

        $this->documentService->delete($document);

        return response()->json([
            'message' => 'Document deleted successfully'
        ]);
    }

    /**
     * Get documents by category.
     */
    public function getByCategory(Project $project, string $category)
    {
        $this->authorize('viewAny', [ProjectDocument::class, $project]);

        $documents = $this->documentService->getByCategory($project, $category);

        return response()->json([
            'data' => $documents->load(['uploader', 'sharedWith'])
        ]);
    }

    /**
     * Get all versions of a document.
     */
    public function getVersions(ProjectDocument $document)
    {
        $this->authorize('view', $document);

        $versions = $this->documentService->getVersions($document);

        return response()->json([
            'data' => $versions->load(['uploader', 'sharedWith'])
        ]);
    }

    /**
     * Share a document with users.
     */
    public function share(Request $request, ProjectDocument $document)
    {
        $this->authorize('share', $document);

        $request->validate([
            'user_ids' => 'required|array',
            'user_ids.*' => 'exists:users,id'
        ]);

        $this->documentService->share($document, $request->input('user_ids'));

        return response()->json([
            'message' => 'Document shared successfully',
            'data' => $document->load(['uploader', 'sharedWith'])
        ]);
    }
} 