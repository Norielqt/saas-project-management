import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { organizationsApi } from '../api/organizations'
import toast from 'react-hot-toast'
import Spinner from '../components/ui/Spinner'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import Input from '../components/ui/Input'
import { PlusIcon, TrashIcon, UserPlusIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../context/AuthContext'

export default function OrganizationsPage() {
  const { user } = useAuth()
  const [organizations, setOrganizations] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [showInvite, setShowInvite] = useState(null) // org id
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteLoading, setInviteLoading] = useState(false)

  const load = () => {
    setLoading(true)
    organizationsApi.list()
      .then(({ data }) => setOrganizations(data.data || data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const handleDelete = async (org) => {
    if (!window.confirm(`Delete "${org.name}"? This will remove all projects and tasks.`)) return
    try {
      await organizationsApi.delete(org.id)
      toast.success('Organization deleted.')
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete.')
    }
  }

  const handleInvite = async (e) => {
    e.preventDefault()
    setInviteLoading(true)
    try {
      await organizationsApi.addMember(showInvite, { email: inviteEmail })
      toast.success('Member invited successfully.')
      setShowInvite(null)
      setInviteEmail('')
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to invite member.')
    } finally {
      setInviteLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#003148' }}>Organizations</h1>
          <p className="text-gray-400 text-sm mt-0.5">Manage your teams and workspaces</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]"
          style={{ backgroundColor: '#003148' }}
        >
          <PlusIcon className="w-4 h-4" />
          New Organization
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : organizations.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,49,72,0.07)' }}>
            <svg className="w-8 h-8" style={{ color: '#003148' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-800 mb-1">No organizations yet</h3>
          <p className="text-gray-400 text-sm mb-5">Create one to start organizing your projects</p>
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white"
            style={{ backgroundColor: '#003148' }}
          >
            <PlusIcon className="w-4 h-4" />
            Create Organization
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {organizations.map((org) => (
            <div
              key={org.id}
              className="animate-fade-in-up bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 p-5 flex flex-col gap-4"
            >
              {/* Card header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                    style={{ backgroundColor: '#003148' }}
                  >
                    {org.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{org.name}</h3>
                    <Badge variant={org.my_role === 'owner' ? 'blue' : org.my_role === 'admin' ? 'yellow' : 'gray'}>
                      {org.my_role}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-1">
                  {(org.my_role === 'owner' || org.my_role === 'admin') && (
                    <button
                      onClick={() => { setShowInvite(org.id); setInviteEmail('') }}
                      className="p-1.5 rounded-lg text-gray-300 hover:text-white transition-colors"
                      style={{ '--hover-bg': '#003148' }}
                      onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(0,49,72,0.1)'; e.currentTarget.style.color = '#003148' }}
                      onMouseLeave={e => { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.color = '' }}
                      title="Invite member"
                    >
                      <UserPlusIcon className="w-4 h-4" />
                    </button>
                  )}
                  {org.my_role === 'owner' && (
                    <button
                      onClick={() => handleDelete(org)}
                      className="p-1.5 rounded-lg text-gray-300 transition-colors"
                      onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.08)'; e.currentTarget.style.color = '#ef4444' }}
                      onMouseLeave={e => { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.color = '' }}
                      title="Delete organization"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {org.description && (
                <p className="text-sm text-gray-400 line-clamp-2 -mt-1">{org.description}</p>
              )}

              {/* Card footer */}
              <div className="flex items-center justify-between pt-1 border-t border-gray-50">
                <div className="flex gap-3 text-xs text-gray-400">
                  <span>{org.projects_count || 0} projects</span>
                  <span>·</span>
                  <span>{org.members?.length || 0} members</span>
                </div>
                <Link
                  to={`/organizations/${org.id}/projects`}
                  className="text-sm font-semibold hover:underline transition-colors"
                  style={{ color: '#003148' }}
                >
                  View projects →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Org Modal */}
      <CreateOrgModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={load}
      />

      {/* Invite Member Modal */}
      <Modal open={!!showInvite} onClose={() => setShowInvite(null)} title="Invite Member">
        <form onSubmit={handleInvite} className="space-y-4 pt-2">
          <Input
            label="Email address"
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="colleague@example.com"
            required
          />
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setShowInvite(null)} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-100 transition-colors">Cancel</button>
            <button type="submit" disabled={inviteLoading} className="px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-60 transition-opacity" style={{ backgroundColor: '#003148' }}>
              {inviteLoading ? 'Inviting…' : 'Send Invite'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

function CreateOrgModal({ open, onClose, onCreated }) {
  const [form, setForm] = useState({ name: '', description: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await organizationsApi.create(form)
      toast.success('Organization created!')
      onCreated()
      onClose()
      setForm({ name: '', description: '' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Create Organization">
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <Input
          label="Organization name"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="Acme Corp"
          required
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="What does this organization do?"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent resize-none transition-colors hover:border-gray-400"
            style={{ '--tw-ring-color': '#003148' }}
          />
        </div>
        <div className="flex gap-2 justify-end">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-100 transition-colors">Cancel</button>
          <button type="submit" disabled={loading} className="px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-60 transition-opacity" style={{ backgroundColor: '#003148' }}>
            {loading ? 'Creating…' : 'Create'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
