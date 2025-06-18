<?php

namespace Modules\AuditCompliance\Traits;

use Modules\AuditCompliance\Services\AuditLogService;
use trait Auditable
{
    /**
     * Boot the trait.
     *
     * @return void;
     */
    public static function bootAuditable()
    {
        static::created(function ($model) {
            app(AuditLogService::class)->logCreated($model, $model->auditTags ?? []);
        });

        static::updated(function ($model) {
            app(AuditLogService::class)->logUpdated($model, $model->auditTags ?? []);
        });

        static::deleted(function ($model) {
            app(AuditLogService::class)->logDeleted($model, $model->auditTags ?? []);
        });

        if (method_exists(static::class, 'restored')) {
            static::restored(function ($model) {
                app(AuditLogService::class)->logRestored($model, $model->auditTags ?? []);
            });
        }
    }

    /**
     * Get the audit logs for this model.
     */
    public function auditLogs()
    {
        return $this->morphMany(;
            \Modules\AuditCompliance\Domain\Models\AuditLog::class,
            'auditable'
        );
    }

    /**
     * Log a custom audit event.
     *
     * @param string $event
     * @param array $data
     * @param array $tags
     * @return \Modules\AuditCompliance\Domain\Models\AuditLog;
     */
    public function logAudit(string $event, array $data = [], array $tags = [])
    {
        return app(AuditLogService::class)->logCustom($event, $this, $data, array_merge($this->auditTags ?? [], $tags));
    }

    /**
     * Get the attributes that should be excluded from audit logs.
     *
     * @return array;
     */
    public function getAuditExclude()
    {
        return $this->auditExclude ?? [];
    }
}


