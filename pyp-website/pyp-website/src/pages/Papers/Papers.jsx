import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react'
import SearchBar from '../../components/SearchBar/SearchBar'
import PaperCard from '../../components/PaperCard/PaperCard'
import { paperAPI } from '../../services/api'
import { useDebounce } from '../../hooks/useDebounce'

function FilterSelect({ label, value, onChange, options, placeholder = 'All' }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="input-field appearance-none pr-9 text-sm cursor-pointer"
      >
        <option value="">{placeholder} {label}</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
    </div>
  )
}

export default function Papers() {
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [filters, setFilters] = useState({
    dept: searchParams.get('dept') || '',
    year: '',
    semester: '',
    examtype: '',
    difficulty: '',
  })
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState('downloads')
  const [papers, setPapers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const debouncedQuery = useDebounce(query)

  const filterOptions = paperAPI.getFilters()

  // Fetch papers from backend
  useEffect(() => {
    const fetchPapers = async () => {
      setLoading(true)
      setError('')
      try {
        const queryParams = new URLSearchParams()
        if (debouncedQuery) queryParams.append('title', debouncedQuery)
        if (filters.dept) queryParams.append('departmentid', filters.dept)
        if (filters.year) queryParams.append('year', filters.year)
        if (filters.semester) queryParams.append('semester', filters.semester)
        if (filters.examtype) queryParams.append('examtype', filters.examtype)
        if (filters.difficulty) queryParams.append('difficulty', filters.difficulty)

        const url = queryParams.toString()
          ? `/papers/all?${queryParams.toString()}`
          : '/papers/all'

        const response = await fetch(`${import.meta.env.VITE_API_URL}${url}`)
        if (!response.ok) throw new Error('Failed to fetch papers')
        const data = await response.json()
        setPapers(data.papers || [])
      } catch (err) {
        setError(err.message || 'Failed to load papers')
        console.error('Fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchPapers()
  }, [debouncedQuery, filters])

  useEffect(() => {
    const q = searchParams.get('q') || ''
    const dept = searchParams.get('dept') || ''
    setQuery(q)
    setFilters(f => ({ ...f, dept }))
  }, [searchParams])

  const setFilter = (key, val) => setFilters(f => ({ ...f, [key]: val }))

  const activeFilterCount = Object.values(filters).filter(Boolean).length

  const filtered = useMemo(() => {
    let result = [...papers]

    return result.sort((a, b) => {
      if (sortBy === 'downloads') return (b.downloads || 0) - (a.downloads || 0)
      if (sortBy === 'year') return (b.year || 0) - (a.year || 0)
      if (sortBy === 'title') return (a.title || '').localeCompare(b.title || '')
      return 0
    })
  }, [papers, sortBy])

  const clearAll = () => {
    setQuery('')
    setFilters({ dept: '', year: '', semester: '', examtype: '', difficulty: '' })
  }

  return (
    <div className="pt-24 pb-20">
      <div className="page-container">
        {/* Header */}
        <div className="mb-8">
          <p className="section-label">Question Bank</p>
          <h1 className="section-title mb-2">Previous Year Papers</h1>
          <p className="text-slate-500 text-sm">
            Browse and download exam papers from all departments and semesters.
          </p>
        </div>

        {/* Search + Filter toggle */}
        <div className="flex gap-2 mb-4">
          <SearchBar
            value={query}
            onChange={setQuery}
            onClear={() => setQuery('')}
            placeholder="Search papers…"
            className="flex-1"
          />
          <button
            onClick={() => setShowFilters(v => !v)}
            className={`flex items-center gap-2 px-4 py-3 rounded-lg border text-sm font-medium transition-all duration-200 ${
              showFilters || activeFilterCount > 0
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                : 'bg-transparent border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-300'
            }`}
          >
            <SlidersHorizontal size={15} />
            Filters
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-amber-500 text-navy-950 text-xs font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="card p-5 mb-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            <FilterSelect
              label="Dept"
              value={filters.dept}
              onChange={v => setFilter('dept', v)}
              options={filterOptions.departments.map(d => ({ value: d.value, label: d.label }))}
            />
            <FilterSelect
              label="Year"
              value={filters.year}
              onChange={v => setFilter('year', v)}
              options={filterOptions.years.map(y => ({ value: y.value.toString(), label: y.label }))}
            />
            <FilterSelect
              label="Semester"
              value={filters.semester}
              onChange={v => setFilter('semester', v)}
              options={filterOptions.semesters.map(s => ({ value: s.value, label: s.label }))}
            />
            <FilterSelect
              label="Type"
              value={filters.examtype}
              onChange={v => setFilter('examtype', v)}
              options={filterOptions.examTypes.map(t => ({ value: t.value, label: t.label }))}
            />
            <FilterSelect
              label="Difficulty"
              value={filters.difficulty}
              onChange={v => setFilter('difficulty', v)}
              options={[
                { value: 'easy', label: 'Easy' },
                { value: 'medium', label: 'Medium' },
                { value: 'hard', label: 'Hard' },
              ]}
            />
          </div>
        )}

        {/* Result bar */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <p className="text-slate-500 text-sm">
              <span className="text-white font-medium">{filtered.length}</span> papers found
            </p>
            {(query || activeFilterCount > 0) && (
              <button
                onClick={clearAll}
                className="flex items-center gap-1 text-xs text-slate-600 hover:text-amber-400 transition-colors"
              >
                <X size={12} /> Clear all
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-600 text-xs">Sort:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="bg-transparent text-slate-400 text-xs border border-white/10 rounded-lg px-2 py-1.5 cursor-pointer outline-none focus:border-amber-500/40"
            >
              <option value="downloads">Most Downloaded</option>
              <option value="year">Newest First</option>
              <option value="title">A–Z</option>
            </select>
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-400">Loading papers...</p>
            </div>
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 text-center">
            <p className="text-red-400 text-sm">Failed to load papers: {error}</p>
            <button onClick={clearAll} className="btn-secondary mt-4">
              Try again
            </button>
          </div>
        )}

        {/* Grid */}
        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(paper => (
              <PaperCard 
                key={paper.paperid || paper.id} 
                paper={paper} 
                onDelete={(deletedId) => setPapers(prev => prev.filter(p => (p.paperid || p.id) !== deletedId))}
              />
            ))}
          </div>
        )}

        {/* No results state */}
        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">📭</div>
            <h3 className="font-display font-semibold text-white text-xl mb-2">No papers found</h3>
            <p className="text-slate-500 text-sm mb-6">Try different keywords or remove some filters.</p>
            <button onClick={clearAll} className="btn-secondary">
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
