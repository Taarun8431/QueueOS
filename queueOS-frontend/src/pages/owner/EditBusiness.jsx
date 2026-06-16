import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Building2, Mail, Phone, MapPin, Clock, FileText, Tag, ArrowLeft } from 'lucide-react'
import { DUMMY_BUSINESSES } from '../../data/dummy'
import PageHeader from '../../components/PageHeader'

const CATEGORIES = ['Hospital', 'Salon', 'Bank', 'Government Office', 'Service Center']

export default function EditBusiness() {
  const { id } = useParams()
  const navigate = useNavigate()
  const business = DUMMY_BUSINESSES.find(b => b.id === id) || DUMMY_BUSINESSES[0]

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      name: business.name,
      category: business.category,
      email: business.email,
      phone: business.phone,
      address: business.address,
      description: business.description,
      openingTime: business.openingTime,
      closingTime: business.closingTime,
    }
  })

  const onSubmit = async (data) => {
    await new Promise(r => setTimeout(r, 800))
    toast.success('Business updated successfully!')
    navigate('/owner/businesses')
  }

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Edit Business"
        subtitle={`Editing: ${business.name}`}
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
              <input type="text" className={`input-field pl-9 ${errors.name ? 'border-red-400' : ''}`}
                {...register('name', { required: 'Required' })} />
            </div>
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
            <div className="relative">
              <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <select className={`input-field pl-9 ${errors.category ? 'border-red-400' : ''}`}
                {...register('category', { required: 'Required' })}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business Email *</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="email" className={`input-field pl-9 ${errors.email ? 'border-red-400' : ''}`}
                  {...register('email', { required: 'Required' })} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="tel" className={`input-field pl-9 ${errors.phone ? 'border-red-400' : ''}`}
                  {...register('phone', { required: 'Required' })} />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
            <div className="relative">
              <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" className={`input-field pl-9 ${errors.address ? 'border-red-400' : ''}`}
                {...register('address', { required: 'Required' })} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <div className="relative">
              <FileText size={16} className="absolute left-3 top-3 text-gray-400" />
              <textarea rows={3} className="input-field pl-9 resize-none" {...register('description')} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Clock size={15} className="text-gray-400" /> Working Hours
            </label>
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Opening Time</label>
                <input type="time" className="input-field bg-white" {...register('openingTime')} />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Closing Time</label>
                <input type="time" className="input-field bg-white" {...register('closingTime')} />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => navigate('/owner/businesses')} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
              {isSubmitting ? 'Updating...' : 'Update Business'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
