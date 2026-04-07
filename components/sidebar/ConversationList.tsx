'use client'

import { MessageSquare, Plus } from 'lucide-react'
import type { Conversation } from '@/lib/db/schema'

type Props = {
  conversations: Conversation[]
  activeId: string | null
  onSelect: (id: string) => void
  onNew: () => void
}

export function ConversationList({ conversations, activeId, onSelect, onNew }: Props) {
  return (
    <div className="flex flex-col h-full bg-[#1a1a24]">
      <div className="flex-1 overflow-y-auto py-2 space-y-1">
        {conversations.length === 0 && (
          <p className="px-4 py-3 text-xs text-gray-600">No conversations yet</p>
        )}
        {conversations.map((c) => (
          <button
            key={c.id}
            onClick={() => onSelect(c.id)}
            className={`w-full flex items-center gap-3 px-[18px] py-3 text-left text-[13.5px] font-medium transition-all mx-2 rounded-xl truncate max-w-[240px] ${
              c.id === activeId
                ? 'bg-[#252535] text-white shadow-sm ring-1 ring-white/5 border-l-2 border-blue-500'
                : 'text-gray-400 hover:bg-white/5 hover:text-gray-200 border-l-2 border-transparent'
            }`}
          >
            <MessageSquare className={`w-4 h-4 flex-shrink-0 ${c.id === activeId ? 'text-gray-300' : 'text-gray-500'}`} />
            <div className="flex flex-col w-full overflow-hidden">
               <span className="truncate">{c.title ?? 'New conversation'}</span>
               <span className={`text-[11px] truncate mt-0.5 ${c.id === activeId ? 'text-gray-400' : 'text-gray-500'}`}>
                 {c.title ?? 'New conversation'}
               </span>
            </div>
            {c.id === activeId && <div className="w-1.5 h-1.5 rounded-full bg-orange-400 ml-auto shadow-[0_0_8px_rgba(251,146,60,0.8)]"></div>}
          </button>
        ))}
      </div>
    </div>
  )
}
