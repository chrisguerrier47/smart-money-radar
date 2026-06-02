import React, { useState } from 'react'
import { Activity, Zap, Filter, RefreshCw, AlertCircle } from 'lucide-react'
import SignalCard from '../components/SignalCard'
import { useSignals } from '../hooks/useSignals'

const FILTERS = [{ label: 'ALL', min: 0 }, { label: '40+', min: 40 }, { label: '60+', min: 60 }, { label: '80+', min: 80 }]

export default function Dashboard() {
  const [minScore, setMinScore] = useState(40)
  const [clusterOnly, setClusterOnly] = useState(false)
  const { data, loading, usingMock, refetch } = useSignals({ minScore, clusterOnly })

  const clusterCount = data.filter(d => d.cluster_detected).length
  const avgScore = data.length ? Math.round(data.reduce((a, b) => a + b.score, 0) / data.length) : 0

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ borderBottom: '1px solid var(--border)', padding: '14px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(8,12,16,0.95)', backdropFilter: 'blur(8px)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Activity size={18} color="var(--green)" />
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 800, letterSpacing: '-0.01em' }}>SMART MONEY RADAR</span>
          <span style={{ background: 'rgba(0,230,118,0.1)', color: 'var(--green)', border: '1px solid rgba(0,230,118,0.2)', borderRadius: 3, padding: '1px 7px', fontSize: 10, fontWeight: 700 }}>
            {usingMock ? 'DEMO' : 'LIVE'}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ display: 'flex', gap: 20 }}>
            {[{ label: 'TRACKED', value: data.length }, { label: 'CLUSTERS', value: clusterCount }, { label: 'AVG SCORE', value: avgScore }].map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, color: 'var(--green)', lineHeight: 1 }}>{s.value}</div>
                <div style={{ color: 'var(--text-dim)', fontSize: 9, letterSpacing: '0.1em', marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
          <button onClick={refetch} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--border)', border: '1px solid var(--border-bright)', borderRadius: 6, padding: '7px 12px', color: 'var(--text-secondary)', fontSize: 11, fontWeight: 600 }}>
            <RefreshCw size={12} /> REFRESH
          </button>
        </div>
      </header>

      <div style={{ padding: '16px 32px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-dim)', fontSize: 11 }}><Filter size={12} /> MIN SCORE</div>
        <div style={{ display: 'flex', gap: 6 }}>
          {FILTERS.map(f => (
            <button key={f.label} onClick={() => setMinScore(f.min)} style={{ padding: '4px 12px', borderRadius: 4, fontSize: 11, fontWeight: 700, border: '1px solid', borderColor: minScore === f.min ? 'var(--green)' : 'var(--border)', background: minScore === f.min ? 'rgba(0,230,118,0.1)' : 'transparent', color: minScore === f.min ? 'var(--green)' : 'var(--text-dim)' }}>
              {f.label}
            </button>
          ))}
        </div>
        <div style={{ width: 1, height: 20, background: 'var(--border)' }} />
        <button onClick={() => setClusterOnly(!clusterOnly)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 4, fontSize: 11, fontWeight: 700, border: '1px solid', borderColor: clusterOnly ? 'var(--amber)' : 'var(--border)', background: clusterOnly ? 'rgba(255,171,0,0.1)' : 'transparent', color: clusterOnly ? 'var(--amber)' : 'var(--text-dim)' }}>
          <Zap size={11} /> CLUSTERS ONLY
        </button>
        {usingMock && (
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, color: 'var(--amber)', fontSize: 11 }}>
            <AlertCircle size={12} /> Demo mode — connect backend for live data
          </div>
        )}
      </div>

      <main style={{ flex: 1, padding: '28px 32px', maxWidth: 1400, width: '100%', margin: '0 auto' }}>
        {loading ? (
          <div style={{ color: 'var(--text-dim)', textAlign: 'center', padding: 80 }}>
            <span style={{ animation: 'blink 1s infinite' }}>▌</span> fetching signals...
          </div>
        ) : data.length === 0 ? (
          <div style={{ color: 'var(--text-dim)', textAlign: 'center', padding: 80 }}>No signals above score {minScore}</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 16 }}>
            {data.map((item, i) => <SignalCard key={item.ticker || item.id} data={item} index={i} />)}
          </div>
        )}
      </main>

      <footer style={{ borderTop: '1px solid var(--border)', padding: '12px 32px', display: 'flex', justifyContent: 'space-between', color: 'var(--text-dim)', fontSize: 11 }}>
        <span>Not financial advice. Signals are informational only.</span>
        <span>Sources: SEC EDGAR · Finnhub · Gemini AI</span>
      </footer>
    </div>
  )
}
