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
  const scoreColor = !score ? 'var(--text-tertiary)' : score.score >= 80 ? 'var(--green)' : score.score >= 60 ? 'var(--amber)' : 'var(--accent)'

  if (loading) return <div style={{ padding: 60, color: 'var(--text-tertiary)', fontFamily: 'var(--font)' }}>Loading...</div>

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Top nav */}
      <div style={{ background: 'rgba(245,245,247,0.8)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border)', padding: '14px 40px', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--accent)', fontSize: 13, fontWeight: 500 }}>
          <ArrowLeft size={14} /> Dashboard
        </button>
        <span style={{ color: 'var(--border-strong)' }}>/</span>
        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{ticker?.toUpperCase()}</span>
        {score?.company_name && <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 300 }}>{score.company_name}</span>}
        {score?.cluster_detected === 1 && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--accent-soft)', color: 'var(--accent)', border: '1px solid rgba(0,113,227,0.15)', borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 500 }}>
            <Zap size={10} /> Cluster detected
          </span>
        )}
      </div>

      <div style={{ padding: '40px', maxWidth: 800, margin: '0 auto' }}>
        {/* Score card */}
        {score && (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)', padding: 32, marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 20, marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-tertiary)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 6 }}>Conviction Score</div>
                <div style={{ fontSize: 64, fontWeight: 200, letterSpacing: '-0.05em', color: scoreColor, lineHeight: 1 }}>
                  {score.score}<span style={{ fontSize: 24, fontWeight: 300, color: 'var(--text-tertiary)' }}>/100</span>
                </div>
              </div>
              <div style={{ flex: 1, paddingBottom: 12 }}>
                <ScoreBar score={score.score} showLabel={false} />
                <div style={{ color: 'var(--text-tertiary)', fontSize: 12, marginTop: 6 }}>{score.signal_count} signal{score.signal_count !== 1 ? 's' : ''} in last 30 days</div>
              </div>
            </div>

            {score.llm_analysis && (
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-tertiary)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 10 }}>Analyst Commentary</div>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7, fontWeight: 300 }}>{score.llm_analysis}</p>
              </div>
            )}
          </div>
        )}

        {/* Raw signals */}
        {rawSignals.length > 0 && (
          <div>
            <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-tertiary)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 12 }}>Raw Signals ({rawSignals.length})</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {rawSignals.map((sig, i) => (
                <div key={sig.id || i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', boxShadow: 'var(--shadow)', padding: '14px 18px', display: 'grid', gridTemplateColumns: '140px 1fr auto', gap: 14, alignItems: 'center' }}>
                  <SignalBadge type={sig.signal_type} />
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 13, color: 'var(--text-primary)', marginBottom: 2 }}>{sig.actor}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: 12, fontWeight: 300 }}>{sig.description}</div>
                    <div style={{ color: 'var(--text-tertiary)', fontSize: 11, marginTop: 3 }}>{sig.source} · {sig.filed_at ? new Date(sig.filed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown date'}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    {sig.amount_usd && <div style={{ fontWeight: 500, fontSize: 13, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{fmt(sig.amount_usd)}</div>}
                    {sig.shares && <div style={{ color: 'var(--text-tertiary)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>{sig.shares.toLocaleString()} sh</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!score && !loading && <div style={{ color: 'var(--text-tertiary)', textAlign: 'center', padding: 60 }}>No data found for {ticker?.toUpperCase()}</div>}
      </div>
    </div>
  )
}
