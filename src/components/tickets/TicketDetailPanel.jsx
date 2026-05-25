import { X, CheckCircle2 } from 'lucide-react'
import { CATEGORIES, DEPARTMENTS } from '../../data/mockData'

const STATUS_STYLES = {
  'Open':        { bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE' },
  'In Progress': { bg: '#FFFBEB', text: '#B45309', border: '#FDE68A' },
  'Resolved':    { bg: '#F0FDF4', text: '#15803D', border: '#BBF7D0' },
}

const PRIORITY_STYLES = {
  'High':   { bg: '#FEF2F2', text: '#B91C1C', border: '#FECACA' },
  'Medium': { bg: '#FFFBEB', text: '#B45309', border: '#FDE68A' },
  'Low':    { bg: '#F0FDF4', text: '#15803D', border: '#BBF7D0' },
}

function Badge({ label, styles }) {
  const s = styles[label] || { bg: '#F1F5F9', text: '#475569', border: '#E2E8F0' }
  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold"
      style={{ background: s.bg, color: s.text, border: `1px solid ${s.border}` }}
    >
      {label}
    </span>
  )
}

function TicketDetailPanel({ ticket, onClose }) {
  const cat = CATEGORIES[ticket.category] || CATEGORIES['service']
  const filledFields = ticket.filled_fields || {}
  const categoryFields = cat.fields || []

  return (
    <div className="bg-white border-l border-slate-200 w-96 flex-shrink-0 flex flex-col h-full overflow-hidden">

      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-start justify-between flex-shrink-0">
        <div>
          <div className="font-mono text-xs font-bold text-blue-600 mb-1">{ticket.id}</div>
          <div className="text-sm font-bold text-slate-900">{ticket.customer}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">{ticket.contact}</div>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition-all"
        >
          <X size={13} color="#64748b" />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-5">

        {/* Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge label={ticket.status}   styles={STATUS_STYLES} />
          <Badge label={ticket.priority} styles={PRIORITY_STYLES} />
          <span
            className="text-[11px] font-semibold px-2.5 py-1 rounded-md"
            style={{ background: cat.bg, color: cat.color, border: `1px solid ${cat.border}` }}
          >
            {cat.label}
          </span>
        </div>

        {/* Ticket Info */}
        <div>
          <div className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider mb-3">
            Ticket Information
          </div>
          <div className="flex flex-col gap-2.5">
            {[
              { label: 'Department',  value: ticket.dept },
              { label: 'Duration',    value: ticket.duration },
              { label: 'Created At',  value: ticket.time },
              { label: 'Handled By',  value: 'ARIA · AI Agent' },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between">
                <span className="text-xs text-slate-400">{row.label}</span>
                <span className="text-xs font-semibold text-slate-700">{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ARIA Recorded Details — the full form */}
        <div>
          <div className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider mb-3">
            Details Recorded by ARIA
          </div>
          <div className="flex flex-col gap-2">
            {categoryFields.map((f) => {
              const value = filledFields[f.key]
              return (
                <div key={f.key} style={{
                  borderRadius: 8, overflow: 'hidden',
                  border: value ? `1px solid ${cat.border}` : '1px solid #E2E8F0',
                }}>
                  <div style={{
                    padding: '4px 12px',
                    background: value ? cat.bg : '#F8FAFC',
                    fontSize: 10, fontWeight: 700, color: value ? cat.color : '#94A3B8',
                    textTransform: 'uppercase', letterSpacing: '0.07em',
                  }}>
                    {f.label}
                  </div>
                  <div style={{
                    padding: '8px 12px',
                    background: '#FFFFFF',
                    fontSize: 13, fontWeight: value ? 500 : 400,
                    color: value ? '#1E293B' : '#CBD5E1',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}>
                    <span>{value || 'Not captured'}</span>
                    {value && <CheckCircle2 size={13} color={cat.color} />}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Routing */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
          <div className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-1">
            Routing Decision · ChromaDB RAG
          </div>
          <div className="text-sm font-semibold text-amber-800">{ticket.dept}</div>
          <div className="text-[11px] text-amber-600 mt-1">Confidence: 94%</div>
        </div>

        {/* Confirmation */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3">
          <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-2">
            Customer Confirmation
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={13} color="#15803D" />
            <span className="text-xs font-semibold text-emerald-800">
              SMS sent to {ticket.contact}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1.5">
            <CheckCircle2 size={13} color="#15803D" />
            <span className="text-xs font-semibold text-emerald-800">
              Email confirmation dispatched
            </span>
          </div>
        </div>

        {/* Actions */}
        <div>
          <div className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider mb-3">
            Actions
          </div>
          <div className="flex flex-col gap-2">
            <button className="w-full py-2.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-all">
              Reassign Department
            </button>
            <button className="w-full py-2.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-all">
              Mark as Resolved
            </button>
            <button className="w-full py-2.5 rounded-lg text-xs font-semibold bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 transition-all">
              Add Note
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}

export default TicketDetailPanel