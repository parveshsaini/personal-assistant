'use client'

import { useCallback, useEffect, useState } from 'react'
import type { Conversation, Message } from '@/lib/db/schema'

export function useConversationHistory() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)

  // Load conversation list on mount
  useEffect(() => {
    fetch('/api/conversations')
      .then((r) => r.json())
      .then(setConversations)
      .catch(console.error)
  }, [])

  const selectConversation = useCallback(async (id: string) => {
    setActiveId(id)
    setLoading(true)
    try {
      const res = await fetch(`/api/conversations/${id}`)
      const msgs = await res.json()
      setMessages(msgs)
    } finally {
      setLoading(false)
    }
  }, [])

  const startNewConversation = useCallback(async () => {
    const res = await fetch('/api/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    })
    const conversation: Conversation = await res.json()
    setConversations((prev) => [conversation, ...prev])
    setActiveId(conversation.id)
    setMessages([])
    return conversation.id
  }, [])

  const addMessage = useCallback(
    async (
      role: 'user' | 'assistant',
      content: string,
      modality: 'text' | 'voice' = 'text'
    ) => {
      let id = activeId
      if (!id) {
        id = await startNewConversation()
      }

      const res = await fetch(`/api/conversations/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, content, modality })
      })
      const message: Message = await res.json()
      setMessages((prev) => [...prev, message])

      // Auto-title conversation from first user message
      if (role === 'user' && messages.length === 0) {
        const title = content.slice(0, 60)
        await fetch(`/api/conversations/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title })
        })
        setConversations((prev) =>
          prev.map((c) => (c.id === id ? { ...c, title } : c))
        )
      }

      return message
    },
    [activeId, messages.length, startNewConversation]
  )

  return {
    conversations,
    activeId,
    messages,
    loading,
    selectConversation,
    startNewConversation,
    addMessage,
  }
}
