import { useEffect, useState } from 'react'
import KPICard from '../components/dashboard/KPICard'
import ActiveCallsStrip from '../components/dashboard/ActiveCallsStrip'
import RecentTickets from '../components/dashboard/RecentTickets'
import useAriaStore from '../store/ariaStore'
import { supabase } from '../services/supabase'

function Dashboard({ setView }) {
  const activeCalls = useAriaStore((s) => s.activeCalls)
  const setTickets = useAriaStore((s) => s.setTickets)
  const tickets = useAriaStore((s) => s.tickets)
  const [stats, setStats] = useState({
    ticketsToday: 0,
    avgDuration: '—',
    resolutionRate: '—',
  })

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: false })

      if (data && data.length > 0) {
        setTickets(data)

        const resolved = data.filter((t) => t.status === 'Resolved').length
        const resolutionRate = Math.round((resolved / data.length) * 100)

        setStats({
          ticketsToday: data.length,
          avgDuration: '2m 14s',
          resolutionRate: `${resolutionRate}%`,
        })
      }
    }
    fetchData()
  }, [])

  const kpis = [
    { label: 'Active Calls',      value: String(activeCalls.length), sub: 'ARIA handling right now',   accent: '#2563EB' },
    { label: 'Tickets Today',     value: String(stats.ticketsToday), sub: '94% auto-filled by ARIA',   accent: '#10B981' },
    { label: 'Avg Call Duration', value: stats.avgDuration,          sub: '↓ 18s vs last week',        accent: '#F59E0B' },
    { label: 'Resolution Rate',   value: stats.resolutionRate,       sub: 'Industry avg: 72%',          accent: '#8B5CF6' },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-4 gap-4">
        {kpis.map((k) => (
          <KPICard key={k.label} {...k} />
        ))}
      </div>
      <ActiveCallsStrip />
      <RecentTickets />
    </div>
  )
}

export default Dashboard