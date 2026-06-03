import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ScoreBar from './ScoreBar'
import SignalBadge from './SignalBadge'
import { ChevronDown, ChevronUp, Zap } from 'lucide-react'

function parseLines(summary) {
  if (!summary) return []
  return summary.split('\n').filter(Boolean).map(line => {
    const m = line.match(/^\[([A-Z_]+)\]/)
    return { type: m ? m[1].toLowerCase() : 'unknown', text: line.replace(/^\[[A-Z_]+\] /, ''), isCluster: line.includes('CLUSTER') }
  })
}

export default function SignalCard({ data, index = 0 }) {
  const navigate = useNavigate()
  const [expanded, setExpanded] = useState(false)
  const isCluster = data.cluster_detected === 1 || data.cluster_detected === true
  const lines = parseLines(data.signal_summary)
  const scoreColor = data.score >= 80 ? 'var(--green)' : data.score >= 60 ? 'var(--amber)' : 'var(--accent)'

  return (
    <div style={{
      background: 'var(--bg-card)',
      borderRadius: 'var(--radius)',
      border: '1px solid var(--border)',
      boxShadow: 'var(--shadow)',
      padding: '20px 22px',
      transition: 'box-shadow 0.2s ease, transform 0.2s ease',
      animation: `fadeUp 0.4s ease both`,
      animationDelay: `${index * 50}ms`,
      cursor: 'default',
    }}
    onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-hover)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
    onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow)'; e.currentTarget.style.transform = 'translateY(0)' }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
            <span
              onClick={() => navigate(`/ticker/${data.ticker}`)}
              style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.03em', color: 'var(--text-primary)', cursor: 'pointer' }}
              onMouseEnter={e => e.target.style.color = 'var(--accent)'}
              onMouseLeave={e => e.target.style.color = 'var(--text-primary)'}
            >
              {data.ticker}
            </span>
            {isCluster && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 3, background: 'rgba(0,113,227,0.08)', color: 'var(--accent)', border: '1px solid rgba(0,113,227,0.15)', borderRadius: 20, padding: '2px 8px', fontSize: 11, fontWeight: 500 }}>
                <Zap size={10} /> Cluster
              </span>
            )}
          </div>
          {data.company_name && <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 400 }}>{data.company_name}</div>}
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 26, fontWeight: 300, letterSpacing: '-0.04em', color: scoreColor, lineHeight: 1 }}>{data.score}</div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 1 }}>/ 100</div>
        </div>
      </div>

      {/* Score bar */}
      <ScoreBar score={data.score} showLabel={false} />

      {/* Meta */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '12px 0', color: 'var(--text-tertiary)', fontSize: 12 }}>
        <span>{data.signal_count} signal{data.signal_count !== 1 ? 's' : ''}</span>
        <span>·</span>
        <span>{data.last_updated ? new Date(data.last_updated).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}</span>
      </div>

      {/* Badges */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 14 }}>
        {lines.filter(l => !l.isCluster).slice(0, 4).map((l, i) => <SignalBadge key={i} type={l.type} small />)}
      </div>

      {/* Analysis */}
      {data.llm_analysis && (
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.6, fontWeight: 300, display: '-webkit-box', WebkitLineClamp: expanded ? 999 : 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {data.llm_analysis}
          </p>
          <button onClick={e => { e.stopPropagation(); setExpanded(!expanded) }} style={{ display: 'flex', alignItems: 'center', gap: 3, color: 'var(--text-tertiary)', fontSize: 12, marginTop: 6, transition: 'color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-tertiary)'}
          >
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            {expanded ? 'Show less' : 'Show more'}
          </button>
        </div>
      )}

      {/* Detail link */}
      <button
        onClick={() => navigate(`/ticker/${data.ticker}`)}
        style={{ marginTop: 14, fontSize: 12, color: 'var(--accent)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}
        onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
      >
        View breakdown →
      </button>
    </div>
  )
}
