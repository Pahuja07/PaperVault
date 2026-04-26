import { Search, X } from 'lucide-react'

export default function SearchBar({
  value = '',
  onChange,
  onClear,
  placeholder = 'Search papers, subjects, departments…',
  className = '',
  size = 'md',
}) {
  const sizeClasses = {
    sm: 'text-sm py-2.5 pl-9 pr-8',
    md: 'text-sm py-3.5 pl-11 pr-10',
    lg: 'text-base py-4 pl-12 pr-12',
  }
  const iconSize = { sm: 14, md: 16, lg: 18 }[size]

  return (
    <div className={`relative ${className}`}>
      <div className="absolute left-0 inset-y-0 flex items-center pl-3.5 pointer-events-none">
        <Search size={iconSize} className="text-slate-500" />
      </div>
      <input
        type="text"
        value={value}
        onChange={e => onChange?.(e.target.value)}
        placeholder={placeholder}
        className={`input-field ${sizeClasses[size]}`}
        spellCheck={false}
      />
      {value && (
        <button
          onClick={onClear}
          className="absolute right-0 inset-y-0 flex items-center pr-3.5 text-slate-500 hover:text-slate-300 transition-colors"
        >
          <X size={iconSize} />
        </button>
      )}
    </div>
  )
}
