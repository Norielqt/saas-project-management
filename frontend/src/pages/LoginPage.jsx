import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
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
      await login(form.email, form.password)
      toast.success('Welcome back!')
      navigate('/dashboard')
    } catch (err) {
      const data = err.response?.data
      if (data?.errors) {
        setErrors(data.errors)
      } else {
        toast.error(data?.message || 'Login failed. Please try again.')
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <span className="text-white font-semibold text-lg tracking-tight">SaaS PM</span>
        </div>

        <div>
          <h2 className="animate-fade-in-left delay-100 text-4xl font-bold text-white leading-tight mb-4">
            Manage projects.<br />Ship faster.<br />Together.
          </h2>
          <p className="animate-fade-in-left delay-200 text-white/60 text-base leading-relaxed">
            A unified workspace for your team — tasks, timelines, and collaboration in one place.
          </p>

          <div className="mt-10 grid grid-cols-2 gap-4">
            {[['Projects', 'Track every milestone'], ['Teams', 'Collaborate in real-time'], ['Boards', 'Drag & drop tasks'], ['Activity', 'Full audit logs']].map(([title, desc], i) => (
              <div
                key={title}
                className={`animate-fade-in-up delay-${[300,400,500,600][i]} rounded-xl p-4 transition-transform duration-300 hover:-translate-y-1 hover:scale-[1.02]`}
                style={{ backgroundColor: 'rgba(255,255,255,0.07)' }}
              >
                <p className="text-white font-semibold text-sm">{title}</p>
                <p className="text-white/50 text-xs mt-0.5">{desc}</p>
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
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg" style={{ backgroundColor: '#003148' }}>
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <span className="font-semibold text-gray-900">SaaS PM</span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h1>
          <p className="text-gray-400 text-sm mb-8">Sign in to continue to your workspace</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="animate-fade-in-up delay-100">
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
            <div className="animate-fade-in-up delay-200">
              <Input
                label="Password"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                error={errors.password?.[0]}
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </div>
            <div className="animate-fade-in-up delay-300">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-lg text-sm font-semibold text-white
                  transition-all duration-200 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]
                  disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#003148' }}
              >
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
            </div>
          </form>

          <p className="animate-fade-in-up delay-400 mt-6 text-center text-sm text-gray-400">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold hover:underline transition-colors" style={{ color: '#003148' }}>
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
