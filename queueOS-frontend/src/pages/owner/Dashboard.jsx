import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Building2, Users, Clock, TrendingUp, PlusCircle, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import api from '../../api'

export default function OwnerDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [businesses, setBusinesses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/business/my')
      .then(res => setBusinesses(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const stats = [
    { title: 'Locations', value: businesses.length, icon: Building2, color: 'text-indigo-600', bg: 'bg-indigo-100/50' },
    { title: "Today's Visitors", value: '—', icon: Users, color: 'text-pink-600', bg: 'bg-pink-100/50' },
    { title: 'Avg Wait Time', value: '—', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100/50' },
    { title: 'Queues Served', value: '—', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-100/50' },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  }

  return (
    <motion.div 
      initial="hidden" 
      animate="show" 
      variants={containerVariants}
      className="space-y-6"
    >
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <motion.div variants={itemVariants} className="hero-panel">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between relative z-10">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-indigo-100 font-semibold mb-2">Welcome Back</p>
              <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                Hello, {user?.name?.split(' ')[0]}
              </h2>
              <p className="mt-4 max-w-xl text-indigo-50/90 text-sm sm:text-base leading-relaxed">
                Your queue operations are running smoothly. Manage locations, monitor live wait times, and analyze performance from your command center.
              </p>
            </div>
            <button onClick={() => navigate('/owner/businesses/create')} className="btn-secondary w-full sm:w-auto flex items-center justify-center gap-2 group whitespace-nowrap">
              <PlusCircle size={18} className="text-indigo-600 group-hover:rotate-90 transition-transform duration-300" /> 
              <span>New Location</span>
            </button>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="glass-card flex flex-col justify-center p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="panel-title text-xl">Quick Stats</h3>
            <button onClick={() => navigate('/owner/analytics')} className="text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1 group">
              View All <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {stats.map((stat, i) => (
              <motion.div 
                key={stat.title}
                whileHover={{ scale: 1.05 }}
                className="rounded-3xl border border-white/40 bg-white/40 p-4 backdrop-blur-md shadow-sm transition-all"
              >
                <div className="flex flex-col gap-3">
                  <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${stat.bg} ${stat.color} shadow-inner`}>
                    <stat.icon size={22} strokeWidth={2.5} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">{stat.title}</p>
                    <p className="mt-1 text-2xl font-black text-slate-800 tracking-tight">{stat.value}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div variants={itemVariants} className="glass-card p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="panel-title text-xl">Active Locations</h3>
          <button onClick={() => navigate('/owner/businesses')} className="text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1 group">
            Manage <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
        
        {loading ? (
          <div className="animate-pulse space-y-3">
            {[1, 2].map(i => (
               <div key={i} className="h-24 bg-white/30 rounded-3xl backdrop-blur-sm"></div>
            ))}
          </div>
        ) : businesses.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-indigo-200 bg-indigo-50/30 p-12 text-center backdrop-blur-sm">
            <Building2 size={48} className="mx-auto text-indigo-300 mb-4" />
            <p className="text-slate-600 font-medium mb-4">No locations configured yet.</p>
            <button onClick={() => navigate('/owner/businesses/create')} className="btn-primary">
              Setup First Location
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {businesses.filter(b => b.isActive).map(b => (
              <motion.div 
                key={b._id} 
                whileHover={{ y: -4, shadow: "0 10px 40px -10px rgba(0,0,0,0.1)" }}
                className="group relative overflow-hidden rounded-3xl border border-white/60 bg-white/60 p-5 backdrop-blur-md transition-all cursor-pointer"
                onClick={() => navigate(`/owner/businesses/${b._id}`)}
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-150 transition-transform duration-500">
                  <Building2 size={64} className="text-indigo-600" />
                </div>
                <div className="relative z-10">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm text-indigo-600 mb-4 border border-slate-100">
                    <Building2 size={20} strokeWidth={2.5} />
                  </div>
                  <h4 className="font-bold text-slate-900 text-lg mb-1">{b.businessName}</h4>
                  <p className="text-sm text-slate-500 font-medium">{b.category}</p>
                  <div className="mt-4 flex items-center justify-between border-t border-slate-200/50 pt-4">
                    <span className="status-pill bg-emerald-100 text-emerald-700">Online</span>
                    <span className="text-xs font-semibold text-slate-400">{b.workingHours?.open}–{b.workingHours?.close}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
