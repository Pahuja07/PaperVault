import { Link } from 'react-router-dom'
import { BookOpen, Github, Twitter, Mail } from 'lucide-react'

const footerLinks = {
  Resources: [
    { label: 'All Papers', to: '/papers' },
    { label: 'Subjects', to: '/subjects' },
    { label: 'Upload Paper', to: '/upload' },
  ],
  Account: [
    { label: 'Login', to: '/login' },
    { label: 'Sign Up', to: '/signup' },
  ],
  Legal: [
    { label: 'Privacy Policy', to: '#' },
    { label: 'Terms of Use', to: '#' },
    { label: 'DMCA', to: '#' },
  ],
}

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-navy-900/50 mt-20">
      <div className="page-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 group mb-4">
              <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center">
                <BookOpen size={16} className="text-navy-950" />
              </div>
              <span className="font-display font-bold text-xl text-white">
                PYP<span className="text-amber-400">Vault</span>
              </span>
            </Link>
            <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
              Your go-to repository for college previous year exam papers. Helping students prepare smarter, not harder.
            </p>
            <div className="flex items-center gap-3 mt-5">
              {[
                { Icon: Github, href: '#' },
                { Icon: Twitter, href: '#' },
                { Icon: Mail, href: '#' },
              ].map(({ Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-amber-500/20 flex items-center justify-center text-slate-500 hover:text-amber-400 transition-all duration-200"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h4 className="text-white text-sm font-semibold mb-3">{section}</h4>
              <ul className="space-y-2">
                {links.map(({ label, to }) => (
                  <li key={label}>
                    <Link
                      to={to}
                      className="text-slate-500 hover:text-amber-400 text-sm transition-colors duration-200"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="divider mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-slate-600 text-xs">
            © {new Date().getFullYear()} PYPVault. Made for students, by students.
          </p>
          <p className="text-slate-600 text-xs font-mono">
            v1.0.0 — Open Source
          </p>
        </div>
      </div>
    </footer>
  )
}
