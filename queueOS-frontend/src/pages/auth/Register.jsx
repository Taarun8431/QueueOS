import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Eye, EyeOff, Mail, Lock, User, Phone } from 'lucide-react'
import { useState } from 'react'

export default function Register() {
  const navigate = useNavigate()
  const [showPass, setShowPass] = useState(false)
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm()
  const password = watch('password')

  const onSubmit = async (data) => {
    // Simulate registration success
    toast.success('Account created successfully! Please sign in.')
    navigate('/login')
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">Create account</h2>
      <p className="text-gray-500 text-sm mb-6">Join QueueOS to manage queues smarter</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <div className="relative">
            <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="John Doe"
              className={`input-field pl-9 ${errors.name ? 'border-red-400' : ''}`}
              {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Min 2 characters' } })}
            />
          </div>
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <div className="relative">
            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              placeholder="you@example.com"
              className={`input-field pl-9 ${errors.email ? 'border-red-400' : ''}`}
              {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' } })}
            />
          </div>
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
          <div className="relative">
            <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="tel"
              placeholder="+1 555-0100"
              className={`input-field pl-9 ${errors.phone ? 'border-red-400' : ''}`}
              {...register('phone', { required: 'Phone is required', pattern: { value: /^[0-9+\-\s()]{7,15}$/, message: 'Invalid phone number' } })}
            />
          </div>
          {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type={showPass ? 'text' : 'password'}
              placeholder="••••••••"
              className={`input-field pl-9 pr-10 ${errors.password ? 'border-red-400' : ''}`}
              {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'Min 8 characters' } })}
            />
            <button type="button" onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="password"
              placeholder="••••••••"
              className={`input-field pl-9 ${errors.confirmPassword ? 'border-red-400' : ''}`}
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: v => v === password || 'Passwords do not match'
              })}
            />
          </div>
          {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
        </div>

        <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-2.5 text-sm">
          {isSubmitting ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Already have an account?{' '}
        <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">Sign in</Link>
      </p>
    </div>
  )
}
