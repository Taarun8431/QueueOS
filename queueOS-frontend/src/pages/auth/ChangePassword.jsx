import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import PageHeader from '../../components/PageHeader'
import api from '../../api'

export default function ChangePassword() {
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const { register, handleSubmit, watch, reset, formState: { errors, isSubmitting } } = useForm()
  const newPass = watch('newPassword')

  const onSubmit = async (data) => {
    try {
      await api.put('/auth/change-password', {
        oldPassword: data.currentPassword,
        newPassword: data.newPassword,
      })
      toast.success('Password changed successfully!')
      reset()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password')
    }
  }


  return (
    <div className="max-w-md">
      <PageHeader title="Change Password" subtitle="Keep your account secure with a strong password" />

      <div className="card">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
          <div className="p-2 bg-primary-50 rounded-lg">
            <ShieldCheck size={20} className="text-primary-600" />
          </div>
          <div>
            <p className="font-medium text-gray-800 text-sm">Password Security</p>
            <p className="text-gray-400 text-xs">Use at least 8 characters with mixed types</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showCurrent ? 'text' : 'password'}
                placeholder="••••••••"
                className={`input-field pl-9 pr-10 ${errors.currentPassword ? 'border-red-400' : ''}`}
                {...register('currentPassword', { required: 'Current password is required' })}
              />
              <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.currentPassword && <p className="text-red-500 text-xs mt-1">{errors.currentPassword.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showNew ? 'text' : 'password'}
                placeholder="••••••••"
                className={`input-field pl-9 pr-10 ${errors.newPassword ? 'border-red-400' : ''}`}
                {...register('newPassword', {
                  required: 'New password is required',
                  minLength: { value: 8, message: 'Min 8 characters' },
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                    message: 'Must include uppercase, lowercase, and a number'
                  }
                })}
              />
              <button type="button" onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.newPassword && <p className="text-red-500 text-xs mt-1">{errors.newPassword.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                placeholder="••••••••"
                className={`input-field pl-9 ${errors.confirmPassword ? 'border-red-400' : ''}`}
                {...register('confirmPassword', {
                  required: 'Please confirm your new password',
                  validate: v => v === newPass || 'Passwords do not match'
                })}
              />
            </div>
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
          </div>

          <div className="pt-2">
            <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-2.5">
              {isSubmitting ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
