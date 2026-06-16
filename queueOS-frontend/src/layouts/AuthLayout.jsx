import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AuthLayout() {
  const { user } = useAuth()
  if (user) return <Navigate to={`/${user.role}/dashboard`} replace />

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-4">
            <span className="text-2xl font-black text-primary-600">Q</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">QueueOS</h1>
          <p className="text-primary-200 mt-1 text-sm">Smart Queue & Appointment Management</p>
        </div>
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <Outlet />
        </div>
        <p className="text-center text-primary-300 text-xs mt-6">
          © 2026 QueueOS. All rights reserved.
        </p>
      </div>
    </div>
  )
}
