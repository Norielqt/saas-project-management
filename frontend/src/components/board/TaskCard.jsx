import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { format, isPast, isToday } from 'date-fns'
import { ChatBubbleLeftIcon, PaperClipIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import Badge from '../ui/Badge'

const PRIORITY_COLORS = {
  low:    { badge: 'green',  dot: 'bg-green-400' },
  medium: { badge: 'yellow', dot: 'bg-yellow-400' },
  high:   { badge: 'orange', dot: 'bg-orange-400' },
  urgent: { badge: 'red',    dot: 'bg-red-500' },
}

export default function TaskCard({ task, onClick, isDragging }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0 : 1,
  }

  const priority = PRIORITY_COLORS[task.priority] ?? PRIORITY_COLORS.medium
  const dueDate = task.due_date ? new Date(task.due_date) : null
  const isOverdue = dueDate && isPast(dueDate) && task.status !== 'done'
  const isDueToday = dueDate && isToday(dueDate)

  const subtaskTotal = task.subtask_progress?.total ?? task.subtasks?.length ?? 0
  const subtaskDone = task.subtask_progress?.completed ?? task.subtasks?.filter((s) => s.completed).length ?? 0

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`bg-white rounded-lg border border-gray-200 p-3 cursor-pointer select-none
        hover:border-brand-300 hover:shadow-md transition-all
        ${isDragging ? 'shadow-xl ring-2 ring-brand-400' : ''}
      `}
    >
      {/* Priority & Title */}
      <div className="flex items-start gap-2 mb-2">
        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${priority.dot}`} />
        <p className="text-sm font-medium text-gray-800 leading-snug line-clamp-2">{task.title}</p>
      </div>

      {/* Due date */}
      {dueDate && (
        <div className={`flex items-center gap-1 text-xs mb-2 ${
          isOverdue ? 'text-red-500' : isDueToday ? 'text-yellow-600' : 'text-gray-400'
        }`}>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {isOverdue ? 'Overdue · ' : ''}{format(dueDate, 'MMM d')}
        </div>
      )}

      {/* Subtask progress */}
      {subtaskTotal > 0 && (
        <div className="mb-2">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-0.5">
            <span className="flex items-center gap-1">
              <CheckCircleIcon className="w-3 h-3" />
              {subtaskDone}/{subtaskTotal}
            </span>
          </div>
          <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-500 rounded-full transition-all"
              style={{ width: `${subtaskTotal > 0 ? (subtaskDone / subtaskTotal) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          {(task.comments_count > 0) && (
            <span className="flex items-center gap-0.5">
              <ChatBubbleLeftIcon className="w-3 h-3" />
              {task.comments_count}
            </span>
          )}
          {(task.attachments_count > 0) && (
            <span className="flex items-center gap-0.5">
              <PaperClipIcon className="w-3 h-3" />
              {task.attachments_count}
            </span>
          )}
        </div>
        {task.assignee && (
          <img
            src={task.assignee.avatar_url}
            alt={task.assignee.name}
            title={task.assignee.name}
            className="w-5 h-5 rounded-full object-cover border border-gray-200"
          />
        )}
      </div>
    </div>
  )
}
