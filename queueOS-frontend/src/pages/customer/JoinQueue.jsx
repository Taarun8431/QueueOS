import { useState } from 'react'
import { Building2, Clock, Search, Users, ChevronRight } from 'lucide-react'
import { toast } from 'react-toastify'
import { DUMMY_BUSINESSES, DUMMY_SERVICES } from '../../data/dummy'
import PageHeader from '../../components/PageHeader'

export default function JoinQueue() {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [joined, setJoined] = useState(false)
  const [token, setToken] = useState(null)

  const filtered = DUMMY_BUSINESSES
    .filter(b => b.status === 'active')
    .filter(b => b.name.toLowerCase().includes(search.toLowerCase()) ||
                 b.category.toLowerCase().includes(search.toLowerCase()))

  const handleJoin = (service) => {
    const tokenNum = `T${String(Math.floor(Math.random() * 900) + 100)}`
    setToken({ number: tokenNum, business: selected.name, service: service.name,
               position: Math.floor(Math.random() * 8) + 2, wait: `${Math.floor(Math.random() * 30) + 10} min` })
    setJoined(true)
    toast.success(`Queue joined! Your token: ${tokenNum}`)
  }

  if (joined && token) {
    return (
      <div className="max-w-md mx-auto">
        <div className="card text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl font-black text-green-600">{token.number}</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">You're in the queue!</h2>
          <p className="text-gray-500 text-sm mb-6">{token.business} · {token.service}</p>
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-2xl font-bold text-gray-900">#{token.position}</p>
              <p className="text-xs text-gray-400">Position</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-2xl font-bold text-gray-900">{token.wait}</p>
              <p className="text-xs text-gray-400">Est. Wait</p>
            </div>
          </div>
          <button onClick={() => { setJoined(false); setSelected(null); setToken(null) }}
            className="btn-secondary w-full">Join Another Queue</button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      <PageHeader title="Join Queue" subtitle="Select a business and walk right in" />

      {!selected ? (
        <>
          <div className="relative mb-4">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input placeholder="Search businesses..." value={search}
              onChange={e => setSearch(e.target.value)} className="input-field pl-9" />
          </div>
          <div className="space-y-3">
            {filtered.map(b => (
              <button key={b.id} onClick={() => setSelected(b)}
                className="card w-full flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer text-left">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
                    <Building2 size={18} className="text-primary-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{b.name}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-gray-400">{b.category}</span>
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock size={10} /> {b.openingTime}–{b.closingTime}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Users size={10} /> ~{Math.floor(Math.random() * 15) + 2} in queue
                      </span>
                    </div>
                  </div>
                </div>
                <ChevronRight size={16} className="text-gray-400" />
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <button onClick={() => setSelected(null)} className="text-primary-600 text-sm mb-4 flex items-center gap-1">
            ← Back to businesses
          </button>
          <div className="card mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
                <Building2 size={18} className="text-primary-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{selected.name}</p>
                <p className="text-xs text-gray-400">{selected.category} · {selected.address}</p>
              </div>
            </div>
          </div>
          <p className="text-sm font-medium text-gray-700 mb-3">Select a service to join:</p>
          <div className="space-y-2">
            {DUMMY_SERVICES.filter(s => s.available).map(s => (
              <button key={s.id} onClick={() => handleJoin(s)}
                className="card w-full flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer text-left">
                <div>
                  <p className="font-medium text-gray-900 text-sm">{s.name}</p>
                  <p className="text-xs text-gray-400">{s.duration} min · {s.price === 0 ? 'Free' : `$${s.price}`}</p>
                </div>
                <span className="btn-primary text-xs py-1.5 px-3">Join</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
