import React, { useState } from 'react'
import { Activity, Zap, RefreshCw, AlertCircle } from 'lucide-react'
import SignalCard from '../components/SignalCard'
import { useSignals } from '../hooks/useSignals'

const FILTERS = [{ label: 'All', min: 0 }, { label: '40+', min: 40 }, { label: '60+', min: 60 }, { label: '80+', min: 80 }]

export default function Dashboard() {
  const [minScore, setMinScore] = useState(40)
  const [clusterOnly, setClusterOnly] = useState(false)
  const { data, loading, usingMock, refetch } = useSignals({ minScore, clusterOnly })

  const clusterCount = data.filter(d => d.cluster_detected).length
  const avgScore = data.length ? Math.round(data.reduce((a, b) => a + b.score, 0) / data.length) : 0

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Sidebar */}
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <aside style={{
          width: 220, flexShrink: 0, background: 'var(--bg-sidebar)',
          borderRight: '1px solid var(--border)', padding: '24px 0',
          position: 'fixed', top: 0, left: 0, height: '100vh',
          display: 'flex', flexDirection: 'column',
        }}>
          {/* Logo */}
          <div style={{ padding: '0 20px 24px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 28, height: 28, background: 'var(--accent)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Activity size={14} color="white" />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>Smart Money</div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: -1 }}>Radar</div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div style={{ padding: '20px', borderBottom: '1px solid var(--border)' }}>
            {[{ label: 'Tracked', value: data.length }, { label: 'Clusters', value: clusterCount }, { label: 'Avg Score', value: avgScore }].map(s => (
              <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{s.label}</span>
                <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{s.value}</span>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div style={{ padding: '20px' }}>
            <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-tertiary)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 10 }}>Min Score</div>
            {FILTERS.map(f => (
              <button key={f.label} onClick={() => setMinScore(f.min)} style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: '6px 10px', borderRadius: 6, fontSize: 13,
                fontWeight: minScore === f.min ? 500 : 400,
                background: minScore === f.min ? 'var(--accent-soft)' : 'transparent',
                color: minScore === f.min ? 'var(--accent)' : 'var(--text-secondary)',
                marginBottom: 2, transition: 'all 0.15s',
              }}>
                {f.label}
              </button>
            ))}

            <div style={{ marginTop: 16 }}>
              <button onClick={() => setClusterOnly(!clusterOnly)} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                width: '100%', padding: '6px 10px', borderRadius: 6, fontSize: 13,
                fontWeight: clusterOnly ? 500 : 400,
                background: clusterOnly ? 'var(--accent-soft)' : 'transparent',
                color: clusterOnly ? 'var(--accent)' : 'var(--text-secondary)',
                transition: 'all 0.15s',
              }}>
                <Zap size={12} /> Clusters only
              </button>
            </div>
          </div>

          {/* Bottom */}
          <div style={{ marginTop: 'auto', padding: '20px' }}>
            <button onClick={refetch} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: 12, padding: '6px 10px', borderRadius: 6, width: '100%', transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <RefreshCw size={12} /> Refresh
            </button>
            {usingMock && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginTop: 10, color: 'var(--amber)', fontSize: 11, lineHeight: 1.4 }}>
                <AlertCircle size={12} style={{ flexShrink: 0, marginTop: 1 }} />
                Demo mode
              </div>
            )}
            <div style={{ marginTop: 16, fontSize: 11, color: 'var(--text-tertiary)', lineHeight: 1.5 }}>
              Not financial advice
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main style={{ marginLeft: 220, flex: 1, padding: '32px', minHeight: '100vh' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            {/* Page header */}
            <div style={{ marginBottom: 28 }}>
              <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.03em', color: 'var(--text-primary)', marginBottom: 4 }}>Signal Dashboard</h1>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 300 }}>Aggregated smart-money activity ranked by conviction score</p>
            </div>

            {loading ? (
              <div style={{ color: 'var(--text-tertiary)', textAlign: 'center', padding: 80, fontSize: 14 }}>Loading signals...</div>
            ) : data.length === 0 ? (
              <div style={{ color: 'var(--text-tertiary)', textAlign: 'center', padding: 80 }}>No signals above score {minScore}</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 14 }}>
                {data.map((item, i) => <SignalCard key={item.ticker || item.id} data={item} index={i} />)}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
