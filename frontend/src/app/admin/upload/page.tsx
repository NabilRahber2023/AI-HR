'use client'
import { useState, useRef } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { employeesAPI } from '@/lib/api'
import { Upload, CheckCircle, XCircle, FileText, Brain } from 'lucide-react'

const REQUIRED_COLS = [
  'worker_id','employee_name','employee_email','age','gender','department','job_role','join_date',
  'years_of_experience','monthly_salary_usd','avg_monthly_attendance_percent','late_arrival_count',
  'absent_days_last_6_months','overtime_hours_monthly','kpi_score','goal_completion_percent',
  'task_completion_rate','manager_feedback_score','training_hours','certifications_count',
  'skill_assessment_score','leadership_assessment_score',
]

// Predicted by the system from the metrics above — no need to include these.
const PREDICTED_COLS = ['performance_level', 'potential_level', 'nine_box']

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = (f: File | undefined) => {
    if (!f) return
    if (!f.name.endsWith('.csv')) { setError('Only .csv files are accepted'); return }
    setFile(f); setResult(null); setError('')
  }

  const handleUpload = async () => {
    if (!file) return
    setLoading(true); setError(''); setResult(null)
    try {
      const fd = new FormData(); fd.append('file', file)
      const res = await employeesAPI.uploadCSV(fd)
      setResult(res.data)
    } catch (e: any) {
      const d = e.response?.data?.detail
      setError(typeof d === 'object' ? JSON.stringify(d.validation_errors, null, 2) : d || 'Upload failed')
    } finally { setLoading(false) }
  }

  return (
    <DashboardLayout adminOnly>
      <div className="p-4 lg:p-8 max-w-[1440px] mx-auto">
        <div className="mb-8">
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Upload Dataset</h2>
          <p className="font-body-md text-on-surface-variant">Upload a CSV file with employee data to populate the system</p>
        </div>

        <div className="max-w-2xl space-y-6">
          {/* Drop Zone */}
          <div
            className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center bg-white/50 hover:bg-white transition-colors cursor-pointer group ${
              dragOver ? 'border-primary bg-primary/5' : 'border-outline'
            }`}
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]) }}
          >
            <Upload size={40} className={`mb-3 group-hover:scale-110 transition-transform ${dragOver ? 'text-primary' : 'text-outline'}`} />
            {file ? (
              <div className="text-center">
                <p className="font-semibold text-on-surface">{file.name}</p>
                <p className="text-sm text-on-surface-variant">{(file.size / 1024).toFixed(1)} KB</p>
                <div className="mt-2 flex items-center gap-1 text-secondary text-sm"><CheckCircle size={16} /><span>Ready to upload</span></div>
              </div>
            ) : (
              <div className="text-center">
                <p className="font-medium text-on-surface-variant">Drop CSV file or click to browse</p>
                <p className="text-sm text-outline mt-1">Only .csv files are accepted</p>
              </div>
            )}
            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
          </div>

          {file && (
            <button onClick={handleUpload} disabled={loading} className="btn-primary w-full disabled:opacity-60">
              <Upload size={18} />
              {loading ? 'Uploading & Validating...' : 'Upload & Validate'}
            </button>
          )}

          {result && (
            <div className="card bg-secondary-container/10 border-secondary/30">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle size={20} className="text-secondary" />
                <h3 className="font-title-lg text-secondary">Upload Successful!</h3>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Inserted', value: result.inserted, color: 'text-secondary' },
                  { label: 'Skipped', value: result.skipped, color: 'text-[#f59e0b]' },
                  { label: 'Warnings', value: result.errors?.length || 0, color: 'text-error' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="text-center p-3 bg-white rounded-lg">
                    <p className={`text-2xl font-bold ${color}`}>{value}</p>
                    <p className="text-xs text-on-surface-variant">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="card bg-error-container border-error/30">
              <div className="flex items-center gap-2 mb-2">
                <XCircle size={20} className="text-error" />
                <h3 className="font-title-lg text-on-error-container">Validation Failed</h3>
              </div>
              <pre className="text-xs text-on-error-container whitespace-pre-wrap">{error}</pre>
            </div>
          )}

          {/* Required Columns */}
          <div className="card">
            <div className="flex items-center gap-2 mb-3">
              <FileText size={18} className="text-primary" />
              <h3 className="font-title-lg text-on-surface">Required CSV Columns</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {REQUIRED_COLS.map((col) => (
                <span key={col} className="text-xs bg-surface-container-high text-primary px-2 py-1 rounded font-mono">
                  {col}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2 mt-5 mb-3">
              <Brain size={16} className="text-secondary" />
              <h3 className="font-title-lg text-on-surface">Predicted by the System</h3>
            </div>
            <p className="text-xs text-on-surface-variant mb-2">
              You do <strong>not</strong> need these in your CSV — they are predicted from the metrics above for every employee:
            </p>
            <div className="flex flex-wrap gap-2">
              {PREDICTED_COLS.map((col) => (
                <span key={col} className="text-xs bg-secondary-container/30 text-on-secondary-container px-2 py-1 rounded font-mono">
                  {col}
                </span>
              ))}
            </div>

            <p className="text-xs text-on-surface-variant mt-4">
              💡 Use the included <code className="bg-surface-container-high px-1 rounded">data/synthetic_employees.csv</code> file to test.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
