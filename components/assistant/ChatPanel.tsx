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

  const groupedMessages = messages.reduce((acc, curr) => {
     if (acc.length > 0 && acc[acc.length - 1].role === curr.role) {
         acc[acc.length - 1].content += ' ' + curr.content
     } else {
         acc.push({ ...curr })
     }
     return acc
  }, [] as Message[])

  return (
    <div className="flex flex-col flex-1 items-center justify-center min-h-0 w-full bg-white">
      {/* Message list */}
      <div className="w-full flex-1 overflow-y-auto px-6 py-6 space-y-4">
        {groupedMessages.length === 0 && (
          <p className="text-center text-gray-400 text-lg mt-12 mb-4">
             Start a conversation
          </p>
        )}
        {groupedMessages.map((m, index) => (
          <MessageBubble key={m.id || index} message={m} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="gap-3 w-full p-6 pt-2 bg-white"
      >
        <div className="flex items-center border border-gray-200 bg-gray-50 rounded-[20px] overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all shadow-sm pl-5 pr-2 py-2">
           <input
             autoFocus
             id="chat-input-field"
             name="chat-input"
             value={input}
             onChange={(e) => setInput(e.target.value)}
             placeholder="Dynamic text input in the conversation..."
             disabled={disabled}
             autoComplete="off"
             className="flex-1 bg-transparent text-gray-900 placeholder-gray-400 text-[15px] outline-none py-2 disabled:opacity-50"
           />
           <button
             id="chat-send-button"
             type="submit"
             disabled={!input.trim() || disabled}
             className="px-[18px] py-[10px] bg-blue-600 hover:bg-blue-500 disabled:bg-gray-200 disabled:text-gray-400 rounded-xl shadow-sm transition-all active:scale-95 flex items-center justify-center text-white font-semibold text-sm"
           >
             Send
           </button>
        </div>
      </form>
    </div>
  )
}
