import { useEffect, useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { tasksApi } from '../api/tasks'
import { projectsApi } from '../api/projects'
import { organizationsApi } from '../api/organizations'
import toast from 'react-hot-toast'
import Spinner from '../components/ui/Spinner'
import Button from '../components/ui/Button'
import KanbanBoard from '../components/board/KanbanBoard'
import TaskModal from '../components/tasks/TaskModal'
import Modal from '../components/ui/Modal'
import Input from '../components/ui/Input'
import { PlusIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../context/AuthContext'

export default function BoardPage() {
  const { orgId, projectId } = useParams()
  const { user } = useAuth()

  const [project, setProject] = useState(null)
  const [orgMembers, setOrgMembers] = useState([])
  const [columns, setColumns] = useState({ todo: [], in_progress: [], in_review: [], done: [] })
  const [loading, setLoading] = useState(true)
  const [selectedTask, setSelectedTask] = useState(null) // task for detail modal
  const [showCreate, setShowCreate] = useState(false)
  const [createStatus, setCreateStatus] = useState('todo')

  const loadBoard = useCallback(async () => {
    try {
      const [projRes, tasksRes, orgRes] = await Promise.all([
        projectsApi.get(orgId, projectId),
        tasksApi.list(projectId),
        organizationsApi.get(orgId),
      ])
      setProject(projRes.data)
      setColumns(tasksRes.data)
      setOrgMembers(orgRes.data.members || [])
    } catch (err) {
      toast.error('Failed to load board.')
    } finally {
      setLoading(false)
    }
  }, [orgId, projectId])

  useEffect(() => { loadBoard() }, [loadBoard])

  const handleTaskMoved = async (taskId, newStatus, newPosition) => {
    try {
      await tasksApi.updatePosition(taskId, { status: newStatus, position: newPosition })
    } catch {
      toast.error('Failed to save position.')
      loadBoard() // revert
    }
  }

  const openTaskDetail = async (task) => {
    try {
      const { data } = await tasksApi.get(projectId, task.id)
      setSelectedTask(data)
    } catch {
      toast.error('Failed to load task details.')
    }
  }

  const handleTaskUpdated = (updatedTask) => {
    setSelectedTask(updatedTask)
    // Refresh the board columns
    tasksApi.list(projectId).then(({ data }) => setColumns(data)).catch(() => {})
  }

  const handleTaskDeleted = (taskId) => {
    setSelectedTask(null)
    setColumns((prev) => {
      const next = {}
      for (const [status, tasks] of Object.entries(prev)) {
        next[status] = tasks.filter((t) => t.id !== taskId)
      }
      return next
    })
  }

  const handleColumnsChange = (newColumns) => {
    setColumns(newColumns)
  }

  const handleCreateTask = async (data) => {
    try {
      const { data: task } = await tasksApi.create(projectId, { ...data, status: createStatus })
      toast.success('Task created!')
      setColumns((prev) => ({
        ...prev,
        [createStatus]: [...(prev[createStatus] || []), task],
      }))
      setShowCreate(false)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create task.')
      throw err
    }
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <div className="flex flex-col h-full">
      {/* Board Header */}
      <div className="px-6 py-4 bg-white border-b border-gray-200 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2 text-sm text-gray-400 min-w-0">
          <Link to="/organizations" className="hover:text-gray-600 shrink-0">Organizations</Link>
          <span>/</span>
          <Link to={`/organizations/${orgId}/projects`} className="hover:text-gray-600 shrink-0">{project?.name}</Link>
          <span>/</span>
          <span className="text-gray-700 font-medium truncate">Kanban Board</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Member avatars */}
          <div className="flex -space-x-1.5">
            {orgMembers.slice(0, 4).map((m) => (
              <img key={m.id} src={m.avatar_url} alt={m.name} title={m.name}
                className="w-7 h-7 rounded-full border-2 border-white object-cover" />
            ))}
          </div>
          <Button
            size="sm"
            onClick={() => { setCreateStatus('todo'); setShowCreate(true) }}
            icon={<PlusIcon className="w-4 h-4" />}
          >
            Add Task
          </Button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-hidden">
        <KanbanBoard
          columns={columns}
          onColumnsChange={handleColumnsChange}
          onTaskClick={openTaskDetail}
          onTaskMoved={handleTaskMoved}
          onAddTask={(status) => { setCreateStatus(status); setShowCreate(true) }}
        />
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskModal
          task={selectedTask}
          projectId={projectId}
          members={orgMembers}
          onClose={() => setSelectedTask(null)}
          onUpdated={handleTaskUpdated}
          onDeleted={handleTaskDeleted}
        />
      )}

      {/* Create Task Modal */}
      <CreateTaskModal
        open={showCreate}
        status={createStatus}
        members={orgMembers}
        onClose={() => setShowCreate(false)}
        onSubmit={handleCreateTask}
      />
    </div>
  )
}

function CreateTaskModal({ open, status, members, onClose, onSubmit }) {
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium', assignee_id: '', due_date: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSubmit({
        ...form,
        assignee_id: form.assignee_id || null,
        due_date: form.due_date || null,
      })
      setForm({ title: '', description: '', priority: 'medium', assignee_id: '', due_date: '' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={`New Task — ${status.replace('_', ' ')}`}>
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <Input
          label="Task title"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          placeholder="e.g. Design landing page"
          required
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Optional description..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              value={form.priority}
              onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
            <input
              type="date"
              value={form.due_date}
              onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Assignee</label>
          <select
            value={form.assignee_id}
            onChange={(e) => setForm((f) => ({ ...f, assignee_id: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">Unassigned</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2 justify-end pt-1">
          <Button variant="ghost" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={loading}>Create Task</Button>
        </div>
      </form>
    </Modal>
  )
}
