'use client'
import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { authAPI } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import Link from 'next/link'

const BOX_STYLES: Record<number, string> = {
  1:'bg-red-500', 2:'bg-orange-500', 3:'bg-yellow-500',
  4:'bg-lime-500', 5:'bg-green-500', 6:'bg-emerald-500',
  7:'bg-cyan-500', 8:'bg-blue-500', 9:'bg-indigo-500',
}
const BOX_LABELS: Record<number, string> = {
  1:'Underperformer', 2:'Solid but Limited', 3:'Trusted Professional',
  4:'Inconsistent Player', 5:'Core Contributor', 6:'High Performer',
  7:'Emerging Talent', 8:'Future Leader', 9:'Star Performer',
}

export default function UserDashboard() {
  const { user } = useAuthStore()
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    authAPI.me().then(r => setProfile(r.data)).catch(() => {})
  }, [])

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-8 max-w-3xl space-y-6">
        {/* Header */}
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">My Dashboard</h2>
          <p className="font-body-md text-on-surface-variant">Your personal performance overview</p>
        </div>

        {/* Profile Card */}
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-on-primary text-2xl font-bold">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1">
              <h3 className="font-headline-md text-headline-md text-on-surface">{user?.full_name}</h3>
              <p className="text-sm text-on-surface-variant">{profile?.email}</p>
              <span className="inline-block mt-1 text-xs bg-primary-container/20 text-on-primary-container px-2 py-0.5 rounded-full font-medium">
                {user?.role === 'admin' ? 'Administrator' : 'Employee'}
              </span>
            </div>
          </div>
        </div>

        {/* 9-Box Overview */}
        <div id="ninebox-overview" className="card scroll-mt-20">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">🧠</span>
            <h3 className="font-title-lg text-on-surface">9-Box Grid System Overview</h3>
          </div>
          <p className="text-sm text-on-surface-variant mb-4">
            The 9-Box Grid evaluates employees on two dimensions:{' '}
            <strong>Performance</strong> (current delivery) and{' '}
            <strong>Potential</strong> (future capability).
          </p>
          <div className="grid grid-cols-3 gap-2">
            {[9,8,7,6,5,4,3,2,1].map(box => (
              <div
                key={box}
                className={`p-2 rounded-lg text-white text-center ${BOX_STYLES[box]}`}
              >
                <div className="font-bold text-sm">Box {box}</div>
                <div className="text-xs opacity-80 mt-0.5 leading-tight">{BOX_LABELS[box]}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="card">
          <h3 className="font-title-lg text-on-surface mb-3">Quick Links</h3>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/chatbot"
              className="p-4 rounded-xl bg-primary text-on-primary hover:opacity-90 transition-opacity block"
            >
              <p className="font-semibold">💬 AI Chatbot</p>
              <p className="text-xs opacity-80 mt-1">Get career advice</p>
            </Link>
            <a
              href="#ninebox-overview"
              className="p-4 rounded-xl bg-surface-container-high text-on-surface hover:bg-surface-container transition-colors block"
            >
              <p className="font-semibold">📊 About 9-Box</p>
              <p className="text-xs text-on-surface-variant mt-1">Learn the framework</p>
            </a>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
