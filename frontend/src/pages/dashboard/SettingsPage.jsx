import React, { useState } from 'react'
import { User, Bell, Save, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

export default function SettingsPage() {
  const { user } = useAuth()
  const [saved, setSaved] = useState(false)
  const [notifPrefs, setNotifPrefs] = useState({ email: true, alerts: true, recommendations: true, attendance: false })
  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000) }
  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div><h1 className="text-2xl font-extrabold text-navy-900">Settings</h1><p className="text-sm text-text-secondary mt-1">Manage your account and preferences</p></div>
      <div className="card p-5">
        <h3 className="text-sm font-bold text-navy-900 mb-4 flex items-center gap-2"><User size={16} />Profile</h3>
        <div className="space-y-3">
          <div><label className="block text-xs font-semibold text-text-secondary mb-1">Full Name</label><input type="text" defaultValue={user?.name} className="input" /></div>
          <div><label className="block text-xs font-semibold text-text-secondary mb-1">Email</label><input type="email" defaultValue={user?.email} className="input" /></div>
          <div><label className="block text-xs font-semibold text-text-secondary mb-1">Department</label><input type="text" defaultValue={user?.department} className="input" /></div>
        </div>
      </div>
      <div className="card p-5">
        <h3 className="text-sm font-bold text-navy-900 mb-4 flex items-center gap-2"><Bell size={16} />Notification Preferences</h3>
        <div className="space-y-3">
          {[
            { key: 'email', label: 'Email Notifications', desc: 'Receive notifications via email' },
            { key: 'alerts', label: 'Early Warning Alerts', desc: 'Get notified when risk indicators change' },
            { key: 'recommendations', label: 'New Recommendations', desc: 'Notify when new study recommendations are ready' },
            { key: 'attendance', label: 'Attendance Reminders', desc: 'Daily reminders about attendance' },
          ].map(pref => (
            <div key={pref.key} className="flex items-center justify-between p-3 rounded-lg bg-surface-secondary">
              <div><p className="text-sm font-semibold text-navy-900">{pref.label}</p><p className="text-xs text-text-tertiary">{pref.desc}</p></div>
              <button onClick={() => setNotifPrefs(prev => ({ ...prev, [pref.key]: !prev[pref.key] }))}
                className={`w-11 h-6 rounded-full transition-colors ${notifPrefs[pref.key] ? 'bg-royal-500' : 'bg-border-default'}`}>
                <div className={`w-4 h-4 rounded-full bg-white shadow mx-1 transition-transform ${notifPrefs[pref.key] ? 'translate-x-5' : 'translate-x-0'}`}></div>
              </button>
            </div>
          ))}
        </div>
      </div>
      <button onClick={handleSave} className={`btn ${saved ? 'bg-teal-500 text-white' : 'btn-primary'}`}>
        {saved ? <><CheckCircle2 size={16} />Saved!</> : <><Save size={16} />Save Changes</>}
      </button>
    </div>
  )
}
