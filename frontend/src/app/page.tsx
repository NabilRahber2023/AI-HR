'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import LandingPage from '@/components/landing/LandingPage'

export default function Home() {
  const router = useRouter()
  const { isAuthenticated, user } = useAuthStore()

  // Authenticated users skip the marketing page and go straight to their workspace.
  useEffect(() => {
    if (isAuthenticated && user) {
      router.replace(user.role === 'admin' ? '/admin' : '/dashboard')
    }
  }, [isAuthenticated, user, router])

  return <LandingPage />
}
