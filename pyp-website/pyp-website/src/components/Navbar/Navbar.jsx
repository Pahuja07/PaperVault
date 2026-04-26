import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { BookOpen, Menu, X, Upload, LogIn, Brain, LogOut, User as UserIcon } from 'lucide-react'

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/papers', label: 'Papers' },
  { to: '/predictions', label: 'AI Predictions', icon: Brain },
  { to: '/subjects', label: 'Subjects' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { pathname } = useLocation()
  const [user, setUser] = useState(null)

  useEffect(() => {
    const checkUser = () => {
      try {
        const u = localStorage.getItem('user')
        if (u) setUser(JSON.parse(u))
        else setUser(null)
      } catch (e) {
        setUser(null)
      }
    }
    checkUser()
    // Listen for custom login/logout events or local storage changes
    window.addEventListener('storage', checkUser)
    window.addEventListener('user-changed', checkUser)
    return () => {
      window.removeEventListener('storage', checkUser)
      window.removeEventListener('user-changed', checkUser)
    }
  }, [pathname]) // Also recheck on navigation

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    window.dispatchEvent(new Event('user-changed'))
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => setMobileOpen(false), [pathname])

  return (
    <>
      <nav
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-navy-900/90 backdrop-blur-lg border-b border-white/[0.06] shadow-card'
            : 'bg-transparent'
        }`}
      >
        <div className="page-container">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center shadow-amber group-hover:scale-110 transition-transform duration-200">
                <BookOpen size={16} className="text-navy-950" />
              </div>
              <span className="font-display font-bold text-xl text-white">
                PYP<span className="text-amber-400">Vault</span>
              </span>
            </Link>

            {/* Desktop links */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className={`nav-link px-4 py-2 rounded-lg hover:bg-white/5 flex items-center gap-1.5 ${
                    pathname === to ? 'nav-link-active' : ''
                  }`}
                >
                  {Icon && <Icon size={14} className={pathname === to ? 'text-amber-400' : 'text-slate-500'} />}
                  {label}
                  {pathname === to && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-amber-400" />
                  )}
                </Link>
              ))}
            </div>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-3">
              {user?.role === 'admin' && (
                <Link to="/upload" className="btn-ghost text-sm">
                  <Upload size={15} />
                  Upload
                </Link>
              )}
              {user ? (
                <div className="flex items-center gap-3">
                  <span className="text-slate-400 text-sm flex items-center gap-1.5">
                    <UserIcon size={14} /> {user.name}
                  </span>
                  <button onClick={handleLogout} className="btn-ghost text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10">
                    <LogOut size={15} />
                    Logout
                  </button>
                </div>
              ) : (
                <>
                  <Link to="/login" className="btn-ghost text-sm">
                    <LogIn size={15} />
                    Login
                  </Link>
                  <Link to="/signup" className="btn-primary text-sm py-2">
                    Get Started
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              onClick={() => setMobileOpen(v => !v)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ${
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="absolute inset-0 bg-navy-950/80 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
        <div
          className={`absolute top-16 inset-x-0 bg-navy-900 border-b border-white/[0.06] p-4 transition-transform duration-300 ${
            mobileOpen ? 'translate-y-0' : '-translate-y-4'
          }`}
        >
          <div className="flex flex-col gap-1">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  pathname === to
                    ? 'bg-amber-500/10 text-amber-400'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                {Icon && <Icon size={15} />}
                {label}
              </Link>
            ))}
            <div className="divider my-2" />
            {user?.role === 'admin' && (
              <Link to="/upload" className="px-4 py-3 rounded-lg text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white flex items-center gap-2">
                <Upload size={15} /> Upload Paper
              </Link>
            )}
            {user ? (
              <>
                <div className="px-4 py-3 text-sm text-slate-400 flex items-center gap-2">
                  <UserIcon size={15} /> {user.name}
                </div>
                <button onClick={handleLogout} className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:bg-white/5 flex items-center gap-2">
                  <LogOut size={15} /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="px-4 py-3 rounded-lg text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white flex items-center gap-2">
                  <LogIn size={15} /> Login
                </Link>
                <Link to="/signup" className="btn-primary mt-2 justify-center">
                  Get Started Free
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
