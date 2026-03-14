<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TaskResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'               => $this->id,
            'project_id'       => $this->project_id,
            'title'            => $this->title,
            'description'      => $this->description,
            'status'           => $this->status,
            'priority'         => $this->priority,
            'position'         => $this->position,
            'due_date'         => $this->due_date?->toDateString(),
            'comments_count'   => $this->comments_count ?? $this->comments()->count(),
            'attachments_count'=> $this->attachments_count ?? $this->attachments()->count(),
            'subtask_progress' => $this->subtask_progress,
            'assignee'         => $this->whenLoaded('assignee', fn() => $this->assignee ? new UserResource($this->assignee) : null),
            'reporter'         => $this->whenLoaded('reporter', fn() => new UserResource($this->reporter)),
            'subtasks'         => $this->whenLoaded('subtasks', fn() => $this->subtasks->map(fn($s) => [
                'id'        => $s->id,
                'title'     => $s->title,
                'completed' => $s->completed,
                'position'  => $s->position,
            ])),
            'comments'     => $this->whenLoaded('comments', fn() => CommentResource::collection($this->comments)),
            'attachments'  => $this->whenLoaded('attachments', fn() => $this->attachments->map(fn($a) => [
                'id'            => $a->id,
                'original_name' => $a->original_name,
                'mime_type'     => $a->mime_type,
                'formatted_size'=> $a->formatted_size,
                'url'           => $a->url,
                'user'          => ['id' => $a->user->id, 'name' => $a->user->name],
                'created_at'    => $a->created_at,
            ])),
            'activity_logs' => $this->whenLoaded('activityLogs', fn() => $this->activityLogs->map(fn($log) => [
                'id'          => $log->id,
                'action'      => $log->action,
                'description' => $log->description,
                'user'        => $log->user ? ['id' => $log->user->id, 'name' => $log->user->name, 'avatar_url' => $log->user->avatar_url] : null,
                'created_at'  => $log->created_at,
            ])),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
