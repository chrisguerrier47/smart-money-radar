import React from 'react'

export default function ScoreBar({ score, showLabel = true }) {
  const color = score >= 80 ? 'var(--green)' : score >= 60 ? 'var(--amber)' : 'var(--accent)'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ flex: 1, height: 3, background: 'rgba(0,0,0,0.06)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ width: `${score}%`, height: '100%', background: color, borderRadius: 2, transition: 'width 0.5s ease' }} />
      </div>
      {showLabel && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 500, color, minWidth: 28, textAlign: 'right' }}>{score}</span>}
    </div>
  )
}
