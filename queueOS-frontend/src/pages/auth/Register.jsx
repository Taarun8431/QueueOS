import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Eye, EyeOff, Mail, Lock, User, Phone } from 'lucide-react'
import { useState } from 'react'
import api from '../../api'


export default function Register() {
  const navigate = useNavigate()
  const [showPass, setShowPass] = useState(false)
  const [role, setRole] = useState('customer')
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm()
  const password = watch('password')

  const onSubmit = async (data) => {
    try {
      await api.post('/auth/register', {
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
        role: role,
      })
      toast.success('Account created! Please sign in.')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    }
  }

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary-600">Join QueueOS</p>
        <h2 className="text-3xl font-black text-slate-900">Create your account</h2>
        <p className="max-w-xl text-sm text-slate-500">Register once and manage customers, appointments, and queue flow from one polished dashboard.</p>
      </div>

      <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl bg-emerald-50 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-600">Quick start</p>
            <p className="mt-3 text-sm text-slate-700">Use a demo email to preview the system without setting up a backend.</p>
          </div>
          <div className="rounded-3xl bg-slate-900 p-4 text-white shadow-inner">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Secure by design</p>
            <p className="mt-3 text-sm leading-6 text-slate-200">All account actions feel modern and confident with strong validations.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 rounded-[1.75rem] bg-white p-8 shadow-[0_25px_80px_-40px_rgba(15,23,42,0.16)]">
        <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1 mb-6">
          <button
            type="button"
            onClick={() => setRole('customer')}
            className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all ${role === 'customer' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Customer
          </button>
          <button
            type="button"
            onClick={() => setRole('owner')}
            className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all ${role === 'owner' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Business Owner
          </button>

        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
          <div className="relative">
            <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="John Doe"
              className={`input-field pl-12 ${errors.name ? 'border-red-400' : ''}`}
              {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Min 2 characters' } })}
            />
          </div>
          {errors.name && <p className="mt-2 text-xs text-red-500">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
          <div className="relative">
            <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="email"
              placeholder="you@example.com"
              className={`input-field pl-12 ${errors.email ? 'border-red-400' : ''}`}
              {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' } })}
            />
          </div>
          {errors.email && <p className="mt-2 text-xs text-red-500">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Phone Number</label>
          <div className="relative">
            <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="tel"
              placeholder="+1 555-0100"
              className={`input-field pl-12 ${errors.phone ? 'border-red-400' : ''}`}
              {...register('phone', { required: 'Phone is required', pattern: { value: /^[0-9+\-\s()]{7,15}$/, message: 'Invalid phone number' } })}
            />
          </div>
          {errors.phone && <p className="mt-2 text-xs text-red-500">{errors.phone.message}</p>}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                className={`input-field pl-12 pr-14 ${errors.password ? 'border-red-400' : ''}`}
                {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'Min 8 characters' } })}
              />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="mt-2 text-xs text-red-500">{errors.password.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Confirm Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                placeholder="••••••••"
                className={`input-field pl-12 ${errors.confirmPassword ? 'border-red-400' : ''}`}
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: v => v === password || 'Passwords do not match'
                })}
              />
            </div>
            {errors.confirmPassword && <p className="mt-2 text-xs text-red-500">{errors.confirmPassword.message}</p>}
          </div>
        </div>

        <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-3 text-sm">
          {isSubmitting ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <p className="text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700">Sign in</Link>
      </p>
    </div>
  )
}
