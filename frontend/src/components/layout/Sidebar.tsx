'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import {
  LayoutDashboard, Users, Search, Brain, BarChart3,
  MessageSquare, Upload, LogOut, Activity,
} from 'lucide-react'

const adminLinks = [
  { href: '/admin', label: 'Admin Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/upload', label: 'Upload CSV', icon: Upload },
  { href: '/admin/employees', label: 'Employees', icon: Users },
  { href: '/admin/search', label: 'Employee Search', icon: Search },
  { href: '/admin/prediction', label: 'ML Prediction', icon: Brain },
  { href: '/admin/metrics', label: 'Model Metrics', icon: BarChart3 },
  { href: '/admin/chatbot', label: 'AI Chatbot', icon: MessageSquare },
]

const userLinks = [
  { href: '/dashboard', label: 'My Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/chatbot', label: 'AI Chatbot', icon: MessageSquare },
]

export default function Sidebar({
  mobileOpen = false,
  onClose,
}: {
  mobileOpen?: boolean
  onClose?: () => void
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const isAdmin = user?.role === 'admin'
  const links = isAdmin ? adminLinks : userLinks

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href)

  const handleLogout = () => {
    onClose?.()
    logout()
    router.push('/login')
  }

  return (
    <aside
      className={`fixed left-0 top-0 h-full w-[260px] flex flex-col bg-primary shadow-xl z-[60] transition-transform duration-300 lg:translate-x-0 ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
    >
      {/* Logo */}
      <div className="px-6 pt-10 mb-8">
        <div className="flex items-center gap-2">
          <Activity size={28} className="text-on-primary" />
          <span className="font-headline-md text-headline-md font-black text-on-primary">AI HR</span>
        </div>
        <p className="text-xs text-primary-fixed-dim mt-1">9-Box Grid Platform</p>
      </div>

      {/* Nav */}
      <nav className="flex flex-col px-4 space-y-1 flex-1">
        {links.map(({ href, label, icon: Icon, exact }) => (
          <Link
            key={href}
            href={href}
            onClick={onClose}
            className={isActive(href, exact) ? 'nav-link-active' : 'nav-link'}
          >
            <Icon size={18} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>

      {/* User info */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 p-3 bg-on-primary-fixed-variant/10 rounded-xl mb-3">
          <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-bold text-sm">
            {user?.full_name?.charAt(0) || 'U'}
          </div>
          <div className="overflow-hidden">
            <p className="font-label-md text-label-md text-on-primary truncate">{user?.full_name}</p>
            <p className="text-[10px] text-primary-fixed-dim truncate">
              {isAdmin ? 'Administrator' : 'Employee'}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-primary-fixed-dim hover:text-on-primary hover:bg-red-500/20 rounded-lg transition-all text-sm"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}
