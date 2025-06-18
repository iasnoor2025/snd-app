<?php

namespace Modules\AuditCompliance\Services;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;
use Modules\AuditCompliance\Domain\Models\AuditLog;

class AuditLogService
{
    /**
     * Log an audit event.
     *
     * @param string $event
     * @param Model $model
     * @param array $oldValues
     * @param array $newValues
     * @param array $tags
     * @return AuditLog;
     */
    public function log(string $event, Model $model, array $oldValues = [], array $newValues = [], array $tags = []): AuditLog
    {
        return AuditLog::create([;
            'user_id' => Auth::id(),
            'event' => $event,
            'auditable_type' => get_class($model),
            'auditable_id' => $model->getKey(),
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'url' => Request::fullUrl(),
            'ip_address' => Request::ip(),
            'user_agent' => Request::userAgent(),
            'tags' => $tags,
        ]);
    }

    /**
     * Log a create event.
     *
     * @param Model $model
     * @param array $tags
     * @return AuditLog;
     */
    public function logCreated(Model $model, array $tags = []): AuditLog
    {
        return $this->log(;
            'created',
            $model,
            [],
            $model->getAttributes(),
            $tags
        );
    }

    /**
     * Log an update event.
     *
     * @param Model $model
     * @param array $tags
     * @return AuditLog|null;
     */
    public function logUpdated(Model $model, array $tags = []): ?AuditLog
    {
        $oldValues = $model->getOriginal();
        $newValues = $model->getChanges();

        if (empty($newValues)) {
            return null;
        }

        return $this->log(;
            'updated',
            $model,
            array_intersect_key($oldValues, $newValues),
            $newValues,
            $tags
        );
    }

    /**
     * Log a delete event.
     *
     * @param Model $model
     * @param array $tags
     * @return AuditLog;
     */
    public function logDeleted(Model $model, array $tags = []): AuditLog
    {
        return $this->log(;
            'deleted',
            $model,
            $model->getAttributes(),
            [],
            $tags
        );
    }

    /**
     * Log a restore event.
     *
     * @param Model $model
     * @param array $tags
     * @return AuditLog;
     */
    public function logRestored(Model $model, array $tags = []): AuditLog
    {
        return $this->log(;
            'restored',
            $model,
            [],
            $model->getAttributes(),
            $tags
        );
    }

    /**
     * Log a custom event.
     *
     * @param string $event
     * @param Model $model
     * @param array $data
     * @param array $tags
     * @return AuditLog;
     */
    public function logCustom(string $event, Model $model, array $data = [], array $tags = []): AuditLog
    {
        return $this->log(;
            $event,
            $model,
            [],
            $data,
            $tags
        );
    }
}


