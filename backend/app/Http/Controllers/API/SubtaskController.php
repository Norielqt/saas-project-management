<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Subtask;
use App\Models\Task;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SubtaskController extends Controller
{
    public function index(Request $request, Task $task): JsonResponse
    {
        $this->authorizeAccess($request, $task);

        return response()->json($task->subtasks()->orderBy('position')->get());
    }

    public function store(Request $request, Task $task): JsonResponse
    {
        $this->authorizeAccess($request, $task);

        $data = $request->validate([
            'title' => ['required', 'string', 'max:500'],
        ]);

        $maxPosition = $task->subtasks()->max('position') ?? 0;

        $subtask = $task->subtasks()->create([
            'title'    => $data['title'],
            'position' => $maxPosition + 1,
        ]);

        return response()->json($subtask, 201);
    }

    public function update(Request $request, Task $task, Subtask $subtask): JsonResponse
    {
        $this->authorizeAccess($request, $task);
        abort_unless($subtask->task_id === $task->id, 404);

        $data = $request->validate([
            'title'     => ['sometimes', 'string', 'max:500'],
            'completed' => ['sometimes', 'boolean'],
        ]);

        $subtask->update($data);

        return response()->json($subtask);
    }

    public function destroy(Request $request, Task $task, Subtask $subtask): JsonResponse
    {
        $this->authorizeAccess($request, $task);
        abort_unless($subtask->task_id === $task->id, 404);

        $subtask->delete();

        return response()->json(['message' => 'Subtask deleted.']);
    }

    public function toggle(Request $request, Subtask $subtask): JsonResponse
    {
        $this->authorizeAccess($request, $subtask->task);

        $subtask->update(['completed' => ! $subtask->completed]);

        return response()->json($subtask);
    }

    private function authorizeAccess(Request $request, Task $task): void
    {
        $org = $task->project->organization;
        abort_unless($org->hasMember($request->user()->id), 403, 'Access denied.');
    }
}
