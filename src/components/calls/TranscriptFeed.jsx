import { useEffect, useRef } from 'react'
import { Bot, User } from 'lucide-react'

function TranscriptFeed({ transcript }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [transcript])

  return (
    <div className="bg-white rounded-xl border border-slate-200 flex flex-col h-full overflow-hidden">

      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
        <div>
          <div className="text-sm font-bold text-slate-900">Live Transcript</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Whisper STT · en-IN</div>
        </div>
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 px-3 py-1.5 rounded-md">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[11px] font-bold text-red-600">RECORDING</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
        {transcript.map((line, i) => (
          <div
            key={i}
            className={`flex gap-3 ${line.role === 'aria' ? 'flex-row' : 'flex-row-reverse'}`}
          >
            {/* Avatar */}
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{
                background: line.role === 'aria' ? '#EFF6FF' : '#F0FDF4',
                border: line.role === 'aria' ? '1px solid #BFDBFE' : '1px solid #BBF7D0',
              }}
            >
              {line.role === 'aria'
                ? <Bot size={13} color="#2563EB" />
                : <User size={13} color="#15803D" />
              }
            </div>

            {/* Bubble */}
            <div className={`flex flex-col gap-1 max-w-[78%] ${line.role === 'aria' ? 'items-start' : 'items-end'}`}>
              <span className="text-[10px] text-slate-400 font-medium px-1">
                {line.role === 'aria' ? 'ARIA · AI Agent' : 'Customer'}
              </span>
              <div
                className="px-3.5 py-2.5 text-sm leading-relaxed text-slate-700"
                style={{
                  background: line.role === 'aria' ? '#EFF6FF' : '#F0FDF4',
                  border: line.role === 'aria' ? '1px solid #BFDBFE' : '1px solid #BBF7D0',
                  borderRadius: line.role === 'aria' ? '4px 12px 12px 12px' : '12px 4px 12px 12px',
                }}
              >
                {line.text}
              </div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

    </div>
  )
}

export default TranscriptFeed