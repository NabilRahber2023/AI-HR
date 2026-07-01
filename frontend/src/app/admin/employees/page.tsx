'use client'
import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { employeesAPI } from '@/lib/api'
import { ChevronLeft, ChevronRight, Users } from 'lucide-react'

const BOX_BADGE: Record<number, string> = {
  1:'bg-red-100 text-red-700', 2:'bg-orange-100 text-orange-700', 3:'bg-yellow-100 text-yellow-700',
  4:'bg-lime-100 text-lime-700', 5:'bg-green-100 text-green-700', 6:'bg-emerald-100 text-emerald-700',
  7:'bg-cyan-100 text-cyan-700', 8:'bg-blue-100 text-blue-700', 9:'bg-indigo-100 text-indigo-700',
}
const LEVEL_BADGE: Record<string, string> = {
  High: 'bg-secondary-container/30 text-on-secondary-container',
  Medium: 'bg-[#ffddb8]/50 text-[#653e00]',
  Low: 'bg-error-container text-on-error-container',
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [skip, setSkip] = useState(0)
  const limit = 50

  useEffect(() => {
    setLoading(true)
    employeesAPI.list(skip, limit)
      .then(r => setEmployees(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [skip])

  return (
    <DashboardLayout adminOnly>
      <div className="p-4 lg:p-8 max-w-[1440px] mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface">Employees</h2>
            <p className="font-body-md text-on-surface-variant">Browse and manage all employee records</p>
          </div>
          <div className="flex items-center gap-2 text-on-surface-variant text-sm">
            <Users size={16} />
            <span>{employees.length} shown</span>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-sm border border-outline-variant overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-surface-container-low border-b border-outline-variant">
                    <tr>
                      {['Worker ID','Name','Department','Role','Performance','Potential','9-Box','KPI','Salary'].map(h => (
                        <th key={h} className="px-4 py-3 text-left font-label-md text-label-md text-on-surface-variant uppercase tracking-wide whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/30">
                    {employees.map(emp => (
                      <tr key={emp.id} className="hover:bg-surface-container-low transition-colors">
                        <td className="px-4 py-3 font-mono text-xs text-on-surface-variant">{emp.worker_id}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container text-xs font-bold flex-shrink-0">
                              {emp.employee_name?.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium text-on-surface">{emp.employee_name}</p>
                              <p className="text-xs text-on-surface-variant">{emp.employee_email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-on-surface-variant">{emp.department}</td>
                        <td className="px-4 py-3 text-on-surface-variant text-xs">{emp.job_role}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${LEVEL_BADGE[emp.performance_level] || 'bg-surface-container text-on-surface'}`}>
                            {emp.performance_level}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${LEVEL_BADGE[emp.potential_level] || 'bg-surface-container text-on-surface'}`}>
                            {emp.potential_level}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {emp.nine_box && (
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${BOX_BADGE[emp.nine_box]}`}>
                              Box {emp.nine_box}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-on-surface-variant">{emp.kpi_score?.toFixed(1)}</td>
                        <td className="px-4 py-3 text-on-surface-variant">${emp.monthly_salary_usd?.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4">
              <button
                onClick={() => setSkip(Math.max(0, skip - limit))}
                disabled={skip === 0}
                className="btn-secondary disabled:opacity-40"
              >
                <ChevronLeft size={16} /> Previous
              </button>
              <span className="text-sm text-on-surface-variant">
                Showing {skip + 1}–{skip + employees.length}
              </span>
              <button
                onClick={() => setSkip(skip + limit)}
                disabled={employees.length < limit}
                className="btn-secondary disabled:opacity-40"
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
