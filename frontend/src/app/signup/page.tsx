'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { authAPI } from '@/lib/api'

interface SignupForm { full_name: string; email: string; password: string; role: string }

export default function SignupPage() {
  const { register, handleSubmit } = useForm<SignupForm>({ defaultValues: { role: 'user' } })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const onSubmit = async (data: SignupForm) => {
    setLoading(true); setError('')
    try {
      await authAPI.signup(data)
      router.push('/login')
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Signup failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="bg-login-gradient min-h-screen flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-md glass-card shadow-2xl rounded-2xl p-8 md:p-12">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center gap-2 mb-4">
            <span className="text-4xl">🧠</span>
            <h1 className="font-headline-lg text-headline-lg text-primary">HR AI Platform</h1>
          </div>
          <h2 className="font-headline-md text-headline-md text-on-surface">Create Account</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">Join the HR AI Platform</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-error-container text-on-error-container rounded-xl text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {[
            { name: 'full_name', label: 'Full Name', type: 'text', placeholder: 'John Doe' },
            { name: 'email', label: 'Email Address', type: 'email', placeholder: 'you@company.com' },
            { name: 'password', label: 'Password', type: 'password', placeholder: 'Min 6 characters' },
          ].map(({ name, label, type, placeholder }) => (
            <div key={name}>
              <label className="block font-label-md text-label-md text-on-surface-variant mb-2">{label}</label>
              <input
                {...register(name as any, { required: true })}
                type={type}
                placeholder={placeholder}
                className="input-field"
              />
            </div>
          ))}

          <div>
            <label className="block font-label-md text-label-md text-on-surface-variant mb-2">Role</label>
            <select {...register('role')} className="input-field">
              <option value="user">Employee</option>
              <option value="admin">Administrator</option>
            </select>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-center font-body-md text-body-md text-on-surface-variant">
          Already have an account?{' '}
          <Link href="/login" className="text-primary font-bold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
