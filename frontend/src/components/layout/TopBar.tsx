'use client'
import { Menu } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

export default function TopBar({ onMenuClick }: { onMenuClick?: () => void }) {
  const { user } = useAuthStore()
  return (
    <header className="flex lg:hidden justify-between items-center px-4 h-16 w-full z-50 bg-surface border-b border-outline-variant shadow-sm fixed top-0">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="text-primary">
          <Menu size={24} />
        </button>
        <h1 className="font-headline-md text-headline-md font-bold text-primary">HR AI Platform</h1>
      </div>
      <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-bold text-sm">
        {user?.full_name?.charAt(0) || 'U'}
      </div>
    </header>
  )
}
