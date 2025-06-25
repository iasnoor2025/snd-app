<?php

namespace Modules\ProjectManagement\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Modules\ProjectManagement\Domain\Models\Project;
use Modules\ProjectManagement\Domain\Models\ProjectDocument;

class ProjectDocumentService
{
    /**
     * Store a project document
     */
    public function store(Project $project, UploadedFile $file, array $data): ProjectDocument
    {
        $path = $this->storeFile($project, $file);
        
        return ProjectDocument::create([
            'project_id' => $project->id,
            'name' => $data['name'] ?? $file->getClientOriginalName(),
            'description' => $data['description'] ?? null,
            'category' => $data['category'],
            'file_path' => $path,
            'file_size' => $file->getSize(),
            'file_type' => $file->getMimeType(),
            'version' => $this->getNextVersion($project, $data['category']),
            'uploaded_by' => auth()->id(),
            'is_shared' => $data['is_shared'] ?? false,
            'metadata' => $data['metadata'] ?? null,
        ]);
    }

    /**
     * Update a project document
     */
    public function update(ProjectDocument $document, array $data): ProjectDocument
    {
        $document->update([
            'name' => $data['name'] ?? $document->name,
            'description' => $data['description'] ?? $document->description,
            'category' => $data['category'] ?? $document->category,
            'is_shared' => $data['is_shared'] ?? $document->is_shared,
            'metadata' => $data['metadata'] ?? $document->metadata,
        ]);

        return $document->fresh();
    }

    /**
     * Delete a project document
     */
    public function delete(ProjectDocument $document): bool
    {
        Storage::delete($document->file_path);
        return $document->delete();
    }

    /**
     * Store the uploaded file
     */
    protected function storeFile(Project $project, UploadedFile $file): string
    {
        $fileName = Str::random(40) . '.' . $file->getClientOriginalExtension();
        $path = "projects/{$project->id}/documents/{$fileName}";
        
        Storage::put($path, file_get_contents($file));
        
        return $path;
    }

    /**
     * Get the next version number for a document category
     */
    protected function getNextVersion(Project $project, string $category): float
    {
        $latestVersion = ProjectDocument::where('project_id', $project->id)
            ->where('category', $category)
            ->max('version');

        return $latestVersion ? $latestVersion + 0.1 : 1.0;
    }

    /**
     * Share a document with team members
     */
    public function share(ProjectDocument $document, array $userIds): void
    {
        $document->update(['is_shared' => true]);
        $document->sharedWith()->sync($userIds);
    }

    /**
     * Get documents by category
     */
    public function getByCategory(Project $project, string $category)
    {
        return ProjectDocument::where('project_id', $project->id)
            ->where('category', $category)
            ->orderBy('version', 'desc')
            ->get();
    }

    /**
     * Get all versions of a document
     */
    public function getVersions(ProjectDocument $document)
    {
        return ProjectDocument::where('project_id', $document->project_id)
            ->where('category', $document->category)
            ->orderBy('version', 'desc')
            ->get();
    }
} 