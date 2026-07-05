import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, ArrowRight, Clock, Users, ShieldCheck } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden flex flex-col items-center justify-center">
      {/* Animated Background Blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[70%] rounded-full bg-indigo-600/10 blur-[120px] mix-blend-multiply animate-[pulse_8s_ease-in-out_infinite]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[70%] rounded-full bg-pink-500/10 blur-[120px] mix-blend-multiply animate-[pulse_10s_ease-in-out_infinite_reverse]" />
      
      {/* Subtle Grid Pattern */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 lg:gap-8 items-center h-full py-20">
        
        {/* Left Side: Text & Call to Action */}
        <motion.div 
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center lg:items-start text-center lg:text-left"
        >
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-[1.75rem] bg-gradient-to-br from-indigo-500 to-purple-700 text-white shadow-2xl shadow-indigo-500/40 mb-8"
          >
            <Sparkles size={40} strokeWidth={2} />
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-6xl sm:text-7xl xl:text-8xl font-black tracking-tight text-slate-900 mb-6 leading-tight"
          >
            Queue<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-500">OS</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl sm:text-2xl text-slate-600 font-medium max-w-xl leading-relaxed mb-10"
          >
            The intelligent command center for modern queue operations. Streamline flow, gain insights, and empower your staff.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Link 
              to="/login"
              className="inline-flex items-center justify-center gap-3 rounded-full bg-indigo-600 px-8 py-4 text-lg font-bold text-white shadow-xl shadow-indigo-500/30 transition-all duration-300 hover:bg-indigo-700 hover:shadow-indigo-500/40 hover:-translate-y-1 hover:scale-105 group"
            >
              <span>Get Started Now</span>
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </motion.div>

        {/* Right Side: Animated Floating Mockups to fill the blank space */}
        <div className="relative h-[500px] w-full hidden sm:block">
          
          {/* Main Glass Card */}
          <motion.div 
            initial={{ opacity: 0, y: 50, rotate: -5 }}
            animate={{ opacity: 1, y: 0, rotate: -2 }}
            transition={{ duration: 1, delay: 0.6, type: 'spring' }}
            className="absolute top-10 left-10 right-10 bg-white/70 backdrop-blur-2xl border border-white/60 shadow-[0_20px_60px_-15px_rgba(79,70,229,0.2)] rounded-[2rem] p-6 z-10"
          >
            <div className="flex items-center justify-between border-b border-slate-200/50 pb-4 mb-4">
              <div>
                <h3 className="font-black text-slate-800 text-lg">Live Queue Status</h3>
                <p className="text-xs text-slate-500 font-medium mt-1">Real-time updates</p>
              </div>
              <span className="flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>
            <div className="space-y-4">
              {[
                { name: 'Alice Walker', status: 'Serving Now', time: '0 min', color: 'bg-indigo-100 text-indigo-700' },
                { name: 'Michael Chen', status: 'Next up', time: '5 min', color: 'bg-amber-100 text-amber-700' },
                { name: 'Sarah Jenkins', status: 'Waiting', time: '12 min', color: 'bg-slate-100 text-slate-600' }
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-white border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">
                      {item.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{item.name}</p>
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full mt-1 inline-block ${item.color}`}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <Clock size={14} className="inline mr-1 text-slate-400" />
                    <span className="text-xs font-bold text-slate-500">{item.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Floating Element 1 */}
          <motion.div 
            animate={{ 
              y: [0, -15, 0],
              rotate: [5, 7, 5]
            }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -right-4 top-0 bg-white p-4 rounded-3xl shadow-xl border border-slate-100 z-20 flex items-center gap-3"
          >
            <div className="h-12 w-12 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center">
              <Users size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase">Daily Visitors</p>
              <p className="text-xl font-black text-slate-800">4,281</p>
            </div>
          </motion.div>

          {/* Floating Element 2 */}
          <motion.div 
            animate={{ 
              y: [0, 20, 0],
              rotate: [-5, -8, -5]
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute -left-8 bottom-12 bg-indigo-600 p-5 rounded-3xl shadow-2xl shadow-indigo-600/30 text-white z-20"
          >
            <ShieldCheck size={28} className="mb-2 text-indigo-200" />
            <p className="text-sm font-medium text-indigo-100">Enterprise Grade</p>
            <p className="text-lg font-bold">100% Secure Flow</p>
          </motion.div>

        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-6 w-full text-center text-slate-400 font-medium text-sm"
      >
        © 2026 QueueOS. Crafted with precision.
      </motion.div>
    </div>
  )
}
