import { useEffect, useState } from 'react'

function BootScreen({ onComplete }) {
  const [phase, setPhase] = useState('hidden') // hidden → visible → tagline → fadeout

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('visible'), 300)
    const t2 = setTimeout(() => setPhase('tagline'), 1600)
    const t3 = setTimeout(() => setPhase('fadeout'), 3200)
    const t4 = setTimeout(onComplete, 4000)
    return () => [t1, t2, t3, t4].forEach(clearTimeout)
  }, [])

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: '#000000',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: "'SF Pro Display', 'Helvetica Neue', sans-serif",
      opacity: phase === 'fadeout' ? 0 : 1,
      transition: 'opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
      zIndex: 9999,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@200;300;400&display=swap');
        @keyframes flowIn {
          0%   { opacity: 0; filter: blur(20px); transform: scale(1.04); }
          100% { opacity: 1; filter: blur(0px);  transform: scale(1); }
        }
        @keyframes taglineIn {
          0%   { opacity: 0; transform: translateY(6px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* ARIA */}
      <div style={{
        fontSize: 96,
        fontWeight: 200,
        letterSpacing: '0.35em',
        color: '#FFFFFF',
        fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
        opacity: phase === 'hidden' ? 0 : 1,
        filter: phase === 'hidden' ? 'blur(20px)' : 'blur(0)',
        transform: phase === 'hidden' ? 'scale(1.04)' : 'scale(1)',
        transition: 'all 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
        paddingLeft: '0.35em',
      }}>
        ARIA
      </div>

      {/* Tagline */}
      <div style={{
        marginTop: 16,
        fontSize: 13,
        fontWeight: 300,
        letterSpacing: '0.2em',
        color: 'rgba(255,255,255,0.35)',
        fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
        textTransform: 'uppercase',
        opacity: phase === 'tagline' || phase === 'fadeout' ? 1 : 0,
        transform: phase === 'tagline' || phase === 'fadeout' ? 'translateY(0)' : 'translateY(6px)',
        transition: 'all 0.9s cubic-bezier(0.16, 1, 0.3, 1)',
      }}>
        Agentic Response & Intelligence Automation
      </div>

    </div>
  )
}

export default BootScreen