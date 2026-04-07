import { Mic } from 'lucide-react'
import type { Message } from '@/lib/db/schema'

type Props = { message: Message }

export function MessageBubble({ message }: Props) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex gap-3 w-full ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
       {!isUser && (
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-blue-400 flex items-center justify-center flex-shrink-0 shadow-sm mt-1">
             <span className="text-white font-bold text-[13px]">A</span>
          </div>
       )}
       {isUser && (
          <div className="w-8 h-8 rounded-full bg-[#f0f2f5] flex items-center justify-center flex-shrink-0 mt-1 text-blue-600 border border-black/5">
             <span className="font-bold text-[13px] shadow-sm">U</span>
          </div>
       )}
      <div className="flex flex-col">
          <div className={`flex items-center gap-2 mb-1.5 ${isUser ? 'justify-end' : 'justify-start'}`}>
               <span className={`text-[13px] font-bold ${isUser ? 'text-gray-900' : 'text-gray-400'}`}>
                  {isUser ? 'User' : 'Aether'}
               </span>
               <span className="text-[11px] text-gray-400 font-medium">9:41 AM</span>
          </div>
          <div
            className={`max-w-[85%] sm:max-w-[75%] rounded-[18px] px-5 py-3 text-[14.5px] leading-[1.6] shadow-sm tracking-tight ${
              isUser
                ? 'bg-[#f3f5f9] text-gray-800 rounded-tr-sm self-end border border-gray-100'
                : 'bg-[#f8f9fc] border border-gray-100 text-gray-800 rounded-tl-sm self-start'
            }`}
          >
            {message.modality === 'voice' && (
              <Mic className="inline w-[14px] h-[14px] mr-2 opacity-60 text-blue-500" />
            )}
            {message.content}
          </div>
      </div>
    </div>
  )
}
