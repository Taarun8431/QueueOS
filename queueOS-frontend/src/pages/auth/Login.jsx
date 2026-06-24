import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../../context/AuthContext'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'
import { useState } from 'react'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [showPass, setShowPass] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm()

  const onSubmit = async (data) => {
    try {
      const user =await login(data.email, data.password)
      toast.success(`Welcome back, ${user.name}!`)
      navigate(`/${user.role}/dashboard`)
    } catch (err) {
      toast.error('Invalid credentials. Please try again.')
    }
  }

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary-600">Welcome back</p>
        <h2 className="text-3xl font-black text-slate-900">Sign in to QueueOS</h2>
        <p className="max-w-xl text-sm text-slate-500">Access your dashboard, manage queues, and stay on top of appointments with a polished workflow.</p>
      </div>

      <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5 shadow-sm">
        <div className="rounded-[1.5rem] bg-white p-5 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl bg-blue-50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-blue-600">Demo access</p>
              <p className="mt-3 text-sm text-slate-600">Use any of these demo accounts to preview the full experience.</p>
              <ul className="mt-4 space-y-2 text-sm text-slate-700">
                <li>customer@demo.com</li>
                <li>owner@demo.com</li>
                <li>staff@demo.com</li>
                <li>admin@demo.com</li>
              </ul>
            </div>
            <div className="rounded-3xl bg-slate-900 p-4 text-white shadow-inner">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Fast access</p>
              <p className="mt-3 text-sm leading-6 text-slate-200">QueueOS is built for quick queue onboarding, real-time staff tools, and a clean customer journey.</p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 rounded-[1.75rem] bg-white p-8 shadow-[0_25px_80px_-40px_rgba(15,23,42,0.16)]">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
          <div className="relative">
            <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="email"
              placeholder="you@example.com"
              className={`input-field pl-12 ${errors.email ? 'border-red-400 focus:ring-red-400' : ''}`}
              {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' } })}
            />
          </div>
          {errors.email && <p className="mt-2 text-xs text-red-500">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
          <div className="relative">
            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type={showPass ? 'text' : 'password'}
              placeholder="••••••••"
              className={`input-field pl-12 pr-14 ${errors.password ? 'border-red-400 focus:ring-red-400' : ''}`}
              {...register('password', { required: 'Password is required', minLength: { value: 4, message: 'Min 4 characters' } })}
            />
            <button
              type="button"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              onClick={() => setShowPass(!showPass)}
            >
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && <p className="mt-2 text-xs text-red-500">{errors.password.message}</p>}
        </div>

        <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-3 text-sm">
          {isSubmitting ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <p className="text-center text-sm text-slate-500">
        Don't have an account?{' '}
        <Link to="/register" className="font-semibold text-primary-600 hover:text-primary-700">Create account</Link>
      </p>
    </div>
  )
}
