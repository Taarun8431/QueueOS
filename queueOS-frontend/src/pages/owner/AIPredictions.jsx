import { useState } from 'react'
import { BrainCircuit, TrendingUp, Clock, Users, Zap } from 'lucide-react'
import { toast } from 'react-toastify'
import PageHeader from '../../components/PageHeader'
import api from '../../api'

const CATEGORIES = ['Hospital', 'Salon', 'Bank', 'Government Office', 'Service Center']
const SERVICES_BY_CATEGORY = {
  Hospital: ['Consultation', 'Dental', 'Eye Checkup', 'Blood Test'],
  Salon: ['Haircut', 'Facial', 'Hair Spa', 'Shaving'],
  Bank: ['Account Opening', 'Cash Deposit', 'Loan Inquiry'],
  'Government Office': ['Certificate Issue', 'Verification', 'Registration'],
  'Service Center': ['Mobile Repair', 'Laptop Repair', 'Inspection'],
}

export default function AIPredictions() {
  const [form, setForm] = useState({
    businessCategory: 'Hospital',
    serviceType: 'Consultation',
    queueLength: 10,
    hourOfDay: new Date().getHours(),
    dayOfWeek: new Date().getDay() || 7,
    avgServiceDuration: 20,
    staffCount: 3,
  })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const handlePredict = async () => {
    setLoading(true)
    try {
      const res = await api.post('/queue/predict-wait-time', form)
      setResult(res.data.predictedWaitTime)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Prediction failed. Make sure the ML service is running.')
    } finally {
      setLoading(false)
    }
  }

  const services = SERVICES_BY_CATEGORY[form.businessCategory] || []

  return (
    <div>
      <PageHeader title="AI Predictions" subtitle="Machine learning-powered wait time prediction" />

      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-5 mb-6 text-white">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-xl"><BrainCircuit size={20} /></div>
          <div>
            <p className="font-bold">AI Queue Intelligence</p>
            <p className="text-purple-200 text-xs">Enter queue parameters to get a predicted wait time</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Prediction Parameters</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Business Category</label>
              <select className="input-field" value={form.businessCategory}
                onChange={e => setForm(p => ({ ...p, businessCategory: e.target.value, serviceType: SERVICES_BY_CATEGORY[e.target.value]?.[0] || '' }))}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Service Type</label>
              <select className="input-field" value={form.serviceType}
                onChange={e => setForm(p => ({ ...p, serviceType: e.target.value }))}>
                {services.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Queue Length</label>
                <input type="number" className="input-field" min={0} value={form.queueLength}
                  onChange={e => setForm(p => ({ ...p, queueLength: +e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Staff Count</label>
                <input type="number" className="input-field" min={1} value={form.staffCount}
                  onChange={e => setForm(p => ({ ...p, staffCount: +e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Hour of Day (0-23)</label>
                <input type="number" className="input-field" min={0} max={23} value={form.hourOfDay}
                  onChange={e => setForm(p => ({ ...p, hourOfDay: +e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Avg Service Duration (min)</label>
                <input type="number" className="input-field" min={1} value={form.avgServiceDuration}
                  onChange={e => setForm(p => ({ ...p, avgServiceDuration: +e.target.value }))} />
              </div>
            </div>
            <button onClick={handlePredict} disabled={loading} className="btn-primary w-full mt-2">
              {loading ? 'Predicting...' : 'Get Prediction'}
            </button>
          </div>
        </div>

        <div className="card flex flex-col items-center justify-center text-center">
          {result !== null ? (
            <>
              <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Clock size={36} className="text-purple-600" />
              </div>
              <p className="text-5xl font-black text-gray-900 mb-2">{result} <span className="text-2xl font-semibold text-gray-400">min</span></p>
              <p className="text-gray-500 text-sm">Predicted wait time</p>
              <p className="text-xs text-gray-400 mt-2">{form.businessCategory} · {form.serviceType} · {form.queueLength} in queue</p>
            </>
          ) : (
            <>
              <BrainCircuit size={48} className="text-gray-200 mb-4" />
              <p className="text-gray-400">Fill in the parameters and click Get Prediction</p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
