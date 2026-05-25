import { useState, useEffect } from 'react'
import useAriaStore from '../store/ariaStore'
import CallCard from '../components/calls/CallCard'
import RealCallPanel from '../components/calls/RealCallPanel'
import { PhoneOff, Plus, Phone } from 'lucide-react'
import { supabase } from '../services/supabase'

function ActiveCalls() {
  const activeCalls = useAriaStore((s) => s.activeCalls)
  const setActiveCalls = useAriaStore((s) => s.setActiveCalls)
  const [showPanel, setShowPanel] = useState(false)
  const [showTrigger, setShowTrigger] = useState(false)
  const [phone, setPhone] = useState('')
  const [calling, setCalling] = useState(false)
  const [callStatus, setCallStatus] = useState('')

  useEffect(() => {
    const fetchCalls = async () => {
      const { data } = await supabase
        .from('calls')
        .select('*')
        .order('created_at', { ascending: false })
      if (data) {
        const mapped = data.map((c) => ({
          id: c.id,
          category: c.category === 'unknown' ? 'service' : c.category,
          stage: c.stage,
          duration: c.duration,
          customer: c.customer,
          filledFields: c.filled_fields || {},
          transcript: c.transcript || [],
        }))
        setActiveCalls(mapped)
      }
    }

    fetchCalls()

    const channel = supabase
      .channel('calls-realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'calls',
      }, () => {
        fetchCalls()
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  const handleTriggerCall = async () => {
    if (!phone.trim()) return
    setCalling(true)
    setCallStatus('')
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/calls/trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_number: phone.trim() }),
      })
      const data = await res.json()
      if (data.call_sid) {
        setCallStatus('success')
        setPhone('')
        setTimeout(() => {
          setShowTrigger(false)
          setCallStatus('')
        }, 2000)
      } else {
        setCallStatus('error')
      }
    } catch (err) {
      setCallStatus('error')
    }
    setCalling(false)
  }

  return (
    <div className="flex flex-col gap-6">

      {/* Stats Strip */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-white border border-slate-200 rounded-xl px-5 py-3 flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-sm font-bold text-slate-900">{activeCalls.length} Active</span>
            <span className="text-xs text-slate-400">calls being handled by ARIA</span>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl px-5 py-3 flex items-center gap-3">
            <span className="text-sm font-bold text-slate-900">
              {activeCalls.reduce((acc, c) => acc + Object.keys(c.filledFields).length, 0)}
            </span>
            <span className="text-xs text-slate-400">fields extracted so far</span>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl px-5 py-3 flex items-center gap-3">
            <span className="text-sm font-bold text-emerald-600">
              {activeCalls.filter((c) => c.stage === 'confirmation' || c.stage === 'complete').length}
            </span>
            <span className="text-xs text-slate-400">calls nearing completion</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setShowTrigger(!showTrigger); setCallStatus('') }}
            className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-3 rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all"
          >
            <Phone size={15} color="white" />
            Trigger Call
          </button>
          <button
            onClick={() => setShowPanel(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all"
          >
            <Plus size={15} color="white" />
            New Live Call
          </button>
        </div>
      </div>

      {/* Trigger Call Panel */}
      {showTrigger && (
        <div className="bg-white border border-slate-200 rounded-xl px-6 py-5">
          <div className="text-sm font-bold text-slate-900 mb-1">Trigger Outbound Call</div>
          <div className="text-xs text-slate-400 mb-4">
            ARIA will call this number. Answer and speak naturally — ARIA will handle the rest.
          </div>
          <div className="flex items-center gap-3">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleTriggerCall()}
              placeholder="+91XXXXXXXXXX"
              className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-blue-400"
            />
            <button
              onClick={handleTriggerCall}
              disabled={calling || !phone.trim()}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-40"
              style={{ background: '#10B981', color: '#fff' }}
            >
              <Phone size={14} color="white" />
              {calling ? 'Calling...' : 'Call Now'}
            </button>
          </div>
          {callStatus === 'success' && (
            <div className="mt-3 text-xs font-semibold text-emerald-600">
              ✓ Call initiated — your phone will ring shortly
            </div>
          )}
          {callStatus === 'error' && (
            <div className="mt-3 text-xs font-semibold text-red-500">
              Failed to initiate call. Check your backend and Twilio config.
            </div>
          )}
        </div>
      )}

      {/* Call Cards Grid */}
      {activeCalls.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-xl border border-slate-200 gap-4">
          <PhoneOff size={32} color="#cbd5e1" />
          <div className="text-slate-400 text-sm font-medium">No active calls right now</div>
          <div className="text-slate-300 text-xs">Click Trigger Call to start a real ARIA conversation</div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-5">
          {activeCalls.map((call) => (
            <CallCard key={call.id} call={call} />
          ))}
        </div>
      )}

      {/* Real Call Panel */}
      {showPanel && (
        <RealCallPanel onClose={() => setShowPanel(false)} />
      )}

    </div>
  )
}

export default ActiveCalls