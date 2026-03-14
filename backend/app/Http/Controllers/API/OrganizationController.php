<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrganizationResource;
use App\Models\Organization;
use App\Models\OrganizationMember;
use App\Models\User;
use App\Services\ActivityLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrganizationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $organizations = $request->user()
            ->organizations()
            ->with(['owner', 'allMembers.user'])
            ->withCount('projects')
            ->get();

        return response()->json(OrganizationResource::collection($organizations));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'        => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
        ]);

        $organization = Organization::create([
            ...$data,
            'owner_id' => $request->user()->id,
        ]);

        // Add owner as a member with 'owner' role
        $organization->allMembers()->create([
            'user_id' => $request->user()->id,
            'role'    => 'owner',
        ]);

        ActivityLogService::log(
            user: $request->user(),
            action: 'organization.created',
            description: "{$request->user()->name} created organization {$organization->name}",
            organizationId: $organization->id,
        );

        return response()->json(
            new OrganizationResource($organization->load(['owner', 'allMembers.user'])),
            201
        );
    }

    public function show(Request $request, Organization $organization): JsonResponse
    {
        $this->authorizeMember($request, $organization);

        $organization->load(['owner', 'allMembers.user', 'projects']);

        return response()->json(new OrganizationResource($organization));
    }

    public function update(Request $request, Organization $organization): JsonResponse
    {
        $this->authorizeAdmin($request, $organization);

        $data = $request->validate([
            'name'        => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
        ]);

        $organization->update($data);

        return response()->json(new OrganizationResource($organization->fresh(['owner', 'allMembers.user'])));
    }

    public function destroy(Request $request, Organization $organization): JsonResponse
    {
        $this->authorizeOwner($request, $organization);

        $organization->delete();

        return response()->json(['message' => 'Organization deleted.']);
    }

    public function addMember(Request $request, Organization $organization): JsonResponse
    {
        $this->authorizeAdmin($request, $organization);

        $data = $request->validate([
            'email' => ['required', 'email', 'exists:users,email'],
            'role'  => ['sometimes', 'in:admin,member'],
        ]);

        $user = User::where('email', $data['email'])->firstOrFail();

        if ($organization->hasMember($user->id)) {
            return response()->json(['message' => 'User is already a member.'], 422);
        }

        $organization->allMembers()->create([
            'user_id' => $user->id,
            'role'    => $data['role'] ?? 'member',
        ]);

        ActivityLogService::log(
            user: $request->user(),
            action: 'organization.member_added',
            description: "{$request->user()->name} added {$user->name} to {$organization->name}",
            organizationId: $organization->id,
        );

        return response()->json(['message' => 'Member added successfully.']);
    }

    public function removeMember(Request $request, Organization $organization, User $user): JsonResponse
    {
        $this->authorizeAdmin($request, $organization);

        if ($user->id === $organization->owner_id) {
            return response()->json(['message' => 'Cannot remove the organization owner.'], 422);
        }

        $organization->allMembers()->where('user_id', $user->id)->delete();

        ActivityLogService::log(
            user: $request->user(),
            action: 'organization.member_removed',
            description: "{$request->user()->name} removed {$user->name} from {$organization->name}",
            organizationId: $organization->id,
        );

        return response()->json(['message' => 'Member removed.']);
    }

    private function authorizeMember(Request $request, Organization $organization): void
    {
        abort_unless($organization->hasMember($request->user()->id), 403, 'Access denied.');
    }

    private function authorizeAdmin(Request $request, Organization $organization): void
    {
        $role = $organization->getMemberRole($request->user()->id);
        abort_unless(in_array($role, ['owner', 'admin']), 403, 'Insufficient permissions.');
    }

    private function authorizeOwner(Request $request, Organization $organization): void
    {
        abort_unless($organization->owner_id === $request->user()->id, 403, 'Only the owner can perform this action.');
    }
}
