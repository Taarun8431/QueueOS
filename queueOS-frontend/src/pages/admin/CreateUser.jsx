import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { User, Mail, Phone, Lock, Tag } from 'lucide-react'
import PageHeader from '../../components/PageHeader'
import api from '../../api'

export default function CreateUser() {
  const navigate = useNavigate()
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm()

  const onSubmit = async (data) => {
    try {
      await api.post('/auth/admin/create-user', {
        name: data.name,
        email: data.email,
        password: data.password,
        phone: data.phone,
        role: data.role,
      })
      toast.success(`${data.role} account created for ${data.name}`)
      reset()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create user')
    }
  }

  return (
    <div className="max-w-lg">
      <PageHeader
        title="Create User"
        subtitle="Create owner or staff accounts"
        action={
          <button onClick={() => navigate('/admin/users')} className="btn-secondary text-sm">
            ← Back
          </button>
        }
      />

      <div className="card">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" className={`input-field pl-9 ${errors.name ? 'border-red-400' : ''}`}
                placeholder="John Doe"
                {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Min 2 characters' } })} />
            </div>
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="email" className={`input-field pl-9 ${errors.email ? 'border-red-400' : ''}`}
                placeholder="user@example.com"
                {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' } })} />
            </div>
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
            <div className="relative">
              <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="tel" className={`input-field pl-9 ${errors.phone ? 'border-red-400' : ''}`}
                placeholder="555-0100"
                {...register('phone', { required: 'Phone is required' })} />
            </div>
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="password" className={`input-field pl-9 ${errors.password ? 'border-red-400' : ''}`}
                placeholder="Min 6 characters"
                {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })} />
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
            <div className="relative">
              <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <select className={`input-field pl-9 ${errors.role ? 'border-red-400' : ''}`}
                {...register('role', { required: 'Role is required' })}>
                <option value="">Select a role</option>
                <option value="owner">Owner</option>
                <option value="staff">Staff</option>
              </select>
            </div>
            {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role.message}</p>}
          </div>

          <div className="pt-2 bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
            The user will receive their credentials and can log in immediately. Make sure to share the password securely.
          </div>

          <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-2.5">
            {isSubmitting ? 'Creating...' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  )
}
