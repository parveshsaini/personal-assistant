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
    <div className="flex flex-col flex-1 items-center justify-center min-h-0 w-full p-4">
      {/* Message list */}
      <div className="w-full max-w-2xl overflow-y-auto max-h-[60vh] space-y-3 mb-6 px-2">
        {messages.length === 0 && (
          <p className="text-center text-gray-400 text-lg mt-8 mb-4">
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
        className="flex items-center gap-3 w-full max-w-2xl bg-[#1e1e2d] p-2 rounded-2xl border border-white/10 shadow-xl"
      >
        <input
          autoFocus
          id="chat-input-field"
          name="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          disabled={disabled}
          autoComplete="off"
          className="flex-1 bg-white/5 text-white placeholder-gray-400 rounded-xl px-5 py-3 text-base outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-40"
        />
        <button
          id="chat-send-button"
          type="submit"
          disabled={!input.trim() || disabled}
          className="p-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:hover:bg-blue-600 rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center"
        >
          <Send className="w-5 h-5 text-white" />
        </button>
      </form>
    </div>
  )
}
