<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProjectResource;
use App\Models\Organization;
use App\Models\Project;
use App\Models\User;
use App\Services\ActivityLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    public function index(Request $request, Organization $organization): JsonResponse
    {
        $this->authorizeMember($request, $organization);

        $projects = $organization->projects()
            ->with(['creator', 'members'])
            ->withCount('tasks')
            ->get();

        return response()->json(ProjectResource::collection($projects));
    }

    public function store(Request $request, Organization $organization): JsonResponse
    {
        $this->authorizeMember($request, $organization);

        $data = $request->validate([
            'name'        => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'color'       => ['sometimes', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
        ]);

        $project = $organization->projects()->create([
            ...$data,
            'created_by' => $request->user()->id,
        ]);

        // Creator becomes admin of the project
        $project->projectMembers()->create([
            'user_id' => $request->user()->id,
            'role'    => 'admin',
        ]);

        ActivityLogService::log(
            user: $request->user(),
            action: 'project.created',
            description: "{$request->user()->name} created project {$project->name}",
            organizationId: $organization->id,
            projectId: $project->id,
        );

        return response()->json(
            new ProjectResource($project->load(['creator', 'members'])),
            201
        );
    }

    public function show(Request $request, Organization $organization, Project $project): JsonResponse
    {
        $this->authorizeMember($request, $organization);
        $this->ensureProjectBelongsToOrganization($project, $organization);

        $project->load(['creator', 'members', 'tasks.assignee', 'tasks.subtasks']);

        return response()->json(new ProjectResource($project));
    }

    public function update(Request $request, Organization $organization, Project $project): JsonResponse
    {
        $this->authorizeProjectAdmin($request, $organization, $project);

        $data = $request->validate([
            'name'        => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'color'       => ['sometimes', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'status'      => ['sometimes', 'in:active,archived'],
        ]);

        $project->update($data);

        return response()->json(new ProjectResource($project->fresh(['creator', 'members'])));
    }

    public function destroy(Request $request, Organization $organization, Project $project): JsonResponse
    {
        $this->authorizeProjectAdmin($request, $organization, $project);

        $project->delete();

        return response()->json(['message' => 'Project deleted.']);
    }

    public function addMember(Request $request, Project $project): JsonResponse
    {
        $organization = $project->organization;
        $this->authorizeProjectAdmin($request, $organization, $project);

        $data = $request->validate([
            'user_id' => ['required', 'exists:users,id'],
            'role'    => ['sometimes', 'in:admin,member'],
        ]);

        if (! $organization->hasMember($data['user_id'])) {
            return response()->json(['message' => 'User must be a member of the organization first.'], 422);
        }

        if ($project->hasMember($data['user_id'])) {
            return response()->json(['message' => 'User is already a project member.'], 422);
        }

        $project->projectMembers()->create([
            'user_id' => $data['user_id'],
            'role'    => $data['role'] ?? 'member',
        ]);

        return response()->json(['message' => 'Member added to project.']);
    }

    public function removeMember(Request $request, Project $project, User $user): JsonResponse
    {
        $organization = $project->organization;
        $this->authorizeProjectAdmin($request, $organization, $project);

        $project->projectMembers()->where('user_id', $user->id)->delete();

        return response()->json(['message' => 'Member removed from project.']);
    }

    private function authorizeMember(Request $request, Organization $organization): void
    {
        abort_unless($organization->hasMember($request->user()->id), 403, 'Access denied.');
    }

    private function authorizeProjectAdmin(Request $request, Organization $organization, Project $project): void
    {
        $orgRole = $organization->getMemberRole($request->user()->id);
        $projectRole = $project->getMemberRole($request->user()->id);

        $isOrgAdmin = in_array($orgRole, ['owner', 'admin']);
        $isProjectAdmin = $projectRole === 'admin';

        abort_unless($isOrgAdmin || $isProjectAdmin, 403, 'Insufficient permissions.');
    }

    private function ensureProjectBelongsToOrganization(Project $project, Organization $organization): void
    {
        abort_unless($project->organization_id === $organization->id, 404, 'Project not found.');
    }
}
