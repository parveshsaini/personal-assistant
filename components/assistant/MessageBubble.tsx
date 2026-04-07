import { Mic } from 'lucide-react'
import type { Message } from '@/lib/db/schema'

type Props = { message: Message }

export function MessageBubble({ message }: Props) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? 'bg-blue-600 text-white rounded-br-sm'
            : 'bg-white/10 text-gray-100 rounded-bl-sm'
        }`}
      >
        {message.modality === 'voice' && (
          <Mic className="inline w-3 h-3 mr-1 opacity-60" />
        )}
        {message.content}
      </div>
    </div>
  )
}
