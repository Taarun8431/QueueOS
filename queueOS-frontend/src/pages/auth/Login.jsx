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
      const user = login(data.email, data.password)
      toast.success(`Welcome back, ${user.name}!`)
      navigate(`/${user.role}/dashboard`)
    } catch (err) {
      toast.error('Invalid credentials. Please try again.')
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">Sign in</h2>
      <p className="text-gray-500 text-sm mb-6">Enter your credentials to access your account</p>

      {/* Demo hint */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6 text-xs text-blue-700">
        <p className="font-semibold mb-1">Demo Accounts:</p>
        <p>customer@demo.com · owner@demo.com · staff@demo.com · admin@demo.com</p>
        <p className="mt-0.5 text-blue-500">Any password works</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <div className="relative">
            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              placeholder="you@example.com"
              className={`input-field pl-9 ${errors.email ? 'border-red-400 focus:ring-red-400' : ''}`}
              {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' } })}
            />
          </div>
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type={showPass ? 'text' : 'password'}
              placeholder="••••••••"
              className={`input-field pl-9 pr-10 ${errors.password ? 'border-red-400 focus:ring-red-400' : ''}`}
              {...register('password', { required: 'Password is required', minLength: { value: 4, message: 'Min 4 characters' } })}
            />
            <button type="button" onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
        </div>

        <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-2.5 text-sm">
          {isSubmitting ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Don't have an account?{' '}
        <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">Sign up</Link>
      </p>
    </div>
  )
}
