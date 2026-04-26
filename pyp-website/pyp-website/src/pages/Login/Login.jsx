import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, LogIn, BookOpen, AlertCircle, ArrowLeft, Key, CheckCircle } from 'lucide-react'

// API base URL - adjust based on your backend server
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// View modes: 'login', 'forgot', 'verifyOtp', 'resetPassword'
export default function Login() {
  const navigate = useNavigate()
  const [view, setView] = useState('login')
  const [form, setForm]     = useState({ email: '', password: '', otp: '', resetToken: '', newPassword: '', confirmNewPassword: '' })
  const [show, setShow]     = useState(false)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }))
    setErrors(e => ({ ...e, [k]: '' }))
    setApiError('')
    setSuccessMsg('')
  }

  const validateLogin = () => {
    const e = {}
    if (!form.email.trim())        e.email    = 'Email is required.'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email.'
    if (!form.password)            e.password = 'Password is required.'
    return e
  }

  const handleLogin = async (ev) => {
    ev.preventDefault()
    const e = validateLogin()
    if (Object.keys(e).length) { setErrors(e); return }
    
    setLoading(true)
    setApiError('')
    
    try {
      const response = await fetch(`${API_URL}/user/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Login failed')
      }

      // Store token and user data in localStorage
      if (data.token) {
        localStorage.setItem('token', data.token)
      }
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user))
      }

      // Navigate to home page
      navigate('/')
    } catch (err) {
      setApiError(err.message || 'An error occurred during login')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async (ev) => {
    ev.preventDefault()
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) {
      setErrors({ email: 'Please enter a valid email address' })
      return
    }
    
    setLoading(true)
    setApiError('')
    setSuccessMsg('')
    
    try {
      const response = await fetch(`${API_URL}/user/forgotpassword`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: form.email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send OTP')
      }

      setSuccessMsg('OTP sent to your email!')
      setTimeout(() => setView('verifyOtp'), 1500)
    } catch (err) {
      setApiError(err.message || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (ev) => {
    ev.preventDefault()
    if (!form.otp || form.otp.length !== 6) {
      setErrors({ otp: 'Please enter a valid 6-digit OTP' })
      return
    }
    
    setLoading(true)
    setApiError('')
    setSuccessMsg('')
    
    try {
      const response = await fetch(`${API_URL}/user/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: form.email, otp: form.otp }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Invalid OTP')
      }

      // Store the reset token for the next step
      setForm(f => ({ ...f, resetToken: data.resetToken }))
      setSuccessMsg('OTP verified! Set your new password.')
      setTimeout(() => setView('resetPassword'), 1500)
    } catch (err) {
      setApiError(err.message || 'Invalid or expired OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (ev) => {
    ev.preventDefault()
    const e = {}
    if (!form.newPassword || form.newPassword.length < 8) e.newPassword = 'Password must be at least 8 characters'
    if (form.newPassword !== form.confirmNewPassword) e.confirmNewPassword = 'Passwords do not match'
    if (Object.keys(e).length) { setErrors(e); return }
    
    setLoading(true)
    setApiError('')
    setSuccessMsg('')
    
    try {
      const response = await fetch(`${API_URL}/user/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: form.resetToken, password: form.newPassword }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to reset password')
      }

      setSuccessMsg('Password reset successful!')
      setTimeout(() => {
        setView('login')
        setForm({ email: '', password: '', otp: '', resetToken: '', newPassword: '', confirmNewPassword: '' })
      }, 2000)
    } catch (err) {
      setApiError(err.message || 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  const renderBackButton = () => (
    <button
      type="button"
      onClick={() => { setView('login'); setApiError(''); setSuccessMsg(''); }}
      className="flex items-center gap-1 text-sm text-slate-400 hover:text-amber-400 transition-colors mb-4"
    >
      <ArrowLeft size={14} /> Back to login
    </button>
  )

  return (
    <div className="min-h-screen flex items-center justify-center pt-16 pb-10 px-4">
      {/* Background glow */}
      <div className="absolute inset-0 bg-amber-glow pointer-events-none opacity-50" />

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex w-12 h-12 rounded-xl bg-amber-500 items-center justify-center mb-4 shadow-amber">
            <BookOpen size={22} className="text-navy-950" />
          </div>
          {view === 'login' && (
            <>
              <h1 className="font-display font-bold text-2xl text-white">Welcome back</h1>
              <p className="text-slate-500 text-sm mt-1">Sign in to your PYPVault account</p>
            </>
          )}
          {view === 'forgot' && (
            <>
              <h1 className="font-display font-bold text-2xl text-white">Forgot Password</h1>
              <p className="text-slate-500 text-sm mt-1">Enter your email to receive OTP</p>
            </>
          )}
          {view === 'verifyOtp' && (
            <>
              <h1 className="font-display font-bold text-2xl text-white">Verify OTP</h1>
              <p className="text-slate-500 text-sm mt-1">Enter the 6-digit OTP sent to your email</p>
            </>
          )}
          {view === 'resetPassword' && (
            <>
              <h1 className="font-display font-bold text-2xl text-white">Set New Password</h1>
              <p className="text-slate-500 text-sm mt-1">Create a strong password</p>
            </>
          )}
        </div>

        <div className="card p-7">
          {(apiError || successMsg) && (
            <div className={`flex items-start gap-2.5 rounded-lg p-3 mb-5 text-sm ${
              apiError ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
            }`}>
              {apiError ? <AlertCircle size={16} className="shrink-0 mt-0.5" /> : <CheckCircle size={16} className="shrink-0 mt-0.5" />}
              {apiError || successMsg}
            </div>
          )}

          {/* LOGIN VIEW */}
          {view === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4" noValidate>
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
                    className={`input-field pl-10 text-sm ${errors.email ? 'border-red-500/50 focus:border-red-500/60' : ''}`}
                    autoComplete="email"
                  />
                </div>
                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-medium text-slate-300">Password</label>
                  <button
                    type="button"
                    onClick={() => { setView('forgot'); setApiError(''); setSuccessMsg(''); }}
                    className="text-xs text-slate-500 hover:text-amber-400 transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type={show ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => set('password', e.target.value)}
                    placeholder="••••••••"
                    className={`input-field pl-10 pr-10 text-sm ${errors.password ? 'border-red-500/50 focus:border-red-500/60' : ''}`}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShow(v => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {show ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center py-3 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-navy-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <><LogIn size={16} /> Sign In</>
                )}
              </button>
            </form>
          )}

          {/* FORGOT PASSWORD VIEW */}
          {view === 'forgot' && (
            <>
              {renderBackButton()}
              <form onSubmit={handleForgotPassword} className="space-y-4" noValidate>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="email"
                      value={form.email}
                      onChange={e => set('email', e.target.value)}
                      placeholder="you@example.com"
                      className={`input-field pl-10 text-sm ${errors.email ? 'border-red-500/50 focus:border-red-500/60' : ''}`}
                      autoComplete="email"
                    />
                  </div>
                  {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full justify-center py-3 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-navy-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <><Key size={16} /> Send OTP</>
                  )}
                </button>
              </form>
            </>
          )}

          {/* VERIFY OTP VIEW */}
          {view === 'verifyOtp' && (
            <>
              {renderBackButton()}
              <form onSubmit={handleVerifyOtp} className="space-y-4" noValidate>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Enter 6-digit OTP</label>
                  <div className="relative">
                    <Key size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={form.otp}
                      onChange={e => set('otp', e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000000"
                      className={`input-field pl-10 text-sm text-center tracking-widest ${errors.otp ? 'border-red-500/50' : ''}`}
                    />
                  </div>
                  {errors.otp && <p className="text-red-400 text-xs mt-1">{errors.otp}</p>}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full justify-center py-3 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-navy-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>Verify OTP</>
                  )}
                </button>
              </form>
            </>
          )}

          {/* RESET PASSWORD VIEW */}
          {view === 'resetPassword' && (
            <>
              {renderBackButton()}
              <form onSubmit={handleResetPassword} className="space-y-4" noValidate>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">New Password</label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type={show ? 'text' : 'password'}
                      value={form.newPassword}
                      onChange={e => set('newPassword', e.target.value)}
                      placeholder="Create a new password"
                      className={`input-field pl-10 pr-10 text-sm ${errors.newPassword ? 'border-red-500/50' : ''}`}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShow(v => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {show ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {errors.newPassword && <p className="text-red-400 text-xs mt-1">{errors.newPassword}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Confirm New Password</label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type={show ? 'text' : 'password'}
                      value={form.confirmNewPassword}
                      onChange={e => set('confirmNewPassword', e.target.value)}
                      placeholder="Confirm your new password"
                      className={`input-field pl-10 text-sm ${errors.confirmNewPassword ? 'border-red-500/50' : ''}`}
                      autoComplete="new-password"
                    />
                  </div>
                  {errors.confirmNewPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmNewPassword}</p>}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full justify-center py-3 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-navy-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>Reset Password</>
                  )}
                </button>
              </form>
            </>
          )}

          {/* Social buttons - only show on login view */}
          {view === 'login' && (
            <>
              <div className="relative my-5">
                <div className="divider" />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-navy-800 px-3 text-slate-600 text-xs">
                  or continue with
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {['Google', 'GitHub'].map(provider => (
                  <button
                    key={provider}
                    type="button"
                    className="btn-secondary py-2.5 text-sm justify-center"
                  >
                    {provider}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {view === 'login' && (
          <p className="text-center text-slate-500 text-sm mt-5">
            Don't have an account?{' '}
            <Link to="/signup" className="text-amber-400 hover:text-amber-300 font-medium transition-colors">
              Sign up free
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}
