import { useState } from 'react'
import { PhoneCall, Eye, EyeOff } from 'lucide-react'

const DEMO = { email: 'supervisor@aria.com', password: 'aria2026' }

function SignIn({ onSignIn }) {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [mounted, setMounted]   = useState(true)

  const handleSignIn = async () => {
    setError('')
    setLoading(true)
    await new Promise(r => setTimeout(r, 900))
    if (email === DEMO.email && password === DEMO.password) {
      onSignIn()
    } else {
      setError('Incorrect email or password.')
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#000000',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input::placeholder { color: rgba(255,255,255,0.2); }
        input { caret-color: #2563EB; }
        input:focus { outline: none; }
      `}</style>

      <div style={{
        width: 380,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0,
      }}>

        {/* Logo mark */}
        <div style={{
          width: 52, height: 52, borderRadius: 14,
          background: 'linear-gradient(135deg, #1D4ED8 0%, #2563EB 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 24,
          boxShadow: '0 0 40px rgba(37,99,235,0.25)',
        }}>
          <PhoneCall size={22} color="white" />
        </div>

        {/* Title */}
        <div style={{
          color: '#FFFFFF', fontSize: 24, fontWeight: 600,
          letterSpacing: '-0.3px', marginBottom: 6, textAlign: 'center',
        }}>
          ARIA
        </div>
        <div style={{
          color: 'rgba(255,255,255,0.3)', fontSize: 13, fontWeight: 300,
          marginBottom: 40, textAlign: 'center', letterSpacing: '0.02em',
        }}>
          Supervisor Console
        </div>

        {/* Form */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Email */}
          <input
            type="email"
            value={email}
            onChange={e => { setEmail(e.target.value); setError('') }}
            onKeyDown={e => e.key === 'Enter' && handleSignIn()}
            placeholder="Email address"
            style={{
              width: '100%', padding: '14px 16px',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 12, color: '#FFFFFF', fontSize: 14,
              fontFamily: 'inherit', fontWeight: 400,
              transition: 'border 0.2s, background 0.2s',
            }}
            onFocus={e => {
              e.target.style.background = 'rgba(255,255,255,0.09)'
              e.target.style.borderColor = 'rgba(37,99,235,0.6)'
            }}
            onBlur={e => {
              e.target.style.background = 'rgba(255,255,255,0.06)'
              e.target.style.borderColor = 'rgba(255,255,255,0.08)'
            }}
          />

          {/* Password */}
          <div style={{ position: 'relative' }}>
            <input
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={e => { setPassword(e.target.value); setError('') }}
              onKeyDown={e => e.key === 'Enter' && handleSignIn()}
              placeholder="Password"
              style={{
                width: '100%', padding: '14px 44px 14px 16px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 12, color: '#FFFFFF', fontSize: 14,
                fontFamily: 'inherit', fontWeight: 400,
                transition: 'border 0.2s, background 0.2s',
              }}
              onFocus={e => {
                e.target.style.background = 'rgba(255,255,255,0.09)'
                e.target.style.borderColor = 'rgba(37,99,235,0.6)'
              }}
              onBlur={e => {
                e.target.style.background = 'rgba(255,255,255,0.06)'
                e.target.style.borderColor = 'rgba(255,255,255,0.08)'
              }}
            />
            <button onClick={() => setShowPw(!showPw)} style={{
              position: 'absolute', right: 14, top: '50%',
              transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            }}>
              {showPw
                ? <EyeOff size={15} color="rgba(255,255,255,0.3)" />
                : <Eye size={15} color="rgba(255,255,255,0.3)" />
              }
            </button>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              color: '#F87171', fontSize: 12, textAlign: 'center',
              fontWeight: 400, paddingTop: 2,
            }}>
              {error}
            </div>
          )}

          {/* Button */}
          <button
            onClick={handleSignIn}
            disabled={loading || !email || !password}
            style={{
              width: '100%', padding: '14px',
              background: email && password ? '#2563EB' : 'rgba(37,99,235,0.3)',
              border: 'none', borderRadius: 12,
              color: '#fff', fontSize: 14, fontWeight: 500,
              fontFamily: 'inherit',
              cursor: loading || !email || !password ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              marginTop: 4,
              letterSpacing: '0.01em',
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

        </div>

        {/* Demo credentials */}
        <div style={{
          marginTop: 32, textAlign: 'center',
        }}>
          <div style={{ color: 'rgba(255,255,255,0.15)', fontSize: 11, marginBottom: 6 }}>
            Demo access
          </div>
          <div style={{
            color: 'rgba(255,255,255,0.25)', fontSize: 11,
            fontFamily: 'monospace', letterSpacing: '0.05em',
          }}>
            supervisor@aria.com · aria2026
          </div>
        </div>

      </div>
    </div>
  )
}

export default SignIn