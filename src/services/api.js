const BASE_URL = import.meta.env.VITE_API_URL

export const api = {
  // Calls
  startCall: async (callId) => {
    const res = await fetch(`${BASE_URL}/calls/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ call_id: callId }),
    })
    return res.json()
  },

  sendMessage: async (callId, customerMessage) => {
    const res = await fetch(`${BASE_URL}/calls/message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ call_id: callId, customer_message: customerMessage }),
    })
    return res.json()
  },

  getCall: async (callId) => {
    const res = await fetch(`${BASE_URL}/calls/${callId}`)
    return res.json()
  },

  getTTS: async (text) => {
    const res = await fetch(`${BASE_URL}/calls/tts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    })
    return res.blob()
  },

  // Tickets
  createTicket: async (data) => {
    const res = await fetch(`${BASE_URL}/tickets/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    return res.json()
  },

  getTickets: async () => {
    const res = await fetch(`${BASE_URL}/tickets/`)
    return res.json()
  },

  updateTicketStatus: async (ticketId, status) => {
    const res = await fetch(`${BASE_URL}/tickets/${ticketId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    return res.json()
  },
}