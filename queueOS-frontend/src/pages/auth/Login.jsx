import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../../context/AuthContext'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'
import { useState } from 'react'
import { motion } from 'framer-motion'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [showPass, setShowPass] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm()

  const onSubmit = async (data) => {
    try {
      const user = await login(data.email, data.password)
      toast.success(`Welcome back, ${user.name}!`)
      navigate(`/${user.role}/dashboard`)
    } catch (err) {
      // The global error handler in api.js will catch the toast error if it fails
      if (!err.response) toast.error('Invalid credentials. Please try again.')
    }
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-xs font-bold uppercase tracking-widest text-indigo-600"
        >
          Welcome Back
        </motion.p>
        <motion.h2 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-4xl font-black text-slate-900 tracking-tight"
        >
          Sign in
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-slate-500 font-medium"
        >
          Secure access to your QueueOS workspace.
        </motion.p>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, type: "spring" }}
        className="rounded-[2rem] bg-indigo-50/50 p-6 border border-indigo-100"
      >
        <div className="flex items-start gap-4">
          <div className="mt-1 h-2 w-2 rounded-full bg-indigo-500 animate-pulse shrink-0" />
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-indigo-800 mb-1">Demo Access Available</p>
            <p className="text-sm text-indigo-900/80 leading-relaxed mb-3">You can log in using any of the preset roles:</p>
            <div className="flex flex-wrap gap-2">
              {['admin', 'owner', 'staff', 'customer'].map(role => (
                <span key={role} className="inline-flex items-center rounded-lg bg-white px-2 py-1 text-xs font-semibold text-indigo-700 shadow-sm border border-indigo-100">
                  {role}@demo.com
                </span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      <motion.form 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        onSubmit={handleSubmit(onSubmit)} 
        className="space-y-5"
      >
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
          <div className="relative">
            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="email"
              autoComplete="username"
              placeholder="you@example.com"
              className={`input-field pl-12 bg-white ${errors.email ? 'border-rose-400 focus:ring-rose-400' : ''}`}
              {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' } })}
            />
          </div>
          {errors.email && <p className="mt-2 text-xs font-medium text-rose-500">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
          <div className="relative">
            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type={showPass ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              className={`input-field pl-12 pr-12 bg-white ${errors.password ? 'border-rose-400 focus:ring-rose-400' : ''}`}
              {...register('password', { required: 'Password is required', minLength: { value: 4, message: 'Min 4 characters' } })}
            />
            <button
              type="button"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
              onClick={() => setShowPass(!showPass)}
            >
              {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && <p className="mt-2 text-xs font-medium text-rose-500">{errors.password.message}</p>}
        </div>

        <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-3.5 text-base mt-2">
          {isSubmitting ? 'Authenticating...' : 'Sign In'}
        </button>
      </motion.form>

      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="text-center text-sm font-medium text-slate-500"
      >
        Don't have an account?{' '}
        <Link to="/register" className="text-indigo-600 hover:text-indigo-700 hover:underline">
          Create account
        </Link>
      </motion.p>
    </div>
  )
}
