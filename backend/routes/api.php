<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\OrganizationController;
use App\Http\Controllers\API\ProjectController;
use App\Http\Controllers\API\TaskController;
use App\Http\Controllers\API\SubtaskController;
use App\Http\Controllers\API\CommentController;
use App\Http\Controllers\API\AttachmentController;
use App\Http\Controllers\API\ActivityLogController;
use App\Http\Controllers\API\NotificationController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// ─── Public Auth ──────────────────────────────────────────────────────────────
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

// ─── Protected Routes ─────────────────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/logout',    [AuthController::class, 'logout']);
    Route::get('/me',         [AuthController::class, 'me']);
    Route::put('/profile',    [AuthController::class, 'updateProfile']);

    // Organizations
    Route::apiResource('organizations', OrganizationController::class);
    Route::post('organizations/{organization}/members',              [OrganizationController::class, 'addMember']);
    Route::delete('organizations/{organization}/members/{user}',     [OrganizationController::class, 'removeMember']);

    // Projects (nested under organization)
    Route::apiResource('organizations.projects', ProjectController::class);
    Route::post('projects/{project}/members',              [ProjectController::class, 'addMember']);
    Route::delete('projects/{project}/members/{user}',     [ProjectController::class, 'removeMember']);

    // Tasks (nested under project)
    Route::apiResource('projects.tasks', TaskController::class);
    Route::patch('tasks/{task}/status',   [TaskController::class, 'updateStatus']);
    Route::patch('tasks/{task}/position', [TaskController::class, 'updatePosition']);
    Route::patch('tasks/{task}/assign',   [TaskController::class, 'assign']);

    // Subtasks (nested under task)
    Route::apiResource('tasks.subtasks', SubtaskController::class)->except(['show']);
    Route::patch('subtasks/{subtask}/toggle', [SubtaskController::class, 'toggle']);

    // Comments (nested under task)
    Route::apiResource('tasks.comments', CommentController::class)->except(['show']);

    // Attachments (nested under task)
    Route::get('tasks/{task}/attachments',             [AttachmentController::class, 'index']);
    Route::post('tasks/{task}/attachments',            [AttachmentController::class, 'store']);
    Route::delete('tasks/{task}/attachments/{attachment}', [AttachmentController::class, 'destroy']);

    // Activity Logs
    Route::get('organizations/{organization}/activity', [ActivityLogController::class, 'index']);
    Route::get('projects/{project}/activity',           [ActivityLogController::class, 'projectActivity']);

    // Notifications
    Route::get('notifications',                           [NotificationController::class, 'index']);
    Route::get('notifications/unread-count',              [NotificationController::class, 'unreadCount']);
    Route::patch('notifications/{notification}/read',     [NotificationController::class, 'markAsRead']);
    Route::post('notifications/read-all',                 [NotificationController::class, 'markAllAsRead']);
});
