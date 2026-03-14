import { useState, useRef } from 'react'
import { tasksApi } from '../../api/tasks'
import toast from 'react-hot-toast'
import { TrashIcon, ArrowDownTrayIcon, PaperClipIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline'
import { format } from 'date-fns'
import { useAuth } from '../../context/AuthContext'

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

export default function AttachmentSection({ taskId, initialAttachments }) {
  const { user } = useAuth()
  const [attachments, setAttachments] = useState(initialAttachments)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef(null)

  const upload = async (file) => {
    setUploading(true)
    try {
      const { data } = await tasksApi.uploadAttachment(taskId, file)
      setAttachments((a) => [data, ...a])
      toast.success(`Uploaded ${data.original_name}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed.')
    } finally {
      setUploading(false)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) upload(file)
    e.target.value = ''
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) upload(file)
  }

  const handleDelete = async (attachment) => {
    if (!window.confirm(`Delete "${attachment.original_name}"?`)) return
    const prev = attachments
    setAttachments((a) => a.filter((att) => att.id !== attachment.id))
    try {
      await tasksApi.deleteAttachment(taskId, attachment.id)
    } catch {
      setAttachments(prev)
      toast.error('Failed to delete attachment.')
    }
  }

  return (
    <div className="px-6 py-4">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors mb-4 ${
          dragOver
            ? 'border-brand-400 bg-brand-50'
            : 'border-gray-200 hover:border-brand-300 hover:bg-gray-50'
        }`}
      >
        <CloudArrowUpIcon className="w-8 h-8 text-gray-300 mx-auto mb-2" />
        <p className="text-sm text-gray-500">
          {uploading ? 'Uploading...' : 'Drag & drop or click to upload'}
        </p>
        <p className="text-xs text-gray-400 mt-1">Max 20 MB</p>
        <input ref={inputRef} type="file" className="hidden" onChange={handleFileChange} />
      </div>

      {/* Attachment list */}
      {attachments.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">No attachments yet.</p>
      ) : (
        <ul className="space-y-2">
          {attachments.map((att) => (
            <li key={att.id} className="flex items-center gap-3 p-2.5 rounded-lg border border-gray-100 hover:bg-gray-50 group transition-colors">
              {IMAGE_TYPES.includes(att.mime_type) ? (
                <img src={att.url} alt={att.original_name} className="w-10 h-10 rounded object-cover shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center shrink-0">
                  <PaperClipIcon className="w-5 h-5 text-gray-400" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700 truncate">{att.original_name}</p>
                <p className="text-xs text-gray-400">
                  {att.formatted_size} · {att.user?.name} · {format(new Date(att.created_at), 'MMM d')}
                </p>
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <a
                  href={att.url}
                  download={att.original_name}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1 rounded text-gray-400 hover:text-brand-500 transition-colors"
                >
                  <ArrowDownTrayIcon className="w-4 h-4" />
                </a>
                {att.user?.id === user?.id && (
                  <button
                    onClick={() => handleDelete(att)}
                    className="p-1 rounded text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
