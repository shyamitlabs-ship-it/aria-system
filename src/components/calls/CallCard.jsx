import { useNavigate } from 'react-router-dom'
import { PhoneCall, ArrowRight } from 'lucide-react'
import { CATEGORIES } from '../../data/mockData'

const STAGES = {
  greeting: { label: 'Greeting', pct: 10 },
  categoryDetection: { label: 'Category Detection', pct: 25 },
  formFilling: { label: 'Form Filling', pct: 60 },
  confirmation: { label: 'Confirmation', pct: 85 },
  routing: { label: 'Routing', pct: 95 },
  complete: { label: 'Complete', pct: 100 },
}

function fmt(s) {
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

function CallCard({ call }) {
  const navigate = useNavigate()
  const cat = CATEGORIES[call.category] || CATEGORIES['service']
  const stage = STAGES[call.stage]
  const filled = Object.keys(call.filledFields).length
  const total = cat.fields.length
  const pct = Math.round((filled / total) * 100)

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col gap-4 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
      onClick={() => navigate(`/calls/${call.id}`)}>

      {/* Header Row */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
          <span className="text-xs font-bold text-red-600">LIVE · {fmt(call.duration)}</span>
        </div>
        <span
          className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
          style={{ background: cat.bg, color: cat.color, border: `1px solid ${cat.border}` }}
        >
          {cat.label}
        </span>
      </div>

      {/* Customer Info */}
      <div>
        <div className="text-base font-bold text-slate-900">
          {call.filledFields?.customerName || call.customer || 'Identifying customer...'}
        </div>
        <div className="text-xs text-slate-400 mt-0.5 font-mono">{call.id}</div>
      </div>

      {/* Stage Indicator */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <PhoneCall size={11} color="#64748b" />
            <span className="text-xs text-slate-500 font-medium">{stage.label}</span>
          </div>
          <span className="text-xs font-bold text-slate-600">{filled}/{total} fields</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${pct}%`,
              background: cat.color,
            }}
          />
        </div>

        <div className="text-[10px] text-slate-400">{pct}% form complete</div>
      </div>

      {/* Filled Fields Preview */}
      <div className="flex flex-col gap-1.5">
        {cat.fields.slice(0, 3).map((f) => (
          <div key={f.key} className="flex items-center gap-2">
            <span
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ background: call.filledFields[f.key] ? cat.color : '#e2e8f0' }}
            />
            <span className="text-[11px] text-slate-400 w-28 flex-shrink-0">{f.label}</span>
            <span className="text-[11px] font-medium text-slate-700 truncate">
              {call.filledFields[f.key] || '—'}
            </span>
          </div>
        ))}
      </div>

      {/* View Button */}
      <button
        className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold border transition-all"
        style={{
          background: cat.bg,
          color: cat.color,
          border: `1px solid ${cat.border}`,
        }}
      >
        View Full Call <ArrowRight size={12} />
      </button>

    </div>
  )
}

export default CallCard