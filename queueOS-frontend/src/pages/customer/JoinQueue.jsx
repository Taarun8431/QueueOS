import { useState, useEffect, useRef } from 'react'
import { Building2, Clock, Search, Users, ChevronRight, QrCode, Camera, X } from 'lucide-react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { toast } from 'react-toastify'
import PageHeader from '../../components/PageHeader'
import api from '../../api'

export default function JoinQueue() {
  const [businesses, setBusinesses] = useState([])
  const [services, setServices] = useState([])
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [joined, setJoined] = useState(false)
  const [token, setToken] = useState(null)
  const [loadingServices, setLoadingServices] = useState(false)
  const [showScanner, setShowScanner] = useState(false)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/business').then(res => setBusinesses(res.data.data)).catch(() => toast.error('Failed to load businesses'))
    
    // Auto-join from URL if parameters exist
    const qBusinessId = searchParams.get('businessId')
    const qServiceId = searchParams.get('serviceId')
    
    if (qBusinessId && qServiceId) {
      handleAutoJoin(qBusinessId, qServiceId)
    }
  }, [searchParams])

  useEffect(() => {
    if (!showScanner) return
    const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: { width: 250, height: 250 } }, false)
    scanner.render((decodedText) => {
      scanner.clear()
      setShowScanner(false)
      try {
        const url = new URL(decodedText)
        const bId = url.searchParams.get('businessId')
        const sId = url.searchParams.get('serviceId')
        if (bId && sId) handleAutoJoin(bId, sId)
        else toast.error('Invalid QR code format')
      } catch {
        toast.error('Invalid QR code URL')
      }
    }, (err) => {})

    return () => { scanner.clear().catch(e => {}) }
  }, [showScanner])

  const handleAutoJoin = async (bId, sId) => {
    try {
      const res = await api.post('/queue/token', { businessId: bId, serviceId: sId })
      setToken(res.data.data)
      setJoined(true)
      toast.success(`Queue joined! Token: #${res.data.data.tokenNumber}`)
      // Redirect to status page for best experience
      setTimeout(() => {
        localStorage.setItem('activeTokenId', res.data.data._id)
        navigate('/customer/queue-status')
      }, 2000)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to auto-join queue')
    }
  }

  const selectBusiness = async (b) => {
    setSelected(b)
    setLoadingServices(true)
    try {
      const res = await api.get(`/services/business/${b._id}`)
      setServices(res.data.data)
    } catch {
      toast.error('Failed to load services')
    } finally {
      setLoadingServices(false)
    }
  }

  const handleJoin = async (service) => {
    try {
      const res = await api.post('/queue/token', { businessId: selected._id, serviceId: service._id })
      setToken(res.data.data)
      setJoined(true)
      toast.success(`Queue joined! Token: #${res.data.data.tokenNumber}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to join queue')
    }
  }

  const filtered = businesses.filter(b => b.isActive &&
    (b.businessName.toLowerCase().includes(search.toLowerCase()) || b.category.toLowerCase().includes(search.toLowerCase())))

  if (joined && token) {
    return (
      <div className="max-w-md mx-auto">
        <div className="card text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl font-black text-green-600">#{token.tokenNumber}</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">You're in the queue!</h2>
          <p className="text-gray-500 text-sm mb-6">{selected.businessName}</p>
          <button onClick={() => { setJoined(false); setSelected(null); setToken(null) }} className="btn-secondary w-full">Join Another Queue</button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      <div className="flex justify-between items-start mb-6">
        <PageHeader title="Join Queue" subtitle="Select a business or scan a QR code" />
        {!selected && (
          <button 
            onClick={() => setShowScanner(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md hover:bg-indigo-700 transition"
          >
            <QrCode size={16} /> Scan QR
          </button>
        )}
      </div>

      {showScanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full relative">
            <button onClick={() => setShowScanner(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 z-50">
              <X size={24} />
            </button>
            <h3 className="text-xl font-bold text-slate-900 mb-4 text-center">Scan Department QR</h3>
            <div id="reader" className="w-full overflow-hidden rounded-xl border-2 border-indigo-100"></div>
            <p className="text-xs text-slate-500 text-center mt-4">Point your camera at the Receptionist's screen to instantly join the correct queue.</p>
          </div>
        </div>
      )}
      {!selected ? (
        <>
          <div className="relative mb-4">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input placeholder="Search businesses..." value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-9" />
          </div>
          <div className="space-y-3">
            {filtered.map(b => (
              <button key={b._id} onClick={() => selectBusiness(b)}
                className="card w-full flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer text-left">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
                    <Building2 size={18} className="text-primary-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{b.businessName}</p>
                    <span className="text-xs text-gray-400">{b.category}</span>
                  </div>
                </div>
                <ChevronRight size={16} className="text-gray-400" />
              </button>
            ))}
            {filtered.length === 0 && <p className="text-gray-400 text-sm text-center py-8">No businesses found.</p>}
          </div>
        </>
      ) : (
        <>
          <button onClick={() => setSelected(null)} className="text-primary-600 text-sm mb-4">← Back to businesses</button>
          <div className="card mb-4">
            <p className="font-semibold text-gray-900">{selected.businessName}</p>
            <p className="text-xs text-gray-400">{selected.category} · {selected.address}</p>
          </div>
          <p className="text-sm font-medium text-gray-700 mb-3">Select a service to join:</p>
          {loadingServices ? <p className="text-gray-400">Loading services...</p> : (
            <div className="space-y-2">
              {services.map(s => (
                <button key={s._id} onClick={() => s.isActive && handleJoin(s)}
                  className={`card w-full flex items-center justify-between transition-shadow text-left ${s.isActive ? 'hover:shadow-md cursor-pointer' : 'opacity-75 cursor-not-allowed'}`}>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{s.serviceName}</p>
                    <p className="text-xs text-gray-400">{s.estimatedDuration} min · {s.price === 0 ? 'Free' : `$${s.price}`}</p>
                  </div>
                  {s.isActive ? (
                    <span className="btn-primary text-xs py-1.5 px-3">Join</span>
                  ) : (
                    <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded">Unavailable</span>
                  )}
                </button>
              ))}
              {services.length === 0 && <p className="text-gray-400 text-sm">No services available.</p>}
            </div>
          )}
        </>
      )}
    </div>
  )
}
