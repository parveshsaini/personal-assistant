'use client'

import { motion, AnimatePresence } from 'framer-motion'

type Props = {
  inputTranscript: string   // what the user said
  outputTranscript: string  // what Gemini said
}

export function TranscriptOverlay({ inputTranscript, outputTranscript }: Props) {
  return (
    <div className="flex flex-col items-center gap-2 min-h-[4rem] max-w-md w-full text-center">
      <AnimatePresence mode="wait">
        {inputTranscript && (
          <motion.p
            key={inputTranscript}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-sm text-gray-400 italic"
          >
            You: {inputTranscript}
          </motion.p>
        )}
      </AnimatePresence>
      <AnimatePresence mode="wait">
        {outputTranscript && (
          <motion.p
            key={outputTranscript}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-sm text-white"
          >
            {outputTranscript}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
