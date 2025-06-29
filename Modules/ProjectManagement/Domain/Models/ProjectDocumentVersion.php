<?php

namespace Modules\ProjectManagement\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProjectDocumentVersion extends Model
{
    protected $fillable = [
        'document_id',
        'user_id',
        'file_path',
        'version',
    ];

    public function document(): BelongsTo
    {
        return $this->belongsTo(ProjectDocument::class, 'document_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class);
    }
}
