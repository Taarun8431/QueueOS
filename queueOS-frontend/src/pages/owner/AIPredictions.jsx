import { BrainCircuit, TrendingUp, Clock, Users, Zap, AlertCircle } from 'lucide-react'
import PageHeader from '../../components/PageHeader'

const predictions = [
  { time: '09:00 – 10:00', expected: 35, confidence: 92, level: 'High' },
  { time: '10:00 – 11:00', expected: 62, confidence: 88, level: 'High' },
  { time: '11:00 – 12:00', expected: 89, confidence: 85, level: 'Peak' },
  { time: '12:00 – 13:00', expected: 45, confidence: 90, level: 'Medium' },
  { time: '13:00 – 14:00', expected: 30, confidence: 94, level: 'Low' },
  { time: '14:00 – 15:00', expected: 55, confidence: 87, level: 'Medium' },
  { time: '15:00 – 16:00', expected: 78, confidence: 83, level: 'High' },
  { time: '16:00 – 17:00', expected: 91, confidence: 86, level: 'Peak' },
]

const levelColors = {
  Peak:   'bg-red-100 text-red-700',
  High:   'bg-orange-100 text-orange-700',
  Medium: 'bg-yellow-100 text-yellow-700',
  Low:    'bg-green-100 text-green-700',
}

export default function AIPredictions() {
  return (
    <div>
      <PageHeader title="AI Predictions" subtitle="Machine learning-powered queue forecasting" />

      {/* AI Badge */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-5 mb-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-white/20 rounded-xl">
            <BrainCircuit size={20} />
          </div>
          <div>
            <p className="font-bold">AI Queue Intelligence</p>
            <p className="text-purple-200 text-xs">Powered by historical patterns & ML models</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-4">
          {[
            { label: 'Model Accuracy', value: '89.4%' },
            { label: 'Data Points', value: '124K' },
            { label: 'Last Trained', value: '2h ago' },
          ].map(m => (
            <div key={m.label} className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-lg font-bold">{m.value}</p>
              <p className="text-purple-200 text-xs">{m.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Forecast */}
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock size={16} className="text-purple-500" /> Today's Hourly Forecast
          </h3>
          <div className="space-y-2">
            {predictions.map(p => (
              <div key={p.time} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-28">{p.time}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${levelColors[p.level]}`}>
                    {p.level}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{p.expected} visitors</p>
                  <p className="text-xs text-gray-400">{p.confidence}% confidence</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="space-y-4">
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Zap size={16} className="text-yellow-500" /> Smart Recommendations
            </h3>
            <div className="space-y-3">
              {[
                { icon: Users, color: 'text-blue-600 bg-blue-50', title: 'Add Staff at 11AM', desc: 'Predicted 89 visitors. Consider 2 extra counters.' },
                { icon: Clock, color: 'text-orange-600 bg-orange-50', title: 'Extend Hours Friday', desc: 'Peak demand extends to 6PM on Fridays historically.' },
                { icon: TrendingUp, color: 'text-green-600 bg-green-50', title: 'Pre-book Slots', desc: 'Opening online booking reduces peak load by 22%.' },
              ].map(r => (
                <div key={r.title} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className={`p-2 rounded-lg flex-shrink-0 ${r.color}`}>
                    <r.icon size={14} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{r.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{r.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card border border-amber-200 bg-amber-50">
            <div className="flex items-start gap-3">
              <AlertCircle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-800 text-sm">Coming Soon</p>
                <p className="text-amber-700 text-xs mt-1">
                  Full AI integration with real-time queue data will be available in the next release.
                  Currently showing static predictions for UI preview.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
