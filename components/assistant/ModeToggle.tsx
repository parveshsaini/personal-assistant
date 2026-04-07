'use client'

import { Mic, MessageSquare } from 'lucide-react'

type Props = {
  mode: 'text' | 'voice'
  onChange: (mode: 'text' | 'voice') => void
}

export function ModeToggle({ mode, onChange }: Props) {
  return (
    <div className="flex items-center gap-1 bg-white/5 rounded-full p-1">
      <button
        onClick={() => onChange('text')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
          mode === 'text'
            ? 'bg-white/15 text-white'
            : 'text-gray-500 hover:text-gray-300'
        }`}
      >
        <MessageSquare className="w-3.5 h-3.5" />
        Text
      </button>
      <button
        onClick={() => onChange('voice')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
          mode === 'voice'
            ? 'bg-white/15 text-white'
            : 'text-gray-500 hover:text-gray-300'
        }`}
      >
        <Mic className="w-3.5 h-3.5" />
        Voice
      </button>
    </div>
  )
}
