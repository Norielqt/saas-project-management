import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { projectsApi } from '../api/projects'
import { organizationsApi } from '../api/organizations'
import toast from 'react-hot-toast'
import Spinner from '../components/ui/Spinner'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import Input from '../components/ui/Input'
import { PlusIcon, TrashIcon, FolderOpenIcon } from '@heroicons/react/24/outline'
import { format } from 'date-fns'

const PROJECT_COLORS = [
  '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B',
  '#10B981', '#EF4444', '#06B6D4', '#84CC16',
]

export default function ProjectsPage() {
  const { orgId } = useParams()
  const [org, setOrg] = useState(null)
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)

  const load = async () => {
    try {
      const [orgRes, projRes] = await Promise.all([
        organizationsApi.get(orgId),
        projectsApi.list(orgId),
      ])
      setOrg(orgRes.data)
      setProjects(projRes.data.data || projRes.data)
    } catch (err) {
      toast.error('Failed to load projects.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [orgId])

  const handleDelete = async (project) => {
    if (!window.confirm(`Delete project "${project.name}"? All tasks will be removed.`)) return
    try {
      await projectsApi.delete(orgId, project.id)
      toast.success('Project deleted.')
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete.')
    }
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm text-gray-400">
        <Link to="/organizations" className="hover:text-gray-600 transition-colors">Organizations</Link>
        <span>/</span>
        <span className="font-medium" style={{ color: '#003148' }}>{org?.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#003148' }}>Projects</h1>
          <p className="text-gray-400 text-sm mt-0.5">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]"
          style={{ backgroundColor: '#003148' }}
        >
          <PlusIcon className="w-4 h-4" />
          New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,49,72,0.07)' }}>
            <FolderOpenIcon className="w-8 h-8" style={{ color: '#003148' }} />
          </div>
          <h3 className="font-semibold text-gray-800 mb-1">No projects yet</h3>
          <p className="text-gray-400 text-sm mb-5">Create your first project to get started</p>
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white"
            style={{ backgroundColor: '#003148' }}
          >
            <PlusIcon className="w-4 h-4" />
            Create Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              orgId={orgId}
              onDelete={() => handleDelete(project)}
            />
          ))}
        </div>
      )}

      <CreateProjectModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        orgId={orgId}
        onCreated={load}
      />
    </div>
  )
}

function ProjectCard({ project, orgId, onDelete }) {
  return (
    <div className="animate-fade-in-up bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 group overflow-hidden flex flex-col">
      {/* Color bar */}
      <div className="h-1" style={{ backgroundColor: project.color || '#003148' }} />

      <div className="p-5 flex flex-col flex-1 gap-3">
        {/* Title row */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: project.color || '#003148' }}
            />
            <h3 className="font-semibold text-gray-900 leading-snug">{project.name}</h3>
          </div>
          <button
            onClick={onDelete}
            className="p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all text-gray-300"
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.08)'; e.currentTarget.style.color = '#ef4444' }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.color = '' }}
          >
            <TrashIcon className="w-3.5 h-3.5" />
          </button>
        </div>

        {project.description && (
          <p className="text-sm text-gray-400 line-clamp-2">{project.description}</p>
        )}

        {/* Members */}
        {project.members?.length > 0 && (
          <div className="flex -space-x-1.5">
            {project.members.slice(0, 5).map((m) => (
              <img
                key={m.id}
                src={m.avatar_url}
                alt={m.name}
                title={m.name}
                className="w-6 h-6 rounded-full border-2 border-white object-cover"
              />
            ))}
            {project.members.length > 5 && (
              <div className="w-6 h-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs text-gray-500 font-medium">
                +{project.members.length - 5}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-50 mt-auto">
          <div className="flex items-center gap-2">
            <Badge variant={project.status === 'active' ? 'green' : 'gray'}>
              {project.status}
            </Badge>
            <span className="text-xs text-gray-400">{project.tasks_count || 0} tasks</span>
          </div>
          <Link
            to={`/organizations/${orgId}/projects/${project.id}/board`}
            className="text-sm font-semibold hover:underline transition-colors"
            style={{ color: '#003148' }}
          >
            Open board →
          </Link>
        </div>
      </div>
    </div>
  )
}

function CreateProjectModal({ open, onClose, orgId, onCreated }) {
  const [form, setForm] = useState({ name: '', description: '', color: '#3B82F6' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await projectsApi.create(orgId, form)
      toast.success('Project created!')
      onCreated()
      onClose()
      setForm({ name: '', description: '', color: '#3B82F6' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create project.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Create Project">
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <Input
          label="Project name"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="e.g. Website Redesign"
          required
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="What is this project about?"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent resize-none transition-colors hover:border-gray-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
          <div className="flex gap-2 flex-wrap">
            {PROJECT_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setForm((f) => ({ ...f, color }))}
                className="w-7 h-7 rounded-full transition-transform hover:scale-110"
                style={{
                  backgroundColor: color,
                  outline: form.color === color ? `3px solid ${color}` : 'none',
                  outlineOffset: '2px',
                }}
              />
            ))}
          </div>
        </div>
        <div className="flex gap-2 justify-end pt-1">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-100 transition-colors">Cancel</button>
          <button type="submit" disabled={loading} className="px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-60 transition-all hover:opacity-90" style={{ backgroundColor: '#003148' }}>
            {loading ? 'Creating…' : 'Create Project'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
