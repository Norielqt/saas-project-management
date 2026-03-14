import { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import KanbanColumn from './KanbanColumn'
import TaskCard from './TaskCard'

const COLUMNS = [
  { id: 'todo',        label: 'To Do',       color: 'bg-gray-400' },
  { id: 'in_progress', label: 'In Progress',  color: 'bg-blue-500' },
  { id: 'in_review',   label: 'In Review',    color: 'bg-yellow-500' },
  { id: 'done',        label: 'Done',         color: 'bg-green-500' },
]

export default function KanbanBoard({ columns, onColumnsChange, onTaskClick, onTaskMoved, onAddTask }) {
  const [activeTask, setActiveTask] = useState(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const findColumnOfTask = (taskId) => {
    for (const [status, tasks] of Object.entries(columns)) {
      if (tasks.some((t) => t.id === taskId)) return status
    }
    return null
  }

  const handleDragStart = ({ active }) => {
    const sourceColumn = findColumnOfTask(active.id)
    if (!sourceColumn) return
    const task = columns[sourceColumn].find((t) => t.id === active.id)
    setActiveTask(task)
  }

  const handleDragOver = ({ active, over }) => {
    if (!over) return

    const activeColumn = findColumnOfTask(active.id)
    // "over" can be a column id or a task id
    const overColumn = columns[over.id] !== undefined
      ? over.id
      : findColumnOfTask(over.id)

    if (!activeColumn || !overColumn || activeColumn === overColumn) return

    onColumnsChange((prev) => {
      const activeItems = [...prev[activeColumn]]
      const overItems = [...prev[overColumn]]
      const activeIndex = activeItems.findIndex((t) => t.id === active.id)
      const task = activeItems[activeIndex]

      const overIndex = overItems.findIndex((t) => t.id === over.id)
      const insertAt = overIndex >= 0 ? overIndex : overItems.length

      return {
        ...prev,
        [activeColumn]: activeItems.filter((t) => t.id !== active.id),
        [overColumn]: [
          ...overItems.slice(0, insertAt),
          { ...task, status: overColumn },
          ...overItems.slice(insertAt),
        ],
      }
    })
  }

  const handleDragEnd = ({ active, over }) => {
    setActiveTask(null)
    if (!over) return

    const activeColumn = findColumnOfTask(active.id)
    const overColumn = columns[over.id] !== undefined
      ? over.id
      : findColumnOfTask(over.id)

    if (!activeColumn || !overColumn) return

    if (activeColumn === overColumn) {
      // Reorder within same column
      onColumnsChange((prev) => {
        const items = [...prev[activeColumn]]
        const oldIdx = items.findIndex((t) => t.id === active.id)
        const newIdx = items.findIndex((t) => t.id === over.id)
        if (oldIdx === newIdx) return prev
        const reordered = arrayMove(items, oldIdx, newIdx)
        onTaskMoved(active.id, activeColumn, newIdx)
        return { ...prev, [activeColumn]: reordered }
      })
    } else {
      // Moved to different column — position update handled by dragOver
      const newTasks = columns[overColumn]
      const newPos = newTasks.findIndex((t) => t.id === active.id)
      onTaskMoved(active.id, overColumn, newPos)
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 p-6 h-full overflow-x-auto scrollbar-thin">
        {COLUMNS.map((col) => {
          const tasks = columns[col.id] || []
          return (
            <SortableContext
              key={col.id}
              id={col.id}
              items={tasks.map((t) => t.id)}
              strategy={verticalListSortingStrategy}
            >
              <KanbanColumn
                column={col}
                tasks={tasks}
                onTaskClick={onTaskClick}
                onAddTask={() => onAddTask(col.id)}
              />
            </SortableContext>
          )
        })}
      </div>

      <DragOverlay>
        {activeTask && (
          <div className="rotate-2 opacity-90">
            <TaskCard task={activeTask} isDragging />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
