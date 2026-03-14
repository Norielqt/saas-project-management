import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
    setErrors((er) => ({ ...er, [e.target.name]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await register(form.name, form.email, form.password, form.password_confirmation)
      toast.success('Account created! Welcome aboard.')
      navigate('/dashboard')
    } catch (err) {
      const data = err.response?.data
      if (data?.errors) {
        setErrors(data.errors)
      } else {
        toast.error(data?.message || 'Registration failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[70%] flex-col justify-between p-12" style={{ backgroundColor: '#003148' }}>
        <div className="animate-fade-in-left flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 bg-white/10 rounded-xl">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <span className="text-white font-semibold text-lg tracking-tight">SaaS PM</span>
        </div>

        <div>
          <h2 className="animate-fade-in-left delay-100 text-4xl font-bold text-white leading-tight mb-4">
            One platform.<br />Infinite projects.
          </h2>
          <p className="animate-fade-in-left delay-200 text-white/60 text-base leading-relaxed">
            Join teams who move faster with clear ownership, structured tasks, and real-time collaboration.
          </p>

          <div className="mt-10 space-y-3">
            {[
              'Organize work across orgs & projects',
              'Drag & drop Kanban boards',
              'Comments, attachments & activity logs',
              'Real-time notifications',
            ].map((item, i) => (
              <div key={item} className={`animate-fade-in-left delay-${[300,400,500,600][i]} flex items-center gap-3`}>
                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-transform duration-300 hover:scale-110" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-white/70 text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="animate-fade-in-left delay-700 text-white/30 text-xs">© {new Date().getFullYear()} SaaS PM. Built for modern teams.</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white">
        <div className="animate-fade-in-right w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg" style={{ backgroundColor: '#003148' }}>
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <span className="font-semibold text-gray-900">SaaS PM</span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-1">Create your account</h1>
          <p className="text-gray-400 text-sm mb-8">Start managing projects with your team</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="animate-fade-in-up delay-100">
              <Input
                label="Full name"
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                error={errors.name?.[0]}
                placeholder="Jane Doe"
                autoComplete="name"
                required
              />
            </div>
            <div className="animate-fade-in-up delay-200">
              <Input
                label="Email address"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                error={errors.email?.[0]}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>
            <div className="animate-fade-in-up delay-300">
              <Input
                label="Password"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                error={errors.password?.[0]}
                placeholder="Min. 8 characters"
                autoComplete="new-password"
                required
              />
            </div>
            <div className="animate-fade-in-up delay-400">
              <Input
                label="Confirm password"
                type="password"
                name="password_confirmation"
                value={form.password_confirmation}
                onChange={handleChange}
                placeholder="Repeat your password"
                autoComplete="new-password"
                required
              />
            </div>
            <div className="animate-fade-in-up delay-500">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-lg text-sm font-semibold text-white
                  transition-all duration-200 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]
                  disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#003148' }}
              >
                {loading ? 'Creating account…' : 'Create account'}
              </button>
            </div>
          </form>

          <p className="animate-fade-in-up delay-600 mt-6 text-center text-sm text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold hover:underline transition-colors" style={{ color: '#003148' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
