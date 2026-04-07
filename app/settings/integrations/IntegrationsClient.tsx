'use client'

import { useSearchParams } from 'next/navigation'

export function IntegrationsClient({ googleConnected }: { googleConnected: boolean }) {
  const params = useSearchParams()
  const justConnected = params.get('connected')
  const errorParam = params.get('error')

  return (
    <div className="flex h-[calc(100vh-1rem)] flex-1 overflow-hidden rounded-[24px]">
       <main className="flex flex-col flex-1 min-w-0 bg-[#f3f5f9] text-gray-900 overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.1)] relative">
        <header className="flex items-center justify-between px-10 py-5 bg-white/70 backdrop-blur-xl sticky top-0 z-10 flex-shrink-0 border-b border-gray-200/50">
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Integrations Settings</h1>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-10 flex justify-center">
            <div className="bg-white max-w-3xl w-full rounded-[32px] shadow-sm shadow-black/5 flex flex-col p-8 md:p-12 border border-gray-100/50 min-h-full">
              <h1 className="text-2xl font-bold mb-2 text-gray-900">Connections</h1>
              <p className="text-gray-500 text-sm mb-8">Connect your productivity tools to enable the assistant to act on your behalf.</p>

              {justConnected && (
                <div className="mb-6 px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm">
                  Successfully connected {justConnected}.
                </div>
              )}
              {errorParam && (
                <div className="mb-6 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                  Authorization was denied or an error occurred. Please try again.
                </div>
              )}

              <div className="w-full space-y-4">
                {/* Google */}
                <div className="flex items-center justify-between p-5 rounded-2xl bg-[#f8f9fa] border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all">
                  <div>
                    <div className="font-bold text-[15px] text-gray-900 tracking-tight">Google Workspace</div>
                    <div className="text-[13px] text-gray-500 mt-1 font-medium">Calendar · Gmail · Sheets</div>
                  </div>
                  {googleConnected ? (
                    <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-green-100 text-green-700 border border-green-200 shadow-sm">
                      Connected
                    </span>
                  ) : (
                    <a
                      href="/api/integrations/google/auth"
                      className="text-[13px] font-bold px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/20 transition-all active:scale-95"
                    >
                      Connect
                    </a>
                  )}
                </div>

                {/* Slack — coming soon */}
                <div className="flex items-center justify-between p-5 rounded-2xl bg-[#f8f9fa] border border-gray-100 opacity-60">
                  <div>
                    <div className="font-bold text-[15px] text-gray-900 tracking-tight">Slack</div>
                    <div className="text-[13px] text-gray-500 mt-1 font-medium">Messages · Channels</div>
                  </div>
                  <span className="text-[11px] font-bold tracking-widest uppercase text-gray-400 bg-gray-200/50 px-3 py-1 rounded-full">Coming soon</span>
                </div>

                {/* Notion — coming soon */}
                <div className="flex items-center justify-between p-5 rounded-2xl bg-[#f8f9fa] border border-gray-100 opacity-60">
                  <div>
                    <div className="font-bold text-[15px] text-gray-900 tracking-tight">Notion</div>
                    <div className="text-[13px] text-gray-500 mt-1 font-medium">Pages · Databases</div>
                  </div>
                  <span className="text-[11px] font-bold tracking-widest uppercase text-gray-400 bg-gray-200/50 px-3 py-1 rounded-full">Coming soon</span>
                </div>

                {/* HubSpot — coming soon */}
                <div className="flex items-center justify-between p-5 rounded-2xl bg-[#f8f9fa] border border-gray-100 opacity-60">
                  <div>
                    <div className="font-bold text-[15px] text-gray-900 tracking-tight">HubSpot</div>
                    <div className="text-[13px] text-gray-500 mt-1 font-medium">Contacts · Deals</div>
                  </div>
                  <span className="text-[11px] font-bold tracking-widest uppercase text-gray-400 bg-gray-200/50 px-3 py-1 rounded-full">Coming soon</span>
                </div>
              </div>
            </div>
        </div>
       </main>
    </div>
  )
}
