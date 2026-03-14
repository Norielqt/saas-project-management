import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { authApi } from '../api/auth'
import toast from 'react-hot-toast'
import Input from '../components/ui/Input'

export default function SettingsPage() {
  const { user, updateUser } = useAuth()
  const [form, setForm] = useState({
    name: user?.name || '',
    job_title: user?.job_title || '',
  })
  const [pwForm, setPwForm] = useState({ password: '', password_confirmation: '' })
  const [loading, setLoading] = useState(false)
  const [pwLoading, setPwLoading] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [avatarFile, setAvatarFile] = useState(null)

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('name', form.name)
      if (form.job_title) fd.append('job_title', form.job_title)
      if (avatarFile) fd.append('avatar', avatarFile)

      const { data } = await authApi.updateProfile(fd)
      updateUser(data)
      toast.success('Profile updated!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile.')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    if (pwForm.password !== pwForm.password_confirmation) {
      toast.error('Passwords do not match.')
      return
    }
    setPwLoading(true)
    try {
      const fd = new FormData()
      fd.append('password', pwForm.password)
      fd.append('password_confirmation', pwForm.password_confirmation)
      await authApi.updateProfile(fd)
      toast.success('Password updated!')
      setPwForm({ password: '', password_confirmation: '' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password.')
    } finally {
      setPwLoading(false)
    }
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">

      {/* Page header */}
      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-bold" style={{ color: '#003148' }}>Account Settings</h1>
        <p className="text-sm text-gray-400 mt-0.5">Manage your profile and password</p>
      </div>

      {/* Profile card */}
      <div className="animate-fade-in-up delay-100 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Card header accent */}
        <div className="h-0.5" style={{ backgroundColor: '#003148' }} />
        <div className="p-6">
          <h2 className="font-semibold text-gray-800 mb-5">Profile Information</h2>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={avatarPreview || user?.avatar_url}
                  alt={user?.name}
                  className="w-16 h-16 rounded-full object-cover"
                  style={{ border: '2px solid rgba(0,49,72,0.15)' }}
                />
              </div>
              <div>
                <label className="cursor-pointer">
                  <span
                    className="text-sm font-semibold hover:underline"
                    style={{ color: '#003148' }}
                  >Change photo</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </label>
                <p className="text-xs text-gray-400 mt-0.5">JPG, PNG, GIF up to 2 MB</p>
              </div>
            </div>

            <Input
              label="Full name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
            <Input
              label="Job title"
              value={form.job_title}
              onChange={(e) => setForm((f) => ({ ...f, job_title: e.target.value }))}
              placeholder="e.g. Software Engineer"
            />

            {/* Email (read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={user?.email}
                disabled
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
              />
              <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-60 transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ backgroundColor: '#003148' }}
              >
                {loading ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Password card */}
      <div className="animate-fade-in-up delay-200 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="h-0.5" style={{ backgroundColor: '#003148' }} />
        <div className="p-6">
          <h2 className="font-semibold text-gray-800 mb-5">Change Password</h2>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <Input
              label="New password"
              type="password"
              value={pwForm.password}
              onChange={(e) => setPwForm((f) => ({ ...f, password: e.target.value }))}
              placeholder="Min. 8 characters"
              required
            />
            <Input
              label="Confirm new password"
              type="password"
              value={pwForm.password_confirmation}
              onChange={(e) => setPwForm((f) => ({ ...f, password_confirmation: e.target.value }))}
              placeholder="Repeat password"
              required
            />
            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={pwLoading}
                className="px-5 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-60 transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ backgroundColor: '#003148' }}
              >
                {pwLoading ? 'Updating…' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
