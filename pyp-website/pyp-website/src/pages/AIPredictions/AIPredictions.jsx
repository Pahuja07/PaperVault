import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Brain, TrendingUp, BookOpen, Target, Clock, ThumbsUp, ThumbsDown, Star, ChevronDown, Filter, RefreshCw, Download, ExternalLink, AlertCircle, CheckCircle, Sparkles, BarChart3, PieChart, ListFilter } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, Legend } from 'recharts'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Confidence color mapping
const getConfidenceColor = (score) => {
  if (score >= 80) return 'text-green-400 bg-green-500/10 border-green-500/30'
  if (score >= 60) return 'text-amber-400 bg-amber-500/10 border-amber-500/30'
  return 'text-orange-400 bg-orange-500/10 border-orange-500/30'
}

const getConfidenceBg = (score) => {
  if (score >= 80) return 'bg-green-500'
  if (score >= 60) return 'bg-amber-500'
  return 'bg-orange-500'
}

const COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316']

// Filter Select Component
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

// Topic Card Component
function TopicCard({ topic, index }) {
  return (
    <div 
      className="card p-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-slate-500">#{index + 1}</span>
            {topic.unit && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">
                {topic.unit}
              </span>
            )}
          </div>
          <h3 className="font-semibold text-white text-sm leading-tight">{topic.topic}</h3>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-bold ${getConfidenceColor(topic.confidence)}`}>
          {topic.confidence}%
        </div>
      </div>
      <div className="flex items-center gap-4 text-xs text-slate-400">
        <span className="flex items-center gap-1">
          <Target size={12} />
          {topic.marks} marks
        </span>
        <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
          <div 
            className={`h-full ${getConfidenceBg(topic.confidence)} transition-all duration-500`}
            style={{ width: `${topic.confidence}%` }}
          />
        </div>
      </div>
    </div>
  )
}

// Predicted Question Card
function QuestionCard({ question, index }) {
  const [rated, setRated] = useState(null)

  const handleRate = async (helpful) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        alert('Please login to rate predictions')
        return
      }

      await fetch(`${API_BASE_URL}/ai/predictions/${question.predictionid}/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isHelpful: helpful, rating: helpful ? 5 : 2 })
      })
      setRated(helpful)
    } catch (error) {
      console.error('Rating error:', error)
    }
  }

  return (
    <div className="card p-4 hover:shadow-lg transition-all duration-300">
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
          question.confidence >= 75 ? 'bg-green-500/20 text-green-400' :
          question.confidence >= 50 ? 'bg-amber-500/20 text-amber-400' :
          'bg-orange-500/20 text-orange-400'
        }`}>
          {index + 1}
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2 mb-2">
            <p className="text-sm text-slate-200 leading-relaxed flex-1">{question.question}</p>
            <span className={`px-2 py-1 rounded text-xs font-bold flex-shrink-0 ${getConfidenceColor(question.confidence)}`}>
              {question.confidence}%
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <BookOpen size={12} />
              {question.marks} marks
            </span>
            <span className="flex items-center gap-1">
              <ListFilter size={12} />
              {question.type || 'descriptive'}
            </span>
          </div>
          
          {/* Rating buttons */}
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-700">
            <span className="text-xs text-slate-500">Was this helpful?</span>
            <button
              onClick={() => handleRate(true)}
              disabled={rated !== null}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs transition-all ${
                rated === true 
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                  : 'bg-slate-700 text-slate-300 hover:bg-green-500/10 hover:text-green-400'
              }`}
            >
              <ThumbsUp size={12} /> Helpful
            </button>
            <button
              onClick={() => handleRate(false)}
              disabled={rated !== null}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs transition-all ${
                rated === false 
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                  : 'bg-slate-700 text-slate-300 hover:bg-red-500/10 hover:text-red-400'
              }`}
            >
              <ThumbsDown size={12} /> Not helpful
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Main Component
export default function AIPredictions() {
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [prediction, setPrediction] = useState(null)
  const [error, setError] = useState('')
  const [branches, setBranches] = useState([])
  const [departments, setDepartments] = useState([])
  const [showFilters, setShowFilters] = useState(false)
  
  const [filters, setFilters] = useState({
    department: searchParams.get('dept') || '',
    semester: searchParams.get('semester') || '',
    branch: searchParams.get('branch') || ''
  })

  // Fetch departments and SKIT info
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const deptRes = await fetch(`${API_BASE_URL}/department`)
        const deptData = await deptRes.json()
        setDepartments(deptData.departments || [])
        
        // Try to fetch SKIT info, but don't fail if it's not available
        try {
          const skitRes = await fetch(`${API_BASE_URL}/ai/skit-info`)
          if (skitRes.ok) {
            const skitData = await skitRes.json()
            setBranches(skitData.branches || [])
          }
        } catch (skitError) {
          console.warn('SKIT info not available, using default branches')
          setBranches([
            { code: 'CSE', name: 'Computer Science & Engineering' },
            { code: 'IT', name: 'Information Technology' },
            { code: 'ECE', name: 'Electronics & Communication Engineering' },
            { code: 'EE', name: 'Electrical Engineering' },
            { code: 'ME', name: 'Mechanical Engineering' },
            { code: 'CE', name: 'Civil Engineering' }
          ])
        }
      } catch (error) {
        console.error('Fetch error:', error)
        setBranches([
          { code: 'CSE', name: 'Computer Science & Engineering' },
          { code: 'IT', name: 'Information Technology' },
          { code: 'ECE', name: 'Electronics & Communication Engineering' },
          { code: 'EE', name: 'Electrical Engineering' },
          { code: 'ME', name: 'Mechanical Engineering' },
          { code: 'CE', name: 'Civil Engineering' }
        ])
      }
    }
    
    fetchInitialData()
  }, [])

  // Fetch predictions
  useEffect(() => {
    if (filters.department && filters.semester) {
      fetchPredictions()
    }
  }, [filters])

  const fetchPredictions = async () => {
    setLoading(true)
    setError('')
    
    try {
      let url
      if (filters.branch === 'common') {
        // Get common subject predictions for first year
        url = `${API_BASE_URL}/ai/predictions/common/semester/${filters.semester}`
      } else {
        url = `${API_BASE_URL}/ai/predictions/department/${filters.department}/semester/${filters.semester}`
      }
      
      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to fetch predictions')
      
      const data = await response.json()
      setPrediction(data)
    } catch (err) {
      setError(err.message)
      console.error('Prediction error:', err)
    } finally {
      setLoading(false)
    }
  }

  const setFilter = (key, val) => setFilters(f => ({ ...f, [key]: val }))

  const branchOptions = [
    { value: 'common', label: 'Common Subjects (1st/2nd Sem)' },
    ...branches.map(b => ({ value: b.code, label: b.name }))
  ]

  const semesterOptions = [
    { value: '1', label: 'Semester 1' },
    { value: '2', label: 'Semester 2' },
    { value: '3', label: 'Semester 3' },
    { value: '4', label: 'Semester 4' },
    { value: '5', label: 'Semester 5' },
    { value: '6', label: 'Semester 6' },
    { value: '7', label: 'Semester 7' },
    { value: '8', label: 'Semester 8' },
  ]

  // Prepare chart data
  const marksDistributionData = prediction?.prediction?.marksDistribution 
    ? Object.entries(prediction.prediction.marksDistribution).map(([key, value]) => ({
        name: key,
        value: value
      }))
    : []

  const topicConfidenceData = prediction?.prediction?.importantTopics
    ? prediction.prediction.importantTopics.slice(0, 6).map(t => ({
        name: t.topic.length > 15 ? t.topic.substring(0, 15) + '...' : t.topic,
        confidence: t.confidence
      }))
    : []

  return (
    <div className="pt-24 pb-20">
      <div className="page-container">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <Brain className="text-white" size={24} />
            </div>
            <div>
              <p className="section-label">AI-Powered</p>
              <h1 className="section-title mb-1">Exam Predictions</h1>
            </div>
          </div>
          <p className="text-slate-500 text-sm max-w-2xl">
            Get AI-generated predictions for important topics and questions based on analysis of previous year papers.
            Powered by advanced machine learning algorithms.
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setShowFilters(v => !v)}
            className={`flex items-center gap-2 px-4 py-3 rounded-lg border text-sm font-medium transition-all duration-200 ${
              showFilters
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                : 'bg-transparent border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-300'
            }`}
          >
            <Filter size={15} />
            Select Branch & Semester
          </button>
          {prediction && (
            <button
              onClick={fetchPredictions}
              className="flex items-center gap-2 px-4 py-3 rounded-lg border border-white/10 text-sm font-medium text-slate-400 hover:border-amber-500/30 hover:text-amber-400 transition-all"
            >
              <RefreshCw size={15} />
              Regenerate
            </button>
          )}
        </div>

        {showFilters && (
          <div className="card p-5 mb-6 grid grid-cols-1 md:grid-cols-3 gap-3 animate-fadeIn">
            <FilterSelect
              label="Branch"
              value={filters.branch}
              onChange={v => setFilter('branch', v)}
              options={branchOptions}
              placeholder="Select Branch"
            />
            <FilterSelect
              label="Department"
              value={filters.department}
              onChange={v => setFilter('department', v)}
              options={departments.map(d => ({ value: d.departmentid, label: d.name }))}
              placeholder="Select Department"
            />
            <FilterSelect
              label="Semester"
              value={filters.semester}
              onChange={v => setFilter('semester', v)}
              options={semesterOptions}
              placeholder="Select Semester"
            />
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 border-4 border-amber-500/30 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-amber-500 rounded-full animate-spin" style={{ clipPath: 'polygon(0 0, 75% 0, 75% 75%, 0 75%)' }}></div>
                <Brain className="absolute inset-0 m-auto text-amber-500 animate-pulse" size={24} />
              </div>
              <h3 className="font-semibold text-white text-lg mb-2">AI is analyzing papers...</h3>
              <p className="text-slate-500 text-sm">This may take a moment as we process historical data</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-400 text-sm mb-4">Failed to load predictions: {error}</p>
            <button onClick={fetchPredictions} className="btn-secondary">
              Try again
            </button>
          </div>
        )}

        {/* Prediction Results */}
        {!loading && !error && prediction && (
          <div className="space-y-8 animate-fadeIn">
            {/* Overall Confidence Score */}
            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white mb-2">Prediction Summary</h2>
                  <p className="text-slate-400 text-sm">
                    Based on analysis of {prediction.prediction.basedOnPapers || 0} previous papers
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold text-amber-400 mb-1">
                    {parseFloat(prediction.prediction.confidenceScore || 0).toFixed(0)}%
                  </div>
                  <p className="text-xs text-slate-500">Overall Confidence</p>
                </div>
              </div>
              
              {/* Confidence Bar */}
              <div className="mt-4 h-3 bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-1000"
                  style={{ width: `${prediction.prediction.confidenceScore}%` }}
                />
              </div>
            </div>

            {/* Important Topics */}
            {prediction.prediction.importantTopics && prediction.prediction.importantTopics.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Target className="text-amber-500" size={20} />
                  <h2 className="text-xl font-bold text-white">Important Topics</h2>
                  <span className="text-xs text-slate-500 ml-auto">
                    {prediction.prediction.importantTopics.length} topics identified
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {prediction.prediction.importantTopics.map((topic, idx) => (
                    <TopicCard key={idx} topic={topic} index={idx} />
                  ))}
                </div>
              </section>
            )}

            {/* Predicted Questions */}
            {prediction.prediction.predictedQuestions && prediction.prediction.predictedQuestions.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="text-amber-500" size={20} />
                  <h2 className="text-xl font-bold text-white">Predicted Questions</h2>
                  <span className="text-xs text-slate-500 ml-auto">
                    {prediction.prediction.predictedQuestions.length} questions predicted
                  </span>
                </div>
                <div className="space-y-3">
                  {prediction.prediction.predictedQuestions.map((question, idx) => (
                    <QuestionCard 
                      key={idx} 
                      question={{ ...question, predictionid: prediction.prediction.predictionid }} 
                      index={idx} 
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Charts Section */}
            {(marksDistributionData.length > 0 || topicConfidenceData.length > 0) && (
              <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Marks Distribution Chart */}
                {marksDistributionData.length > 0 && (
                  <div className="card p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <BarChart3 className="text-amber-500" size={20} />
                      <h3 className="font-semibold text-white">Marks Distribution by Unit</h3>
                    </div>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={marksDistributionData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                          <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                          <YAxis stroke="#64748b" fontSize={12} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#1e293b', 
                              border: '1px solid #334155',
                              borderRadius: '8px'
                            }} 
                          />
                          <Bar dataKey="value" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* Topic Confidence Chart */}
                {topicConfidenceData.length > 0 && (
                  <div className="card p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <PieChart className="text-amber-500" size={20} />
                      <h3 className="font-semibold text-white">Top Topics Confidence</h3>
                    </div>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={topicConfidenceData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="confidence"
                            nameKey="name"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            labelLine={{ stroke: '#64748b' }}
                          >
                            {topicConfidenceData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#1e293b', 
                              border: '1px solid #334155',
                              borderRadius: '8px'
                            }} 
                          />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
            </section>
            )}

            {/* Study Recommendations */}
            {prediction.prediction.studyRecommendations && prediction.prediction.studyRecommendations.length > 0 && (
              <section className="card p-6 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="text-amber-500" size={20} />
                  <h3 className="font-semibold text-white">AI Study Recommendations</h3>
                </div>
                <ul className="space-y-2">
                  {prediction.prediction.studyRecommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                      <span className="text-amber-500 mt-1">•</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Disclaimer */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="text-slate-400 flex-shrink-0 mt-0.5" size={16} />
                <div>
                  <p className="text-xs text-slate-400">
                    <strong className="text-slate-300">Disclaimer:</strong> These predictions are generated by AI based on analysis of previous year papers. 
                    They are meant to assist your studies, not replace comprehensive preparation. 
                    Always refer to your syllabus and consult with faculty for complete exam preparation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && !prediction && (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-6">
              <Brain className="text-slate-600" size={40} />
            </div>
            <h3 className="font-display font-semibold text-white text-xl mb-2">Select Branch & Semester</h3>
            <p className="text-slate-500 text-sm mb-6 max-w-md mx-auto">
              Choose your branch and semester to get AI-powered predictions for important topics and questions.
            </p>
            <button 
              onClick={() => setShowFilters(true)}
              className="btn-primary"
            >
              Get Started
            </button>
          </div>
        )}
      </div>
    </div>
  )
}