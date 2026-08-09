import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Building2, Mail, Phone, MapPin, Clock, Edit2, ArrowLeft, Briefcase } from 'lucide-react'
import { toast } from 'react-toastify'
import PageHeader from '../../components/PageHeader'
import api from '../../api'

export default function BusinessDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [business, setBusiness] = useState(null)
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get(`/business/${id}`),
      api.get(`/services/business/${id}`),
    ])
      .then(([bRes, sRes]) => {
        setBusiness(bRes.data.data)
        setServices(sRes.data.data)
      })
      .catch(() => toast.error('Failed to load business details'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <p className="text-gray-400">Loading...</p>
  if (!business) return <p className="text-gray-500">Business not found.</p>

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Business Details"
        action={
          <div className="flex gap-2">
            <button onClick={() => navigate('/owner/businesses')}
              className="btn-secondary flex items-center gap-2 text-sm">
              <ArrowLeft size={14} /> Back
            </button>
            <button onClick={() => navigate(`/owner/businesses/${business.id}/edit`)}
              className="btn-primary flex items-center gap-2 text-sm">
              <Edit2 size={14} /> Edit
            </button>
          </div>
        }
      />
      <div className="card mb-4">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Building2 size={28} className="text-primary-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-xl font-bold text-gray-900">{business.businessName}</h2>
              <span className={business.isActive ? 'badge-active' : 'badge-inactive'}>
                {business.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <p className="text-gray-500 text-sm mt-0.5">{business.category}</p>
            <p className="text-gray-600 text-sm mt-2">{business.description}</p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-3 text-sm">Contact Details</h3>
          <div className="space-y-2.5 text-sm text-gray-600">
            <div className="flex items-center gap-2"><Mail size={14} className="text-primary-500 flex-shrink-0" /><span>{business.businessEmail}</span></div>
            <div className="flex items-center gap-2"><Phone size={14} className="text-primary-500 flex-shrink-0" /><span>{business.phone}</span></div>
            <div className="flex items-center gap-2"><MapPin size={14} className="text-primary-500 flex-shrink-0" /><span>{business.address}</span></div>
          </div>
        </div>
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-3 text-sm">Working Hours</h3>
          <div className="flex items-center gap-3 text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
            <Clock size={18} className="text-primary-500" />
            <span>{business.workingHoursOpen} – {business.workingHoursClose}</span>
          </div>
        </div>
      </div>
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Briefcase size={16} className="text-primary-500" /> Services Offered
          </h3>
          <button onClick={() => navigate('/owner/services')} className="text-primary-600 text-xs font-medium hover:underline">Manage</button>
        </div>
        {services.length === 0 ? (
          <p className="text-gray-400 text-sm">No services added yet.</p>
        ) : (
          <div className="space-y-2">
            {services.map(s => (
              <div key={s.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl text-sm">
                <div>
                  <p className="font-medium text-gray-900">{s.serviceName}</p>
                  <p className="text-xs text-gray-400">{s.estimatedDuration} min · {s.description}</p>
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <p className="font-semibold text-gray-800">{s.price === 0 ? 'Free' : `$${s.price}`}</p>
                  <span className={s.isActive ? 'badge-active text-xs' : 'badge-inactive text-xs'}>
                    {s.isActive ? 'Available' : 'Unavailable'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
