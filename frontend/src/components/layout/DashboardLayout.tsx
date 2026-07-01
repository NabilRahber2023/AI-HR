'use client'
import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/store/authStore'
import Sidebar from './Sidebar'
import TopBar from './TopBar'

export default function DashboardLayout({
  children,
  adminOnly = false,
}: {
  children: React.ReactNode
  adminOnly?: boolean
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, user } = useAuthStore()
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) { router.replace('/login'); return }
    if (adminOnly && user?.role !== 'admin') router.replace('/dashboard')
  }, [isAuthenticated, user, adminOnly, router])

  if (!isAuthenticated) return null

  const chatHref = user?.role === 'admin' ? '/admin/chatbot' : '/chatbot'
  const onChatbot = pathname === chatHref

  return (
    <div className="flex min-h-screen bg-background text-on-surface">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <TopBar onMenuClick={() => setMobileOpen(true)} />

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-[55] lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <main className="flex-1 lg:ml-[260px] pt-16 lg:pt-0 min-w-0">
        {children}
      </main>

      {/* Floating shortcut to the AI assistant (hidden while already on it) */}
      {!onChatbot && (
        <Link
          href={chatHref}
          aria-label="Open AI Assistant"
          className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-on-primary rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-transform z-40"
        >
          <span className="text-2xl">🤖</span>
        </Link>
      )}
    </div>
  )
}
