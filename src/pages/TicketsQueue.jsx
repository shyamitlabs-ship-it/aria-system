import { useState, useEffect } from 'react'
import useAriaStore from '../store/ariaStore'
import { CATEGORIES } from '../data/mockData'
import TicketDetailPanel from '../components/tickets/TicketDetailPanel'
import { supabase } from '../services/supabase'

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
      className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold"
      style={{ background: s.bg, color: s.text, border: `1px solid ${s.border}` }}
    >
      {label}
    </span>
  )
}

const HEADERS = ['Ticket ID', 'Customer', 'Category', 'Department', 'Priority', 'Status', 'Duration', 'Time']
const STATUSES = ['All', 'Open', 'In Progress', 'Resolved']

function TicketsQueue() {
  const tickets = useAriaStore((s) => s.tickets)
  const setTickets = useAriaStore((s) => s.setTickets)
  const [filter, setFilter] = useState('All')
  const [selectedTicket, setSelectedTicket] = useState(null)

  useEffect(() => {
    const fetchTickets = async () => {
      const { data } = await supabase
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: false })
      if (data && data.length > 0) setTickets(data)
    }
    fetchTickets()

    const channel = supabase
      .channel('tickets')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tickets',
      }, () => {
        fetchTickets()
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  const filtered = filter === 'All' ? tickets : tickets.filter((t) => t.status === filter)

  const counts = {
    All: tickets.length,
    Open: tickets.filter((t) => t.status === 'Open').length,
    'In Progress': tickets.filter((t) => t.status === 'In Progress').length,
    Resolved: tickets.filter((t) => t.status === 'Resolved').length,
  }

  return (
    <div className="flex gap-5 h-full min-h-0">

      {/* Main Table */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">

        {/* Filter Bar */}
        <div className="bg-white border border-slate-200 rounded-xl px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={{
                  background: filter === s ? '#2563EB' : '#F8FAFC',
                  color: filter === s ? '#fff' : '#475569',
                  border: filter === s ? '1px solid #2563EB' : '1px solid #E2E8F0',
                }}
              >
                {s} ({counts[s]})
              </button>
            ))}
          </div>
          <div className="text-xs text-slate-400">
            Showing <strong className="text-slate-600">{filtered.length}</strong> tickets
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden flex-1">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {HEADERS.map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-[10.5px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 bg-slate-50 whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((t, i) => {
                  const cat = CATEGORIES[t.category] || CATEGORIES['service']
                  const isSelected = selectedTicket?.id === t.id
                  return (
                    <tr
                      key={t.id}
                      onClick={() => setSelectedTicket(isSelected ? null : t)}
                      className="cursor-pointer transition-colors"
                      style={{
                        background: isSelected ? '#EFF6FF' : i % 2 === 0 ? '#fff' : '#fafbfc',
                      }}
                      onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = '#F8FAFC' }}
                      onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = i % 2 === 0 ? '#fff' : '#fafbfc' }}
                    >
                      <td className="px-4 py-3 border-b border-slate-100">
                        <span className="font-mono text-xs font-bold text-blue-600">{t.id}</span>
                      </td>
                      <td className="px-4 py-3 border-b border-slate-100">
                        <div className="text-sm font-semibold text-slate-800">{t.customer}</div>
                        <div className="text-[11px] text-slate-400">{t.contact}</div>
                      </td>
                      <td className="px-4 py-3 border-b border-slate-100">
                        <span
                          className="text-[11px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap"
                          style={{ background: cat.bg, color: cat.color, border: `1px solid ${cat.border}` }}
                        >
                          {cat.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 border-b border-slate-100 text-xs text-slate-600 whitespace-nowrap">{t.dept}</td>
                      <td className="px-4 py-3 border-b border-slate-100">
                        <Badge label={t.priority} styles={PRIORITY_STYLES} />
                      </td>
                      <td className="px-4 py-3 border-b border-slate-100">
                        <Badge label={t.status} styles={STATUS_STYLES} />
                      </td>
                      <td className="px-4 py-3 border-b border-slate-100">
                        <span className="font-mono text-[11px] text-slate-500">{t.duration}</span>
                      </td>
                      <td className="px-4 py-3 border-b border-slate-100 text-[11px] text-slate-400 whitespace-nowrap">{t.time}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Slide-in Detail Panel */}
      {selectedTicket && (
        <TicketDetailPanel
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
        />
      )}

    </div>
  )
}

export default TicketsQueue