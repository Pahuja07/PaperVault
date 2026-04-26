import { Link } from 'react-router-dom'
import { FileText, ChevronRight } from 'lucide-react'

const colorMap = {
  blue:   { bg: 'from-blue-500/20 to-blue-600/5',   icon: 'text-blue-400',   border: 'hover:border-blue-500/30' },
  purple: { bg: 'from-purple-500/20 to-purple-600/5', icon: 'text-purple-400', border: 'hover:border-purple-500/30' },
  amber:  { bg: 'from-amber-500/20 to-amber-600/5',  icon: 'text-amber-400',  border: 'hover:border-amber-500/30' },
  green:  { bg: 'from-emerald-500/20 to-emerald-600/5', icon: 'text-emerald-400', border: 'hover:border-emerald-500/30' },
}

export default function SubjectCard({ subject, dept }) {
  const color = colorMap[dept?.color] || colorMap.blue

  return (
    <Link
      to={`/papers?subject=${subject.id}`}
      className={`card ${color.border} p-5 flex items-start gap-4 group cursor-pointer`}
    >
      {/* Icon area */}
      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${color.bg} flex items-center justify-center shrink-0`}>
        <FileText size={18} className={color.icon} />
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-white text-sm leading-snug group-hover:text-amber-100 transition-colors mb-0.5 truncate">
          {subject.name}
        </h3>
        <p className="text-xs text-slate-500 font-mono">{subject.code} · Sem {subject.semester}</p>
        <p className="text-xs text-slate-600 mt-1">{subject.paperCount} papers</p>
      </div>

      <ChevronRight
        size={16}
        className="text-slate-600 group-hover:text-amber-400 group-hover:translate-x-1 transition-all duration-200 shrink-0 mt-1"
      />
    </Link>
  )
}
