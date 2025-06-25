<?php

namespace Modules\ProjectManagement\Policies;

use App\Models\User;
use Modules\ProjectManagement\Domain\Models\Project;
use Modules\ProjectManagement\Domain\Models\ProjectDocument;
use Illuminate\Auth\Access\HandlesAuthorization;

class ProjectDocumentPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any documents.
     */
    public function viewAny(User $user, Project $project): bool
    {
        return $user->id === $project->manager_id || 
               $project->teamMembers->contains($user->id);
    }

    /**
     * Determine whether the user can view the document.
     */
    public function view(User $user, ProjectDocument $document): bool
    {
        return $user->id === $document->project->manager_id || 
               $document->project->teamMembers->contains($user->id) ||
               $document->sharedWith->contains($user->id);
    }

    /**
     * Determine whether the user can create documents.
     */
    public function create(User $user, Project $project): bool
    {
        return $user->id === $project->manager_id || 
               $project->teamMembers->contains($user->id);
    }

    /**
     * Determine whether the user can update the document.
     */
    public function update(User $user, ProjectDocument $document): bool
    {
        return $user->id === $document->project->manager_id || 
               $user->id === $document->uploaded_by;
    }

    /**
     * Determine whether the user can delete the document.
     */
    public function delete(User $user, ProjectDocument $document): bool
    {
        return $user->id === $document->project->manager_id || 
               $user->id === $document->uploaded_by;
    }

    /**
     * Determine whether the user can share the document.
     */
    public function share(User $user, ProjectDocument $document): bool
    {
        return $user->id === $document->project->manager_id || 
               $user->id === $document->uploaded_by;
    }
} 