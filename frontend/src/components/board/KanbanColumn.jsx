import { useDroppable } from '@dnd-kit/core'
import TaskCard from './TaskCard'
import { PlusIcon } from '@heroicons/react/24/outline'

export default function KanbanColumn({ column, tasks, onTaskClick, onAddTask }) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id })

  return (
    <div
      className="flex flex-col w-72 shrink-0"
      ref={setNodeRef}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${column.color}`} />
          <span className="text-sm font-semibold text-gray-700">{column.label}</span>
          <span className="text-xs font-medium text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </div>
        <button
          onClick={onAddTask}
          className="p-1 rounded text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Cards */}
      <div
        className={`flex-1 rounded-xl p-2 space-y-2 min-h-[200px] transition-colors ${
          isOver ? 'bg-brand-50 ring-2 ring-brand-200' : 'bg-gray-100/60'
        }`}
      >
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} />
        ))}

        {tasks.length === 0 && !isOver && (
          <div className="flex flex-col items-center justify-center h-24 text-gray-300 text-xs">
            <p>No tasks</p>
          </div>
        )}

        {isOver && tasks.length === 0 && (
          <div className="h-16 rounded-lg border-2 border-dashed border-brand-300 flex items-center justify-center text-brand-400 text-xs">
            Drop here
          </div>
        )}
      </div>
    </div>
  )
}
