import { useState, useRef, useEffect } from 'react'
import { Upload as UploadIcon, FileText, X, CheckCircle, AlertCircle, CloudUpload, ChevronDown } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { paperAPI, aiAPI } from '../../services/api'

const MAX_SIZE_MB = 10
const ACCEPTED = ['application/pdf']

function FieldLabel({ children, required }) {
  return (
    <label className="block text-sm font-medium text-slate-300 mb-1.5">
      {children}
      {required && <span className="text-amber-400 ml-1">*</span>}
    </label>
  )
}

function SelectField({ value, onChange, options, placeholder, required }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        required={required}
        className="input-field appearance-none pr-9 text-sm cursor-pointer w-full"
      >
        <option value="">{placeholder}</option>
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
    </div>
  )
}

export default function Upload() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const [file, setFile] = useState(null)
  const [fileError, setFileError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')
  const [filters, setFilters] = useState(null)
  const [isAdmin, setIsAdmin] = useState(true)

  const [form, setForm] = useState({
    title: '',
    departmentid: '',
    semester: '',
    year: '',
    examtype: '',
    subjectName: '',
    subjectCode: '',
    difficulty: 'medium',
  })
  const [errors, setErrors] = useState({})
  const [skitInfo, setSkitInfo] = useState({ branches: [], commonSubjects: [] })

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const info = await aiAPI.getSKITInfo()
        if (info.success) {
          setSkitInfo({ branches: info.branches, commonSubjects: info.commonSubjects })
        }
      } catch (err) {
        console.error('Failed to fetch SKIT info:', err)
      }
    }
    fetchMetadata()
    const filters = paperAPI.getFilters()
    setFilters(filters)
    const token = localStorage.getItem('token')
    const userStr = localStorage.getItem('user')
    
    if (!token || !userStr) {
      navigate('/login')
      return
    }
    
    try {
      const userObj = JSON.parse(userStr)
      if (userObj.role !== 'admin') {
        setIsAdmin(false)
      }
    } catch (e) {
      navigate('/login')
    }
  }, [navigate])

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }))
    setErrors(e => ({ ...e, [k]: '' }))
    setApiError('')
  }

  const validateFile = (f) => {
    if (!f) return 'Please select a file.'
    if (!ACCEPTED.includes(f.type)) return 'Only PDF files are accepted.'
    if (f.size > MAX_SIZE_MB * 1024 * 1024) return `File size must be under ${MAX_SIZE_MB} MB.`
    return ''
  }

  const handleFile = (f) => {
    const err = validateFile(f)
    setFileError(err)
    if (!err) {
      setFile(f)
    } else {
      setFile(null)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragging(false)
    const droppedFiles = e.dataTransfer.files
    if (droppedFiles.length > 0) {
      handleFile(droppedFiles[0])
    }
  }

  const validate = () => {
    const e = {}
    if (!form.title) e.title = 'Paper title is required.'
    if (!form.departmentid) e.departmentid = 'Department is required.'
    if (!form.semester) e.semester = 'Semester is required.'
    if (!form.year) e.year = 'Year is required.'
    if (!form.examtype) e.examtype = 'Exam type is required.'
    if (!form.subjectName) e.subjectName = 'Subject Name is required.'
    const ferr = validateFile(file)
    if (ferr) setFileError(ferr)
    setErrors(e)
    return Object.keys(e).length === 0 && !ferr
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    setApiError('')

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('title', form.title)
      formData.append('departmentid', form.departmentid)
      formData.append('semester', form.semester)
      formData.append('year', form.year)
      formData.append('examtype', form.examtype)
      formData.append('subjectName', form.subjectName)
      formData.append('subjectCode', form.subjectCode || '')
      formData.append('difficulty', form.difficulty)

      const response = await paperAPI.uploadPaper(formData)

      if (response) {
        setSubmitted(true)
        setFile(null)
      }
    } catch (error) {
      setApiError(error.message || 'Failed to upload paper. Please try again.')
      console.error('Upload error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="pt-24 pb-20 min-h-screen flex items-center justify-center">
        <div className="card p-10 max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={32} className="text-emerald-400" />
          </div>
          <h2 className="font-display font-bold text-white text-2xl mb-3">Paper Submitted!</h2>
          <p className="text-slate-500 text-sm mb-6">
            <strong className="text-slate-300">{form.title}</strong> has been submitted successfully. Thank you for contributing!
          </p>
          <button
            onClick={() => {
              setSubmitted(false)
              setFile(null)
              setForm({
                title: '',
                departmentid: '',
                semester: '',
                year: '',
                examtype: '',
                subjectName: '',
                subjectCode: '',
                difficulty: 'medium',
              })
            }}
            className="btn-primary w-full justify-center"
          >
            Upload Another
          </button>
          <button
            onClick={() => navigate('/papers')}
            className="btn-secondary w-full justify-center mt-3"
          >
            View Papers
          </button>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="pt-24 pb-20 min-h-screen flex items-center justify-center">
        <div className="card p-10 max-w-md text-center border-red-500/20">
          <div className="w-16 h-16 rounded-full bg-red-500/15 flex items-center justify-center mx-auto mb-5">
            <AlertCircle size={32} className="text-red-400" />
          </div>
          <h2 className="font-display font-bold text-white text-2xl mb-3">Access Denied</h2>
          <p className="text-slate-500 text-sm mb-6">
            Only administrators are allowed to upload papers.
          </p>
          <button
            onClick={() => navigate('/')}
            className="btn-primary w-full justify-center"
          >
            Go to Home
          </button>
        </div>
      </div>
    )
  }

  if (!filters) {
    return (
      <div className="pt-24 pb-20 min-h-screen flex items-center justify-center">
        <p className="text-slate-400">Loading...</p>
      </div>
    )
  }

  return (
    <div className="pt-24 pb-20">
      <div className="page-container max-w-3xl">
        <div className="mb-8">
          <p className="section-label">Contribute</p>
          <h1 className="section-title mb-2">Upload a Paper</h1>
          <p className="text-slate-500 text-sm">Help fellow students by sharing previous year papers. Only PDF files accepted, max 10 MB.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File drop zone */}
          <div>
            <FieldLabel required>PDF File</FieldLabel>
            <div
              onDragOver={e => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer p-8 text-center
                ${dragging
                  ? 'border-amber-500/60 bg-amber-500/5'
                  : file
                  ? 'border-emerald-500/40 bg-emerald-500/5'
                  : 'border-white/10 hover:border-amber-500/30 bg-white/[0.02] hover:bg-white/[0.04]'
                }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={e => handleFile(e.target.files[0])}
              />
              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <FileText size={28} className="text-emerald-400 shrink-0" />
                  <div className="text-left">
                    <p className="text-white font-medium text-sm truncate max-w-xs">{file.name}</p>
                    <p className="text-slate-500 text-xs">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); setFile(null); setFileError('') }}
                    className="ml-auto text-slate-500 hover:text-red-400 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <CloudUpload size={32} className="text-slate-600" />
                  <p className="text-slate-400 text-sm">
                    <span className="text-amber-400 font-medium">Click to browse</span> or drag & drop
                  </p>
                  <p className="text-slate-600 text-xs">PDF only · Max 10 MB</p>
                </div>
              )}
            </div>
            {fileError && (
              <p className="flex items-center gap-1.5 text-red-400 text-xs mt-1.5">
                <AlertCircle size={12} /> {fileError}
              </p>
            )}
          </div>

          {/* Form fields */}
          <div className="card p-6 space-y-5">
            {apiError && (
              <p className="flex items-center gap-1.5 text-red-400 text-sm p-3 bg-red-500/10 rounded-lg">
                <AlertCircle size={16} /> {apiError}
              </p>
            )}

            <div>
              <FieldLabel required>Paper Title</FieldLabel>
              <input
                type="text"
                value={form.title}
                onChange={e => set('title', e.target.value)}
                placeholder="e.g. Data Structures — End Semester 2024"
                className="input-field text-sm"
              />
              {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <FieldLabel required>Department</FieldLabel>
                <SelectField
                  value={form.departmentid}
                  onChange={v => set('departmentid', v)}
                  placeholder="Select department"
                  options={filters.departments}
                  required
                />
                {errors.departmentid && <p className="text-red-400 text-xs mt-1">{errors.departmentid}</p>}
              </div>
              <div>
                <FieldLabel required>Semester</FieldLabel>
                <SelectField
                  value={form.semester}
                  onChange={v => set('semester', v)}
                  placeholder="Select semester"
                  options={filters.semesters}
                  required
                />
                {errors.semester && <p className="text-red-400 text-xs mt-1">{errors.semester}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <FieldLabel required>Exam Year</FieldLabel>
                <SelectField
                  value={form.year}
                  onChange={v => set('year', v)}
                  placeholder="Select year"
                  options={filters.years}
                  required
                />
                {errors.year && <p className="text-red-400 text-xs mt-1">{errors.year}</p>}
              </div>
              <div>
                <FieldLabel required>Exam Type</FieldLabel>
                <SelectField
                  value={form.examtype}
                  onChange={v => set('examtype', v)}
                  placeholder="Select exam type"
                  options={filters.examTypes}
                  required
                />
                {errors.examtype && <p className="text-red-400 text-xs mt-1">{errors.examtype}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <FieldLabel required>Subject Name</FieldLabel>
                {form.departmentid === 'first-year' || form.semester === '1' || form.semester === '2' ? (
                  <SelectField
                    value={`${form.subjectCode}|${form.subjectName}`}
                    onChange={v => {
                      if (!v) {
                        setForm(f => ({ ...f, subjectName: '', subjectCode: '' }))
                        return
                      }
                      const [code, name] = v.split('|')
                      setForm(f => ({ ...f, subjectName: name, subjectCode: code }))
                      setErrors(e => ({ ...e, subjectName: '' }))
                    }}
                    placeholder="Select common subject"
                    options={Array.from(
                      new Map(
                        skitInfo.commonSubjects
                          .filter(s => !form.semester || s.semester.toString() === form.semester)
                          .map(s => [s.code, { value: `${s.code}|${s.name}`, label: `${s.code} - ${s.name}` }])
                      ).values()
                    )}
                    required
                  />
                ) : (
                  <input
                    type="text"
                    value={form.subjectName}
                    onChange={e => set('subjectName', e.target.value)}
                    placeholder="Enter subject name"
                    className="input-field text-sm"
                  />
                )}
                {errors.subjectName && <p className="text-red-400 text-xs mt-1">{errors.subjectName}</p>}
              </div>
              
              <div>
                <FieldLabel>Subject Code (Optional)</FieldLabel>
                <input
                  type="text"
                  value={form.subjectCode}
                  onChange={e => set('subjectCode', e.target.value)}
                  placeholder="e.g. CS101"
                  className="input-field text-sm"
                  disabled={form.departmentid === 'first-year' || form.semester === '1' || form.semester === '2'}
                />
              </div>
            </div>

            <div>
              <FieldLabel>Difficulty Level</FieldLabel>
              <SelectField
                value={form.difficulty}
                onChange={v => set('difficulty', v)}
                placeholder="Select difficulty"
                options={[
                  { value: 'easy', label: 'Easy' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'hard', label: 'Hard' },
                ]}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`btn-primary w-full justify-center flex items-center gap-2 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <UploadIcon size={18} />
            {loading ? 'Uploading...' : 'Upload Paper'}
          </button>
        </form>
      </div>
    </div>
  )
}
