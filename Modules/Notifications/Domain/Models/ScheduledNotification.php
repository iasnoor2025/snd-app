<?php

namespace Modules\Notifications\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\User;

class ScheduledNotification extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'template_id',
        'send_at',
        'status',
        'payload',
    ];

    protected $casts = [
        'send_at' => 'datetime',
        'payload' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function template(): BelongsTo
    {
        return $this->belongsTo(NotificationTemplate::class, 'template_id');
    }
}
