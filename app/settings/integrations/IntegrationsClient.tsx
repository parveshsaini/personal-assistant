'use client'

import { useSearchParams } from 'next/navigation'

export function IntegrationsClient({ googleConnected }: { googleConnected: boolean }) {
  const params = useSearchParams()
  const justConnected = params.get('connected')
  const errorParam = params.get('error')

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <h1 className="text-2xl font-semibold mb-2">Integrations</h1>
      <p className="text-gray-400 text-sm mb-8">Connect your productivity tools to enable the assistant to act on your behalf.</p>

      {justConnected && (
        <div className="mb-6 px-4 py-3 rounded-lg bg-green-900/40 border border-green-700 text-green-300 text-sm">
          Successfully connected {justConnected}.
        </div>
      )}
      {errorParam && (
        <div className="mb-6 px-4 py-3 rounded-lg bg-red-900/40 border border-red-700 text-red-300 text-sm">
          Authorization was denied or an error occurred. Please try again.
        </div>
      )}

      <div className="max-w-lg space-y-4">
        {/* Google */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
          <div>
            <div className="font-medium">Google</div>
            <div className="text-xs text-gray-400 mt-0.5">Calendar · Gmail · Sheets</div>
          </div>
          {googleConnected ? (
            <span className="text-xs font-medium px-3 py-1 rounded-full bg-green-900/50 text-green-400 border border-green-700">
              Connected
            </span>
          ) : (
            <a
              href="/api/integrations/google/auth"
              className="text-sm font-medium px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 transition-colors"
            >
              Connect
            </a>
          )}
        </div>

        {/* Slack — coming soon */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 opacity-50">
          <div>
            <div className="font-medium">Slack</div>
            <div className="text-xs text-gray-400 mt-0.5">Messages · Channels</div>
          </div>
          <span className="text-xs text-gray-500">Coming soon</span>
        </div>

        {/* Notion — coming soon */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 opacity-50">
          <div>
            <div className="font-medium">Notion</div>
            <div className="text-xs text-gray-400 mt-0.5">Pages · Databases</div>
          </div>
          <span className="text-xs text-gray-500">Coming soon</span>
        </div>

        {/* HubSpot — coming soon */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 opacity-50">
          <div>
            <div className="font-medium">HubSpot</div>
            <div className="text-xs text-gray-400 mt-0.5">Contacts · Deals</div>
          </div>
          <span className="text-xs text-gray-500">Coming soon</span>
        </div>
      </div>
    </div>
  )
}
