import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ScoreBar from './ScoreBar'
import SignalBadge from './SignalBadge'
import { Zap, ChevronDown, ChevronUp } from 'lucide-react'

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
  const color = data.score >= 80 ? 'var(--green)' : data.score >= 60 ? 'var(--amber)' : 'var(--blue)'
  const isCluster = data.cluster_detected === 1 || data.cluster_detected === true
  const lines = parseLines(data.signal_summary)

  return (
    <div
      style={{
        background: 'var(--bg-card)', border: `1px solid ${data.score >= 80 ? 'rgba(0,230,118,0.2)' : 'var(--border)'}`,
        borderRadius: 8, padding: '20px 24px', cursor: 'pointer',
        transition: 'all 0.15s ease', animation: `fadeSlideIn 0.4s ease both`,
        animationDelay: `${index * 60}ms`, position: 'relative', overflow: 'hidden',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.borderColor = data.score >= 80 ? 'rgba(0,230,118,0.35)' : 'var(--border-bright)' }}
      onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-card)'; e.currentTarget.style.borderColor = data.score >= 80 ? 'rgba(0,230,118,0.2)' : 'var(--border)' }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, width: `${data.score}%`, height: 2, background: `linear-gradient(90deg, ${color}, transparent)` }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 3 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color, letterSpacing: '-0.02em' }}>{data.ticker}</span>
            {isCluster && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(0,230,118,0.1)', border: '1px solid rgba(0,230,118,0.3)', borderRadius: 4, padding: '2px 8px', fontSize: 10, fontWeight: 700, color: 'var(--green)', letterSpacing: '0.08em' }}>
                <Zap size={10} /> CLUSTER
              </span>
            )}
          </div>
          {data.company_name && <div style={{ color: 'var(--text-secondary)', fontSize: 11 }}>{data.company_name}</div>}
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color, lineHeight: 1 }}>{data.score}</div>
          <div style={{ color: 'var(--text-dim)', fontSize: 10, marginTop: 2 }}>/100</div>
        </div>
      </div>

      <ScoreBar score={data.score} showLabel={false} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, marginBottom: 14 }}>
        <span style={{ color: 'var(--text-dim)', fontSize: 11 }}>{data.signal_count} signal{data.signal_count !== 1 ? 's' : ''}</span>
        <span style={{ color: 'var(--border-bright)' }}>·</span>
        <span style={{ color: 'var(--text-dim)', fontSize: 11 }}>{data.last_updated ? new Date(data.last_updated).toLocaleDateString() : '—'}</span>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
        {lines.filter(l => !l.isCluster).slice(0, 4).map((l, i) => <SignalBadge key={i} type={l.type} small />)}
      </div>

      {data.llm_analysis && (
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: 12, lineHeight: 1.65, display: '-webkit-box', WebkitLineClamp: expanded ? 999 : 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {data.llm_analysis}
          </p>
          <button onClick={e => { e.stopPropagation(); setExpanded(!expanded) }} style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-dim)', fontSize: 11, marginTop: 6 }}>
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            {expanded ? 'less' : 'more'}
          </button>
        </div>
      )}

      <button onClick={() => navigate(`/ticker/${data.ticker}`)} style={{ marginTop: 14, color, fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', opacity: 0.7 }}>
        VIEW BREAKDOWN →
      </button>
    </div>
  )
}
