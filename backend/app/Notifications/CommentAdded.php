<?php

namespace App\Notifications;

use App\Models\Comment;
use App\Models\Task;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class CommentAdded extends Notification
{
    use Queueable;

    public function __construct(
        private Task $task,
        private Comment $comment,
        private User $commenter,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'type'       => 'comment_added',
            'task_id'    => $this->task->id,
            'task_title' => $this->task->title,
            'project_id' => $this->task->project_id,
            'comment_id' => $this->comment->id,
            'commenter'  => [
                'id'   => $this->commenter->id,
                'name' => $this->commenter->name,
            ],
            'message' => "{$this->commenter->name} commented on \"{$this->task->title}\"",
        ];
    }
}
