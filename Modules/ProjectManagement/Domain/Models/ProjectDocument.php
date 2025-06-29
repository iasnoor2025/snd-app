<?php

namespace Modules\ProjectManagement\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\User;

class ProjectDocument extends Model
{
    protected $fillable = [
        'project_id',
        'user_id',
        'name',
        'description',
        'category',
        'file_path',
        'file_size',
        'file_type',
        'version',
        'uploaded_by',
        'is_shared',
        'metadata',
    ];

    protected $casts = [
        'is_shared' => 'boolean',
        'metadata' => 'array',
        'version' => 'float',
        'file_size' => 'integer',
    ];

    /**
     * Get the project that owns the document
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * Get the user who uploaded the document
     */
    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    /**
     * Get the users this document is shared with
     */
    public function sharedWith(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'project_document_shares', 'document_id', 'user_id')
            ->withTimestamps();
    }

    /**
     * Get the formatted file size
     */
    public function getFormattedFileSizeAttribute(): string
    {
        $bytes = $this->file_size;
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];

        for ($i = 0; $bytes > 1024; $i++) {
            $bytes /= 1024;
        }

        return round($bytes, 2) . ' ' . $units[$i];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class);
    }

    public function versions(): HasMany
    {
        return $this->hasMany(ProjectDocumentVersion::class, 'document_id');
    }
}
