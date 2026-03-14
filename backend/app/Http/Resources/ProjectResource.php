<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProjectResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'              => $this->id,
            'organization_id' => $this->organization_id,
            'name'            => $this->name,
            'description'     => $this->description,
            'color'           => $this->color,
            'status'          => $this->status,
            'tasks_count'     => $this->tasks_count ?? $this->tasks()->count(),
            'creator'         => $this->whenLoaded('creator', fn() => new UserResource($this->creator)),
            'members'         => $this->whenLoaded('members', function () {
                return $this->members->map(fn($m) => [
                    'id'         => $m->id,
                    'name'       => $m->name,
                    'email'      => $m->email,
                    'avatar_url' => $m->avatar_url,
                    'role'       => $m->pivot->role,
                ]);
            }),
            'created_at' => $this->created_at,
        ];
    }
}
