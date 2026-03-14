<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    use HasFactory;

    protected $fillable = [
        'project_id',
        'reporter_id',
        'assignee_id',
        'title',
        'description',
        'status',
        'priority',
        'position',
        'due_date',
    ];

    protected $casts = [
        'due_date' => 'date',
        'position' => 'integer',
    ];

    public const STATUSES = ['todo', 'in_progress', 'in_review', 'done'];
    public const PRIORITIES = ['low', 'medium', 'high', 'urgent'];

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function reporter()
    {
        return $this->belongsTo(User::class, 'reporter_id');
    }

    public function assignee()
    {
        return $this->belongsTo(User::class, 'assignee_id');
    }

    public function subtasks()
    {
        return $this->hasMany(Subtask::class)->orderBy('position');
    }

    public function comments()
    {
        return $this->hasMany(Comment::class)->latest();
    }

    public function attachments()
    {
        return $this->hasMany(Attachment::class)->latest();
    }

    public function activityLogs()
    {
        return $this->hasMany(ActivityLog::class)->latest();
    }

    public function getSubtaskProgressAttribute(): array
    {
        $total = $this->subtasks()->count();
        $completed = $this->subtasks()->where('completed', true)->count();
        return ['total' => $total, 'completed' => $completed];
    }
}
