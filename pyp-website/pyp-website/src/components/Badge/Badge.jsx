export default function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default: 'bg-white/10 text-slate-300',
    amber:   'bg-amber-500/15 text-amber-400 border border-amber-500/20',
    blue:    'bg-blue-500/15 text-blue-400 border border-blue-500/20',
    green:   'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20',
    purple:  'bg-purple-500/15 text-purple-400 border border-purple-500/20',
    red:     'bg-red-500/15 text-red-400 border border-red-500/20',
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}
