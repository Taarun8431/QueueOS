import { useParams, useNavigate } from 'react-router-dom'
import { Building2, Mail, Phone, MapPin, Clock, Edit2, ArrowLeft, Briefcase } from 'lucide-react'
import { DUMMY_BUSINESSES, DUMMY_SERVICES } from '../../data/dummy'
import PageHeader from '../../components/PageHeader'

export default function BusinessDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const b = DUMMY_BUSINESSES.find(biz => biz.id === id) || DUMMY_BUSINESSES[0]

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
            <button onClick={() => navigate(`/owner/businesses/${b.id}/edit`)}
              className="btn-primary flex items-center gap-2 text-sm">
              <Edit2 size={14} /> Edit
            </button>
          </div>
        }
      />

      {/* Header Card */}
      <div className="card mb-4">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Building2 size={28} className="text-primary-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-xl font-bold text-gray-900">{b.name}</h2>
              <span className={b.status === 'active' ? 'badge-active' : 'badge-inactive'}>{b.status}</span>
            </div>
            <p className="text-gray-500 text-sm mt-0.5">{b.category}</p>
            <p className="text-gray-600 text-sm mt-2">{b.description}</p>
          </div>
        </div>
      </div>

      {/* Contact & Hours */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-3 text-sm">Contact Details</h3>
          <div className="space-y-2.5 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Mail size={14} className="text-primary-500 flex-shrink-0" />
              <span>{b.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone size={14} className="text-primary-500 flex-shrink-0" />
              <span>{b.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-primary-500 flex-shrink-0" />
              <span>{b.address}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-3 text-sm">Working Hours</h3>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock size={14} className="text-primary-500" />
            <span>{b.openingTime} – {b.closingTime}</span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-gray-900">{b.todayVisitors}</p>
              <p className="text-xs text-gray-400">Today's Visitors</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-gray-900">{b.totalQueues}</p>
              <p className="text-xs text-gray-400">Active Queues</p>
            </div>
          </div>
        </div>
      </div>

      {/* Services */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Briefcase size={16} className="text-primary-500" /> Services Offered
          </h3>
          <button onClick={() => navigate('/owner/services')}
            className="text-primary-600 text-xs font-medium hover:underline">Manage</button>
        </div>
        <div className="space-y-2">
          {DUMMY_SERVICES.map(s => (
            <div key={s.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl text-sm">
              <div>
                <p className="font-medium text-gray-900">{s.name}</p>
                <p className="text-xs text-gray-400">{s.duration} min · {s.description}</p>
              </div>
              <div className="text-right flex-shrink-0 ml-4">
                <p className="font-semibold text-gray-800">{s.price === 0 ? 'Free' : `$${s.price}`}</p>
                <span className={s.available ? 'badge-active text-xs' : 'badge-inactive text-xs'}>
                  {s.available ? 'Available' : 'Unavailable'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
