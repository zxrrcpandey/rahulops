'use client'

import { useState } from 'react'
import {
  Settings,
  Globe,
  Mail,
  Shield,
  Users,
  Save,
  Loader2,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  CheckCircle
} from 'lucide-react'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'general' | 'email' | 'dns' | 'team'>('general')
  const [isSaving, setIsSaving] = useState(false)
  const [showApiToken, setShowApiToken] = useState(false)
  const [saved, setSaved] = useState(false)

  // General settings
  const [generalSettings, setGeneralSettings] = useState({
    your_domain: 'yourdomain.com',
    default_admin_email: 'admin@yourdomain.com',
    default_timezone: 'Asia/Kolkata'
  })

  // Email settings
  const [emailSettings, setEmailSettings] = useState({
    smtp_host: 'smtp.gmail.com',
    smtp_port: '587',
    smtp_user: '',
    smtp_password: '',
    notification_email: '',
    resend_api_key: ''
  })

  // DNS settings (Cloudflare)
  const [dnsSettings, setDnsSettings] = useState({
    cloudflare_api_token: '',
    cloudflare_zone_id: ''
  })

  // Team members
  const [teamMembers, setTeamMembers] = useState([
    { id: '1', email: 'admin@company.com', name: 'Admin User', role: 'admin' },
    { id: '2', email: 'member@company.com', name: 'Team Member', role: 'member' }
  ])

  const [newMember, setNewMember] = useState({ email: '', name: '', role: 'member' })

  const handleSave = async () => {
    setIsSaving(true)
    // TODO: Save to Supabase
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const handleAddMember = () => {
    if (!newMember.email) return
    setTeamMembers(prev => [...prev, { ...newMember, id: Date.now().toString() }])
    setNewMember({ email: '', name: '', role: 'member' })
  }

  const handleRemoveMember = (id: string) => {
    setTeamMembers(prev => prev.filter(m => m.id !== id))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500 mt-1">Configure your deployment system</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : saved ? (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Saved!
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </>
          )}
        </button>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-64 flex-shrink-0">
          <nav className="space-y-1">
            {[
              { id: 'general', label: 'General', icon: Settings },
              { id: 'email', label: 'Email / Notifications', icon: Mail },
              { id: 'dns', label: 'DNS (Cloudflare)', icon: Globe },
              { id: 'team', label: 'Team Members', icon: Users }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="w-5 h-5 mr-3" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            {/* General Settings */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">General Settings</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Your Domain (for subdomain sites)
                      </label>
                      <input
                        type="text"
                        value={generalSettings.your_domain}
                        onChange={(e) => setGeneralSettings(prev => ({ ...prev, your_domain: e.target.value }))}
                        placeholder="yourdomain.com"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Subdomains will be created as: clientname.yourdomain.com
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Default Admin Email
                      </label>
                      <input
                        type="email"
                        value={generalSettings.default_admin_email}
                        onChange={(e) => setGeneralSettings(prev => ({ ...prev, default_admin_email: e.target.value }))}
                        placeholder="admin@yourdomain.com"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Default Timezone
                      </label>
                      <select
                        value={generalSettings.default_timezone}
                        onChange={(e) => setGeneralSettings(prev => ({ ...prev, default_timezone: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                        <option value="UTC">UTC</option>
                        <option value="America/New_York">America/New_York (EST)</option>
                        <option value="Europe/London">Europe/London (GMT)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Email Settings */}
            {activeTab === 'email' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Email Settings</h2>
                  
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-6">
                    <p className="text-sm text-blue-800">
                      <strong>Recommended:</strong> Use Resend for email delivery (free tier: 3,000 emails/month)
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Resend API Key
                      </label>
                      <div className="relative">
                        <input
                          type={showApiToken ? 'text' : 'password'}
                          value={emailSettings.resend_api_key}
                          onChange={(e) => setEmailSettings(prev => ({ ...prev, resend_api_key: e.target.value }))}
                          placeholder="re_xxxxxxxx"
                          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowApiToken(!showApiToken)}
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                        >
                          {showApiToken ? (
                            <EyeOff className="w-4 h-4 text-gray-400" />
                          ) : (
                            <Eye className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notification Email
                      </label>
                      <input
                        type="email"
                        value={emailSettings.notification_email}
                        onChange={(e) => setEmailSettings(prev => ({ ...prev, notification_email: e.target.value }))}
                        placeholder="team@yourdomain.com"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Deployment notifications will be sent to this email
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-md font-semibold text-gray-900 mb-4">Alternative: SMTP Settings</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        SMTP Host
                      </label>
                      <input
                        type="text"
                        value={emailSettings.smtp_host}
                        onChange={(e) => setEmailSettings(prev => ({ ...prev, smtp_host: e.target.value }))}
                        placeholder="smtp.gmail.com"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        SMTP Port
                      </label>
                      <input
                        type="text"
                        value={emailSettings.smtp_port}
                        onChange={(e) => setEmailSettings(prev => ({ ...prev, smtp_port: e.target.value }))}
                        placeholder="587"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        SMTP User
                      </label>
                      <input
                        type="text"
                        value={emailSettings.smtp_user}
                        onChange={(e) => setEmailSettings(prev => ({ ...prev, smtp_user: e.target.value }))}
                        placeholder="your@email.com"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        SMTP Password
                      </label>
                      <input
                        type="password"
                        value={emailSettings.smtp_password}
                        onChange={(e) => setEmailSettings(prev => ({ ...prev, smtp_password: e.target.value }))}
                        placeholder="••••••••"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* DNS Settings */}
            {activeTab === 'dns' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Cloudflare DNS Settings</h2>
                  
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-6">
                    <p className="text-sm text-yellow-800">
                      <strong>Optional:</strong> Configure Cloudflare to automatically create DNS records for subdomain sites.
                      Without this, you'll need to manually create DNS records.
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cloudflare API Token
                      </label>
                      <div className="relative">
                        <input
                          type={showApiToken ? 'text' : 'password'}
                          value={dnsSettings.cloudflare_api_token}
                          onChange={(e) => setDnsSettings(prev => ({ ...prev, cloudflare_api_token: e.target.value }))}
                          placeholder="Your Cloudflare API token"
                          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowApiToken(!showApiToken)}
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                        >
                          {showApiToken ? (
                            <EyeOff className="w-4 h-4 text-gray-400" />
                          ) : (
                            <Eye className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Create a token with Zone:DNS:Edit permissions
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Zone ID
                      </label>
                      <input
                        type="text"
                        value={dnsSettings.cloudflare_zone_id}
                        onChange={(e) => setDnsSettings(prev => ({ ...prev, cloudflare_zone_id: e.target.value }))}
                        placeholder="Your Cloudflare Zone ID"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Found in your Cloudflare dashboard under your domain
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Team Members */}
            {activeTab === 'team' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Team Members</h2>
                  <p className="text-gray-500 mb-6">
                    Manage who can access this deployment dashboard
                  </p>
                  
                  {/* Add new member */}
                  <div className="p-4 bg-gray-50 rounded-lg mb-6">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Add Team Member</h3>
                    <div className="flex gap-3">
                      <input
                        type="email"
                        value={newMember.email}
                        onChange={(e) => setNewMember(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="email@company.com"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        value={newMember.name}
                        onChange={(e) => setNewMember(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Name"
                        className="w-40 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <select
                        value={newMember.role}
                        onChange={(e) => setNewMember(prev => ({ ...prev, role: e.target.value }))}
                        className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                        <option value="viewer">Viewer</option>
                      </select>
                      <button
                        onClick={handleAddMember}
                        disabled={!newMember.email}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Member list */}
                  <div className="space-y-3">
                    {teamMembers.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-medium">
                              {member.name ? member.name.split(' ').map(n => n[0]).join('') : member.email[0].toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{member.name || member.email}</p>
                            <p className="text-sm text-gray-500">{member.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            member.role === 'admin' 
                              ? 'bg-purple-100 text-purple-700'
                              : member.role === 'viewer'
                              ? 'bg-gray-100 text-gray-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {member.role}
                          </span>
                          <button
                            onClick={() => handleRemoveMember(member.id)}
                            className="p-2 hover:bg-gray-100 rounded-lg text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
