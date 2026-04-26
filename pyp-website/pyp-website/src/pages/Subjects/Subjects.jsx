import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import SearchBar from '../../components/SearchBar/SearchBar'
import SubjectCard from '../../components/SubjectCard/SubjectCard'
import { subjects, departments } from '../../data/dummyData'
import { useDebounce } from '../../hooks/useDebounce'

export default function Subjects() {
  const [query, setQuery] = useState('')
  const [selectedDept, setSelectedDept] = useState('')
  const debouncedQuery = useDebounce(query)

  const filtered = useMemo(() => {
    let result = [...subjects]
    if (debouncedQuery) {
      const q = debouncedQuery.toLowerCase()
      result = result.filter(s => s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q))
    }
    if (selectedDept) result = result.filter(s => s.dept === selectedDept)
    return result
  }, [debouncedQuery, selectedDept])

  const grouped = useMemo(() => {
    const map = {}
    filtered.forEach(s => {
      if (!map[s.dept]) map[s.dept] = []
      map[s.dept].push(s)
    })
    return map
  }, [filtered])

  return (
    <div className="pt-24 pb-20">
      <div className="page-container">
        <div className="mb-8">
          <p className="section-label">Subject Directory</p>
          <h1 className="section-title mb-2">All Subjects</h1>
          <p className="text-slate-500 text-sm">Browse subjects by department and find papers directly.</p>
        </div>

        {/* Search + Filter */}
        <div className="flex gap-2 mb-8">
          <SearchBar
            value={query}
            onChange={setQuery}
            onClear={() => setQuery('')}
            placeholder="Search subjects or codes…"
            className="flex-1"
          />
          <div className="relative">
            <select
              value={selectedDept}
              onChange={e => setSelectedDept(e.target.value)}
              className="input-field appearance-none pr-9 text-sm cursor-pointer min-w-[140px]"
            >
              <option value="">All Depts</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.code}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          </div>
        </div>

        {/* Dept tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setSelectedDept('')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 ${
              !selectedDept
                ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-300'
            }`}
          >
            All
          </button>
          {departments.map(d => (
            <button
              key={d.id}
              onClick={() => setSelectedDept(d.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 ${
                selectedDept === d.id
                  ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-300'
              }`}
            >
              {d.icon} {d.code}
            </button>
          ))}
        </div>

        {/* Grouped subjects */}
        {Object.keys(grouped).length > 0 ? (
          <div className="space-y-10">
            {Object.entries(grouped).map(([deptId, deptSubjects]) => {
              const dept = departments.find(d => d.id === deptId)
              return (
                <div key={deptId}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{dept?.icon}</span>
                      <h2 className="font-display font-semibold text-white text-lg">{dept?.name}</h2>
                      <span className="tag-amber">{deptSubjects.length} subjects</span>
                    </div>
                    <Link
                      to={`/papers?dept=${deptId}`}
                      className="text-xs text-slate-500 hover:text-amber-400 transition-colors"
                    >
                      View all papers →
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {deptSubjects.map(subject => (
                      <SubjectCard key={subject.id} subject={subject} dept={dept} />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="font-display font-semibold text-white text-xl mb-2">No subjects found</h3>
            <p className="text-slate-500 text-sm">Try a different search term.</p>
          </div>
        )}
      </div>
    </div>
  )
}
