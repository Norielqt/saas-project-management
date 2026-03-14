import { useState } from 'react'
import { tasksApi } from '../../api/tasks'
import toast from 'react-hot-toast'
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline'

export default function SubtaskList({ taskId, initialSubtasks }) {
  const [subtasks, setSubtasks] = useState(initialSubtasks)
  const [newTitle, setNewTitle] = useState('')
  const [adding, setAdding] = useState(false)
  const [showInput, setShowInput] = useState(false)

  const completed = subtasks.filter((s) => s.completed).length
  const total = subtasks.length

  const handleToggle = async (subtask) => {
    const prev = subtask.completed
    setSubtasks((s) => s.map((sub) => sub.id === subtask.id ? { ...sub, completed: !prev } : sub))
    try {
      const { data } = await tasksApi.toggleSubtask(subtask.id)
      setSubtasks((s) => s.map((sub) => sub.id === data.id ? data : sub))
    } catch {
      setSubtasks((s) => s.map((sub) => sub.id === subtask.id ? { ...sub, completed: prev } : sub))
      toast.error('Failed to update subtask.')
    }
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!newTitle.trim()) return
    setAdding(true)
    try {
      const { data } = await tasksApi.createSubtask(taskId, { title: newTitle.trim() })
      setSubtasks((s) => [...s, data])
      setNewTitle('')
      setShowInput(false)
    } catch {
      toast.error('Failed to add subtask.')
    } finally {
      setAdding(false)
    }
  }

  const handleDelete = async (id) => {
    const prev = subtasks
    setSubtasks((s) => s.filter((sub) => sub.id !== id))
    try {
      await tasksApi.deleteSubtask(taskId, id)
    } catch {
      setSubtasks(prev)
      toast.error('Failed to delete subtask.')
    }
  }

  return (
    <div className="px-6 py-4">
      {/* Progress header */}
      {total > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>Progress</span>
            <span>{completed}/{total} completed</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-500 rounded-full transition-all duration-300"
              style={{ width: total > 0 ? `${(completed / total) * 100}%` : '0%' }}
            />
          </div>
        </div>
      )}

      {/* Subtask items */}
      <ul className="space-y-1.5 mb-3">
        {subtasks.map((sub) => (
          <li key={sub.id} className="flex items-center gap-2 group p-2 rounded-lg hover:bg-gray-50 transition-colors">
            <input
              type="checkbox"
              checked={sub.completed}
              onChange={() => handleToggle(sub)}
              className="w-4 h-4 rounded text-brand-500 border-gray-300 cursor-pointer accent-brand-500"
            />
            <span className={`flex-1 text-sm ${sub.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
              {sub.title}
            </span>
            <button
              onClick={() => handleDelete(sub.id)}
              className="p-0.5 rounded text-gray-200 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
            >
              <TrashIcon className="w-3.5 h-3.5" />
            </button>
          </li>
        ))}
      </ul>

      {/* Add subtask */}
      {showInput ? (
        <form onSubmit={handleAdd} className="flex items-center gap-2">
          <input
            autoFocus
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Subtask title..."
            className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <button
            type="submit"
            disabled={adding}
            className="px-3 py-1.5 text-sm bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors disabled:opacity-50"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => { setShowInput(false); setNewTitle('') }}
            className="px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </form>
      ) : (
        <button
          onClick={() => setShowInput(true)}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-brand-600 transition-colors px-2 py-1 rounded-lg hover:bg-brand-50"
        >
          <PlusIcon className="w-4 h-4" />
          Add subtask
        </button>
      )}
    </div>
  )
}
