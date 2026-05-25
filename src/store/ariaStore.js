import { create } from 'zustand'
import { MOCK_CALLS, MOCK_TICKETS } from '../data/mockData'
import { api } from '../services/api'

const CATEGORIES_MAP = {
  billing:   { dept: 'Finance & Billing Team' },
  incident:  { dept: 'Technical Team' },
  service:   { dept: 'Service Delivery Team' },
  support:   { dept: 'Product Support Team' },
  sales:     { dept: 'Sales Team' },
  complaint: { dept: 'Customer Relations Team' },
}

const useAriaStore = create((set, get) => ({
  // Active Calls
  activeCalls: MOCK_CALLS.map((c) => ({
    ...c,
    transcript: c.transcript.slice(0, 2),
    filledFields: {},
    stage: 'greeting',
    duration: 0,
  })),
  selectedCall: null,
  setSelectedCall: (call) => set({ selectedCall: call }),

  // Tickets
  tickets: MOCK_TICKETS,
  addTicket: (ticket) => set((s) => ({ tickets: [ticket, ...s.tickets] })),
  setTickets: (tickets) => set({ tickets }),
  setActiveCalls: (calls) => set({ activeCalls: calls }),

  // Complete Call → Create Ticket → Remove from Active
  completeCall: (callId) => {
    const { activeCalls } = get()
    const call = activeCalls.find((c) => c.id === callId)
    if (!call) return

    const cat = CATEGORIES_MAP[call.category]

    const newTicket = {
      id: `TKT-${Math.floor(Math.random() * 9000) + 1000}`,
      customer: call.filledFields.customerName || 'Unknown',
      contact: call.filledFields.contact || call.filledFields.accountNumber || '—',
      category: call.category,
      dept: cat.dept,
      status: 'Open',
      priority: 'Medium',
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      duration: `${String(Math.floor(call.duration / 60)).padStart(2, '0')}m ${String(call.duration % 60).padStart(2, '0')}s`,
    }

    set((s) => ({
      tickets: [newTicket, ...s.tickets],
      activeCalls: s.activeCalls.filter((c) => c.id !== callId),
    }))

    // Also persist to Supabase via backend
    api.createTicket({
      call_id: callId,
      customer: newTicket.customer,
      contact: newTicket.contact,
      category: newTicket.category,
      dept: newTicket.dept,
      priority: newTicket.priority,
      duration: newTicket.duration,
      filled_fields: call.filledFields,
    }).catch((err) => console.error('Failed to persist ticket:', err))
  },

  // Start a real call via backend
  startRealCall: async (callId) => {
    try {
      const response = await api.startCall(callId)

      const newCall = {
        id: callId,
        category: 'unknown',
        stage: 'greeting',
        duration: 0,
        customer: '',
        filledFields: {},
        transcript: [{ role: 'aria', text: response.aria_response }],
      }

      set((s) => ({
        activeCalls: [newCall, ...s.activeCalls],
      }))

      // Start timer for this call
      setInterval(() => {
        set((s) => ({
          activeCalls: s.activeCalls.map((c) =>
            c.id === callId ? { ...c, duration: c.duration + 1 } : c
          ),
        }))
      }, 1000)

      return newCall
    } catch (err) {
      console.error('Failed to start call:', err)
    }
  },

  // Send customer message to backend
  sendMessage: async (callId, customerMessage) => {
    try {
      // Add customer message to transcript immediately
      set((s) => ({
        activeCalls: s.activeCalls.map((c) =>
          c.id === callId
            ? { ...c, transcript: [...c.transcript, { role: 'customer', text: customerMessage }] }
            : c
        ),
      }))

      const response = await api.sendMessage(callId, customerMessage)

      // Update call with backend response
      set((s) => ({
        activeCalls: s.activeCalls.map((c) => {
          if (c.id !== callId) return c
          return {
            ...c,
            category: response.category || c.category,
            stage: response.stage || c.stage,
            customer: response.filled_fields?.customerName || c.customer,
            filledFields: response.filled_fields || c.filledFields,
            transcript: [...c.transcript, { role: 'aria', text: response.aria_response }],
          }
        }),
      }))

      // Play ARIA voice response
      if (response.aria_response) {
        const audioBlob = await api.getTTS(response.aria_response)
        const audioUrl = URL.createObjectURL(audioBlob)
        const audio = new Audio(audioUrl)
        audio.play()
      }

      return response
    } catch (err) {
      console.error('Failed to send message:', err)
    }
  },

  // Simulation
  startSimulation: () => {
    const { activeCalls } = get()

    activeCalls.forEach((call, callIndex) => {
      const full = MOCK_CALLS[callIndex]

      // Timer
      setInterval(() => {
        set((s) => ({
          activeCalls: s.activeCalls.map((c) =>
            c.id === call.id ? { ...c, duration: c.duration + 1 } : c
          ),
        }))
      }, 1000)

      // Transcript lines
      const baseDelay = callIndex * 1500
      full.transcript.forEach((line, lineIndex) => {
        setTimeout(() => {
          set((s) => ({
            activeCalls: s.activeCalls.map((c) => {
              if (c.id !== call.id) return c
              const already = c.transcript.find((t) => t.text === line.text)
              if (already) return c
              return { ...c, transcript: [...c.transcript, line] }
            }),
          }))
        }, baseDelay + lineIndex * 2800)
      })

      // Field filling
      const fieldEntries = Object.entries(full.filledFields)
      fieldEntries.forEach(([key, value], fieldIndex) => {
        setTimeout(() => {
          set((s) => ({
            activeCalls: s.activeCalls.map((c) => {
              if (c.id !== call.id) return c
              return { ...c, filledFields: { ...c.filledFields, [key]: value } }
            }),
          }))
        }, baseDelay + (fieldIndex + 2) * 3200)
      })

      // Stage progression
      const stages = ['greeting', 'categoryDetection', 'formFilling', 'confirmation', 'routing', 'complete']
      stages.forEach((stage, stageIndex) => {
        setTimeout(() => {
          set((s) => ({
            activeCalls: s.activeCalls.map((c) =>
              c.id === call.id ? { ...c, stage } : c
            ),
          }))
        }, baseDelay + stageIndex * 5000)
      })
    })
  },
}))

export default useAriaStore