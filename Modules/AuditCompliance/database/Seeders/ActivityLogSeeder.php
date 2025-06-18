<?php

namespace Modules\AuditCompliance\database\Seeders;

use Illuminate\Database\Seeder;
use Modules\AuditCompliance\Domain\Models\ActivityLog;

class ActivityLogSeeder extends Seeder
{
    public function run()
    {
        $logs = [
            [
                'user_id' => 1,
                'role_id' => 1,
                'action' => 'login',
                'description' => 'User logged in',
                'metadata' => json_encode(['ip' => '127.0.0.1']),
            ],
            [
                'user_id' => 2,
                'role_id' => 2,
                'action' => 'update_profile',
                'description' => 'User updated profile',
                'metadata' => json_encode(['field' => 'email']),
            ],
        ];
        foreach ($logs as $data) {
            ActivityLog::updateOrCreate([
                'user_id' => $data['user_id'],
                'action' => $data['action'],
            ], $data);
        }
    }
}
