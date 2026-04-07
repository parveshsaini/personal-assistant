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
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <span className="text-sm font-semibold text-gray-300">Conversations</span>
        <button
          onClick={onNew}
          className="p-1 rounded hover:bg-white/10 transition-colors"
          title="New conversation"
        >
          <Plus className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {conversations.length === 0 && (
          <p className="px-4 py-3 text-xs text-gray-600">No conversations yet</p>
        )}
        {conversations.map((c) => (
          <button
            key={c.id}
            onClick={() => onSelect(c.id)}
            className={`w-full flex items-center gap-2 px-4 py-2.5 text-left text-sm transition-colors ${
              c.id === activeId
                ? 'bg-white/10 text-white'
                : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{c.title ?? 'New conversation'}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
