<?php

namespace App\Notifications;

use App\Models\Task;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class TaskAssigned extends Notification
{
    use Queueable;

    public function __construct(
        private Task $task,
        private User $assignedBy,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'type'          => 'task_assigned',
            'task_id'       => $this->task->id,
            'task_title'    => $this->task->title,
            'project_id'    => $this->task->project_id,
            'assigned_by'   => [
                'id'   => $this->assignedBy->id,
                'name' => $this->assignedBy->name,
            ],
            'message' => "{$this->assignedBy->name} assigned you to \"{$this->task->title}\"",
        ];
    }
}
