<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Attachment;
use App\Models\Task;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AttachmentController extends Controller
{
    public function index(Request $request, Task $task): JsonResponse
    {
        $this->authorizeAccess($request, $task);

        $attachments = $task->attachments()->with('user')->latest()->get()->map(function ($attachment) {
            return [
                'id'            => $attachment->id,
                'original_name' => $attachment->original_name,
                'mime_type'     => $attachment->mime_type,
                'file_size'     => $attachment->file_size,
                'formatted_size'=> $attachment->formatted_size,
                'url'           => $attachment->url,
                'user'          => [
                    'id'   => $attachment->user->id,
                    'name' => $attachment->user->name,
                ],
                'created_at' => $attachment->created_at,
            ];
        });

        return response()->json($attachments);
    }

    public function store(Request $request, Task $task): JsonResponse
    {
        $this->authorizeAccess($request, $task);

        $request->validate([
            'file' => ['required', 'file', 'max:20480'], // 20 MB limit
        ]);

        $file = $request->file('file');
        $path = $file->store("attachments/tasks/{$task->id}", 'public');

        $attachment = $task->attachments()->create([
            'user_id'       => $request->user()->id,
            'original_name' => $file->getClientOriginalName(),
            'file_path'     => $path,
            'mime_type'     => $file->getMimeType(),
            'file_size'     => $file->getSize(),
        ]);

        return response()->json([
            'id'            => $attachment->id,
            'original_name' => $attachment->original_name,
            'mime_type'     => $attachment->mime_type,
            'file_size'     => $attachment->file_size,
            'formatted_size'=> $attachment->formatted_size,
            'url'           => $attachment->url,
            'user'          => [
                'id'   => $request->user()->id,
                'name' => $request->user()->name,
            ],
            'created_at' => $attachment->created_at,
        ], 201);
    }

    public function destroy(Request $request, Task $task, Attachment $attachment): JsonResponse
    {
        $this->authorizeAccess($request, $task);
        abort_unless($attachment->task_id === $task->id, 404);

        $isOwner = $attachment->user_id === $request->user()->id;
        $isAdmin = in_array(
            $task->project->getMemberRole($request->user()->id),
            ['admin', null]  // null means check org role
        );

        abort_unless($isOwner || $isAdmin, 403, 'You can only delete your own attachments.');

        $attachment->delete(); // Storage::delete called in model boot

        return response()->json(['message' => 'Attachment deleted.']);
    }

    private function authorizeAccess(Request $request, Task $task): void
    {
        $org = $task->project->organization;
        abort_unless($org->hasMember($request->user()->id), 403, 'Access denied.');
    }
}
