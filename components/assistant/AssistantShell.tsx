'use client'

import { useState, useCallback } from 'react'
import { useGeminiSession } from '@/hooks/useGeminiSession'
import { useConversationHistory } from '@/hooks/useConversationHistory'
import { useToolExecutor } from '@/hooks/useToolExecutor'
import { VoiceOrb } from './VoiceOrb'
import { TranscriptOverlay } from './TranscriptOverlay'
import { ChatPanel } from './ChatPanel'
import { ConversationList } from '@/components/sidebar/ConversationList'
import type { SessionState, TranscriptEntry } from '@/types/gemini'
import { Search, Mail, Bell, Edit, MoreHorizontal, Mic, Phone, Volume2, Plus } from 'lucide-react'

export function AssistantShell() {
  const history = useConversationHistory()
  const executeTool = useToolExecutor()

  const handleTranscript = useCallback(
    async (entry: TranscriptEntry) => {
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
    await history.addMessage('user', text, 'text')
    sendText(text)
  }

  return (
    <div className="flex flex-1 bg-[#1a1a24] text-white overflow-hidden rounded-[24px]">
      {/* Secondary Sidebar (Chat History) */}
      <aside className="w-[260px] bg-[#1a1a24] flex-shrink-0 flex flex-col border-r border-[#242432]">
        <div className="px-6 py-6 pb-2">
          <h2 className="font-semibold text-lg text-white/90">Chat History</h2>
        </div>
        <div className="px-5 mb-4 mt-2">
          <button onClick={history.startNewConversation} className="w-full flex items-center justify-center gap-2 py-3 rounded-[14px] bg-white/5 border border-white/5 hover:bg-white/10 transition-all text-sm font-semibold shadow-sm">
            <Plus className="w-4 h-4" /> New Chat
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <ConversationList
            conversations={history.conversations}
            activeId={history.activeId}
            onSelect={history.selectConversation}
            onNew={history.startNewConversation}
          />
        </div>
      </aside>

      {/* Main area */}
      <main className="flex flex-col flex-1 min-w-0 bg-[#f3f5f9] text-gray-900 rounded-tl-[32px] rounded-bl-[32px] overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.1)] relative">
        {/* Content (Side by Side) */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 h-full min-h-[600px]">
            {/* Left Panel: Chat Panel */}
            <div className="bg-white rounded-[32px] shadow-sm shadow-black/5 flex flex-col overflow-hidden h-full">
              <div className="px-8 py-5 flex items-center justify-between border-b border-gray-100">
                <div className="flex items-center gap-2 tracking-tight">
                  <h3 className="font-bold text-gray-900 text-[17px]">What's in you mind?</h3>
                </div>
              </div>
              <div className="flex flex-1 flex-col overflow-hidden">
                <ChatPanel
                  messages={history.messages}
                  onSend={handleTextSend}
                  disabled={history.loading}
                />
              </div>
            </div>

            {/* Right Panel: Active Voice Session */}
            <div className="bg-white rounded-[32px] shadow-sm shadow-black/5 flex flex-col overflow-hidden h-full">
              <div className="px-8 py-5 flex items-center justify-between border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-gray-900 text-[17px] tracking-tight">Wanna talk?</h3>
                </div>
              </div>
              <div className="flex-1 flex flex-col px-8 py-6 items-center w-full relative">

                {/* Voice Orb Area */}
                <div className="w-full h-2/5 min-h-[220px] rounded-[24px] bg-gradient-to-b from-[#f8f9fa] to-white flex items-center justify-center relative border border-gray-100 mb-6 group">
                  <div className="absolute top-5 right-5 bg-green-50 text-green-600 px-4 py-1.5 rounded-full text-xs font-bold ring-1 ring-green-600/20 shadow-sm">Active</div>

                  <div className="scale-[1.6]">
                    <VoiceOrb state={state as SessionState} onClick={handleOrbClick} />
                  </div>

                  <div className="absolute bottom-5 left-6 right-6 flex justify-between text-[11px] font-bold text-gray-400 tracking-wider">
                    <span>PSPA: <span className="text-gray-600">{state === 'listening' ? 'LISTENING' : (state === 'speaking' ? 'SPEAKING' : 'IDLE')}</span></span>
                    <span>USER: <span className="text-green-500">MIC ACTIVE</span></span>
                  </div>
                </div>

                {/* Transcript Area */}
                <div className="w-full flex-1 bg-[#f8f9fa] rounded-[24px] p-6 border border-gray-100 flex flex-col mb-6 min-h-[140px]">
                  <div className="font-bold text-gray-900 mb-3 text-sm tracking-tight flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> Transcript
                  </div>
                  <div className="text-[14.5px] text-gray-600 leading-loose flex-1 overflow-y-auto">
                    <TranscriptOverlay
                      inputTranscript={inputTranscript}
                      outputTranscript={outputTranscript}
                    />
                  </div>
                </div>

                {/* Call Controls */}
                <div className="flex items-center gap-8 mt-auto pb-2 justify-center w-full">
                  <button
                    onClick={() => { if (isVoiceActive) stopVoice(); else startVoice(); }}
                    className="flex flex-col items-center gap-3 group">
                    <div className={`w-[60px] h-[60px] rounded-full flex items-center justify-center text-white ${isVoiceActive ? 'bg-[#ff4b4b] shadow-[0_4px_14px_rgba(255,75,75,0.4)] hover:bg-[#ff3b3b]' : 'bg-[#10b981] shadow-[0_4px_14px_rgba(16,185,129,0.4)] hover:bg-[#0ea5e9]'} transition-all group-active:scale-95`}>
                      <Phone className={`w-6 h-6 ${isVoiceActive ? 'rotate-[135deg]' : ''} transition-transform duration-300`} />
                    </div>
                    <span className={`text-[11px] font-bold tracking-wide uppercase ${isVoiceActive ? 'text-[#ff4b4b]' : 'text-[#10b981]'}`}>
                      {isVoiceActive ? 'End Call' : 'Start Call'}
                    </span>
                  </button>
                </div>

              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
