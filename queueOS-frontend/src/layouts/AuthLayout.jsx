import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { motion } from 'framer-motion'
import { Check, Sparkles } from 'lucide-react'

export default function AuthLayout() {
  const { user } = useAuth()
  if (user) return <Navigate to={`/${user.role}/dashboard`} replace />

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden bg-slate-50">
      {/* Background Animated Gradient Blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[60%] rounded-full bg-indigo-600/20 blur-[120px] mix-blend-multiply animate-[pulse_8s_ease-in-out_infinite]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[60%] rounded-full bg-pink-500/20 blur-[120px] mix-blend-multiply animate-[pulse_10s_ease-in-out_infinite_reverse]" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 grid w-full max-w-6xl gap-6 xl:grid-cols-[1.1fr_0.9fr]"
      >
        <div className="relative overflow-hidden rounded-[2.5rem] bg-indigo-950 px-8 py-12 lg:px-12 lg:py-16 shadow-2xl shadow-indigo-900/40">
          {/* Subtle grid pattern background */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]" />
          
          <div className="relative z-10 max-w-xl h-full flex flex-col justify-center">
            <div>
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-br from-indigo-400 to-purple-600 text-white shadow-xl shadow-indigo-500/30 mb-8"
              >
                <Sparkles size={32} />
              </motion.div>
              <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="text-5xl font-black tracking-tight text-white lg:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-200"
              >
                QueueOS
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-6 text-xl text-indigo-200/90 font-light leading-relaxed max-w-md"
              >
                The intelligent command center for modern queue operations and seamless customer flow.
              </motion.p>
            </div>

            <div className="mt-16 space-y-5">
              {[
                'Real-time customer journey tracking',
                'Deep business analytics & insights',
                'Frictionless staff operation tools',
              ].map((item, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + (i * 0.1) }}
                  key={item} 
                  className="flex items-center gap-4 rounded-3xl border border-indigo-400/20 bg-indigo-900/40 backdrop-blur-md p-4 transition-colors hover:bg-indigo-800/60"
                >
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-500 text-white shadow-lg shadow-indigo-500/20">
                    <Check size={20} strokeWidth={3} />
                  </span>
                  <p className="text-indigo-100 font-medium">{item}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-center rounded-[2.5rem] bg-white/70 backdrop-blur-3xl p-8 lg:p-12 shadow-[0_20px_80px_-20px_rgba(79,70,229,0.15)] border border-white">
          <Outlet />
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-center text-slate-400 text-sm mt-8 font-medium"
          >
            © 2026 QueueOS. Crafted with precision.
          </motion.p>
        </div>
      </motion.div>
    </div>
  )
}
