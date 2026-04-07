'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { GoogleGenAI, Modality, ThinkingLevel, type Session } from '@google/genai/web'
import { useAudioCapture } from './useAudioCapture'
import { useAudioPlayback } from './useAudioPlayback'
import type { SessionState, TranscriptEntry, ToolCallPayload } from '@/types/gemini'

// Updated to Gemini 3.1 Flash Live Preview
const MODEL = 'gemini-3.1-flash-live-preview'
const SESSION_HANDLE_KEY = 'gemini_session_handle'

type Options = {
  onTranscript?: (entry: TranscriptEntry) => void
  onToolCall?: (call: ToolCallPayload) => Promise<unknown>
  onStateChange?: (state: SessionState) => void
}

// Build tool declarations lazily so we don't import heavy server-side code at module level
async function getDeclarations() {
  const { ALL_DECLARATIONS } = await import('@/lib/gemini/function-declarations')
  return ALL_DECLARATIONS
}

export function useGeminiSession(options: Options = {}) {
  const [state, setState] = useState<SessionState>('idle')
  const [inputTranscript, setInputTranscript] = useState('')
  const [outputTranscript, setOutputTranscript] = useState('')

  const sessionRef = useRef<Session | null>(null)
  const stateRef = useRef<SessionState>('idle')
  const optionsRef = useRef(options)
  const pendingUserRef = useRef('')
  const pendingModelRef = useRef('')
  optionsRef.current = options

  const { start: startCapture, stop: stopCapture } = useAudioCapture()
  const { enqueue: enqueueAudio, stop: stopPlayback } = useAudioPlayback()

  const setSessionState = useCallback((s: SessionState) => {
    stateRef.current = s
    setState(s)
    optionsRef.current.onStateChange?.(s)
  }, [])

  const connect = useCallback(async () => {
    if (sessionRef.current) {
      try { sessionRef.current.close() } catch { /* ignore */ }
      sessionRef.current = null
    }

    setSessionState('connecting')

    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY
    if (!apiKey) {
      console.error('[Gemini] NEXT_PUBLIC_GEMINI_API_KEY is not set')
      setSessionState('error')
      return
    }

    // Direct browser → Gemini Live API connection (no ephemeral token needed for single-user)
    const ai = new GoogleGenAI({ apiKey })

    const declarations = await getDeclarations()
    const savedHandle = sessionStorage.getItem(SESSION_HANDLE_KEY)

    let session: Session
    try {
      session = await ai.live.connect({
        model: MODEL,
        config: {
          sessionResumption: savedHandle ? { handle: savedHandle } : {},
          thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
          responseModalities: [Modality.AUDIO],
          outputAudioTranscription: {},
          inputAudioTranscription: {},
          tools: [{ functionDeclarations: declarations }],
          systemInstruction: {
            parts: [{
              text: `You are a highly capable personal assistant. You help the user manage their calendar, emails, Slack messages, Notion pages, spreadsheets, and CRM. Be concise and action-oriented. When you take an action (like sending an email or creating a calendar event), always confirm what you did. Today's date is ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.`,
            }],
          },
        },
        callbacks: {
          onopen: () => {
            setSessionState('listening')
          },

          onmessage: async (msg) => {
            const sc = msg.serverContent
            if (sc) {
              const parts = sc.modelTurn?.parts ?? []
              for (const part of parts) {
                if (part.inlineData?.data) {
                  enqueueAudio(part.inlineData.data)
                  setSessionState('speaking')
                }
              }

              if (sc.inputTranscription?.text) {
                const text = sc.inputTranscription.text
                setInputTranscript(text)
                pendingUserRef.current += text + ' '
              }

              if (sc.outputTranscription?.text) {
                // If AI starts speaking, flush the user's accumulated input.
                if (pendingUserRef.current.trim()) {
                  optionsRef.current.onTranscript?.({ role: 'user', text: pendingUserRef.current.trim(), timestamp: Date.now() })
                  pendingUserRef.current = ''
                }

                const text = sc.outputTranscription.text
                setOutputTranscript(text)
                pendingModelRef.current += text + ' '
              }

              if (sc.interrupted) {
                stopPlayback()
                setSessionState('listening')
                if (pendingModelRef.current.trim()) {
                  optionsRef.current.onTranscript?.({ role: 'model', text: pendingModelRef.current.trim(), timestamp: Date.now() })
                  pendingModelRef.current = ''
                }
              }

              if (sc.generationComplete) {
                setSessionState('listening')
                if (pendingModelRef.current.trim()) {
                  optionsRef.current.onTranscript?.({ role: 'model', text: pendingModelRef.current.trim(), timestamp: Date.now() })
                  pendingModelRef.current = ''
                }
              }
            }

            const toolCall = msg.toolCall
            if (toolCall?.functionCalls?.length) {
              const responses = await Promise.all(
                toolCall.functionCalls.map(async (fc) => {
                  let result: unknown = { error: 'No handler' }
                  try {
                    result = await optionsRef.current.onToolCall?.({
                      name: fc.name ?? '',
                      id: fc.id ?? '',
                      args: (fc.args as Record<string, unknown>) ?? {},
                    })
                  } catch (err) {
                    result = { error: String(err) }
                  }
                  return { name: fc.name ?? '', id: fc.id ?? '', response: { result } }
                })
              )
              sessionRef.current?.sendToolResponse({ functionResponses: responses })
            }

            const resumption = msg.sessionResumptionUpdate
            if (resumption?.resumable && resumption.newHandle) {
              sessionStorage.setItem(SESSION_HANDLE_KEY, resumption.newHandle)
            }

            if (msg.goAway) {
              console.log('[Gemini] GoAway — reconnecting')
              connect()
            }
          },

          onerror: (e) => {
            console.error('[Gemini] Session error', e)
            setSessionState('error')
          },

          onclose: () => {
            if (stateRef.current !== 'idle') {
              setSessionState('idle')
            }
          },
        },
      })
    } catch (err) {
      console.error('[Gemini] live.connect() failed', err)
      setSessionState('error')
      return
    }

    sessionRef.current = session
  }, [enqueueAudio, stopPlayback, setSessionState])

  const startVoice = useCallback(async () => {
    if (stateRef.current === 'idle' || stateRef.current === 'error') {
      await connect()
    }
    await startCapture((base64Pcm) => {
      sessionRef.current?.sendRealtimeInput({
        audio: { data: base64Pcm, mimeType: 'audio/pcm;rate=16000' },
      })
    })
  }, [connect, startCapture])

  const stopVoice = useCallback(() => {
    if (pendingUserRef.current.trim()) {
      optionsRef.current.onTranscript?.({ role: 'user', text: pendingUserRef.current.trim(), timestamp: Date.now() })
      pendingUserRef.current = ''
    }
    if (pendingModelRef.current.trim()) {
      optionsRef.current.onTranscript?.({ role: 'model', text: pendingModelRef.current.trim(), timestamp: Date.now() })
      pendingModelRef.current = ''
    }
    stopCapture()
    stopPlayback()
    try { sessionRef.current?.close() } catch { /* ignore */ }
    sessionRef.current = null
    setSessionState('idle')
  }, [stopCapture, stopPlayback, setSessionState])

  const sendText = useCallback(async (text: string) => {
    if (!sessionRef.current || stateRef.current === 'idle' || stateRef.current === 'error') {
      await connect()
    }
    sessionRef.current?.sendRealtimeInput({ text })
    setSessionState('speaking')
  }, [connect, setSessionState])

  useEffect(() => {
    return () => {
      stopCapture()
      stopPlayback()
      try { sessionRef.current?.close() } catch { /* ignore */ }
    }
  }, [stopCapture, stopPlayback])

  return { state, inputTranscript, outputTranscript, startVoice, stopVoice, sendText, connect }
}
