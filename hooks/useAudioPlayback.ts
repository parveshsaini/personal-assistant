'use client'

import { useCallback, useRef } from 'react'

// Gemini outputs 24kHz raw 16-bit PCM, little-endian
const OUTPUT_SAMPLE_RATE = 24000

export function useAudioPlayback() {
  const contextRef = useRef<AudioContext | null>(null)
  const nextPlayTimeRef = useRef<number>(0)

  const ensureContext = useCallback(() => {
    if (!contextRef.current || contextRef.current.state === 'closed') {
      contextRef.current = new AudioContext({ sampleRate: OUTPUT_SAMPLE_RATE })
      nextPlayTimeRef.current = 0
    }
    return contextRef.current
  }, [])

  const enqueue = useCallback((base64Pcm: string) => {
    const ctx = ensureContext()

    // Decode base64 → ArrayBuffer
    const binary = atob(base64Pcm)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)

    // Parse 16-bit little-endian PCM → Float32
    const samples = bytes.byteLength / 2
    const float32 = new Float32Array(samples)
    const dataView = new DataView(bytes.buffer)
    for (let i = 0; i < samples; i++) {
      const int16 = dataView.getInt16(i * 2, true) // little-endian
      float32[i] = int16 / 32768
    }

    const audioBuffer = ctx.createBuffer(1, samples, OUTPUT_SAMPLE_RATE)
    audioBuffer.copyToChannel(float32, 0)

    const source = ctx.createBufferSource()
    source.buffer = audioBuffer
    source.connect(ctx.destination)

    const startAt = Math.max(ctx.currentTime, nextPlayTimeRef.current)
    source.start(startAt)
    nextPlayTimeRef.current = startAt + audioBuffer.duration
  }, [ensureContext])

  const stop = useCallback(() => {
    if (contextRef.current && contextRef.current.state !== 'closed') {
      contextRef.current.close()
      contextRef.current = null
      nextPlayTimeRef.current = 0
    }
  }, [])

  return { enqueue, stop }
}
