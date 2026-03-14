<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Resources\CommentResource;
use App\Models\Comment;
use App\Models\Task;
use App\Notifications\CommentAdded;
use App\Services\ActivityLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    public function index(Request $request, Task $task): JsonResponse
    {
        $this->authorizeAccess($request, $task);

        $comments = $task->comments()->with('user')->latest()->get();

        return response()->json(CommentResource::collection($comments));
    }

    public function store(Request $request, Task $task): JsonResponse
    {
        $this->authorizeAccess($request, $task);

        $data = $request->validate([
            'content' => ['required', 'string', 'max:5000'],
        ]);

        $comment = $task->comments()->create([
            'user_id' => $request->user()->id,
            'content' => $data['content'],
        ]);

        // Notify task assignee if they're not the commenter
        if ($task->assignee_id && $task->assignee_id !== $request->user()->id) {
            $task->assignee->notify(new CommentAdded($task, $comment, $request->user()));
        }

        // Notify task reporter if they're not the commenter and not the assignee
        if (
            $task->reporter_id !== $request->user()->id
            && $task->reporter_id !== $task->assignee_id
        ) {
            $task->reporter->notify(new CommentAdded($task, $comment, $request->user()));
        }

        ActivityLogService::log(
            user: $request->user(),
            action: 'comment.added',
            description: "{$request->user()->name} commented on \"{$task->title}\"",
            organizationId: $task->project->organization_id,
            projectId: $task->project_id,
            taskId: $task->id,
        );

        return response()->json(
            new CommentResource($comment->load('user')),
            201
        );
    }

    public function update(Request $request, Task $task, Comment $comment): JsonResponse
    {
        $this->authorizeAccess($request, $task);
        abort_unless($comment->user_id === $request->user()->id, 403, 'You can only edit your own comments.');
        abort_unless($comment->task_id === $task->id, 404);

        $data = $request->validate([
            'content' => ['required', 'string', 'max:5000'],
        ]);

        $comment->update($data);

        return response()->json(new CommentResource($comment->load('user')));
    }

    public function destroy(Request $request, Task $task, Comment $comment): JsonResponse
    {
        $this->authorizeAccess($request, $task);
        abort_unless($comment->user_id === $request->user()->id, 403, 'You can only delete your own comments.');
        abort_unless($comment->task_id === $task->id, 404);

        $comment->delete();

        return response()->json(['message' => 'Comment deleted.']);
    }

    private function authorizeAccess(Request $request, Task $task): void
    {
        $org = $task->project->organization;
        abort_unless($org->hasMember($request->user()->id), 403, 'Access denied.');
    }
}
