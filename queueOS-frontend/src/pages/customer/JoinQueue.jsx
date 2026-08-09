import { useState, useEffect } from 'react'
import { QrCode, X } from 'lucide-react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { toast } from 'react-toastify'
import { motion, AnimatePresence } from 'framer-motion'
import PageHeader from '../../components/PageHeader'
import api from '../../api'

export default function JoinQueue() {
  const [joined, setJoined] = useState(false)
  const [token, setToken] = useState(null)
  const [businessName, setBusinessName] = useState('')
  
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {
    // If businessId and serviceId are in the URL, try to join immediately
    const qBusinessId = searchParams.get('businessId')
    const qServiceId = searchParams.get('serviceId')
    const qDoctorId = searchParams.get('doctorId')

    if (qBusinessId && qServiceId) {
      handleAutoJoin(qBusinessId, qServiceId, qDoctorId)
    }
  }, [searchParams])

  useEffect(() => {
    if (joined) return // Don't render scanner if already joined

    const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: { width: 250, height: 250 } }, false)
    scanner.render((decodedText) => {
      scanner.clear()
      try {
        const url = new URL(decodedText)
        const bId = url.searchParams.get('businessId')
        const sId = url.searchParams.get('serviceId')
        const dId = url.searchParams.get('doctorId')
        
        if (bId && sId) handleAutoJoin(bId, sId, dId)
        else toast.error('Invalid QR code format')
      } catch {
        toast.error('Invalid QR code URL')
      }
    }, (err) => {})

    return () => { scanner.clear().catch(e => {}) }
  }, [joined])

  const handleAutoJoin = async (bId, sId, dId = null) => {
    try {
      // First, get the business name for display
      api.get(`/business/${bId}`).then(res => setBusinessName(res.data.data.businessName)).catch(() => {})

      const payload = { businessId: bId, serviceId: sId }
      if (dId) payload.preferredStaffId = dId

      const res = await api.post('/queue/token', payload)
      setToken(res.data.data)
      setJoined(true)
      toast.success(`Walk-in registered! Token: #${res.data.data.tokenNumber}`)
      
      setTimeout(() => {
        localStorage.setItem('activeTokenId', res.data.data.id)
        navigate('/customer/queue-status')
      }, 3000)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to auto-join queue')
    }
  }

  if (joined && token) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md mx-auto mt-10">
        <div className="card text-center border-t-4 border-t-secondary-500 shadow-premium">
          <div className="w-24 h-24 bg-secondary-50 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-secondary-100 shadow-inner">
            <span className="text-4xl font-black text-secondary-600">#{token.tokenNumber}</span>
          </div>
          <h2 className="text-2xl font-bold text-primary-900 mb-2">Registration Successful!</h2>
          <p className="text-slate-500 text-base mb-6 font-medium">Welcome to <span className="text-primary-700 font-bold">{businessName || 'the Hospital'}</span></p>
          <p className="text-sm text-slate-400 mb-6 bg-slate-50 p-3 rounded-xl border border-slate-100">You will be redirected to the live queue status screen in a moment...</p>
          <button onClick={() => { setJoined(false); setToken(null) }} className="btn-secondary w-full py-3">Scan Another QR</button>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="max-w-xl mx-auto h-[80vh] flex flex-col justify-center">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
          <QrCode size={32} className="text-primary-600" />
        </div>
        <h1 className="text-3xl font-black text-primary-900 tracking-tight mb-2">Scan to Join Queue</h1>
        <p className="text-slate-500 font-medium text-lg">Point your camera at the QR code displayed at the hospital reception or doctor's cabin.</p>
      </div>

      <div className="card shadow-premium p-2 overflow-hidden border-2 border-primary-100 relative bg-slate-50">
        <div id="reader" className="w-full h-full overflow-hidden rounded-2xl bg-black"></div>
      </div>
      
      <div className="mt-8 text-center bg-blue-50 border border-blue-100 p-4 rounded-2xl">
         <p className="text-sm text-blue-800 font-medium">Looking to book an appointment for a future date?</p>
         <button onClick={() => navigate('/customer/book-appointment')} className="text-blue-600 font-bold text-sm mt-1 hover:underline">Go to Book Appointment →</button>
      </div>
    </div>
  )
}
