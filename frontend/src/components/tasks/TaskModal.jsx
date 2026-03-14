import { useState } from 'react'
import { tasksApi } from '../../api/tasks'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { XMarkIcon, TrashIcon, CalendarIcon, UserCircleIcon, FlagIcon } from '@heroicons/react/24/outline'
import Badge from '../ui/Badge'
import Button from '../ui/Button'
import SubtaskList from './SubtaskList'
import CommentSection from './CommentSection'
import AttachmentSection from './AttachmentSection'

const TABS = ['Details', 'Subtasks', 'Comments', 'Attachments', 'Activity']

const STATUS_OPTIONS = [
  { value: 'todo',        label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'in_review',   label: 'In Review' },
  { value: 'done',        label: 'Done' },
]

const PRIORITY_OPTIONS = [
  { value: 'low',    label: 'Low',    color: 'text-green-600' },
  { value: 'medium', label: 'Medium', color: 'text-yellow-600' },
  { value: 'high',   label: 'High',   color: 'text-orange-600' },
  { value: 'urgent', label: 'Urgent', color: 'text-red-600' },
]

const PRIORITY_BADGE = { low: 'green', medium: 'yellow', high: 'orange', urgent: 'red' }

export default function TaskModal({ task, projectId, members, onClose, onUpdated, onDeleted }) {
  const [activeTab, setActiveTab] = useState('Details')
  const [editing, setEditing] = useState({ title: false, description: false })
  const [form, setForm] = useState({
    title: task.title,
    description: task.description || '',
    status: task.status,
    priority: task.priority,
    assignee_id: task.assignee?.id || '',
    due_date: task.due_date || '',
  })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const save = async (patch) => {
    setSaving(true)
    try {
      const { data } = await tasksApi.update(projectId, task.id, patch)
      onUpdated(data)
      toast.success('Task updated.')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save.')
    } finally {
      setSaving(false)
    }
  }

  const handleFieldBlur = async (field) => {
    setEditing((e) => ({ ...e, [field]: false }))
    if (form[field] !== (task[field] || '')) {
      await save({ [field]: form[field] })
    }
  }

  const handleSelectChange = async (field, value) => {
    setForm((f) => ({ ...f, [field]: value }))
    const patch = { [field]: value || null }
    await save(patch)
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete this task? This cannot be undone.')) return
    setDeleting(true)
    try {
      await tasksApi.delete(projectId, task.id)
      toast.success('Task deleted.')
      onDeleted(task.id)
    } catch {
      toast.error('Failed to delete task.')
      setDeleting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-12 bg-black/50 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl min-h-0 max-h-[calc(100vh-6rem)] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-start justify-between px-6 pt-5 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Badge variant={PRIORITY_BADGE[task.priority]}>{task.priority}</Badge>
            {editing.title ? (
              <input
                autoFocus
                className="flex-1 text-lg font-bold text-gray-900 border-b-2 border-brand-400 outline-none bg-transparent"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                onBlur={() => handleFieldBlur('title')}
                onKeyDown={(e) => e.key === 'Enter' && handleFieldBlur('title')}
              />
            ) : (
              <h2
                className="flex-1 text-lg font-bold text-gray-900 truncate cursor-text hover:text-brand-700 transition-colors"
                onClick={() => setEditing((e) => ({ ...e, title: true }))}
                title="Click to edit"
              >
                {form.title}
              </h2>
            )}
          </div>
          <div className="flex items-center gap-1 ml-2 shrink-0">
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 border-b border-gray-100 px-6">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-brand-500 text-brand-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
              {tab === 'Comments' && task.comments_count > 0 && (
                <span className="ml-1 text-xs text-gray-400">({task.comments_count})</span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {activeTab === 'Details' && (
            <div className="px-6 py-4 space-y-5">
              {/* Meta fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => handleSelectChange('status', e.target.value)}
                    className="mt-1 w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Priority</label>
                  <select
                    value={form.priority}
                    onChange={(e) => handleSelectChange('priority', e.target.value)}
                    className="mt-1 w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    {PRIORITY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1">
                    <UserCircleIcon className="w-3.5 h-3.5" /> Assignee
                  </label>
                  <select
                    value={form.assignee_id}
                    onChange={(e) => handleSelectChange('assignee_id', e.target.value)}
                    className="mt-1 w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="">Unassigned</option>
                    {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1">
                    <CalendarIcon className="w-3.5 h-3.5" /> Due Date
                  </label>
                  <input
                    type="date"
                    value={form.due_date}
                    onChange={(e) => handleSelectChange('due_date', e.target.value)}
                    className="mt-1 w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              {/* Reporter */}
              {task.reporter && (
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Reporter</label>
                  <div className="mt-1 flex items-center gap-2">
                    <img src={task.reporter.avatar_url} alt={task.reporter.name} className="w-6 h-6 rounded-full" />
                    <span className="text-sm text-gray-700">{task.reporter.name}</span>
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Description</label>
                {editing.description ? (
                  <textarea
                    autoFocus
                    rows={6}
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    onBlur={() => handleFieldBlur('description')}
                    className="mt-1 w-full px-3 py-2 border border-brand-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                    placeholder="Add a description..."
                  />
                ) : (
                  <div
                    onClick={() => setEditing((e) => ({ ...e, description: true }))}
                    className="mt-1 min-h-[80px] px-3 py-2 border border-gray-100 rounded-lg text-sm text-gray-700 cursor-text hover:border-brand-200 hover:bg-gray-50 transition-colors whitespace-pre-wrap"
                  >
                    {form.description || <span className="text-gray-400 italic">Click to add description...</span>}
                  </div>
                )}
              </div>

              {/* Dates */}
              <div className="text-xs text-gray-400 flex gap-4">
                <span>Created {format(new Date(task.created_at), 'MMM d, yyyy')}</span>
                <span>Updated {format(new Date(task.updated_at), 'MMM d, yyyy')}</span>
              </div>
            </div>
          )}

          {activeTab === 'Subtasks' && (
            <SubtaskList taskId={task.id} initialSubtasks={task.subtasks || []} />
          )}

          {activeTab === 'Comments' && (
            <CommentSection taskId={task.id} initialComments={task.comments || []} />
          )}

          {activeTab === 'Attachments' && (
            <AttachmentSection taskId={task.id} initialAttachments={task.attachments || []} />
          )}

          {activeTab === 'Activity' && (
            <div className="px-6 py-4">
              {(task.activity_logs || []).length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">No activity yet.</p>
              ) : (
                <ul className="space-y-3">
                  {task.activity_logs.map((log) => (
                    <li key={log.id} className="flex items-start gap-3">
                      <img
                        src={log.user?.avatar_url || `https://ui-avatars.com/api/?name=?&background=e5e7eb&color=9ca3af`}
                        alt=""
                        className="w-6 h-6 rounded-full mt-0.5 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-700">{log.description}</p>
                        <p className="text-xs text-gray-400">{format(new Date(log.created_at), 'MMM d, yyyy · HH:mm')}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
