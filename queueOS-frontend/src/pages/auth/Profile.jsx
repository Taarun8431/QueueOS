import { useForm } from 'react-hook-form'
import { useAuth } from '../../context/AuthContext'
import { toast } from 'react-toastify'
import { User, Phone, Calendar, Mail, Save } from 'lucide-react'
import PageHeader from '../../components/PageHeader'
import api from '../../api'


export default function Profile() {
  const { user, updateProfile } = useAuth()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
      dob: user?.dob || '',
    }
  })

  const onSubmit = async (data) => {
    try {
      const res = await api.put('/auth/profile', {
        name: data.name,
        dob: data.dob,
      })
      updateProfile(res.data.data)
      toast.success('Profile updated successfully!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed')
    }
  }


  return (
    <div className="max-w-2xl">
      <PageHeader title="My Profile" subtitle="Manage your personal information" />

      <div className="card">
        {/* Avatar */}
        <div className="flex items-center gap-4 pb-6 mb-6 border-b border-gray-100">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-primary-600">{user?.name?.charAt(0)}</span>
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-lg">{user?.name}</p>
            <p className="text-gray-500 text-sm">{user?.email}</p>
            <span className="mt-1 inline-block text-xs font-medium px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full capitalize">
              {user?.role}
            </span>
          </div>
        </div>

        {/* Email (read-only) */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
          <div className="relative">
            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={user?.email} disabled
              className="input-field pl-9 bg-gray-50 text-gray-500 cursor-not-allowed" />
          </div>
          <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                className={`input-field pl-9 ${errors.name ? 'border-red-400' : ''}`}
                {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Min 2 characters' } })}
              />
            </div>
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <div className="relative">
              <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="tel"
                className={`input-field pl-9 ${errors.phone ? 'border-red-400' : ''}`}
                {...register('phone', { pattern: { value: /^[0-9+\-\s()]{7,15}$/, message: 'Invalid phone' } })}
              />
            </div>
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
            <div className="relative">
              <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="date"
                className="input-field pl-9"
                {...register('dob')}
              />
            </div>
          </div>

          <div className="pt-2">
            <button type="submit" disabled={isSubmitting}
              className="btn-primary flex items-center gap-2">
              <Save size={16} />
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
