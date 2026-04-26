import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, User, BookOpen, CheckCircle, AlertCircle } from 'lucide-react'

// API base URL - adjust based on your backend server
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const passwordRules = [
  { label: 'At least 8 characters', test: v => v.length >= 8 },
  { label: 'One uppercase letter', test: v => /[A-Z]/.test(v) },
  { label: 'One number', test: v => /\d/.test(v) },
]

export default function Signup() {
  const navigate = useNavigate()
  const [form, setForm]     = useState({ name: '', email: '', password: '', confirm: '' })
  const [show, setShow]     = useState({ password: false, confirm: false })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [done, setDone]     = useState(false)
  const [apiError, setApiError] = useState('')

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }))
    setErrors(e => ({ ...e, [k]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim())        e.name     = 'Name is required.'
    if (!form.email.trim())       e.email    = 'Email is required.'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email.'
    if (!form.password)           e.password = 'Password is required.'
    else if (form.password.length < 8) e.password = 'Password must be at least 8 characters.'
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match.'
    return e
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    
    setLoading(true)
    setApiError('')
    
    try {
      const response = await fetch(`${API_URL}/user/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Signup failed')
      }

      setDone(true)
    } catch (err) {
      setApiError(err.message || 'An error occurred during signup')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16 pb-10 px-4">
        <div className="card p-10 max-w-sm w-full text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={32} className="text-emerald-400" />
          </div>
          <h2 className="font-display font-bold text-white text-2xl mb-3">Account Created!</h2>
          <p className="text-slate-500 text-sm mb-6">
            Welcome to PYPVault, <strong className="text-slate-300">{form.name}</strong>. You can now log in.
          </p>
          <Link to="/login" className="btn-primary w-full justify-center">
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center pt-16 pb-10 px-4">
      <div className="absolute inset-0 bg-amber-glow pointer-events-none opacity-40" />

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex w-12 h-12 rounded-xl bg-amber-500 items-center justify-center mb-4 shadow-amber">
            <BookOpen size={22} className="text-navy-950" />
          </div>
          <h1 className="font-display font-bold text-2xl text-white">Create an account</h1>
          <p className="text-slate-500 text-sm mt-1">Free access to all question papers</p>
        </div>

        <div className="card p-7">
          {apiError && (
            <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-5 text-red-400 text-sm">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name</label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                  placeholder="Your name"
                  className={`input-field pl-10 text-sm ${errors.name ? 'border-red-500/50' : ''}`}
                  autoComplete="name"
                />
              </div>
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                  placeholder="you@example.com"
                  className={`input-field pl-10 text-sm ${errors.email ? 'border-red-500/50' : ''}`}
                  autoComplete="email"
                />
              </div>
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={show.password ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => set('password', e.target.value)}
                  placeholder="Create a password"
                  className={`input-field pl-10 pr-10 text-sm ${errors.password ? 'border-red-500/50' : ''}`}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShow(s => ({ ...s, password: !s.password }))}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {show.password ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}

              {/* Password strength indicators */}
              {form.password && (
                <div className="mt-2 space-y-1">
                  {passwordRules.map(({ label, test }) => (
                    <div key={label} className={`flex items-center gap-1.5 text-xs transition-colors ${test(form.password) ? 'text-emerald-400' : 'text-slate-600'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${test(form.password) ? 'bg-emerald-400' : 'bg-slate-700'}`} />
                      {label}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={show.confirm ? 'text' : 'password'}
                  value={form.confirm}
                  onChange={e => set('confirm', e.target.value)}
                  placeholder="Repeat your password"
                  className={`input-field pl-10 pr-10 text-sm ${errors.confirm ? 'border-red-500/50' : ''}`}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShow(s => ({ ...s, confirm: !s.confirm }))}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {show.confirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.confirm && <p className="text-red-400 text-xs mt-1">{errors.confirm}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-navy-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <p className="text-center text-slate-600 text-xs mt-4">
            By signing up you agree to our{' '}
            <a href="#" className="text-slate-500 hover:text-amber-400 transition-colors">Terms</a>{' '}
            and{' '}
            <a href="#" className="text-slate-500 hover:text-amber-400 transition-colors">Privacy Policy</a>.
          </p>
        </div>

        <p className="text-center text-slate-500 text-sm mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-amber-400 hover:text-amber-300 font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
