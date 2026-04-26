import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, TrendingUp, Shield, Zap, BookOpen } from 'lucide-react'
import SearchBar from '../../components/SearchBar/SearchBar'
import PaperCard from '../../components/PaperCard/PaperCard'
import { papers, departments, stats } from '../../data/dummyData'

const featuredPapers = papers.filter(p => p.featured).slice(0, 6)

const features = [
  { icon: <Zap size={20} />, title: 'Instant Access', desc: 'Download papers immediately — no paywall, no sign-up required for browsing.' },
  { icon: <Shield size={20} />, title: 'Verified Content', desc: 'All papers are reviewed and verified by faculty or trusted student contributors.' },
  { icon: <TrendingUp size={20} />, title: 'Always Updated', desc: 'New papers added every semester, keeping the collection fresh and relevant.' },
  { icon: <BookOpen size={20} />, title: 'Organized by Subject', desc: 'Find papers by department, semester, subject, or year in seconds.' },
]

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/papers?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <div>
      {/* ── Hero ────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Background effects */}
        <div className="absolute inset-0 bg-hero-gradient pointer-events-none" />
        <div className="absolute inset-0 bg-noise pointer-events-none opacity-50" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />

        {/* Floating decorative orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-blue-600/5 blur-3xl animate-float pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-amber-500/8 blur-3xl animate-float pointer-events-none" style={{ animationDelay: '3s' }} />

        <div className="page-container relative z-10 text-center py-20">
          {/* Label */}
          <div className="section-label justify-center mb-6 animate-fade-up">
            <span className="w-4 h-px bg-amber-400" />
            Trusted by 12,000+ students
            <span className="w-4 h-px bg-amber-400" />
          </div>

          {/* Headline */}
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] mb-6 animate-fade-up animate-delay-100 text-balance">
            Every Exam Paper,{' '}
            <span className="shimmer-text">One Place.</span>
          </h1>

          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 animate-fade-up animate-delay-200 text-balance leading-relaxed">
            Access thousands of previous year question papers across all departments, semesters, and subjects. 
            Study smarter, score better.
          </p>

          {/* Search */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8 animate-fade-up animate-delay-300">
            <div className="relative flex gap-2">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                onClear={() => setSearchQuery('')}
                placeholder="Search by subject, department, or paper name…"
                size="lg"
                className="flex-1"
              />
              <button type="submit" className="btn-primary px-6 shrink-0">
                Search
              </button>
            </div>
          </form>

          {/* Quick links */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-12 animate-fade-up animate-delay-400">
            <span className="text-slate-600 text-sm">Popular:</span>
            {['Data Structures', 'DBMS', 'OS', 'Machine Learning', 'Thermodynamics'].map(t => (
              <button
                key={t}
                onClick={() => navigate(`/papers?q=${encodeURIComponent(t)}`)}
                className="text-xs px-3 py-1.5 rounded-full bg-white/5 hover:bg-amber-500/15 text-slate-400 hover:text-amber-400 border border-white/10 hover:border-amber-500/30 transition-all duration-200"
              >
                {t}
              </button>
            ))}
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto animate-fade-up animate-delay-500">
            {stats.map(({ label, value, icon }) => (
              <div key={label} className="card px-4 py-4 text-center">
                <div className="text-2xl mb-1">{icon}</div>
                <div className="font-display font-bold text-xl text-amber-400">{value}</div>
                <div className="text-slate-500 text-xs mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-slate-600 animate-bounce">
          <span className="text-xs font-mono">scroll</span>
          <div className="w-px h-6 bg-gradient-to-b from-slate-600 to-transparent" />
        </div>
      </section>

      {/* ── Departments ─────────────────────────────────────────── */}
      <section className="py-20 border-t border-white/[0.04]">
        <div className="page-container">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="section-label">Browse by Department</p>
              <h2 className="section-title">Find Your Stream</h2>
            </div>
            <Link to="/subjects" className="btn-ghost text-sm hidden sm:flex">
              All subjects <ArrowRight size={15} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {departments.map((dept, i) => (
              <Link
                key={dept.id}
                to={`/papers?dept=${dept.id}`}
                className="card p-4 flex flex-col gap-2 group"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="text-2xl">{dept.icon}</div>
                <div>
                  <p className="font-semibold text-white text-sm group-hover:text-amber-100 transition-colors leading-tight">
                    {dept.name}
                  </p>
                  <p className="text-slate-600 text-xs font-mono mt-0.5">{dept.paperCount} papers</p>
                </div>
                <span className="text-xs font-mono text-slate-700 mt-auto">{dept.code}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Papers ──────────────────────────────────────── */}
      <section className="py-20 border-t border-white/[0.04]">
        <div className="page-container">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="section-label">
                <TrendingUp size={14} />
                Most Downloaded
              </p>
              <h2 className="section-title">Featured Papers</h2>
            </div>
            <Link to="/papers" className="btn-ghost text-sm hidden sm:flex">
              View all <ArrowRight size={15} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredPapers.map(paper => (
              <PaperCard key={paper.id} paper={paper} featured />
            ))}
          </div>

          <div className="text-center mt-8">
            <Link to="/papers" className="btn-secondary">
              Browse all papers <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────── */}
      <section className="py-20 border-t border-white/[0.04]">
        <div className="page-container">
          <div className="text-center mb-12">
            <p className="section-label justify-center">Why PYPVault</p>
            <h2 className="section-title">Built for student success</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map(({ icon, title, desc }) => (
              <div key={title} className="card p-6">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 mb-4">
                  {icon}
                </div>
                <h3 className="font-semibold text-white mb-2">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="page-container">
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-navy-700 to-navy-900 border border-white/[0.08] p-10 md:p-16 text-center">
            <div className="absolute inset-0 bg-amber-glow pointer-events-none" />
            <div className="relative z-10">
              <p className="section-label justify-center mb-4">Get involved</p>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
                Have papers to share?
              </h2>
              <p className="text-slate-400 max-w-lg mx-auto mb-8">
                Help your fellow students by uploading previous year papers. Together we build the most comprehensive question paper archive.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link to="/upload" className="btn-primary">
                  Upload a Paper <ArrowRight size={16} />
                </Link>
                <Link to="/signup" className="btn-secondary">
                  Create Free Account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
