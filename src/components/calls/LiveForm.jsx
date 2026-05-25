import { CheckCircle2, Clock, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { CATEGORIES, DEPARTMENTS } from '../../data/mockData'
import useAriaStore from '../../store/ariaStore'

function LiveForm({ call }) {
  const navigate = useNavigate()
  const completeCall = useAriaStore((s) => s.completeCall)
  const cat = CATEGORIES[call.category]
  const filled = Object.keys(call.filledFields).length
  const total = cat.fields.length
  const pct = Math.round((filled / total) * 100)
  const allFilled = filled >= total

  const handleComplete = () => {
    completeCall(call.id)
    navigate('/tickets')
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 flex flex-col h-full overflow-hidden">

      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex-shrink-0">
        <div className="flex items-center justify-between mb-1">
          <div className="text-sm font-bold text-slate-900">AI Data Extraction</div>
          <span
            className="text-[11px] font-bold px-2.5 py-1 rounded-full"
            style={{ background: cat.bg, color: cat.color, border: `1px solid ${cat.border}` }}
          >
            {cat.label}
          </span>
        </div>
        <div className="text-[11px] text-slate-400">LangChain · Llama 3 · ChromaDB Routing</div>

        {/* Progress Bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] text-slate-400">Form Completion</span>
            <span className="text-[10px] font-bold text-slate-600">{filled} / {total} fields</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${pct}%`, background: cat.color }}
            />
          </div>
        </div>
      </div>

      {/* Fields */}
      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
        {cat.fields.map((f) => {
          const value = call.filledFields[f.key]
          return (
            <div key={f.key}>
              <div className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                {f.label}
              </div>
              <div
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-all duration-500"
                style={{
                  background: value ? cat.bg : '#F8FAFC',
                  border: value ? `1px solid ${cat.border}` : '1px solid #E2E8F0',
                  color: value ? cat.color : '#CBD5E1',
                  fontWeight: value ? 600 : 400,
                }}
              >
                {value
                  ? <CheckCircle2 size={13} color={cat.color} />
                  : <Clock size={13} color="#CBD5E1" />
                }
                <span>{value || 'Waiting for ARIA to extract...'}</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Routing & Action */}
      <div className="px-5 py-4 border-t border-slate-100 flex-shrink-0 flex flex-col gap-3">

        {/* Routing Info */}
        <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
          <div>
            <div className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-0.5">
              Routing Decision · ChromaDB RAG
            </div>
            <div className="text-xs font-semibold text-amber-800">
              {DEPARTMENTS[cat.department]}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-amber-500 mb-0.5">Confidence</div>
            <div className="text-sm font-extrabold text-amber-700">94%</div>
          </div>
        </div>

        {/* Create Ticket Button */}
        <button
          disabled={!allFilled}
          onClick={handleComplete}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all duration-300"
          style={{
            background: allFilled ? cat.color : '#F1F5F9',
            color: allFilled ? '#fff' : '#CBD5E1',
            cursor: allFilled ? 'pointer' : 'not-allowed',
          }}
        >
          Create Ticket & Send Confirmation
          <ArrowRight size={14} />
        </button>

        {!allFilled && (
          <div className="text-center text-[11px] text-slate-400">
            Waiting for ARIA to complete {total - filled} more field{total - filled > 1 ? 's' : ''}
          </div>
        )}
      </div>

    </div>
  )
}

export default LiveForm