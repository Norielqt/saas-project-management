<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Resources\TaskResource;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use App\Notifications\TaskAssigned;
use App\Services\ActivityLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    public function index(Request $request, Project $project): JsonResponse
    {
        $this->authorizeAccess($request, $project);

        $tasks = $project->tasks()
            ->with(['assignee', 'reporter', 'subtasks'])
            ->withCount('comments', 'attachments')
            ->get()
            ->groupBy('status');

        // Ensure all statuses are present, even if empty
        $board = [];
        foreach (Task::STATUSES as $status) {
            $board[$status] = $tasks->get($status, collect())->values();
        }

        return response()->json($board);
    }

    public function store(Request $request, Project $project): JsonResponse
    {
        $this->authorizeAccess($request, $project);

        $data = $request->validate([
            'title'       => ['required', 'string', 'max:500'],
            'description' => ['nullable', 'string'],
            'status'      => ['sometimes', 'in:' . implode(',', Task::STATUSES)],
            'priority'    => ['sometimes', 'in:' . implode(',', Task::PRIORITIES)],
            'assignee_id' => ['nullable', 'exists:users,id'],
            'due_date'    => ['nullable', 'date'],
        ]);

        // Determine next position in the status column
        $status = $data['status'] ?? 'todo';
        $maxPosition = $project->tasks()
            ->where('status', $status)
            ->max('position') ?? 0;

        $task = $project->tasks()->create([
            ...$data,
            'reporter_id' => $request->user()->id,
            'position'    => $maxPosition + 1,
        ]);

        if ($task->assignee_id && $task->assignee_id !== $request->user()->id) {
            $task->assignee->notify(new TaskAssigned($task, $request->user()));
        }

        ActivityLogService::log(
            user: $request->user(),
            action: 'task.created',
            description: "{$request->user()->name} created task \"{$task->title}\"",
            organizationId: $project->organization_id,
            projectId: $project->id,
            taskId: $task->id,
        );

        return response()->json(
            new TaskResource($task->load(['assignee', 'reporter', 'subtasks'])),
            201
        );
    }

    public function show(Request $request, Project $project, Task $task): JsonResponse
    {
        $this->authorizeAccess($request, $project);
        $this->ensureTaskBelongsToProject($task, $project);

        $task->load([
            'assignee',
            'reporter',
            'subtasks',
            'comments.user',
            'attachments.user',
            'activityLogs.user',
        ]);

        return response()->json(new TaskResource($task));
    }

    public function update(Request $request, Project $project, Task $task): JsonResponse
    {
        $this->authorizeAccess($request, $project);
        $this->ensureTaskBelongsToProject($task, $project);

        $data = $request->validate([
            'title'       => ['sometimes', 'string', 'max:500'],
            'description' => ['nullable', 'string'],
            'status'      => ['sometimes', 'in:' . implode(',', Task::STATUSES)],
            'priority'    => ['sometimes', 'in:' . implode(',', Task::PRIORITIES)],
            'assignee_id' => ['nullable', 'exists:users,id'],
            'due_date'    => ['nullable', 'date'],
        ]);

        $oldStatus = $task->status;
        $task->update($data);

        if (isset($data['status']) && $data['status'] !== $oldStatus) {
            ActivityLogService::log(
                user: $request->user(),
                action: 'task.status_changed',
                description: "{$request->user()->name} moved \"{$task->title}\" from {$oldStatus} to {$data['status']}",
                organizationId: $project->organization_id,
                projectId: $project->id,
                taskId: $task->id,
                properties: ['from' => $oldStatus, 'to' => $data['status']],
            );
        }

        return response()->json(new TaskResource($task->fresh(['assignee', 'reporter', 'subtasks'])));
    }

    public function destroy(Request $request, Project $project, Task $task): JsonResponse
    {
        $this->authorizeAccess($request, $project);
        $this->ensureTaskBelongsToProject($task, $project);

        ActivityLogService::log(
            user: $request->user(),
            action: 'task.deleted',
            description: "{$request->user()->name} deleted task \"{$task->title}\"",
            organizationId: $project->organization_id,
            projectId: $project->id,
        );

        $task->delete();

        return response()->json(['message' => 'Task deleted.']);
    }

    public function updateStatus(Request $request, Task $task): JsonResponse
    {
        $project = $task->project;
        $this->authorizeAccess($request, $project);

        $data = $request->validate([
            'status' => ['required', 'in:' . implode(',', Task::STATUSES)],
        ]);

        $oldStatus = $task->status;
        $task->update(['status' => $data['status']]);

        ActivityLogService::log(
            user: $request->user(),
            action: 'task.status_changed',
            description: "{$request->user()->name} moved \"{$task->title}\" to {$data['status']}",
            organizationId: $project->organization_id,
            projectId: $project->id,
            taskId: $task->id,
            properties: ['from' => $oldStatus, 'to' => $data['status']],
        );

        return response()->json(new TaskResource($task->fresh(['assignee', 'reporter', 'subtasks'])));
    }

    public function updatePosition(Request $request, Task $task): JsonResponse
    {
        $project = $task->project;
        $this->authorizeAccess($request, $project);

        $data = $request->validate([
            'status'   => ['required', 'in:' . implode(',', Task::STATUSES)],
            'position' => ['required', 'integer', 'min:0'],
        ]);

        $task->update([
            'status'   => $data['status'],
            'position' => $data['position'],
        ]);

        return response()->json(['message' => 'Position updated.']);
    }

    public function assign(Request $request, Task $task): JsonResponse
    {
        $project = $task->project;
        $this->authorizeAccess($request, $project);

        $data = $request->validate([
            'assignee_id' => ['nullable', 'exists:users,id'],
        ]);

        $task->update(['assignee_id' => $data['assignee_id']]);

        if ($data['assignee_id'] && $data['assignee_id'] !== $request->user()->id) {
            $assignee = User::find($data['assignee_id']);
            $assignee?->notify(new TaskAssigned($task, $request->user()));
        }

        return response()->json(new TaskResource($task->fresh(['assignee', 'reporter', 'subtasks'])));
    }

    private function authorizeAccess(Request $request, Project $project): void
    {
        $org = $project->organization;
        abort_unless($org->hasMember($request->user()->id), 403, 'Access denied.');
    }

    private function ensureTaskBelongsToProject(Task $task, Project $project): void
    {
        abort_unless($task->project_id === $project->id, 404, 'Task not found.');
    }
}
