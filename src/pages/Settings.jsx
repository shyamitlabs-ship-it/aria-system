import { useState } from 'react'
import { CheckCircle2, Circle, PhoneCall, Database, Cpu, Radio, RotateCcw } from 'lucide-react'
import { CATEGORIES, DEPARTMENTS } from '../data/mockData'

const SYSTEM_STATUS = [
  { name: 'Groq · Llama 3.3',        sub: 'Language model & extraction',  status: 'online', icon: Cpu },
  { name: 'Whisper STT',              sub: 'Speech to text engine',        status: 'online', icon: Radio },
  { name: 'ChromaDB',                 sub: 'Vector store & RAG routing',   status: 'online', icon: Database },
  { name: 'Supabase',                 sub: 'Database & real-time sync',    status: 'online', icon: Database },
  { name: 'Twilio Voice Gateway',     sub: 'Phone call infrastructure',    status: 'online', icon: PhoneCall },
  { name: 'gTTS',                     sub: 'Text to speech engine',        status: 'online', icon: Radio },
]

const ROUTING_RULES = Object.entries(CATEGORIES).map(([key, cat]) => ({
  key,
  label: cat.label,
  color: cat.color,
  bg: cat.bg,
  border: cat.border,
  dept: DEPARTMENTS[cat.department],
  fields: cat.fields.length,
}))

function Section({ title, sub, children }) {
  return (
    <div style={{ background: '#FFFFFF', borderRadius: 12, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
      <div style={{ padding: '18px 22px 14px', borderBottom: '1px solid #F1F5F9' }}>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A' }}>{title}</div>
        {sub && <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>{sub}</div>}
      </div>
      <div style={{ padding: 22 }}>{children}</div>
    </div>
  )
}

function Settings() {
  const [model, setModel] = useState('llama-3.3-70b-versatile')
  const [language, setLanguage] = useState('en-IN')
  const [confidence, setConfidence] = useState(70)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');`}</style>

      {/* System Status */}
      <Section title="System Status" sub="Live status of all ARIA components">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          {SYSTEM_STATUS.map((s) => {
            const Icon = s.icon
            return (
              <div key={s.name} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 14px', borderRadius: 10,
                background: '#F8FAFC', border: '1px solid #E2E8F0',
              }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 8,
                  background: '#EFF6FF', border: '1px solid #BFDBFE',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Icon size={15} color="#2563EB" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#1E293B' }}>{s.name}</div>
                  <div style={{ fontSize: 10.5, color: '#94A3B8', marginTop: 1 }}>{s.sub}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', flexShrink: 0 }} />
                  <span style={{ fontSize: 10, color: '#10B981', fontWeight: 600 }}>Online</span>
                </div>
              </div>
            )
          })}
        </div>
      </Section>

      {/* AI Configuration */}
      <Section title="AI Configuration" sub="Model and language settings for ARIA">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B',
              textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>
              Language Model
            </div>
            <select
              value={model}
              onChange={e => setModel(e.target.value)}
              style={{
                width: '100%', padding: '10px 12px',
                background: '#F8FAFC', border: '1px solid #E2E8F0',
                borderRadius: 8, fontSize: 13, color: '#1E293B',
                fontFamily: 'inherit', cursor: 'pointer',
              }}
            >
              <option value="llama-3.3-70b-versatile">Llama 3.3 · 70B Versatile</option>
              <option value="llama-3.1-8b-instant">Llama 3.1 · 8B Instant</option>
              <option value="mixtral-8x7b-32768">Mixtral · 8x7B</option>
            </select>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B',
              textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>
              STT Language
            </div>
            <select
              value={language}
              onChange={e => setLanguage(e.target.value)}
              style={{
                width: '100%', padding: '10px 12px',
                background: '#F8FAFC', border: '1px solid #E2E8F0',
                borderRadius: 8, fontSize: 13, color: '#1E293B',
                fontFamily: 'inherit', cursor: 'pointer',
              }}
            >
              <option value="en-IN">English · India (en-IN)</option>
              <option value="en-US">English · US (en-US)</option>
              <option value="en-GB">English · UK (en-GB)</option>
            </select>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B',
              textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>
              Routing Confidence Threshold · {confidence}%
            </div>
            <input
              type="range" min={50} max={95} value={confidence}
              onChange={e => setConfidence(e.target.value)}
              style={{ width: '100%', accentColor: '#2563EB' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between',
              fontSize: 10, color: '#94A3B8', marginTop: 4 }}>
              <span>50% — More flexible</span>
              <span>95% — More strict</span>
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B',
              textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>
              ARIA Voice
            </div>
            <select style={{
              width: '100%', padding: '10px 12px',
              background: '#F8FAFC', border: '1px solid #E2E8F0',
              borderRadius: 8, fontSize: 13, color: '#1E293B',
              fontFamily: 'inherit', cursor: 'pointer',
            }}>
              <option>Polly.Aditi · Indian English</option>
              <option>Polly.Joanna · US English</option>
              <option>Polly.Amy · British English</option>
            </select>
          </div>
        </div>

        <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={handleSave} style={{
            padding: '10px 24px', borderRadius: 8, border: 'none',
            background: saved ? '#10B981' : '#2563EB',
            color: '#fff', fontSize: 13, fontWeight: 600,
            cursor: 'pointer', transition: 'background 0.3s', fontFamily: 'inherit',
          }}>
            {saved ? '✓ Saved' : 'Save Changes'}
          </button>
        </div>
      </Section>

      {/* Routing Rules */}
      <Section title="Routing Rules" sub="Category → Department mapping via ChromaDB RAG">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {ROUTING_RULES.map((r) => (
            <div key={r.key} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 16px', borderRadius: 10,
              background: '#F8FAFC', border: '1px solid #E2E8F0',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: '3px 10px',
                  borderRadius: 20, whiteSpace: 'nowrap',
                  background: r.bg, color: r.color, border: `1px solid ${r.border}`,
                }}>
                  {r.label}
                </span>
                <span style={{ color: '#94A3B8', fontSize: 12 }}>→</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#1E293B' }}>{r.dept}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11, color: '#94A3B8' }}>{r.fields} fields</span>
                <CheckCircle2 size={14} color="#10B981" />
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* About */}
      <Section title="About ARIA" sub="System information">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {[
            { label: 'Version',        value: 'v1.0.0 · Production' },
            { label: 'Build',          value: 'May 2026 · KCT Final Year Project' },
            { label: 'Stack',          value: 'React · FastAPI · LangChain · Supabase' },
            { label: 'AI Engine',      value: 'Groq · Llama 3.3 70B · Whisper' },
            { label: 'Routing',        value: 'ChromaDB · sentence-transformers' },
            { label: 'Voice',          value: 'Twilio · Polly.Aditi · gTTS' },
          ].map((row) => (
            <div key={row.label} style={{
              padding: '12px 14px', borderRadius: 8,
              background: '#F8FAFC', border: '1px solid #E2E8F0',
            }}>
              <div style={{ fontSize: 10.5, color: '#94A3B8', marginBottom: 4,
                textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600 }}>
                {row.label}
              </div>
              <div style={{ fontSize: 12.5, color: '#1E293B', fontWeight: 500 }}>{row.value}</div>
            </div>
          ))}
        </div>
      </Section>

    </div>
  )
}

export default Settings