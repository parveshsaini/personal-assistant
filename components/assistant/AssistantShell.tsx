'use client'

import { useState, useCallback } from 'react'
import { useGeminiSession } from '@/hooks/useGeminiSession'
import { useConversationHistory } from '@/hooks/useConversationHistory'
import { useToolExecutor } from '@/hooks/useToolExecutor'
import { VoiceOrb } from './VoiceOrb'
import { TranscriptOverlay } from './TranscriptOverlay'
import { ChatPanel } from './ChatPanel'
import { ModeToggle } from './ModeToggle'
import { ConversationList } from '@/components/sidebar/ConversationList'
import type { SessionState, TranscriptEntry } from '@/types/gemini'

export function AssistantShell() {
  const [mode, setMode] = useState<'text' | 'voice'>('text')

  const history = useConversationHistory()
  const executeTool = useToolExecutor()

  const handleTranscript = useCallback(
    async (entry: TranscriptEntry) => {
      // Persist voice transcripts to conversation history
      await history.addMessage(
        entry.role === 'user' ? 'user' : 'assistant',
        entry.text,
        'voice'
      )
    },
    [history]
  )

  const { state, inputTranscript, outputTranscript, startVoice, stopVoice, sendText } =
    useGeminiSession({ onTranscript: handleTranscript, onToolCall: executeTool })

  const isVoiceActive = state !== 'idle' && state !== 'error'

  function handleOrbClick() {
    if (isVoiceActive) {
      stopVoice()
    } else {
      startVoice()
    }
  }

  async function handleTextSend(text: string) {
    // Save user message
    await history.addMessage('user', text, 'text')
    // Send to Gemini
    sendText(text)
  }

  function handleModeChange(newMode: 'text' | 'voice') {
    if (newMode === 'text' && isVoiceActive) stopVoice()
    setMode(newMode)
  }

  return (
    <div className="flex h-screen bg-gray-950 text-white overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 flex-shrink-0">
        <ConversationList
          conversations={history.conversations}
          activeId={history.activeId}
          onSelect={history.selectConversation}
          onNew={history.startNewConversation}
        />
      </aside>

      {/* Main area */}
      <main className="flex flex-col flex-1 min-w-0">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-white/10 flex-shrink-0">
          <h1 className="text-base font-semibold">Personal Assistant</h1>
          <ModeToggle mode={mode} onChange={handleModeChange} />
        </header>

        {/* Content */}
        {mode === 'text' ? (
          <ChatPanel
            messages={history.messages}
            onSend={handleTextSend}
            disabled={history.loading}
          />
        ) : (
          <div className="flex flex-col flex-1 items-center justify-center gap-8 p-8">
            <VoiceOrb state={state as SessionState} onClick={handleOrbClick} />
            <TranscriptOverlay
              inputTranscript={inputTranscript}
              outputTranscript={outputTranscript}
            />
          </div>
        )}
      </main>
    </div>
  )
}
