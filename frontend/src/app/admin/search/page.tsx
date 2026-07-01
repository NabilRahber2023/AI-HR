'use client'
import { useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { employeesAPI, recommendationAPI, predictionAPI } from '@/lib/api'
import { Search, User, Building2, Briefcase, Star, Brain } from 'lucide-react'

const BOX_STYLES: Record<number, string> = {
  1:'bg-red-500', 2:'bg-orange-500', 3:'bg-yellow-500',
  4:'bg-lime-500', 5:'bg-green-500', 6:'bg-emerald-500',
  7:'bg-cyan-500', 8:'bg-blue-500', 9:'bg-indigo-500',
}
const BOX_LABELS: Record<number, string> = {
  1:'Underperformer', 2:'Solid/Limited', 3:'Trusted Pro',
  4:'Inconsistent', 5:'Core Contributor', 6:'High Performer',
  7:'Emerging Talent', 8:'Future Leader', 9:'Star Performer',
}
const LEVEL_COLOR: Record<string, string> = {
  High: 'bg-secondary-container/30 text-on-secondary-container',
  Medium: 'bg-[#ffddb8]/50 text-[#653e00]',
  Low: 'bg-error-container text-on-error-container',
}

const GRID = [7,8,9,4,5,6,1,2,3]

function NineBoxGrid({ highlightBox }: { highlightBox?: number }) {
  return (
    <div>
      <div className="grid grid-cols-[40px_1fr_1fr_1fr] gap-2 h-[200px]">
        <div className="flex items-center justify-center -rotate-90 text-[10px] font-bold text-on-surface-variant uppercase">High</div>
        {[7,8,9].map(box => (
          <div key={box} className={`rounded-lg flex flex-col items-center justify-center gap-1 transition-all ${
            box === highlightBox ? `${BOX_STYLES[box]} text-white scale-105 shadow-lg ring-2 ring-white/50` : 'bg-outline-variant/10 opacity-40'
          }`}>
            <span className="text-[10px] font-bold">{BOX_LABELS[box]}</span>
          </div>
        ))}
        <div className="flex items-center justify-center -rotate-90 text-[10px] font-bold text-on-surface-variant uppercase">Med</div>
        {[4,5,6].map(box => (
          <div key={box} className={`rounded-lg flex flex-col items-center justify-center gap-1 transition-all ${
            box === highlightBox ? `${BOX_STYLES[box]} text-white scale-105 shadow-lg ring-2 ring-white/50` : 'bg-outline-variant/10 opacity-40'
          }`}>
            <span className="text-[10px] font-bold">{BOX_LABELS[box]}</span>
          </div>
        ))}
        <div className="flex items-center justify-center -rotate-90 text-[10px] font-bold text-on-surface-variant uppercase">Low</div>
        {[1,2,3].map(box => (
          <div key={box} className={`rounded-lg flex flex-col items-center justify-center gap-1 transition-all ${
            box === highlightBox ? `${BOX_STYLES[box]} text-white scale-105 shadow-lg ring-2 ring-white/50` : 'bg-outline-variant/10 opacity-40'
          }`}>
            <span className="text-[10px] font-bold">{BOX_LABELS[box]}</span>
          </div>
        ))}
        <div/><div className="flex items-center justify-center text-[10px] font-bold text-on-surface-variant">High</div>
        <div className="flex items-center justify-center text-[10px] font-bold text-on-surface-variant">Med</div>
        <div className="flex items-center justify-center text-[10px] font-bold text-on-surface-variant">Low</div>
      </div>
      {highlightBox && (
        <div className={`mt-2 text-center py-2 px-4 rounded-lg text-white text-sm font-medium ${BOX_STYLES[highlightBox]}`}>
          Box {highlightBox} — {BOX_LABELS[highlightBox]}
        </div>
      )}
    </div>
  )
}

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [recs, setRecs] = useState<any>(null)
  const [pred, setPred] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [recLoading, setRecLoading] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault(); if (!query.trim()) return
    setLoading(true)
    try { const r = await employeesAPI.search(query); setResults(r.data); setSelected(null); setRecs(null); setPred(null) }
    catch {} finally { setLoading(false) }
  }

  const handleSelect = async (emp: any) => {
    setSelected(emp); setRecs(null); setPred(null); setRecLoading(true)
    try {
      const [rr, pr] = await Promise.all([
        recommendationAPI.get(emp.id),
        predictionAPI.forEmployee(emp.id).catch(() => null),
      ])
      setRecs(rr.data); if (pr) setPred(pr.data)
    } catch {} finally { setRecLoading(false) }
  }

  return (
    <DashboardLayout adminOnly>
      <div className="p-4 lg:p-8 max-w-[1440px] mx-auto">
        <div className="mb-6">
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Employee Search</h2>
          <p className="font-body-md text-on-surface-variant">Search by worker ID or employee name</p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-3 mb-6">
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Employee ID or name" className="input-field flex-1" />
          <button type="submit" disabled={loading} className="btn-primary disabled:opacity-60">
            <Search size={18} />{loading ? 'Searching...' : 'Search'}
          </button>
        </form>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Search Results List */}
          <div className="lg:col-span-4 p-6 bg-surface-container-low border border-outline-variant rounded-xl shadow-sm">
            <h5 className="font-label-md text-label-md text-on-surface mb-3 uppercase tracking-wider">
              {results.length > 0 ? `${results.length} Result(s)` : 'Find Employee Position'}
            </h5>
            {results.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-on-surface-variant/50">
                <Search size={40} className="mb-2 opacity-30" />
                <p className="text-xs">No results to display</p>
              </div>
            ) : (
              <div className="divide-y divide-outline-variant/30 max-h-[500px] overflow-y-auto custom-scrollbar">
                {results.map((emp) => (
                  <div
                    key={emp.id}
                    onClick={() => handleSelect(emp)}
                    className={`p-3 cursor-pointer hover:bg-surface-container transition-colors rounded-lg ${selected?.id === emp.id ? 'bg-surface-container border-l-4 border-primary' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-bold text-sm">
                        {emp.employee_name?.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-on-surface truncate">{emp.employee_name}</p>
                        <p className="text-xs text-on-surface-variant">{emp.worker_id} · {emp.department}</p>
                      </div>
                      {emp.nine_box && (
                        <span className={`text-xs text-white px-2 py-1 rounded-full font-bold ${BOX_STYLES[emp.nine_box]}`}>
                          Box {emp.nine_box}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Employee Detail */}
          <div className="lg:col-span-8 space-y-4">
            {selected ? (
              <>
                <div className="card">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-on-primary text-xl font-bold">
                      {selected.employee_name?.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h2 className="font-headline-md text-headline-md text-on-surface">{selected.employee_name}</h2>
                      <p className="text-on-surface-variant text-sm">{selected.employee_email}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="flex items-center gap-1 text-xs bg-surface-container text-on-surface px-2 py-1 rounded-full">
                          <Building2 size={12} /> {selected.department}
                        </span>
                        <span className="flex items-center gap-1 text-xs bg-surface-container text-on-surface px-2 py-1 rounded-full">
                          <Briefcase size={12} /> {selected.job_role}
                        </span>
                      </div>
                    </div>
                    {pred && (
                      <div className="bg-surface-container p-2 rounded-lg text-center">
                        <p className="text-xs text-on-surface-variant">ML Predicted</p>
                        <p className="font-bold text-primary">Box {pred.predicted_nine_box}</p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {[
                      ['Performance', selected.performance_level],
                      ['Potential', selected.potential_level],
                      ['KPI Score', `${selected.kpi_score?.toFixed(1)}%`],
                    ].map(([label, value]) => (
                      <div key={label} className="text-center p-3 bg-surface-container-low rounded-lg">
                        <span className={`text-sm font-semibold px-2 py-0.5 rounded-full ${LEVEL_COLOR[value as string] || 'text-on-surface'}`}>{value}</span>
                        <p className="text-xs text-on-surface-variant mt-1">{label}</p>
                      </div>
                    ))}
                  </div>

                  <NineBoxGrid highlightBox={selected.nine_box} />
                </div>

                {/* Metrics */}
                <div className="card">
                  <h3 className="font-title-lg text-on-surface mb-3">Performance Metrics</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {[
                      ['KPI Score', `${selected.kpi_score?.toFixed(1)}%`],
                      ['Goal Completion', `${selected.goal_completion_percent?.toFixed(1)}%`],
                      ['Task Completion', `${selected.task_completion_rate?.toFixed(1)}%`],
                      ['Manager Feedback', `${selected.manager_feedback_score?.toFixed(1)}/100`],
                      ['Attendance', `${selected.avg_monthly_attendance_percent?.toFixed(1)}%`],
                      ['Skill Score', `${selected.skill_assessment_score?.toFixed(1)}/100`],
                      ['Leadership Score', `${selected.leadership_assessment_score?.toFixed(1)}/100`],
                      ['Training Hours', `${selected.training_hours?.toFixed(0)} hrs`],
                      ['Certifications', selected.certifications_count],
                      ['Experience', `${selected.years_of_experience} yrs`],
                    ].map(([label, value]) => (
                      <div key={label} className="flex justify-between p-2 bg-surface-container-low rounded">
                        <span className="text-on-surface-variant">{label}</span>
                        <span className="font-medium text-on-surface">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommendations */}
                {recLoading && (
                  <div className="card text-center py-6">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-sm text-on-surface-variant">Loading AI recommendations...</p>
                  </div>
                )}
                {recs && (
                  <div className="card">
                    <div className="flex items-center gap-2 mb-4">
                      <Star size={18} className="text-[#f59e0b]" />
                      <h3 className="font-title-lg text-on-surface">Development Recommendations</h3>
                      {recs.ai_enhanced && <span className="text-xs bg-primary-container/30 text-on-primary-container px-2 py-0.5 rounded-full">AI Enhanced</span>}
                    </div>
                    <ul className="space-y-2">
                      {recs.recommendations?.map((rec: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className="w-5 h-5 bg-primary-container/20 text-primary rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
                          <span className="text-on-surface-variant">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <div className="card flex flex-col items-center justify-center py-16 text-on-surface-variant/50">
                <User size={48} className="mb-3 opacity-30" />
                <p className="font-medium">Select an employee to view details</p>
                <p className="text-sm mt-1">Search above and click a result</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
