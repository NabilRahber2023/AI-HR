'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { predictionAPI, chatbotAPI } from '@/lib/api'
import { Brain, Play, CheckCircle, Send } from 'lucide-react'

type ChatMsg = { role: 'bot' | 'user'; text: string }

const DEPTS = ['HR','IT','Finance','Sales','Marketing','Operations','Customer Support','Engineering']
const ROLES = ['Software Engineer','HR Manager','Financial Analyst','Sales Manager','Marketing Manager',
  'Operations Manager','Support Specialist','Mechanical Engineer','Data Analyst','Recruiter','Accountant']

const BOX_STYLES: Record<number, { bg: string; ring: string; label: string }> = {
  1: { bg: 'bg-red-500', ring: 'ring-red-400', label: 'Underperformer' },
  2: { bg: 'bg-orange-500', ring: 'ring-orange-400', label: 'Solid Professional' },
  3: { bg: 'bg-yellow-500', ring: 'ring-yellow-400', label: 'Trusted Professional' },
  4: { bg: 'bg-lime-500', ring: 'ring-lime-400', label: 'Inconsistent Player' },
  5: { bg: 'bg-green-500', ring: 'ring-green-400', label: 'Core Employee' },
  6: { bg: 'bg-emerald-500', ring: 'ring-emerald-400', label: 'High Performer' },
  7: { bg: 'bg-cyan-500', ring: 'ring-cyan-400', label: 'Enigma / Emerging' },
  8: { bg: 'bg-blue-500', ring: 'ring-blue-400', label: 'Future Leader' },
  9: { bg: 'bg-indigo-500', ring: 'ring-indigo-400', label: 'Star Performer' },
}

// grid order: top-left to bottom-right = [7,8,9,4,5,6,1,2,3]
const GRID = [
  [7, 8, 9],
  [4, 5, 6],
  [1, 2, 3],
]

export default function PredictionPage() {
  const { register, handleSubmit } = useForm({
    defaultValues: {
      age: 32, gender: 'Male', department: 'Engineering', job_role: 'Software Engineer',
      years_of_experience: 4, monthly_salary_usd: 5000,
      avg_monthly_attendance_percent: 94, late_arrival_count: 1,
      absent_days_last_6_months: 0, overtime_hours_monthly: 15,
      kpi_score: 88, goal_completion_percent: 95, task_completion_rate: 92,
      manager_feedback_score: 90, training_hours: 48, certifications_count: 6,
      skill_assessment_score: 85, leadership_assessment_score: 80,
    }
  })
  const [result, setResult] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [trainResult, setTrainResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [training, setTraining] = useState(false)
  const [error, setError] = useState('')

  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [streamingText, setStreamingText] = useState('')

  const handleTrain = async () => {
    setTraining(true); setError('')
    try { const r = await predictionAPI.train(); setTrainResult(r.data) }
    catch (e: any) { setError(e.response?.data?.detail || 'Training failed') }
    finally { setTraining(false) }
  }

  const onSubmit = async (data: any) => {
    setLoading(true); setError(''); setResult(null); setChatMessages([])
    try {
      const payload = Object.fromEntries(Object.entries(data).map(([k, v]) => [k, isNaN(Number(v)) ? v : Number(v)]))
      const r = await predictionAPI.custom(payload); setResult(r.data); setProfile(payload)
    } catch (e: any) { setError(e.response?.data?.detail || 'Prediction failed — train the model first.') }
    finally { setLoading(false) }
  }

  const predicted = result?.predicted_nine_box

  const sendChat = async () => {
    const q = chatInput.trim()
    if (!q || chatLoading) return
    setChatMessages((m) => [...m, { role: 'user', text: q }])
    setChatInput('')
    setChatLoading(true)
    setStreamingText('')
    try {
      const context = predicted
        ? { nine_box: predicted, classification: BOX_STYLES[predicted]?.label, ...(profile || {}) }
        : null
      const full = await chatbotAPI.stream(q, context, (acc) => setStreamingText(acc))
      setChatMessages((m) => [...m, { role: 'bot', text: full || 'No response received.' }])
    } catch {
      setChatMessages((m) => [...m, { role: 'bot', text: 'Sorry, I had trouble responding. Please try again in a moment.' }])
    } finally {
      setChatLoading(false)
      setStreamingText('')
    }
  }

  return (
    <DashboardLayout adminOnly>
      <div className="p-4 lg:p-8 max-w-[1440px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <h1 className="font-display-lg text-display-lg text-primary">Employee Predictive Analysis</h1>
        </div>

        {/* Train Model */}
        <div className="card mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Brain size={20} className="text-primary" />
              </div>
              <div>
                <h3 className="font-title-lg text-on-surface">Train ML Model</h3>
                <p className="text-xs text-on-surface-variant">RandomForestClassifier on employee data</p>
              </div>
            </div>
            <button onClick={handleTrain} disabled={training} className="btn-primary disabled:opacity-60">
              <Play size={16} />
              {training ? 'Training...' : 'Train Model'}
            </button>
          </div>
          {trainResult && (
            <div className="mt-4 p-4 bg-secondary-container/10 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle size={18} className="text-secondary" />
                <span className="font-title-lg text-secondary">Training Complete!</span>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {[['Accuracy', 'accuracy'], ['Precision', 'precision'], ['Recall', 'recall'], ['F1 Score', 'f1']].map(([lbl, key]) => (
                  <div key={key} className="text-center p-2 bg-white rounded">
                    <p className="text-lg font-bold text-secondary">{((trainResult.metrics?.[key] || 0) * 100).toFixed(1)}%</p>
                    <p className="text-xs text-on-surface-variant">{lbl}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {error && <div className="mb-4 p-3 bg-error-container text-on-error-container rounded-xl text-sm">{error}</div>}

        {/* Simulation Form */}
        <div className="card mb-6">
          <div className="bg-surface-container-low px-4 py-3 border-b border-outline-variant flex items-center justify-between -mx-6 -mt-6 mb-6 rounded-t-xl">
            <span className="font-title-lg text-title-lg">Simulation Parameters</span>
            <span className="text-on-surface-variant font-label-sm text-label-sm">18 input fields active</span>
          </div>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { name: 'age', label: 'Employee Age', type: 'number' },
                { name: 'kpi_score', label: 'KPI Score (0-100)', type: 'number' },
                { name: 'years_of_experience', label: 'Years at Company', type: 'number' },
                { name: 'goal_completion_percent', label: 'Goal Completion %', type: 'number' },
                { name: 'task_completion_rate', label: 'Project Completion Rate %', type: 'number' },
                { name: 'training_hours', label: 'Training Hours YTD', type: 'number' },
                { name: 'manager_feedback_score', label: 'Manager Rating (0-100)', type: 'number' },
                { name: 'certifications_count', label: 'Certification Count', type: 'number' },
                { name: 'overtime_hours_monthly', label: 'Monthly Overtime Hours', type: 'number' },
                { name: 'avg_monthly_attendance_percent', label: 'Attendance %', type: 'number' },
                { name: 'late_arrival_count', label: 'Late Arrival Count', type: 'number' },
                { name: 'absent_days_last_6_months', label: 'Absent Days (6 months)', type: 'number' },
                { name: 'monthly_salary_usd', label: 'Monthly Salary (USD)', type: 'number' },
                { name: 'skill_assessment_score', label: 'Skill Score (0-100)', type: 'number' },
                { name: 'leadership_assessment_score', label: 'Leadership Score (0-100)', type: 'number' },
              ].map(({ name, label, type }) => (
                <div key={name} className="space-y-1">
                  <label className="font-label-md text-label-md text-on-surface-variant">{label}</label>
                  <input type={type} {...register(name as any)} className="w-full rounded-lg border border-outline-variant focus:border-primary focus:ring-primary bg-surface-bright px-3 py-2 text-sm" />
                </div>
              ))}

              <div className="space-y-1">
                <label className="font-label-md text-label-md text-on-surface-variant">Gender</label>
                <select {...register('gender')} className="w-full rounded-lg border border-outline-variant focus:border-primary focus:ring-primary bg-surface-bright px-3 py-2 text-sm">
                  <option>Male</option><option>Female</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="font-label-md text-label-md text-on-surface-variant">Department</label>
                <select {...register('department')} className="w-full rounded-lg border border-outline-variant focus:border-primary focus:ring-primary bg-surface-bright px-3 py-2 text-sm">
                  {DEPTS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="font-label-md text-label-md text-on-surface-variant">Job Role</label>
                <select {...register('job_role')} className="w-full rounded-lg border border-outline-variant focus:border-primary focus:ring-primary bg-surface-bright px-3 py-2 text-sm">
                  {ROLES.map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button type="submit" disabled={loading} className="btn-primary disabled:opacity-60">
                <Brain size={18} />
                {loading ? 'Processing...' : 'Run Simulation'}
              </button>
            </div>
          </form>
        </div>

        {/* Result Grid */}
        <section className="card">
          <h4 className="font-title-lg text-on-surface mb-6">Simulation Result: 9-Box Grid</h4>
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Grid */}
            <div className="flex-1 max-w-2xl mx-auto w-full">
              <div className="grid grid-cols-[40px_1fr_1fr_1fr] gap-3 h-[420px]">
                {/* High potential row */}
                <div className="flex items-center justify-center -rotate-90 text-[10px] font-bold text-outline uppercase tracking-widest">High</div>
                {GRID[0].map((box) => (
                  <div key={box} className={`rounded-lg p-3 flex flex-col justify-between transition-all ${
                    predicted === box
                      ? `${BOX_STYLES[box].bg} text-white shadow-lg ${BOX_STYLES[box].ring} ring-4 animate-pulse-subtle`
                      : 'bg-outline-variant/10 border border-dashed border-outline-variant opacity-40'
                  }`}>
                    <span className={`text-xs font-bold uppercase ${predicted === box ? 'text-white' : ''}`}>
                      {BOX_STYLES[box].label}
                    </span>
                    {predicted === box && <span className="text-2xl self-end">🏆</span>}
                  </div>
                ))}

                {/* Medium potential row */}
                <div className="flex items-center justify-center -rotate-90 text-[10px] font-bold text-outline uppercase tracking-widest">Med</div>
                {GRID[1].map((box) => (
                  <div key={box} className={`rounded-lg p-3 flex flex-col justify-between transition-all ${
                    predicted === box
                      ? `${BOX_STYLES[box].bg} text-white shadow-lg ${BOX_STYLES[box].ring} ring-4 animate-pulse-subtle`
                      : 'bg-outline-variant/10 border border-dashed border-outline-variant opacity-40'
                  }`}>
                    <span className={`text-xs font-bold uppercase ${predicted === box ? 'text-white' : ''}`}>
                      {BOX_STYLES[box].label}
                    </span>
                  </div>
                ))}

                {/* Low potential row */}
                <div className="flex items-center justify-center -rotate-90 text-[10px] font-bold text-outline uppercase tracking-widest">Low</div>
                {GRID[2].map((box) => (
                  <div key={box} className={`rounded-lg p-3 flex flex-col justify-between transition-all ${
                    predicted === box
                      ? `${BOX_STYLES[box].bg} text-white shadow-lg ${BOX_STYLES[box].ring} ring-4 animate-pulse-subtle`
                      : 'bg-outline-variant/10 border border-dashed border-outline-variant opacity-40'
                  }`}>
                    <span className={`text-xs font-bold uppercase ${predicted === box ? 'text-white' : ''}`}>
                      {BOX_STYLES[box].label}
                    </span>
                  </div>
                ))}

                {/* Bottom labels */}
                <div />
                <div className="flex items-center justify-center text-[10px] font-bold text-outline uppercase">Low</div>
                <div className="flex items-center justify-center text-[10px] font-bold text-outline uppercase">Med</div>
                <div className="flex items-center justify-center text-[10px] font-bold text-outline uppercase">High</div>
              </div>
            </div>

            {/* AI Panel */}
            <div className="lg:w-1/3 flex flex-col">
              <div className="bg-surface-container-low rounded-xl border border-outline-variant flex flex-col h-[420px]">
                <div className="p-4 border-b border-outline-variant bg-surface-container-lowest flex items-center gap-3 rounded-t-xl">
                  <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center">
                    <Brain size={16} className="text-on-primary-container" />
                  </div>
                  <h5 className="font-title-lg text-on-surface">AI-Powered Development Path</h5>
                </div>
                <div className="flex-grow overflow-y-auto p-4 space-y-4 custom-scrollbar">
                  {/* Welcome / analysis bubble */}
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary flex-shrink-0 flex items-center justify-center text-white text-xs">🤖</div>
                    <div className="bg-surface-container-lowest p-3 rounded-xl rounded-tl-none shadow-sm border border-outline-variant/30 text-sm text-on-surface whitespace-pre-wrap">
                      {predicted
                        ? `I've analyzed the simulation results. This profile classifies as a ${BOX_STYLES[predicted]?.label} (Box ${predicted}). ${
                            predicted >= 8
                              ? 'Focus on executive leadership training and high-impact strategic projects.'
                              : predicted >= 5
                              ? 'Recommend a structured development plan and stretch assignments.'
                              : 'Initiate a Performance Improvement Plan with clear milestones.'
                          }\n\nAsk me anything about this employee below.`
                        : "Fill in the parameters above and click 'Run Simulation' to get AI-powered insights — then ask me anything about this profile."
                      }
                    </div>
                  </div>

                  {/* Conversation */}
                  {chatMessages.map((m, i) => (
                    m.role === 'user' ? (
                      <div key={i} className="flex justify-end">
                        <div className="bg-primary text-white p-3 rounded-xl rounded-tr-none shadow-sm text-sm max-w-[85%] whitespace-pre-wrap">
                          {m.text}
                        </div>
                      </div>
                    ) : (
                      <div key={i} className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary flex-shrink-0 flex items-center justify-center text-white text-xs">🤖</div>
                        <div className="bg-surface-container-lowest p-3 rounded-xl rounded-tl-none shadow-sm border border-outline-variant/30 text-sm text-on-surface whitespace-pre-wrap max-w-[85%]">
                          {m.text}
                        </div>
                      </div>
                    )
                  ))}

                  {/* Streaming reply / typing indicator */}
                  {chatLoading && (
                    <div className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary flex-shrink-0 flex items-center justify-center text-white text-xs">🤖</div>
                      {streamingText ? (
                        <div className="bg-surface-container-lowest p-3 rounded-xl rounded-tl-none shadow-sm border border-outline-variant/30 text-sm text-on-surface whitespace-pre-wrap max-w-[85%]">
                          {streamingText}
                          <span className="ml-0.5 inline-block w-1.5 h-3.5 align-middle bg-primary/70 animate-pulse" />
                        </div>
                      ) : (
                        <div className="bg-surface-container-lowest p-3 rounded-xl rounded-tl-none border border-outline-variant/30 flex items-center gap-1">
                          <span className="typing-dot w-1.5 h-1.5 rounded-full bg-primary inline-block" />
                          <span className="typing-dot w-1.5 h-1.5 rounded-full bg-primary inline-block" />
                          <span className="typing-dot w-1.5 h-1.5 rounded-full bg-primary inline-block" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="p-3 bg-surface-container-lowest border-t border-outline-variant/50 rounded-b-xl">
                  <div className="flex gap-2 items-center bg-surface-container-low p-1.5 rounded-xl border border-outline-variant">
                    <input
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) { e.preventDefault(); sendChat() } }}
                      disabled={chatLoading}
                      className="flex-grow bg-transparent border-none focus:ring-0 text-sm text-on-surface px-2 h-8 outline-none disabled:opacity-60"
                      placeholder="Ask anything about this profile..."
                      type="text"
                    />
                    <button
                      onClick={sendChat}
                      disabled={chatLoading || !chatInput.trim()}
                      aria-label="Send message"
                      className="bg-primary text-on-primary w-8 h-8 rounded-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
                    >
                      <Send size={15} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </DashboardLayout>
  )
}
