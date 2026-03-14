<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Organization;
use App\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ActivityLogController extends Controller
{
    public function index(Request $request, Organization $organization): JsonResponse
    {
        abort_unless($organization->hasMember($request->user()->id), 403, 'Access denied.');

        $logs = $organization->activityLogs()
            ->with('user', 'project', 'task')
            ->latest()
            ->paginate(50);

        return response()->json($logs);
    }

    public function projectActivity(Request $request, Project $project): JsonResponse
    {
        $org = $project->organization;
        abort_unless($org->hasMember($request->user()->id), 403, 'Access denied.');

        $logs = $project->activityLogs()
            ->with('user', 'task')
            ->latest()
            ->paginate(50);

        return response()->json($logs);
    }
}
