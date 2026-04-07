'use client'

import { useCallback, useRef } from 'react'

type OnChunk = (base64Pcm: string) => void

export function useAudioCapture() {
  const contextRef = useRef<AudioContext | null>(null)
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const workletRef = useRef<AudioWorkletNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const start = useCallback(async (onChunk: OnChunk) => {
    // 16kHz context — browser resamples mic input automatically
    const ctx = new AudioContext({ sampleRate: 16000 })
    contextRef.current = ctx

    await ctx.audioWorklet.addModule('/audio-processor.worklet.js')

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
    streamRef.current = stream

    const source = ctx.createMediaStreamSource(stream)
    sourceRef.current = source

    const worklet = new AudioWorkletNode(ctx, 'audio-processor')
    workletRef.current = worklet

    worklet.port.onmessage = (e: MessageEvent<{ pcm: Int16Array }>) => {
      // Convert Int16Array → Uint8Array → base64
      const bytes = new Uint8Array(e.data.pcm.buffer)
      let binary = ''
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i])
      }
      onChunk(btoa(binary))
    }

    source.connect(worklet)
    worklet.connect(ctx.destination) // required to keep worklet alive (silent output)
  }, [])

  const stop = useCallback(() => {
    workletRef.current?.disconnect()
    sourceRef.current?.disconnect()
    streamRef.current?.getTracks().forEach((t) => t.stop())
    contextRef.current?.close()
    workletRef.current = null
    sourceRef.current = null
    streamRef.current = null
    contextRef.current = null
  }, [])

  return { start, stop }
}
