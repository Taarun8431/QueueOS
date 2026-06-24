import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Building2, Mail, Phone, MapPin, Clock, FileText, Tag, ArrowLeft } from 'lucide-react'
import PageHeader from '../../components/PageHeader'
import api from '../../api'

const CATEGORIES = ['hospital', 'salon', 'bank', 'government_office', 'service_center']
const CATEGORY_LABELS = { hospital: 'Hospital', salon: 'Salon', bank: 'Bank', government_office: 'Government Office', service_center: 'Service Center' }

export default function EditBusiness() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm()

  useEffect(() => {
    api.get(`/business/${id}`)
      .then(res => {
        const b = res.data.data
        reset({
          name: b.businessName,
          category: b.category,
          email: b.businessEmail,
          phone: b.phone,
          address: b.address,
          description: b.description,
          openingTime: b.workingHours?.open,
          closingTime: b.workingHours?.close,
        })
      })
      .catch(() => toast.error('Failed to load business'))
  }, [id, reset])

  const onSubmit = async (data) => {
    try {
      await api.put(`/business/${id}`, {
        businessName: data.name,
        businessEmail: data.email,
        phone: data.phone,
        category: data.category,
        address: data.address,
        description: data.description,
        workingHours: { open: data.openingTime, close: data.closingTime },
      })
      toast.success('Business updated successfully!')
      navigate('/owner/businesses')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed')
    }
  }

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Edit Business"
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
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
            <div className="relative">
              <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <select className="input-field pl-9" {...register('category', { required: 'Required' })}>
                {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business Email *</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="email" className="input-field pl-9" {...register('email', { required: 'Required' })} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="tel" className="input-field pl-9" {...register('phone', { required: 'Required' })} />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
            <div className="relative">
              <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" className="input-field pl-9" {...register('address', { required: 'Required' })} />
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Working Hours</label>
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Opening</label>
                <input type="time" className="input-field bg-white" {...register('openingTime')} />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Closing</label>
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
