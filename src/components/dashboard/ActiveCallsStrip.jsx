import { useNavigate } from 'react-router-dom'
import { PhoneCall } from 'lucide-react'
import useAriaStore from '../../store/ariaStore'
import { CATEGORIES } from '../../data/mockData'

const STAGES = {
  greeting: 'Greeting',
  categoryDetection: 'Category Detection',
  formFilling: 'Form Filling',
  confirmation: 'Confirmation',
  routing: 'Routing',
  complete: 'Complete',
}

function fmt(s) {
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

function ActiveCallsStrip() {
  const activeCalls = useAriaStore((s) => s.activeCalls)
  const navigate = useNavigate()

  return (
    <div className="bg-white rounded-xl border border-slate-200">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <div className="text-sm font-bold text-slate-900">Active Calls</div>
          <div className="text-[11px] text-slate-400 mt-0.5">ARIA is handling these right now</div>
        </div>
        <button
          onClick={() => navigate('/calls')}
          className="text-xs font-semibold text-blue-600 border border-blue-200 bg-blue-50 px-3 py-1.5 rounded-md hover:bg-blue-100 transition-all"
        >
          View All →
        </button>
      </div>

      <div className="p-4 grid grid-cols-3 gap-4">
        {activeCalls.map((call) => {
          const cat = CATEGORIES[call.category]
          const filled = Object.keys(call.filledFields).length
          const total = cat.fields.length
          const pct = Math.round((filled / total) * 100)

          return (
            <div
              key={call.id}
              onClick={() => navigate(`/calls/${call.id}`)}
              className="border border-slate-200 rounded-xl p-4 cursor-pointer hover:border-blue-300 hover:shadow-sm transition-all"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-[11px] font-bold text-red-600">LIVE · {fmt(call.duration)}</span>
                </div>
                <span
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: cat.bg, color: cat.color, border: `1px solid ${cat.border}` }}
                >
                  {cat.label}
                </span>
              </div>

              {/* Customer */}
              <div className="text-sm font-semibold text-slate-800 mb-0.5">
                {call.customer || 'Identifying...'}
              </div>
              <div className="text-[11px] text-slate-400 mb-3">{call.id}</div>

              {/* Stage */}
              <div className="flex items-center gap-2 mb-2">
                <PhoneCall size={11} color="#64748b" />
                <span className="text-[11px] text-slate-500 font-medium">{STAGES[call.stage]}</span>
              </div>

              {/* Progress */}
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-slate-400">Form Progress</span>
                <span className="text-[10px] font-bold text-slate-600">{filled}/{total} fields</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ActiveCallsStrip