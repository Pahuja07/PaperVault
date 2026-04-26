import { Download, FileText, Calendar, User, Star, TrendingUp, Trash2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { paperAPI } from '../../services/api'

const difficultyConfig = {
  easy:   { label: 'Easy',   className: 'tag-green' },
  medium: { label: 'Medium', className: 'tag-amber' },
  hard:   { label: 'Hard',   className: 'bg-red-500/15 text-red-400 border border-red-500/20 tag' },
}

const tagConfig = {
  important: { label: 'Important', className: 'tag-amber' },
  solved:    { label: 'Solved',    className: 'tag-green' },
  new:       { label: 'New',       className: 'tag-blue' },
}

const deptColors = {
  cse:  'from-blue-500/20 to-cyan-500/10',
  ece:  'from-purple-500/20 to-violet-500/10',
  me:   'from-orange-500/20 to-amber-500/10',
  ce:   'from-emerald-500/20 to-green-500/10',
  eee:  'from-yellow-500/20 to-amber-500/10',
  it:   'from-sky-500/20 to-blue-500/10',
  bca:  'from-indigo-500/20 to-purple-500/10',
  mba:  'from-teal-500/20 to-emerald-500/10',
}

export default function PaperCard({ paper, featured = false, onDelete }) {
  const diff = difficultyConfig[paper.difficulty] || difficultyConfig.medium
  const [isAdmin, setIsAdmin] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    try {
      const userStr = localStorage.getItem('user')
      if (userStr) {
        const userObj = JSON.parse(userStr)
        if (userObj.role === 'admin') {
          setIsAdmin(true)
        }
      }
    } catch (e) {
      // ignore
    }
  }, [])

  const handleDownload = (e) => {
    e.preventDefault()
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const paperId = paper.paperid || paper.id;
    if (paperId) {
      window.open(`${baseUrl}/papers/${paperId}/download`, '_blank');
    }
  }

  const handleDelete = async (e) => {
    e.preventDefault()
    const paperId = paper.paperid || paper.id;
    if (!paperId) return;

    if (window.confirm('Are you sure you want to delete this paper? This action cannot be undone.')) {
      setIsDeleting(true)
      try {
        await paperAPI.delete(paperId)
        if (onDelete) {
          onDelete(paperId)
        }
      } catch (err) {
        console.error('Failed to delete paper:', err)
        alert('Failed to delete paper: ' + err.message)
        setIsDeleting(false)
      }
    }
  }

  return (
    <article className="card group flex flex-col overflow-hidden">
      {/* Top accent bar */}
      <div className={`h-1 w-full bg-gradient-to-r ${deptColors[paper.dept] || 'from-slate-500/20 to-slate-600/10'}`} />

      <div className="p-5 flex flex-col flex-1">
        {/* Meta row */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={diff.className}>{diff.label}</span>
            {paper.tags.map(t => (
              <span key={t} className={tagConfig[t]?.className || 'tag-blue'}>
                {tagConfig[t]?.label || t}
              </span>
            ))}
          </div>
          {featured && (
            <span className="flex items-center gap-1 text-amber-400 text-xs font-mono shrink-0">
              <Star size={11} fill="currentColor" /> Featured
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-display font-semibold text-white text-base leading-snug mb-1 group-hover:text-amber-100 transition-colors line-clamp-2">
          {paper.title}
        </h3>

        {/* Subject / Dept */}
        <p className="text-slate-500 text-xs mb-4">{paper.deptName} · Semester {paper.semester}</p>

        {/* Info grid */}
        <div className="grid grid-cols-2 gap-2 mb-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <Calendar size={12} className="text-slate-600" />
            {paper.year}
          </span>
          <span className="flex items-center gap-1.5">
            <FileText size={12} className="text-slate-600" />
            {paper.pages}p · {paper.fileSize}
          </span>
          <span className="flex items-center gap-1.5">
            <User size={12} className="text-slate-600" />
            {paper.uploadedBy}
          </span>
          <span className="flex items-center gap-1.5">
            <TrendingUp size={12} className="text-slate-600" />
            {paper.downloads.toLocaleString()} downloads
          </span>
        </div>

        {/* Exam type badge */}
        <div className="mt-auto">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-600 bg-white/[0.04] px-2 py-1 rounded">
              {paper.examType}
            </span>
            <div className="flex items-center gap-2">
              {isAdmin && !featured && (
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className={`flex items-center justify-center p-2 rounded-lg transition-all duration-200 
                    ${isDeleting ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white'}`}
                  title="Delete Paper"
                >
                  <Trash2 size={13} className={isDeleting ? 'animate-pulse' : ''} />
                </button>
              )}
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-navy-950 text-xs font-semibold rounded-lg transition-all duration-200 group/btn"
              >
                <Download size={13} className="group-hover/btn:scale-110 transition-transform" />
                Download
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}
