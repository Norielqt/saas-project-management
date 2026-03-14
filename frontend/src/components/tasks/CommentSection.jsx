import { useState } from 'react'
import { tasksApi } from '../../api/tasks'
import { useAuth } from '../../context/AuthContext'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { TrashIcon, PencilIcon } from '@heroicons/react/24/outline'

export default function CommentSection({ taskId, initialComments }) {
  const { user } = useAuth()
  const [comments, setComments] = useState(initialComments)
  const [text, setText] = useState('')
  const [posting, setPosting] = useState(false)
  const [editing, setEditing] = useState(null) // { id, content }

  const handlePost = async (e) => {
    e.preventDefault()
    if (!text.trim()) return
    setPosting(true)
    try {
      const { data } = await tasksApi.createComment(taskId, { content: text.trim() })
      setComments((c) => [data, ...c])
      setText('')
    } catch {
      toast.error('Failed to post comment.')
    } finally {
      setPosting(false)
    }
  }

  const handleEditSave = async (id) => {
    if (!editing?.content?.trim()) return
    try {
      const { data } = await tasksApi.updateComment(taskId, id, { content: editing.content.trim() })
      setComments((c) => c.map((cm) => cm.id === id ? data : cm))
      setEditing(null)
    } catch {
      toast.error('Failed to update comment.')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this comment?')) return
    const prev = comments
    setComments((c) => c.filter((cm) => cm.id !== id))
    try {
      await tasksApi.deleteComment(taskId, id)
    } catch {
      setComments(prev)
      toast.error('Failed to delete comment.')
    }
  }

  return (
    <div className="px-6 py-4">
      {/* Composer */}
      <form onSubmit={handlePost} className="flex items-start gap-3 mb-5">
        <img src={user?.avatar_url} alt={user?.name} className="w-8 h-8 rounded-full shrink-0 mt-0.5" />
        <div className="flex-1">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write a comment..."
            rows={2}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
          />
          <div className="flex justify-end mt-1.5">
            <button
              type="submit"
              disabled={posting || !text.trim()}
              className="px-4 py-1.5 text-sm bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors disabled:opacity-40"
            >
              {posting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </div>
      </form>

      {/* Comment list */}
      {comments.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">No comments yet. Be the first to comment!</p>
      ) : (
        <ul className="space-y-4">
          {comments.map((comment) => (
            <li key={comment.id} className="flex gap-3 group">
              <img
                src={comment.user?.avatar_url}
                alt={comment.user?.name}
                className="w-8 h-8 rounded-full shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-medium text-gray-900">{comment.user?.name}</span>
                  <span className="text-xs text-gray-400">
                    {format(new Date(comment.created_at), 'MMM d, yyyy · HH:mm')}
                  </span>
                </div>

                {editing?.id === comment.id ? (
                  <div>
                    <textarea
                      autoFocus
                      rows={3}
                      value={editing.content}
                      onChange={(e) => setEditing((ed) => ({ ...ed, content: e.target.value }))}
                      className="w-full px-3 py-2 border border-brand-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                    />
                    <div className="flex gap-2 mt-1.5">
                      <button
                        onClick={() => handleEditSave(comment.id)}
                        className="px-3 py-1 text-xs bg-brand-500 text-white rounded-lg hover:bg-brand-600"
                      >Save</button>
                      <button
                        onClick={() => setEditing(null)}
                        className="px-3 py-1 text-xs text-gray-500 hover:bg-gray-100 rounded-lg"
                      >Cancel</button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                )}
              </div>

              {/* Actions — only show for own comments */}
              {comment.user?.id === user?.id && editing?.id !== comment.id && (
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button
                    onClick={() => setEditing({ id: comment.id, content: comment.content })}
                    className="p-1 rounded text-gray-300 hover:text-brand-500 transition-colors"
                  >
                    <PencilIcon className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="p-1 rounded text-gray-300 hover:text-red-500 transition-colors"
                  >
                    <TrashIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
