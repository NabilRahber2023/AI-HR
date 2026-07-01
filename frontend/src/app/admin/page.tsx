'use client'
import { useState, useEffect, useCallback } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { analyticsAPI } from '@/lib/api'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import { RefreshCw } from 'lucide-react'

// Box numbers come from the generator: nine_box = (performance, potential).
// Top row = HIGH potential [7,8,9]; columns go LOW -> MED -> HIGH performance
// left-to-right, so labels below match each cell's true (perf, potential).
const BOX_STYLES: Record<number, { bg: string; border: string; text: string; hover: string; label: string }> = {
  7: { bg: 'bg-cyan-500/10', border: 'border-cyan-500', text: 'text-cyan-900', hover: 'hover:bg-cyan-500', label: 'Enigma' },
  8: { bg: 'bg-blue-500/10', border: 'border-blue-500', text: 'text-blue-900', hover: 'hover:bg-blue-500', label: 'Growth Employee' },
  9: { bg: 'bg-indigo-500/10', border: 'border-indigo-500', text: 'text-indigo-900', hover: 'hover:bg-indigo-500', label: 'Star Performer' },
  4: { bg: 'bg-lime-500/10', border: 'border-lime-500', text: 'text-lime-900', hover: 'hover:bg-lime-500', label: 'Dilemma' },
  5: { bg: 'bg-green-500/10', border: 'border-green-500', text: 'text-green-900', hover: 'hover:bg-green-500', label: 'Core Employee' },
  6: { bg: 'bg-emerald-500/10', border: 'border-emerald-500', text: 'text-emerald-900', hover: 'hover:bg-emerald-500', label: 'High Performer' },
  1: { bg: 'bg-red-500/10', border: 'border-red-500', text: 'text-red-900', hover: 'hover:bg-red-500', label: 'Underperformer' },
  2: { bg: 'bg-orange-500/10', border: 'border-orange-500', text: 'text-orange-900', hover: 'hover:bg-orange-500', label: 'Effective' },
  3: { bg: 'bg-yellow-500/10', border: 'border-yellow-500', text: 'text-yellow-900', hover: 'hover:bg-yellow-500', label: 'Trusted Pro' },
}

function StatCard({ title, value, icon, sub }: { title: string; value: string; icon: string; sub?: string }) {
  return (
    <div className="min-w-[240px] flex-1 bg-white p-6 rounded-xl shadow-sm border border-outline-variant">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-primary/10 rounded-lg text-2xl">{icon}</div>
        {sub && <span className="text-primary font-bold text-xs">{sub}</span>}
      </div>
      <p className="text-on-surface-variant font-label-md mb-1">{title}</p>
      <h3 className="text-3xl font-bold text-on-surface">{value}</h3>
    </div>
  )
}

export default function AdminDashboard() {
  const [summary, setSummary] = useState<any>(null)
  const [salary, setSalary] = useState<any[]>([])
  const [deptPerf, setDeptPerf] = useState<any[]>([])
  const [ninebox, setNinebox] = useState<any[]>([])
  const [gender, setGender] = useState<any[]>([])
  const [perfDist, setPerfDist] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const [s, sal, dp, nb, g, pd] = await Promise.all([
        analyticsAPI.summary(), analyticsAPI.salaryDist(), analyticsAPI.deptPerf(),
        analyticsAPI.nineboxDist(), analyticsAPI.genderDist(), analyticsAPI.perfDist(),
      ])
      setSummary(s.data); setSalary(sal.data); setDeptPerf(dp.data)
      setNinebox(nb.data); setGender(g.data); setPerfDist(pd.data)
    } catch { /* use mock */ } finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const getBoxCount = (box: number) => ninebox.find((n: any) => n.box === box)?.count || 0

  return (
    <DashboardLayout adminOnly>
      <div className="p-4 lg:p-8 max-w-[1440px] mx-auto">
        {/* Header */}
        <section className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">
              Analytics Dashboard
            </h2>
            <p className="font-body-md text-on-surface-variant">Employee Performance &amp; Potential Overview</p>
          </div>
          <button onClick={fetchAll} className="btn-secondary">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            <span className="font-label-md">Refresh Data</span>
          </button>
        </section>

        {/* Stat Cards */}
        <section className="mb-8">
          <div className="flex overflow-x-auto gap-4 pb-4 custom-scrollbar">
            <StatCard title="Total Employees" value={summary?.total_employees?.toLocaleString() || '5,000'} icon="👥" sub="+2.5%" />
            <div className="min-w-[280px] flex-1 bg-white p-6 rounded-xl shadow-sm border border-outline-variant">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center text-white text-xs">♂</div>
                  <div className="w-8 h-8 rounded-full bg-pink-500 border-2 border-white flex items-center justify-center text-white text-xs">♀</div>
                </div>
              </div>
              <p className="text-on-surface-variant font-label-md mb-1">Gender Distribution</p>
              <div className="flex items-baseline gap-4">
                <div><span className="text-xl font-bold text-blue-600">{summary?.male_count?.toLocaleString() || '2,487'}</span><span className="text-xs text-on-surface-variant ml-1">Male</span></div>
                <div><span className="text-xl font-bold text-pink-600">{summary?.female_count?.toLocaleString() || '2,513'}</span><span className="text-xs text-on-surface-variant ml-1">Female</span></div>
              </div>
            </div>
            <StatCard title="Avg KPI Score" value={`${summary?.avg_kpi || '70.3'}%`} icon="📈" sub="Top Tier" />
            <StatCard title="Avg Attendance" value={`${summary?.avg_attendance || '85.1'}%`} icon="📅" />
          </div>
        </section>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          {/* Salary Bar */}
          <div className="lg:col-span-8 bg-white p-6 rounded-xl shadow-sm border border-outline-variant">
            <div className="mb-4 flex items-baseline justify-between">
              <h4 className="font-title-lg text-on-surface">Salary Distribution</h4>
              <span className="text-xs text-on-surface-variant">
                {salary.length ? `${salary.length} ranges` : ''}
              </span>
            </div>
            <ResponsiveContainer width="100%" height={256}>
              <BarChart
                data={salary.length ? salary : [
                  { range: '$0-$1k', count: 412 },
                  { range: '$1k-$2k', count: 1620 },
                  { range: '$2k-$3k', count: 1227 },
                  { range: '$3k-$4k', count: 980 },
                  { range: '$4k-$5k', count: 761 },
                ]}
                margin={{ top: 16, right: 8, left: 0, bottom: 28 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="range"
                  interval={0}
                  angle={-30}
                  textAnchor="end"
                  height={50}
                  tick={{ fontSize: 10 }}
                />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip
                  formatter={(v: any) => [Number(v).toLocaleString(), 'Employees']}
                  labelFormatter={(l: any) => `Salary: ${l}`}
                />
                <Bar dataKey="count" fill="#00236f" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Gender Pie */}
          <div className="lg:col-span-4 bg-white p-6 rounded-xl shadow-sm border border-outline-variant flex flex-col items-center justify-center">
            <h4 className="font-title-lg text-on-surface mb-4 self-start">Gender Distribution</h4>
            <div className="relative w-48 h-48 rounded-full border-[20px] border-blue-500 flex items-center justify-center"
              style={{ borderRightColor: '#ec4899', borderBottomColor: '#ec4899', transform: 'rotate(18deg)' }}>
              <div className="flex flex-col items-center" style={{ transform: 'rotate(-18deg)' }}>
                <span className="text-2xl font-black text-on-surface">{summary?.total_employees?.toLocaleString() || '5,000'}</span>
                <span className="text-[10px] uppercase tracking-widest text-on-surface-variant">Total</span>
              </div>
            </div>
            <div className="mt-6 flex gap-6">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500" /><span className="text-sm font-medium">Male (49.7%)</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-pink-500" /><span className="text-sm font-medium">Female (50.3%)</span></div>
            </div>
          </div>
        </div>

        {/* 9-Box Heatmap */}
        <section className="mb-8 bg-white p-6 rounded-xl shadow-sm border border-outline-variant">
          <h4 className="font-title-lg text-on-surface mb-6">9-Box Performance Potential Grid</h4>
          <div className="w-full overflow-x-auto">
            <div className="min-w-[500px]">
              <div className="grid grid-cols-[40px_1fr_1fr_1fr] gap-2 h-[420px]">
                {/* Row 1 - HIGH potential */}
                <div className="flex items-center justify-center -rotate-90 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest row-span-1">HIGH</div>
                {[7, 8, 9].map((box) => {
                  const s = BOX_STYLES[box]
                  return (
                    <div key={box} className={`${s.bg} border ${s.border} ${s.text} rounded-lg p-3 flex flex-col group ${s.hover} transition-all cursor-pointer items-center justify-center`}>
                      <span className="text-sm font-bold group-hover:text-white">{s.label}</span>
                      <span className="mt-2 bg-white/50 px-2 py-1 rounded text-[10px] font-black group-hover:bg-black/20 group-hover:text-white">
                        {getBoxCount(box).toLocaleString()}
                      </span>
                    </div>
                  )
                })}

                {/* Row 2 - MEDIUM potential */}
                <div className="flex items-center justify-center -rotate-90 text-[10px] font-bold text-on-surface-variant">MED</div>
                {[4, 5, 6].map((box) => {
                  const s = BOX_STYLES[box]
                  return (
                    <div key={box} className={`${s.bg} border ${s.border} ${s.text} rounded-lg p-3 flex flex-col group ${s.hover} transition-all cursor-pointer items-center justify-center`}>
                      <span className="text-sm font-bold group-hover:text-white">{s.label}</span>
                      <span className="mt-2 bg-white/50 px-2 py-1 rounded text-[10px] font-black group-hover:bg-black/20 group-hover:text-white">
                        {getBoxCount(box).toLocaleString()}
                      </span>
                    </div>
                  )
                })}

                {/* Row 3 - LOW potential */}
                <div className="flex items-center justify-center -rotate-90 text-[10px] font-bold text-on-surface-variant">LOW</div>
                {[1, 2, 3].map((box) => {
                  const s = BOX_STYLES[box]
                  return (
                    <div key={box} className={`${s.bg} border ${s.border} ${s.text} rounded-lg p-3 flex flex-col group ${s.hover} transition-all cursor-pointer items-center justify-center`}>
                      <span className="text-sm font-bold group-hover:text-white">{s.label}</span>
                      <span className="mt-2 bg-white/50 px-2 py-1 rounded text-[10px] font-black group-hover:bg-black/20 group-hover:text-white">
                        {getBoxCount(box).toLocaleString()}
                      </span>
                    </div>
                  )
                })}

                {/* Bottom labels */}
                <div className="flex items-center justify-center text-[10px] font-bold text-on-surface-variant uppercase">Perf.</div>
                <div className="flex items-center justify-center text-[10px] font-bold text-on-surface-variant">LOW</div>
                <div className="flex items-center justify-center text-[10px] font-bold text-on-surface-variant">MED</div>
                <div className="flex items-center justify-center text-[10px] font-bold text-on-surface-variant">HIGH</div>
              </div>
            </div>
          </div>
        </section>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Department Performance */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-outline-variant">
            <h4 className="font-title-lg text-on-surface mb-4">Department Performance (Avg KPI)</h4>
            <ResponsiveContainer width="100%" height={Math.max(250, (deptPerf.length || 8) * 34)}>
              <BarChart layout="vertical" data={deptPerf.length ? deptPerf : [
                { department: 'IT', avg_kpi: 72.4 }, { department: 'Engineering', avg_kpi: 71.8 },
                { department: 'Finance', avg_kpi: 70.9 }, { department: 'Sales', avg_kpi: 69.3 },
                { department: 'Marketing', avg_kpi: 68.7 }, { department: 'HR', avg_kpi: 67.2 },
                { department: 'Operations', avg_kpi: 66.8 }, { department: 'Customer Support', avg_kpi: 65.1 },
              ]} margin={{ left: 8, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                <YAxis dataKey="department" type="category" width={130} interval={0} tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(v: any, _n: any, p: any) => [
                    `${v}${p?.payload?.count ? `  ·  ${Number(p.payload.count).toLocaleString()} emp` : ''}`,
                    'Avg KPI',
                  ]}
                />
                <Bar dataKey="avg_kpi" fill="#006c49" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Performance Distribution */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-outline-variant">
            <h4 className="font-title-lg text-on-surface mb-4">Performance Level Distribution</h4>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={perfDist.length ? perfDist : [
                { level: 'Low', count: 1420 }, { level: 'Medium', count: 2651 }, { level: 'High', count: 929 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="level" tick={{ fontSize: 13 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {(perfDist.length ? perfDist : [{ level: 'Low' }, { level: 'Medium' }, { level: 'High' }]).map((e: any, i: number) => (
                    <Cell key={i} fill={e.level === 'High' ? '#006c49' : e.level === 'Medium' ? '#f59e0b' : '#ba1a1a'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
