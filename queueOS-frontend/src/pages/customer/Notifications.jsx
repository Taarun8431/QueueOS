import { useState } from 'react'
import { Bell, Clock, CalendarCheck, Info, CheckCheck, Trash2 } from 'lucide-react'
import { DUMMY_NOTIFICATIONS } from '../../data/dummy'
import PageHeader from '../../components/PageHeader'

const TYPE_CONFIG = {
  queue:       { icon: Clock, color: 'bg-blue-100 text-blue-600' },
  appointment: { icon: CalendarCheck, color: 'bg-green-100 text-green-600' },
  system:      { icon: Info, color: 'bg-gray-100 text-gray-600' },
}

export default function CustomerNotifications() {
  const [notes, setNotes] = useState(DUMMY_NOTIFICATIONS)

  const markAllRead = () => setNotes(prev => prev.map(n => ({ ...n, read: true })))
  const deleteNote = (id) => setNotes(prev => prev.filter(n => n.id !== id))
  const markRead = (id) => setNotes(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))

  const unread = notes.filter(n => !n.read).length

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Notifications"
        subtitle={unread > 0 ? `${unread} unread notification${unread > 1 ? 's' : ''}` : 'All caught up!'}
        action={unread > 0 && (
          <button onClick={markAllRead}
            className="btn-secondary text-sm flex items-center gap-2">
            <CheckCheck size={14} /> Mark all read
          </button>
        )}
      />

      {notes.length === 0 ? (
        <div className="card text-center py-16">
          <Bell size={48} className="text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">No notifications</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notes.map(n => {
            const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.system
            return (
              <div key={n.id}
                onClick={() => markRead(n.id)}
                className={`card flex items-start gap-3 cursor-pointer transition-all ${
                  !n.read ? 'border-l-4 border-l-primary-500' : ''}`}>
                <div className={`p-2 rounded-xl flex-shrink-0 ${cfg.color}`}>
                  <cfg.icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${!n.read ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
                    {n.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{n.time}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {!n.read && <span className="w-2 h-2 bg-primary-500 rounded-full" />}
                  <button onClick={e => { e.stopPropagation(); deleteNote(n.id) }}
                    className="p-1 text-gray-300 hover:text-red-500 transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
