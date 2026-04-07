'use client'

import { useEffect, useRef, useState } from 'react'
import { Send } from 'lucide-react'
import { MessageBubble } from './MessageBubble'
import type { Message } from '@/lib/db/schema'

type Props = {
  messages: Message[]
  onSend: (text: string) => void
  disabled?: boolean
}

export function ChatPanel({ messages, onSend, disabled }: Props) {
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const text = input.trim()
    if (!text || disabled) return
    setInput('')
    onSend(text)
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Message list */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-center text-gray-600 text-sm mt-16">
            Say hello to get started
          </p>
        )}
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 px-4 py-3 border-t border-white/10"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message…"
          disabled={disabled}
          className="flex-1 bg-white/5 text-white placeholder-gray-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-white/20 disabled:opacity-40"
        />
        <button
          type="submit"
          disabled={!input.trim() || disabled}
          className="p-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 rounded-xl transition-colors"
        >
          <Send className="w-4 h-4 text-white" />
        </button>
      </form>
    </div>
  )
}
