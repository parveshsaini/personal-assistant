'use client'

import { motion } from 'framer-motion'
import type { SessionState } from '@/types/gemini'

type Props = {
  state: SessionState
  onClick: () => void
}

const stateConfig: Record<SessionState, { color: string; scale: number[]; label: string }> = {
  idle:       { color: '#6b7280', scale: [1, 1],        label: 'Start voice' },
  connecting: { color: '#f59e0b', scale: [1, 1.05, 1],  label: 'Connecting…' },
  listening:  { color: '#22c55e', scale: [1, 1.1, 1],   label: 'Listening…' },
  speaking:   { color: '#3b82f6', scale: [1, 1.15, 1],  label: 'Speaking…' },
  error:      { color: '#ef4444', scale: [1, 1],        label: 'Error — tap to retry' },
}

export function VoiceOrb({ state, onClick }: Props) {
  const cfg = stateConfig[state]

  return (
    <div className="flex flex-col items-center gap-3">
      <motion.button
        onClick={onClick}
        animate={{ scale: cfg.scale }}
        transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
        className="relative flex items-center justify-center w-24 h-24 rounded-full cursor-pointer focus:outline-none"
        style={{ backgroundColor: cfg.color }}
        aria-label={cfg.label}
      >
        {/* Ripple ring */}
        {(state === 'listening' || state === 'speaking') && (
          <motion.span
            className="absolute inset-0 rounded-full"
            style={{ backgroundColor: cfg.color }}
            animate={{ scale: [1, 1.6], opacity: [0.4, 0] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut' }}
          />
        )}
        {/* Mic icon */}
        <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 1a4 4 0 0 1 4 4v6a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4zm0 2a2 2 0 0 0-2 2v6a2 2 0 0 0 4 0V5a2 2 0 0 0-2-2zm7 8a1 1 0 0 1 1 1 8 8 0 0 1-7 7.93V22h2a1 1 0 0 1 0 2H9a1 1 0 0 1 0-2h2v-2.07A8 8 0 0 1 4 12a1 1 0 0 1 2 0 6 6 0 0 0 12 0 1 1 0 0 1 1-1z"/>
        </svg>
      </motion.button>
      <span className="text-sm text-gray-400">{cfg.label}</span>
    </div>
  )
}
