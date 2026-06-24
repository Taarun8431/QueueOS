import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Building2, Mail, Phone, MapPin, Clock, FileText, Tag, ArrowLeft } from 'lucide-react'
import PageHeader from '../../components/PageHeader'
import api from '../../api'

const CATEGORIES = ['hospital', 'salon', 'bank', 'government_office', 'service_center']
const CATEGORY_LABELS = { hospital: 'Hospital', salon: 'Salon', bank: 'Bank', government_office: 'Government Office', service_center: 'Service Center' }

export default function CreateBusiness() {
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { openingTime: '09:00', closingTime: '18:00' }
  })

  const onSubmit = async (data) => {
    try {
      await api.post('/business', {
        businessName: data.name,
        businessEmail: data.email,
        phone: data.phone,
        category: data.category,
        address: data.address,
        description: data.description,
        workingHours: { open: data.openingTime, close: data.closingTime },
      })
      toast.success(`"${data.name}" created successfully!`)
      navigate('/owner/businesses')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create business')
    }
  }

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Create Business"
        subtitle="Fill in the details to register a new business"
        action={
          <button onClick={() => navigate('/owner/businesses')}
            className="btn-secondary flex items-center gap-2 text-sm">
            <ArrowLeft size={14} /> Back
          </button>
        }
      />
      <div className="card">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Business Name *</label>
            <div className="relative">
              <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="e.g. City Medical Center"
                className={`input-field pl-9 ${errors.name ? 'border-red-400' : ''}`}
                {...register('name', { required: 'Business name is required', minLength: { value: 3, message: 'Min 3 characters' } })} />
            </div>
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
            <div className="relative">
              <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <select className={`input-field pl-9 ${errors.category ? 'border-red-400' : ''}`}
                {...register('category', { required: 'Please select a category' })}>
                <option value="">Select a category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
              </select>
            </div>
            {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business Email *</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="email" placeholder="contact@business.com"
                  className={`input-field pl-9 ${errors.email ? 'border-red-400' : ''}`}
                  {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' } })} />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="tel" placeholder="555-0100"
                  className={`input-field pl-9 ${errors.phone ? 'border-red-400' : ''}`}
                  {...register('phone', { required: 'Phone is required' })} />
              </div>
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
            <div className="relative">
              <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="123 Main Street, City"
                className={`input-field pl-9 ${errors.address ? 'border-red-400' : ''}`}
                {...register('address', { required: 'Address is required' })} />
            </div>
            {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <div className="relative">
              <FileText size={16} className="absolute left-3 top-3 text-gray-400" />
              <textarea rows={3} placeholder="Describe your business..." className="input-field pl-9 resize-none" {...register('description')} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Working Hours</label>
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Opening Time</label>
                <input type="time" className="input-field bg-white" {...register('openingTime', { required: true })} />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Closing Time</label>
                <input type="time" className="input-field bg-white" {...register('closingTime', { required: true })} />
              </div>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => navigate('/owner/businesses')} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
              {isSubmitting ? 'Creating...' : 'Create Business'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
