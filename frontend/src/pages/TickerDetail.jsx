import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Zap } from 'lucide-react'
import ScoreBar from '../components/ScoreBar'
import SignalBadge from '../components/SignalBadge'
import { useTickerDetail } from '../hooks/useSignals'

function fmt(v) {
  if (!v) return '—'
  if (v >= 1e9) return `$${(v / 1e9).toFixed(2)}B`
  if (v >= 1e6) return `$${(v / 1e6).toFixed(1)}M`
  if (v >= 1e3) return `$${(v / 1e3).toFixed(0)}K`
  return `$${v.toFixed(0)}`
}

export default function TickerDetail() {
  const { ticker } = useParams()
  const navigate = useNavigate()
  const { score, rawSignals, loading } = useTickerDetail(ticker?.toUpperCase())

  const color = !score ? 'var(--text-dim)' : score.score >= 80 ? 'var(--green)' : score.score >= 60 ? 'var(--amber)' : 'var(--blue)'

  if (loading) return <div style={{ padding: 60, color: 'var(--text-dim)' }}><span style={{ animation: 'blink 1s infinite' }}>▌</span> loading {ticker}...</div>

  return (
    <div style={{ minHeight: '100vh' }}>
      <div style={{ borderBottom: '1px solid var(--border)', padding: '16px 40px', display: 'flex', alignItems: 'center', gap: 16, background: 'rgba(8,12,16,0.95)', backdropFilter: 'blur(8px)', position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-dim)', fontSize: 12 }}>
          <ArrowLeft size={14} /> RADAR
        </button>
        <span style={{ color: 'var(--border)' }}>/</span>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, color }}>{ticker?.toUpperCase()}</span>
        {score?.company_name && <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{score.company_name}</span>}
        {score?.cluster_detected === 1 && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(0,230,118,0.1)', border: '1px solid rgba(0,230,118,0.3)', borderRadius: 4, padding: '2px 10px', fontSize: 11, fontWeight: 700, color: 'var(--green)' }}>
            <Zap size={11} /> CLUSTER DETECTED
          </span>
        )}
      </div>

      <div style={{ padding: '40px', maxWidth: 900, margin: '0 auto' }}>
        {score && (
          <div style={{ background: 'var(--bg-card)', border: `1px solid ${score.score >= 80 ? 'rgba(0,230,118,0.2)' : 'var(--border)'}`, borderRadius: 10, padding: 32, marginBottom: 28 }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, marginBottom: 20 }}>
              <div>
                <div style={{ color: 'var(--text-dim)', fontSize: 11, letterSpacing: '0.1em', marginBottom: 4 }}>CONVICTION SCORE</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 64, fontWeight: 800, color, lineHeight: 1 }}>
                  {score.score}<span style={{ fontSize: 24, fontWeight: 400, color: 'var(--text-dim)' }}>/100</span>
                </div>
              </div>
              <div style={{ flex: 1, paddingBottom: 10 }}>
                <ScoreBar score={score.score} showLabel={false} />
                <div style={{ color: 'var(--text-dim)', fontSize: 11, marginTop: 6 }}>{score.signal_count} signal{score.signal_count !== 1 ? 's' : ''} in last 30 days</div>
              </div>
            </div>
            {score.llm_analysis && (
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20 }}>
                <div style={{ fontSize: 10, letterSpacing: '0.12em', color: 'var(--text-dim)', marginBottom: 10, fontWeight: 700 }}>ANALYST COMMENTARY</div>
                <p style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.75 }}>{score.llm_analysis}</p>
              </div>
            )}
          </div>
        )}

        {rawSignals.length > 0 && (
          <div>
            <div style={{ fontSize: 10, letterSpacing: '0.12em', color: 'var(--text-dim)', fontWeight: 700, marginBottom: 14 }}>RAW SIGNALS ({rawSignals.length})</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {rawSignals.map((sig, i) => (
                <div key={sig.id || i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 6, padding: '14px 18px', display: 'grid', gridTemplateColumns: '160px 1fr auto', gap: 12, alignItems: 'center' }}>
                  <SignalBadge type={sig.signal_type} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 12, color: 'var(--text-primary)', marginBottom: 2 }}>{sig.actor}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: 11 }}>{sig.description}</div>
                    <div style={{ color: 'var(--text-dim)', fontSize: 10, marginTop: 3 }}>{sig.source} · {sig.filed_at ? new Date(sig.filed_at).toLocaleDateString() : 'date unknown'}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    {sig.amount_usd && <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>{fmt(sig.amount_usd)}</div>}
                    {sig.shares && <div style={{ color: 'var(--text-dim)', fontSize: 11 }}>{sig.shares.toLocaleString()} sh</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!score && !loading && <div style={{ color: 'var(--text-dim)', textAlign: 'center', padding: 60 }}>No data found for {ticker?.toUpperCase()}</div>}
      </div>
    </div>
  )
}
