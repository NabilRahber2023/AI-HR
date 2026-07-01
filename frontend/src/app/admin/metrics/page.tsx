'use client'
import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { predictionAPI } from '@/lib/api'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts'
import { RefreshCw, CheckCircle, AlertCircle } from 'lucide-react'

export default function MetricsPage() {
  const [metrics, setMetrics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchMetrics = async () => {
    setLoading(true); setError('')
    try {
      const r = await predictionAPI.metrics()
      setMetrics(r.data)
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Failed to load metrics')
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchMetrics() }, [])

  const metricCards = metrics?.metrics
    ? [
        { label: 'Accuracy',  value: metrics.metrics.accuracy,  color: '#00236f' },
        { label: 'Precision', value: metrics.metrics.precision, color: '#006c49' },
        { label: 'Recall',    value: metrics.metrics.recall,    color: '#f59e0b' },
        { label: 'F1 Score',  value: metrics.metrics.f1,        color: '#4059aa' },
      ]
    : []

  const confMatrix: number[][] = metrics?.metrics?.confusion_matrix || []

  return (
    <DashboardLayout adminOnly>
      <div className="p-4 lg:p-8 max-w-[1440px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface">Model Metrics</h2>
            <p className="font-body-md text-on-surface-variant">
              RandomForest 9-Box Classifier performance report
            </p>
          </div>
          <button onClick={fetchMetrics} className="btn-secondary">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            <span className="font-label-md">Refresh</span>
          </button>
        </div>

        {loading && (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && error && (
          <div className="card bg-[#ffddb8]/20 border-[#f59e0b]/30 flex items-center gap-3">
            <AlertCircle size={20} className="text-[#f59e0b]" />
            <div>
              <p className="font-medium text-on-surface">No Model Trained Yet</p>
              <p className="text-sm text-on-surface-variant">
                Go to <strong>ML Prediction</strong> and click <strong>Train Model</strong> first.
              </p>
            </div>
          </div>
        )}

        {!loading && metrics && !error && (
          <>
            {/* Model Info Card */}
            <div className="card mb-6">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle size={22} className="text-secondary" />
                <div>
                  <h3 className="font-title-lg text-on-surface">{metrics.model_name}</h3>
                  <p className="text-sm text-on-surface-variant">
                    Version {metrics.version} ·{' '}
                    Trained {new Date(metrics.trained_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex justify-between p-3 bg-surface-container-low rounded-lg">
                  <span className="text-on-surface-variant">Training Samples</span>
                  <span className="font-semibold text-on-surface">
                    {metrics.metrics?.training_samples?.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between p-3 bg-surface-container-low rounded-lg">
                  <span className="text-on-surface-variant">Test Samples</span>
                  <span className="font-semibold text-on-surface">
                    {metrics.metrics?.test_samples?.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Metric Score Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {metricCards.map(({ label, value, color }) => (
                <div key={label} className="card text-center">
                  <p className="text-3xl font-bold mb-1" style={{ color }}>
                    {(value * 100).toFixed(1)}%
                  </p>
                  <p className="text-sm text-on-surface-variant mb-2">{label}</p>
                  <div className="h-2 bg-surface-container-high rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${value * 100}%`, backgroundColor: color }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Bar Chart */}
            <div className="card mb-6">
              <h3 className="font-title-lg text-on-surface mb-4">Metrics Overview</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={metricCards}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5eeff" />
                  <XAxis dataKey="label" tick={{ fontSize: 13 }} />
                  <YAxis
                    domain={[0, 1]}
                    tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip formatter={(v: number) => `${(v * 100).toFixed(2)}%`} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {metricCards.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Confusion Matrix */}
            {confMatrix.length > 0 && (
              <div className="card">
                <h3 className="font-title-lg text-on-surface mb-4">
                  Confusion Matrix (9-Box Classes)
                </h3>
                <div className="overflow-x-auto">
                  <table className="text-xs border-collapse w-full min-w-[600px]">
                    <thead>
                      <tr>
                        <th className="p-1.5 text-on-surface-variant font-normal text-left">
                          Pred ↓ / Act →
                        </th>
                        {confMatrix[0].map((_, ci) => (
                          <th
                            key={ci}
                            className="p-1.5 text-center font-semibold text-on-surface-variant w-12"
                          >
                            Box {ci + 1}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {confMatrix.map((row, ri) => {
                        const rowMax = Math.max(...row)
                        return (
                          <tr key={ri}>
                            <td className="p-1.5 font-semibold text-on-surface-variant whitespace-nowrap">
                              Box {ri + 1}
                            </td>
                            {row.map((val, ci) => {
                              const isDiag = ri === ci
                              const intensity = rowMax > 0 ? val / rowMax : 0
                              const bg = isDiag
                                ? `rgba(0,35,111,${Math.min(0.9, intensity * 0.85 + 0.1)})`
                                : val > 0
                                ? `rgba(186,26,26,${Math.min(0.55, intensity * 0.5)})`
                                : 'transparent'
                              return (
                                <td
                                  key={ci}
                                  className="p-1.5 text-center w-12 h-10 font-medium rounded transition-all"
                                  style={{
                                    backgroundColor: bg,
                                    color: isDiag && intensity > 0.4 ? '#fff' : '#0b1c30',
                                  }}
                                >
                                  {val}
                                </td>
                              )
                            })}
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-on-surface-variant mt-3">
                  🔵 Blue diagonal = correct predictions &nbsp;·&nbsp; 🔴 Red off-diagonal = misclassifications
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
