import { useState } from 'react'
import { X, Send, PhoneCall } from 'lucide-react'
import useAriaStore from '../../store/ariaStore'

function RealCallPanel({ onClose }) {
  const [callId] = useState(`CALL-${Date.now()}`)
  const [input, setInput] = useState('')
  const [started, setStarted] = useState(false)
  const [loading, setLoading] = useState(false)
  const startRealCall = useAriaStore((s) => s.startRealCall)
  const sendMessage = useAriaStore((s) => s.sendMessage)
  const activeCalls = useAriaStore((s) => s.activeCalls)

  const currentCall = activeCalls.find((c) => c.id === callId)

  const handleStart = async () => {
    setLoading(true)
    await startRealCall(callId)
    setStarted(true)
    setLoading(false)
  }

  const handleSend = async () => {
    if (!input.trim()) return
    setLoading(true)
    const msg = input.trim()
    setInput('')
    await sendMessage(callId, msg)
    setLoading(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl w-[560px] max-h-[80vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <PhoneCall size={15} color="white" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">New Live Call</div>
              <div className="text-[11px] text-slate-400 font-mono">{callId}</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center hover:bg-slate-100"
          >
            <X size={13} color="#64748b" />
          </button>
        </div>

        {/* Transcript */}
        <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-3">
          {!started ? (
            <div className="flex flex-col items-center justify-center h-40 gap-4">
              <div className="text-slate-400 text-sm text-center">
                Click below to connect the call.<br />
                ARIA will greet the customer automatically.
              </div>
              <button
                onClick={handleStart}
                disabled={loading}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all disabled:opacity-50"
              >
                <PhoneCall size={14} color="white" />
                {loading ? 'Connecting...' : 'Connect Call'}
              </button>
            </div>
          ) : (
            currentCall?.transcript.map((line, i) => (
              <div
                key={i}
                className={`flex gap-2 ${line.role === 'aria' ? 'flex-row' : 'flex-row-reverse'}`}
              >
                <div
                  className="px-4 py-2.5 rounded-xl text-sm max-w-[80%] leading-relaxed"
                  style={{
                    background: line.role === 'aria' ? '#EFF6FF' : '#F0FDF4',
                    color: line.role === 'aria' ? '#1E40AF' : '#166534',
                    borderRadius: line.role === 'aria' ? '4px 12px 12px 12px' : '12px 4px 12px 12px',
                  }}
                >
                  {line.text}
                </div>
              </div>
            ))
          )}
          {loading && started && (
            <div className="flex gap-1 px-4 py-3">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          )}
        </div>

        {/* Input */}
        {started && (
          <div className="px-6 py-4 border-t border-slate-100 flex gap-3 flex-shrink-0">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type customer response..."
              disabled={loading}
              className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-blue-400 disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center hover:bg-blue-700 transition-all disabled:opacity-40"
            >
              <Send size={14} color="white" />
            </button>
          </div>
        )}

      </div>
    </div>
  )
}

export default RealCallPanel