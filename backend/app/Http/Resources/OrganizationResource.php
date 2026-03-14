<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrganizationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'name'           => $this->name,
            'slug'           => $this->slug,
            'description'    => $this->description,
            'logo'           => $this->logo,
            'owner_id'       => $this->owner_id,
            'projects_count' => $this->projects_count ?? $this->projects()->count(),
            'owner'          => $this->whenLoaded('owner', fn() => new UserResource($this->owner)),
            'members'        => $this->whenLoaded('allMembers', function () {
                return $this->allMembers->map(fn($m) => [
                    'id'         => $m->user->id,
                    'name'       => $m->user->name,
                    'email'      => $m->user->email,
                    'avatar_url' => $m->user->avatar_url,
                    'role'       => $m->role,
                    'joined_at'  => $m->created_at,
                ]);
            }),
            'my_role'        => $this->whenLoaded('allMembers', function () use ($request) {
                $member = $this->allMembers->firstWhere('user_id', $request->user()?->id);
                return $member?->role;
            }),
            'created_at' => $this->created_at,
        ];
    }
}
