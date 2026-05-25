import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import useAriaStore from '../store/ariaStore'
import { CATEGORIES } from '../data/mockData'
import TranscriptFeed from '../components/calls/TranscriptFeed'
import LiveForm from '../components/calls/LiveForm'

function fmt(s) {
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

function CallDetail() {
  const { callId } = useParams()
  const navigate = useNavigate()
  const activeCalls = useAriaStore((s) => s.activeCalls)
  const call = activeCalls.find((c) => c.id === callId)

  if (!call) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="text-slate-400 text-sm">Call not found</div>
        <button
          onClick={() => navigate('/calls')}
          className="text-blue-600 text-sm font-semibold"
        >
          ← Back to Active Calls
        </button>
      </div>
    )
  }

  const cat = CATEGORIES[call.category]
  const filled = Object.keys(call.filledFields).length
  const total = cat.fields.length

  return (
    <div className="flex flex-col gap-4 h-full">

      {/* Breadcrumb & Meta */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/calls')}
            className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft size={14} /> Active Calls
          </button>
          <span className="text-slate-300">/</span>
          <span className="text-xs font-semibold text-slate-900">{call.id}</span>
        </div>

        {/* Call Meta */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-4 py-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs font-bold text-red-600">LIVE · {fmt(call.duration)}</span>
          </div>
          <div
            className="text-xs font-semibold px-3 py-2 rounded-lg"
            style={{ background: cat.bg, color: cat.color, border: `1px solid ${cat.border}` }}
          >
            {cat.label}
          </div>
          <div className="bg-white border border-slate-200 rounded-lg px-4 py-2">
            <span className="text-xs font-bold text-slate-700">
              {call.customer || 'Identifying...'}
            </span>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg px-4 py-2">
            <span className="text-xs text-slate-500">
              {filled}/{total} fields · {Math.round((filled / total) * 100)}% complete
            </span>
          </div>
        </div>
      </div>

      {/* Split Panel */}
      <div className="grid grid-cols-2 gap-5 flex-1 min-h-0">
        <TranscriptFeed transcript={call.transcript} />
        <LiveForm call={call} />
      </div>

    </div>
  )
}

export default CallDetail