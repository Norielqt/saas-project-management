<?php

namespace App\Services;

use App\Models\ActivityLog;
use App\Models\User;

class ActivityLogService
{
    public static function log(
        User $user,
        string $action,
        string $description,
        ?int $organizationId = null,
        ?int $projectId = null,
        ?int $taskId = null,
        array $properties = [],
    ): ActivityLog {
        return ActivityLog::create([
            'user_id'         => $user->id,
            'organization_id' => $organizationId,
            'project_id'      => $projectId,
            'task_id'         => $taskId,
            'action'          => $action,
            'description'     => $description,
            'properties'      => empty($properties) ? null : $properties,
        ]);
    }
}
