import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AuthLayout() {
  const { user } = useAuth()
  if (user) return <Navigate to={`/${user.role}/dashboard`} replace />

  return (
    <div className="min-h-screen bg-slate-950/95 text-slate-100 flex items-center justify-center p-6">
      <div className="grid w-full max-w-6xl gap-8 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="relative overflow-hidden rounded-[2rem] bg-slate-900/95 px-8 py-10 shadow-[0_40px_120px_-70px_rgba(15,23,42,0.8)] before:absolute before:inset-x-0 before:top-0 before:h-52 before:bg-gradient-to-b before:from-primary-500/30 before:to-transparent">
          <div className="relative z-10 max-w-xl">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-white/10 text-white shadow-lg mb-6">
              <span className="text-2xl font-bold">Q</span>
            </div>
            <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl">QueueOS</h1>
            <p className="mt-4 text-lg text-slate-300 max-w-md">
              Smart queue and appointment management built for modern businesses, staff, customers, and admins.
            </p>
            <div className="mt-10 space-y-4">
              {[
                'Live queue tracking for customers',
                'Business insights and analytics for owners',
                'Staff tools for serving next, marking no-shows and queue control',
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-3xl border border-white/10 bg-white/5 p-4">
                  <span className="mt-1 inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-primary-500/15 text-primary-200">✓</span>
                  <p className="text-sm text-slate-300">{item}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="pointer-events-none absolute -right-24 top-12 h-56 w-56 rounded-full bg-sky-500/20 blur-3xl" />
          <div className="pointer-events-none absolute left-6 bottom-8 h-28 w-28 rounded-full bg-white/10 blur-2xl" />
        </div>

        <div className="rounded-[2rem] bg-white p-8 shadow-[0_40px_120px_-80px_rgba(15,23,42,0.4)]">
          <Outlet />
          <p className="text-center text-slate-400 text-xs mt-6">
            © 2026 QueueOS. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}
