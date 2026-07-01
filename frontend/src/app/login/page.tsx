'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, ArrowRight, Info } from 'lucide-react'
import { authAPI } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'

interface LoginForm { email: string; password: string }

const NineBoxIllustration = () => (
  <div className="relative w-full max-w-[320px] aspect-square p-4 bg-white rounded-xl shadow-sm border border-outline-variant nine-box-grid mx-auto">
    {/* Row 1 - High Potential */}
    <div className="bg-secondary-container/20 rounded flex items-center justify-center">
      <span className="text-3xl">⭐</span>
    </div>
    <div className="bg-secondary-container/40 rounded flex items-center justify-center">
      <span className="text-3xl">📈</span>
    </div>
    <div className="bg-primary-container/60 rounded flex items-center justify-center">
      <span className="text-3xl">🏆</span>
    </div>
    {/* Row 2 - Medium */}
    <div className="bg-[#ffb95f]/30 rounded flex items-center justify-center">
      <span className="text-3xl">👤</span>
    </div>
    <div className="bg-primary/10 rounded flex items-center justify-center">
      <span className="text-3xl">👥</span>
    </div>
    <div className="bg-secondary-fixed-dim/50 rounded flex items-center justify-center">
      <span className="text-3xl">💡</span>
    </div>
    {/* Row 3 - Low Potential */}
    <div className="bg-error-container/40 rounded flex items-center justify-center">
      <span className="text-3xl">⚠️</span>
    </div>
    <div className="bg-surface-variant rounded flex items-center justify-center">
      <span className="text-3xl">⏳</span>
    </div>
    <div className="bg-surface-container-high rounded flex items-center justify-center">
      <span className="text-3xl">🕐</span>
    </div>
    {/* Axis Labels */}
    <div className="absolute -left-8 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] font-bold text-outline uppercase tracking-widest whitespace-nowrap">
      Potential
    </div>
    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] font-bold text-outline uppercase tracking-widest">
      Performance
    </div>
  </div>
)

export default function LoginPage() {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<LoginForm>()
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { setAuth } = useAuthStore()
  const router = useRouter()

  const onSubmit = async (data: LoginForm) => {
    setLoading(true); setError('')
    try {
      const res = await authAPI.login(data)
      const { access_token, role, full_name, user_id } = res.data
      setAuth(access_token, { user_id, full_name, role })
      router.push(role === 'admin' ? '/admin' : '/dashboard')
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Invalid email or password')
    } finally { setLoading(false) }
  }

  return (
    <div className="bg-login-gradient min-h-screen flex items-center justify-center p-4 md:p-8">
      {/* Background blobs */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 opacity-20">
        <div className="absolute top-[10%] left-[5%] w-64 h-64 bg-primary-container rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] right-[5%] w-96 h-96 bg-secondary-container rounded-full blur-[150px]" />
      </div>

      <div className="relative w-full max-w-[1000px] flex flex-col md:flex-row glass-card shadow-2xl rounded-2xl overflow-hidden min-h-[600px]">
        {/* LEFT HERO */}
        <div className="hidden md:flex flex-1 bg-surface-container-low p-12 flex-col justify-between items-center text-center">
          <div className="w-full">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-4xl">🧠</span>
              <h1 className="font-headline-lg text-headline-lg text-primary">HR AI Platform</h1>
            </div>
            <p className="text-title-lg font-title-lg text-on-surface-variant mb-8">9-Box Grid Management System</p>
          </div>

          <NineBoxIllustration />

          <div className="mt-8">
            <h2 className="font-headline-md text-headline-md text-primary mb-2">
              Identify Stars. Develop Talent. Drive Growth.
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant px-4">
              Leverage machine learning to map your workforce and optimize performance through data-driven decisions.
            </p>
            <div className="mt-6 space-y-2 text-left">
              {[
                '🤖 AI-Powered Performance Predictions',
                '📊 Real-Time HR Analytics Dashboard',
                '💬 Conversational AI Career Coach',
              ].map((f) => (
                <div key={f} className="flex items-center gap-2 text-sm text-on-surface-variant">
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT FORM */}
        <div className="flex-1 p-8 md:p-12 lg:p-16 flex flex-col justify-center">
          {/* Mobile logo */}
          <div className="flex md:hidden items-center gap-2 mb-8 justify-center">
            <span className="text-3xl">🧠</span>
            <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-primary">HR AI Platform</h1>
          </div>

          <div className="mb-10 text-center md:text-left">
            <h3 className="font-headline-lg text-headline-lg text-on-surface">Welcome Back</h3>
            <p className="font-body-md text-body-md text-on-surface-variant mt-2">
              Enter your credentials to access the analytics dashboard.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-error-container border border-error/30 text-on-error-container rounded-xl text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block font-label-md text-label-md text-on-surface-variant mb-2">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-outline">✉️</span>
                <input
                  {...register('email', { required: true })}
                  type="email"
                  placeholder="admin@company.com"
                  className="input-field pl-12"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block font-label-md text-label-md text-on-surface-variant mb-2">
                Password
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-outline">🔒</span>
                <input
                  {...register('password', { required: true })}
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="input-field pl-12 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-primary"
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between font-label-md text-label-md">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-outline-variant text-primary" />
                <span className="text-on-surface-variant">Remember me</span>
              </label>
              <a href="#" className="text-primary hover:underline">Forgot password?</a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full group disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center font-body-md text-body-md text-on-surface-variant">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-primary font-bold hover:underline">Sign up</Link>
          </p>

          {/* Demo credentials */}
          <div className="mt-8 p-4 bg-surface-container-high rounded-xl border border-outline-variant">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2 text-primary">
                <Info size={16} />
                <p className="font-label-md text-label-md">Demo Credentials</p>
              </div>
              <button
                type="button"
                id="fill-demo-btn"
                onClick={() => {
                  setValue('email', 'admin@company.com')
                  setValue('password', 'admin123')
                }}
                className="text-xs font-bold text-primary hover:underline bg-primary/10 hover:bg-primary/20 px-2 py-1 rounded transition-colors"
              >
                Fill Demo credential
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { role: 'Administrator', email: 'admin@company.com', pass: 'admin123' },
                { role: 'Standard User', email: 'user@company.com', pass: 'user123' },
              ].map((c) => (
                <div key={c.role} className="bg-white/50 p-3 rounded-lg border border-outline-variant/50">
                  <p className="font-label-sm text-label-sm text-outline uppercase tracking-tight">{c.role}</p>
                  <p className="text-[13px] text-on-surface font-semibold">{c.email}</p>
                  <p className="text-[13px] text-on-surface-variant">Pass: {c.pass}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
